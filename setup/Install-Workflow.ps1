param(
    [string]$CodexHome,
    [switch]$CheckOnly
)

$ErrorActionPreference = 'Stop'
$frameworkRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$sourceSkills = Join-Path $frameworkRoot '01_Skills'
$activeSkills = Join-Path $frameworkRoot '.agents\skills'
$entrySource = Join-Path $PSScriptRoot 'china-litigation-workflow'

if (-not $CodexHome) {
    if ($env:CODEX_HOME) {
        $CodexHome = $env:CODEX_HOME
    }
    else {
        $CodexHome = Join-Path $env:USERPROFILE '.codex'
    }
}
$entryTarget = Join-Path $CodexHome 'skills\china-litigation-workflow'

$skills = @(Get-ChildItem -LiteralPath $sourceSkills -Directory | Where-Object {
    $_.Name -notlike '_*' -and (Test-Path -LiteralPath (Join-Path $_.FullName 'SKILL.md'))
})
if ($skills.Count -ne 18) {
    throw "Expected 18 project Skills; found $($skills.Count)."
}
if (-not (Test-Path -LiteralPath (Join-Path $entrySource 'SKILL.md'))) {
    throw 'Portable entry Skill is missing.'
}
if (Test-Path -LiteralPath $entryTarget) {
    throw "Global entry already exists: $entryTarget. Review it manually before replacing anything."
}
foreach ($skill in $skills) {
    $linkPath = Join-Path $activeSkills $skill.Name
    if (Test-Path -LiteralPath $linkPath) {
        throw "Active Skill path already exists: $linkPath. Review it manually before replacing anything."
    }
}

Write-Host "Framework: $frameworkRoot"
Write-Host "Project Skills: $($skills.Count)"
Write-Host "Global entry destination: $entryTarget"
if ($CheckOnly) {
    Write-Host 'Preflight passed; no files changed.'
    exit 0
}

New-Item -ItemType Directory -Path $activeSkills -Force | Out-Null
foreach ($skill in $skills) {
    Copy-Item -LiteralPath $skill.FullName -Destination (Join-Path $activeSkills $skill.Name) -Recurse
}
New-Item -ItemType Directory -Path (Split-Path -Parent $entryTarget) -Force | Out-Null
Copy-Item -LiteralPath $entrySource -Destination $entryTarget -Recurse
$installedSkillPath = Join-Path $entryTarget 'SKILL.md'
$installedContent = [System.IO.File]::ReadAllText($installedSkillPath, [System.Text.Encoding]::UTF8)
$installedContent = $installedContent.Replace('__FRAMEWORK_ROOT__', $frameworkRoot)
[System.IO.File]::WriteAllText($installedSkillPath, $installedContent, [System.Text.UTF8Encoding]::new($false))

Write-Host 'Installed. Restart Codex or open a new task, then explicitly invoke $china-litigation-workflow.'
