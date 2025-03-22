# Frontend Error Check Agent Runner

# Navigate to the agent directory
Set-Location -Path $PSScriptRoot

# Install dependencies if needed
if (-not (Test-Path -Path "node_modules")) {
    Write-Host "Installing dependencies..."
    npm install
}

# Run the error check agent using Bun
Write-Host "Running Frontend Error Check Agent..."
bun frontend-error-check.ts ../../src/frontend

Write-Host "Error check complete!"
