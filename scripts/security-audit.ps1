
param (
    [switch]$Fix
)

$targetDir = Join-Path $PSScriptRoot "..\cypress\cypressAllure"

if (-not (Test-Path $targetDir)) {
    Write-Error "Target directory not found: $targetDir"
    exit 1
}

Push-Location $targetDir

Write-Host "Starting OWASP Security Audit in $targetDir..." -ForegroundColor Cyan

# Run npm audit
Write-Host "Running npm audit..."
$auditResult = npm audit --json | ConvertFrom-Json

if ($auditResult.metadata.vulnerabilities.total -eq 0) {
    Write-Host "No vulnerabilities found!" -ForegroundColor Green
}
else {
    Write-Host "Vulnerabilities found:" -ForegroundColor Yellow
    $auditResult.metadata.vulnerabilities | Format-List
    
    if ($Fix) {
        Write-Host "Attempting to fix vulnerabilities..." -ForegroundColor Cyan
        npm audit fix
        Write-Host "Run 'npm audit' again to verify fixes."
    }
    else {
        # Keep it simple to avoid terminator errors
        Write-Host "Run this script with -Fix to attempt automatic repairs."
    }
}

Pop-Location
