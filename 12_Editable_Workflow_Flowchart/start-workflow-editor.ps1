param(
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
$siteRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverPath = Join-Path $siteRoot "server.mjs"
$siteUrl = "http://127.0.0.1:4327/"
$healthUrl = "http://127.0.0.1:4327/api/health"
$runtimeRoot = Join-Path $env:TEMP "ChinaLitigationLawyer-workflow-editor"
$stdoutPath = Join-Path $runtimeRoot "server.stdout.log"
$stderrPath = Join-Path $runtimeRoot "server.stderr.log"

function Test-WorkflowEditorHealth {
    try {
        $health = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 2
        return $health.ok -eq $true
    }
    catch {
        return $false
    }
}

try {
    if (-not (Test-Path -LiteralPath $serverPath -PathType Leaf)) {
        throw "Workflow editor server file was not found: $serverPath"
    }

    $nodeCommand = Get-Command node -ErrorAction SilentlyContinue
    $nodeExe = if ($nodeCommand) { $nodeCommand.Source } else { $null }

    if (-not $nodeExe) {
        throw "Node.js was not found. Install Node.js and add it to PATH."
    }

    if (-not (Test-WorkflowEditorHealth)) {
        New-Item -ItemType Directory -Path $runtimeRoot -Force | Out-Null
        $process = Start-Process `
            -FilePath $nodeExe `
            -ArgumentList @($serverPath) `
            -WorkingDirectory $siteRoot `
            -WindowStyle Hidden `
            -RedirectStandardOutput $stdoutPath `
            -RedirectStandardError $stderrPath `
            -PassThru

        $ready = $false
        for ($attempt = 0; $attempt -lt 40; $attempt += 1) {
            Start-Sleep -Milliseconds 250
            if (Test-WorkflowEditorHealth) {
                $ready = $true
                break
            }
            if ($process.HasExited) {
                break
            }
        }

        if (-not $ready) {
            $detail = ""
            if (Test-Path -LiteralPath $stderrPath) {
                $detail = (Get-Content -LiteralPath $stderrPath -Raw -ErrorAction SilentlyContinue).Trim()
            }
            if (-not $detail) {
                $detail = "The service did not pass its health check within 10 seconds."
            }
            throw "Workflow editor startup failed: $detail`nDiagnostic log: $stderrPath"
        }
    }

    if (-not $NoBrowser) {
        Start-Process -FilePath $siteUrl
    }

    Write-Host "Workflow editor is ready: $siteUrl"
    exit 0
}
catch {
    Write-Error $_.Exception.Message
    exit 1
}
