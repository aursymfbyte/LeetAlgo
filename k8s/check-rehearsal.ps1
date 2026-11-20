param(
    [Parameter(Mandatory)][uri]$BaseUrl,
    [Parameter(Mandatory)][ValidateSet('Baseline', 'Upgrade', 'CandidateWeb')][string]$Phase,
    [Parameter(Mandatory)][pscredential]$Credential,
    [pscustomobject]$Baseline,
    [string]$BrowserPath
)

$ErrorActionPreference = 'Stop'
if ($BaseUrl.Scheme -ne 'http' -or $BaseUrl.Host -ne '127.0.0.1' -or
    $BaseUrl.PathAndQuery -ne '/' -or $BaseUrl.UserInfo -or $BaseUrl.Fragment) {
    throw '預演只能連線到本機的 127.0.0.1 入口。'
}
if ($Phase -ne 'Baseline' -and !$Baseline.Marker) { throw '缺少舊版的預演基準。' }
$site = $BaseUrl.GetLeftPart([UriPartial]::Authority)
$http = @{ MaximumRedirection = 0; TimeoutSec = 20 }
$gateway = Invoke-WebRequest "$site/" -Method Head @http
if (@($gateway.Headers['Content-Security-Policy']) -notcontains "connect-src 'self'") {
    throw '入口缺少預演用的同源連線限制。'
}

function Test-ProblemPage([int]$Id, [string]$Marker) {
    if (!$BrowserPath) {
        $BrowserPath = @(
            "$env:ProgramFiles/Google/Chrome/Application/chrome.exe"
            "${env:ProgramFiles(x86)}/Microsoft/Edge/Application/msedge.exe"
            "$env:ProgramFiles/Microsoft/Edge/Application/msedge.exe"
            "$env:LOCALAPPDATA/Google/Chrome/Application/chrome.exe"
        ) | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | Select-Object -First 1
    }
    if (!$BrowserPath) { throw '找不到瀏覽器，請用 -BrowserPath 指定 Chrome 或 Edge。' }

    $startPage = if ($Phase -eq 'CandidateWeb') { "/#/problem/$Id" } else { '/#/admin/login' }
    $scenario = @{ id = $Id; marker = $Marker; edit = $Phase -ne 'CandidateWeb'; origin = $site }
    if ($scenario.edit) {
        $scenario.user = $Credential.UserName
        $scenario.password = $Credential.GetNetworkCredential().Password
    }
    $browserTest = @'
(async (test) => {
    if (location.origin !== test.origin) throw Error('預演入口不符：' + location.origin);
    async function waitFor(check, step) {
        for (let i = 0; i < 150; i++) {
            const value = check();
            if (value) return value;
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        const message = document.querySelector('.form-error, .message')?.textContent || '';
        throw Error(step + '逾時。' + message);
    }
    function typeInto(input, value) {
        const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value').set;
        setter.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (test.edit) {
        const user = await waitFor(() => document.querySelector('input[autocomplete="username"]'), '讀取登入頁');
        typeInto(user, test.user);
        typeInto(user.form.querySelector('input[type="password"]'), test.password);
        user.form.requestSubmit();

        const edit = await waitFor(() => document.querySelector('a[href="#/admin/problems/' + test.id + '/edit"]'), '登入題目管理');
        edit.click();
        const statement = await waitFor(() => document.querySelector('form .markdown-editor textarea'), '讀取題目編輯表單');
        typeInto(statement, test.marker + '\n\n' + statement.value);
        statement.form.requestSubmit();
    }
    await waitFor(() => location.hash === '#/problem/' + test.id &&
        Array.from(document.querySelectorAll('.statement p')).some(p => p.textContent === test.marker), '開啟已儲存的公開題目');
    return true;
})
'@
    $profile = [IO.Directory]::CreateTempSubdirectory('leetalgo-rehearsal-browser-')
    $process = [Diagnostics.Process]::new()
    $socket = [Net.WebSockets.ClientWebSocket]::new()
    $deadline = [Threading.CancellationTokenSource]::new([TimeSpan]::FromSeconds(75))
    $started = $false

    function Invoke-BrowserExpression([string]$Expression) {
        $command = @{ id = 1; method = 'Runtime.evaluate'; params = @{
            expression = $Expression
            awaitPromise = $true; returnByValue = $true
        } } | ConvertTo-Json -Depth 4 -Compress
        $data = [ArraySegment[byte]]::new([Text.Encoding]::UTF8.GetBytes($command))
        $socket.SendAsync($data, [Net.WebSockets.WebSocketMessageType]::Text, $true, $deadline.Token).GetAwaiter().GetResult() | Out-Null
        $buffer = [ArraySegment[byte]]::new([byte[]]::new(8192))
        do {
            $message = [IO.MemoryStream]::new()
            try {
                do {
                    $part = $socket.ReceiveAsync($buffer, $deadline.Token).GetAwaiter().GetResult()
                    if ($part.MessageType -eq 'Close') { throw '預演瀏覽器提前關閉。' }
                    $message.Write($buffer.Array, 0, $part.Count)
                } until ($part.EndOfMessage)
                $reply = [Text.Encoding]::UTF8.GetString($message.ToArray()) | ConvertFrom-Json
            } finally { $message.Dispose() }
        } until ($reply.id -eq 1)
        return $reply
    }

    try {
        $process.StartInfo.FileName = $BrowserPath
        $process.StartInfo.UseShellExecute = $false
        $process.StartInfo.CreateNoWindow = $true
        foreach ($arg in @('--headless', '--disable-background-networking', '--no-first-run', '--no-proxy-server',
                '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1', "--user-data-dir=$($profile.FullName)",
                '--remote-debugging-address=127.0.0.1', '--remote-debugging-port=0', "$site$startPage")) {
            $process.StartInfo.ArgumentList.Add($arg)
        }
        $started = $process.Start()
        $portFile = Join-Path $profile.FullName 'DevToolsActivePort'
        $target = $null
        while (!$target) {
            if ($process.HasExited -or $deadline.IsCancellationRequested) { throw '無法開啟預演瀏覽器。' }
            Start-Sleep -Milliseconds 100
            if (!(Test-Path -LiteralPath $portFile)) { continue }
            $port = Get-Content -LiteralPath $portFile -TotalCount 1
            if (!$port) { continue }
            $tabs = Invoke-RestMethod "http://127.0.0.1:$port/json/list" -TimeoutSec 5
            $target = $tabs | Where-Object { $_.type -eq 'page' -and $_.url -ceq "$site$startPage" } | Select-Object -First 1
        }
        $socket.ConnectAsync([uri]$target.webSocketDebuggerUrl, $deadline.Token).GetAwaiter().GetResult() | Out-Null
        $origin = $site | ConvertTo-Json -Compress
        do {
            if ($deadline.IsCancellationRequested) { throw '瀏覽器未載入預演入口。' }
            $ready = Invoke-BrowserExpression "location.origin === $origin && document.readyState !== 'loading'"
            if ($ready.result.result.value -eq $true) { break }
            Start-Sleep -Milliseconds 100
        } while ($true)
        $reply = Invoke-BrowserExpression ($browserTest + '(' + ($scenario | ConvertTo-Json -Compress) + ')')
        if ($reply.result.result.value -ne $true) {
            throw "$Phase 瀏覽器預演失敗。$($reply.result.exceptionDetails.exception.description) $($reply.error.message)"
        }
    } finally {
        $socket.Dispose()
        $deadline.Dispose()
        if ($started -and !$process.HasExited) { $process.Kill($true); $process.WaitForExit() }
        $process.Dispose()
        $tempRoot = [IO.Path]::TrimEndingDirectorySeparator([IO.Path]::GetFullPath([IO.Path]::GetTempPath()))
        if ($profile.Parent.FullName -eq $tempRoot -and $profile.Name.StartsWith('leetalgo-rehearsal-browser-')) {
            Remove-Item -LiteralPath $profile.FullName -Recurse -Force
        }
    }
}

if ($Phase -eq 'CandidateWeb') {
    Test-ProblemPage $Baseline.Id ($Baseline.Marker + '-upgraded')
    return
}

$stages = Invoke-RestMethod "$site/api/stages" @http
$problems = Invoke-RestMethod "$site/api/problems" @http
if (!$stages -or !$problems) { throw '預演需要上一版的階段清單及至少一題題目。' }

if ($Phase -eq 'Baseline') {
    $id = [int]$problems[0].id
    $marker = 'rehearsal-' + [Guid]::NewGuid().ToString('N')
} else {
    $id = $Baseline.Id
    $marker = $Baseline.Marker + '-upgraded'
    $lostProblems = Compare-Object $Baseline.Ids $problems.id | Where-Object SideIndicator -eq '<='
    $lostStages = Compare-Object $Baseline.Stages $stages.code | Where-Object SideIndicator -eq '<='
    if ($lostProblems -or $lostStages) { throw '遷移後的題庫缺少舊版題號或階段。' }

    $detail = Invoke-RestMethod "$site/api/problems/$id" @http
    foreach ($field in @('id', 'title', 'stage', 'difficulty', 'link', 'statement', 'complexity', 'complexityAnalysis')) {
        if ($detail.$field -cne $Baseline.Detail.$field) { throw "遷移後第 $id 題的 $field 與舊版不同。" }
    }
    foreach ($version in @('optimal', 'readable')) {
        foreach ($code in $Baseline.Detail.$version.PSObject.Properties) {
            if ($detail.$version.($code.Name) -cne $code.Value) { throw "遷移後第 $id 題的 $version 題解內容不同。" }
        }
    }
}

$before = Invoke-RestMethod "$site/api/problems/$id" @http
Test-ProblemPage $id $marker
$saved = Invoke-RestMethod "$site/api/problems/$id" @http
$expected = $marker + [char]10 + [char]10 + $before.statement.Replace([string][char]13 + [char]10, [string][char]10)
if ($saved.id -ne $id -or $saved.statement -cne $expected) { throw "第 $id 題的後台修改未正確儲存。" }

if ($Phase -eq 'Baseline') {
    [pscustomobject]@{ Id = $id; Marker = $marker; Ids = @($problems.id); Stages = @($stages.code); Detail = $saved }
}
