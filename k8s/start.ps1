param([string]$Kind = 'kind', [string]$AdminName)

$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $true
$cluster = 'leetalgo-local'
$namespace = 'leetalgo'
$root = Split-Path -Parent $PSScriptRoot
$configDir = Join-Path $env:LOCALAPPDATA 'LeetAlgo/kind'
[void][IO.Directory]::CreateDirectory($configDir)
if ($Kind -eq 'kind' -and !(Get-Command kind -ErrorAction SilentlyContinue)) {
    $Kind = Join-Path $configDir 'kind.exe'
    if (!(Test-Path -LiteralPath $Kind)) { throw '找不到 kind，可使用 -Kind 指定 kind.exe 路徑。' }
}
$config = Join-Path $configDir 'kubeconfig'
$kubectl = @('--kubeconfig', $config, '--context', "kind-$cluster", '--namespace', $namespace)
$tag = [Guid]::NewGuid().ToString('N').Substring(0, 12)

if ($cluster -notin @(& $Kind get clusters)) {
    & $Kind create cluster --name $cluster --config (Join-Path $PSScriptRoot 'kind.yaml') --kubeconfig $config --wait 180s
} else {
    & $Kind export kubeconfig --name $cluster --kubeconfig $config
}
kubectl @kubectl create namespace $namespace --dry-run=client -o yaml | kubectl @kubectl apply -f -
if (!(kubectl @kubectl get secret leetalgo --ignore-not-found -o name)) {
    $password = 'La1!' + [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(24))
    $secret = @{
        apiVersion = 'v1'
        kind = 'Secret'
        metadata = @{ name = 'leetalgo'; namespace = $namespace }
        stringData = @{
            'sql-password' = $password
            'sql-connection' = "Server=db;Database=LeetAlgo;User Id=sa;Password=$password;TrustServerCertificate=True"
            'jwt-key' = [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
        }
    }
    $secret | ConvertTo-Json -Depth 4 -Compress | kubectl @kubectl create -f -
}

kubectl @kubectl apply -f (Join-Path $PSScriptRoot 'database.yaml')
docker build --provenance=false -t "leetalgo-tools:$tag" --target tools (Join-Path $root 'backend')
docker build --provenance=false -t "leetalgo-api:$tag" --target api (Join-Path $root 'backend')
docker build --provenance=false -t "leetalgo-web:$tag" --build-arg 'VITE_API_URL=' (Join-Path $root 'frontend')
& $Kind load docker-image --name $cluster "leetalgo-tools:$tag" "leetalgo-api:$tag" "leetalgo-web:$tag"

kubectl @kubectl rollout status statefulset/db --timeout=6m
(Get-Content -Raw (Join-Path $PSScriptRoot 'import.yaml')).Replace('BUILD_TAG', $tag) | kubectl @kubectl apply -f -
kubectl @kubectl wait --for=condition=complete "job/import-$tag" --timeout=6m
$gateway = Join-Path $PSScriptRoot 'gateway.conf'
kubectl @kubectl create configmap gateway "--from-file=default.conf=$gateway" --dry-run=client -o yaml | kubectl @kubectl apply -f -
(Get-Content -Raw (Join-Path $PSScriptRoot 'site.yaml')).Replace('BUILD_TAG', $tag) | kubectl @kubectl apply -f -
kubectl @kubectl rollout status deployment/api --timeout=4m
kubectl @kubectl rollout status deployment/web --timeout=4m
$ready = Invoke-RestMethod 'http://127.0.0.1:18081/health/ready' -TimeoutSec 6 -MaximumRetryCount 8 -RetryIntervalSec 2
if ($ready -ne 'Healthy') { throw '網站入口尚未連上資料庫。' }
if ($AdminName) {
    $pod = @{
        apiVersion = 'v1'
        spec = @{ containers = @(@{
            name = "admin-$tag"
            image = "leetalgo-tools:$tag"
            imagePullPolicy = 'Never'
            stdin = $true
            tty = $true
            args = @('create-admin', $AdminName)
            env = @(@{ name = 'ConnectionStrings__LeetAlgo'; valueFrom = @{ secretKeyRef = @{ name='leetalgo'; key='sql-connection' } } })
        }) }
    } | ConvertTo-Json -Depth 8 -Compress
    kubectl @kubectl run "admin-$tag" --image="leetalgo-tools:$tag" --restart=Never --rm -it "--overrides=$pod"
}
Write-Output 'LeetAlgo http://127.0.0.1:18081/'
