param(
    [Parameter(Mandatory)][ValidatePattern('^[\w][\w.-]{0,127}$')][string]$PreviousTag,
    [ValidatePattern('^[\w][\w.-]{0,127}$')][string]$CandidateBackendTag,
    [ValidatePattern('^[\w][\w.-]{0,127}$')][string]$CandidateWebTag,
    [string]$Kind = 'kind',
    [string]$BrowserPath
)

$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $true
if ($PSVersionTable.PSVersion -lt [version]'7.3') { throw '請使用 PowerShell 7.3 以上版本。' }
if ($PreviousTag -eq 'latest') { throw '請指定上一版的實際映像標籤。' }
if ($Kind -eq 'kind' -and !(Get-Command kind -ErrorAction SilentlyContinue)) {
    $Kind = Join-Path $env:LOCALAPPDATA 'LeetAlgo/kind/kind.exe'
}
$null = Get-Command $Kind, docker, kubectl -ErrorAction Stop
$dockerEndpoint = if ($env:DOCKER_HOST -and !$env:DOCKER_CONTEXT) { $env:DOCKER_HOST } else {
    docker context inspect --format '{{.Endpoints.docker.Host}}'
}
if ($dockerEndpoint -notmatch '^(npipe:////(\.|localhost)/pipe/|unix:///|tcp://(127\.0\.0\.1|localhost):)' -or
    ($env:KIND_EXPERIMENTAL_PROVIDER -and $env:KIND_EXPERIMENTAL_PROVIDER -ne 'docker')) {
    throw '預演需要本機 Docker 引擎。'
}

$cluster = 'leetalgo-rehearse-' + [Guid]::NewGuid().ToString('N').Substring(0, 12)
$config = Join-Path ([IO.Path]::GetTempPath()) "$cluster.kubeconfig"
$kubectl = @('--kubeconfig', $config, '--context', "kind-$cluster", '--namespace', 'leetalgo')
$builtImages = @()
$creatingCluster = $false
$images = @("leetalgo-tools:$PreviousTag", "leetalgo-api:$PreviousTag", "leetalgo-web:$PreviousTag")
if ($CandidateBackendTag) { $images += "leetalgo-tools:$CandidateBackendTag", "leetalgo-api:$CandidateBackendTag" }
if ($CandidateWebTag) { $images += "leetalgo-web:$CandidateWebTag" }
foreach ($image in $images | Select-Object -Unique) {
    docker image inspect --format '{{.Id}}' $image | Out-Null
}
$dbImage = 'mcr.microsoft.com/mssql/server:2022-latest'
if (docker image ls $dbImage --format '{{.ID}}') { $images += $dbImage }

function Wait-JobComplete([string]$Name) {
    $deadline = [DateTime]::UtcNow.AddMinutes(6)
    do {
        $status = kubectl @kubectl get job $Name -o json | ConvertFrom-Json
        if ($status.status.succeeded -gt 0) { return }
        if ($status.status.conditions | Where-Object { $_.type -eq 'Failed' -and $_.status -eq 'True' }) { break }
        Start-Sleep -Seconds 2
    } while ([DateTime]::UtcNow -lt $deadline)
    kubectl @kubectl logs "job/$Name" --tail=30
    throw "預演 Job $Name 未完成。"
}

function Get-ImportManifest([string]$Tag, [string]$Name) {
    $manifest = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'import.yaml')
    $manifest.Replace('name: import-BUILD_TAG', "name: $Name").Replace('BUILD_TAG', $Tag)
}

function Get-MigrationHistory {
    $query = 'SET NOCOUNT ON; SELECT MigrationId FROM dbo.__EFMigrationsHistory ORDER BY MigrationId'
    $command = 'SQLCMDPASSWORD="$MSSQL_SA_PASSWORD" /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -d LeetAlgo -C -b -h -1 -W -Q "$1"'
    kubectl @kubectl exec statefulset/db -- /bin/sh -c $command sh $query | ForEach-Object { $_.Trim() } | Where-Object { $_ }
}

try {
    if (!$CandidateBackendTag) {
        $CandidateBackendTag = $cluster
        $backend = Join-Path (Split-Path -Parent $PSScriptRoot) 'backend'
        foreach ($target in 'tools', 'api') {
            $image = "leetalgo-$($target):$CandidateBackendTag"
            docker build --provenance=false -t $image --target $target $backend
            $builtImages += $image
        }
        $images += $builtImages
    }

    if ($cluster -in @(& $Kind get clusters) -or (Test-Path -LiteralPath $config)) { throw "預演環境已存在：$cluster" }
    $creatingCluster = $true
    $kindConfig = (Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'kind.yaml')).Replace('hostPort: 18081', 'hostPort: 0')
    $kindConfig | & $Kind create cluster --config - --name $cluster --kubeconfig $config --wait 180s
    $images = @($images | Select-Object -Unique)
    & $Kind load docker-image --name $cluster @images
    $binding = docker port "$cluster-control-plane" '30080/tcp'
    if ($binding -notmatch '^127\.0\.0\.1:(\d+)$') { throw "預演網站缺少本機連接埠：$binding" }
    $baseUrl = 'http://127.0.0.1:' + $Matches[1]

    kubectl @kubectl create namespace leetalgo
    $sqlPassword = 'La1!' + [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(24))
    $adminPassword = [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(24))
    $secret = @{
        apiVersion = 'v1'; kind = 'Secret'; metadata = @{name = 'leetalgo'}
        stringData = @{
            'sql-password' = $sqlPassword
            'sql-connection' = "Server=db;Database=LeetAlgo;User Id=sa;Password=$sqlPassword;TrustServerCertificate=True"
            'jwt-key' = [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
            'rehearsal-password' = $adminPassword
        }
    }
    $secret | ConvertTo-Json -Depth 6 | kubectl @kubectl create -f -
    kubectl @kubectl apply -f (Join-Path $PSScriptRoot 'database.yaml')
    kubectl @kubectl rollout status statefulset/db --timeout=6m

    Get-ImportManifest $PreviousTag 'import-before' | kubectl @kubectl create -f -
    Wait-JobComplete 'import-before'
    $before = @(Get-MigrationHistory)
    if (!$before.Count) { throw '舊版匯入後沒有資料庫遷移紀錄。' }
    Write-Host "上一版資料庫：$($before.Count) 筆遷移，最後一筆 $($before[-1])。"

    $adminJob = Get-ImportManifest $PreviousTag 'create-admin' | kubectl @kubectl create --dry-run=client -f - -o json | ConvertFrom-Json -AsHashtable
    $admin = $adminJob.spec.template.spec.containers[0]
    $admin.command = @('/bin/sh', '-ec')
    $admin.args = @('printf "%s\n%s\n" "$REHEARSAL_PASSWORD" "$REHEARSAL_PASSWORD" | script -qec "dotnet /app/LeetAlgo.Tools.dll create-admin rehearsal" /dev/null >/dev/null')
    $admin.env += @{name = 'REHEARSAL_PASSWORD'; valueFrom = @{secretKeyRef = @{name = 'leetalgo'; key = 'rehearsal-password'}}}
    $adminJob | ConvertTo-Json -Depth 12 | kubectl @kubectl create -f -
    Wait-JobComplete 'create-admin'

    $gateway = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'gateway.conf')
    $gateway = $gateway.Replace('listen 80;', "listen 80;" + [Environment]::NewLine + '    add_header Content-Security-Policy "connect-src ''self''" always;')
    @{apiVersion='v1'; kind='ConfigMap'; metadata=@{name='gateway'}; data=@{'default.conf'=$gateway}} | ConvertTo-Json -Depth 5 | kubectl @kubectl create -f -
    (Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'site.yaml')).Replace('BUILD_TAG', $PreviousTag) | kubectl @kubectl apply -f -
    kubectl @kubectl rollout status deployment/api --timeout=4m
    kubectl @kubectl rollout status deployment/web --timeout=4m

    $check = Join-Path $PSScriptRoot 'check-rehearsal.ps1'
    $credential = [pscredential]::new('rehearsal', (ConvertTo-SecureString $adminPassword -AsPlainText -Force))
    $checkArgs = @{ BaseUrl = $baseUrl; Credential = $credential }
    if ($BrowserPath) { $checkArgs.BrowserPath = $BrowserPath }
    $baseline = & $check @checkArgs -Phase Baseline

    Get-ImportManifest $CandidateBackendTag 'migrate-after' | kubectl @kubectl create -f -
    Wait-JobComplete 'migrate-after'
    $after = @(Get-MigrationHistory)
    if ($after.Count -lt $before.Count -or ($before -join ',') -ne ($after[0..($before.Count - 1)] -join ',')) {
        throw '升級後缺少舊版資料庫遷移紀錄。'
    }
    $migrationDir = Join-Path (Split-Path -Parent $PSScriptRoot) 'backend/LeetAlgo.Data/Migrations'
    $expected = @(Get-ChildItem -LiteralPath $migrationDir -Filter '*.Designer.cs' -File |
        Select-String -Pattern '\[Migration\("([^"]+)"\)\]' |
        ForEach-Object { $_.Matches[0].Groups[1].Value } | Sort-Object)
    if (($after -join ',') -cne ($expected -join ',')) {
        throw "資料庫遷移與工作副本不符。預期 $expected，實際 $after。"
    }
    if ($after.Count -eq $before.Count) { Write-Host '新版沒有新增資料庫遷移。' } else {
        Write-Host ('已套用新版遷移：' + ($after[$before.Count..($after.Count - 1)] -join ', '))
    }
    kubectl @kubectl set image deployment/api "api=leetalgo-api:$CandidateBackendTag"
    kubectl @kubectl rollout status deployment/api --timeout=4m
    & $check @checkArgs -Phase Upgrade -Baseline $baseline
    if ($CandidateWebTag) {
        kubectl @kubectl set image deployment/web "web=leetalgo-web:$CandidateWebTag"
        kubectl @kubectl rollout status deployment/web --timeout=4m
        & $check @checkArgs -Phase CandidateWeb -Baseline $baseline
    }
} finally {
    try {
        if ($creatingCluster) { & $Kind delete cluster --name $cluster --kubeconfig $config }
    } finally {
        if ($creatingCluster -and (Test-Path -LiteralPath $config)) { Remove-Item -LiteralPath $config }
        if ($builtImages.Count) { docker image rm @builtImages }
    }
}
Write-Output '部署前預演通過。'
