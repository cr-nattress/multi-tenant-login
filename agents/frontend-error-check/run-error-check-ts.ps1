# Frontend Error Check Agent Runner

# Navigate to the agent directory
Set-Location -Path $PSScriptRoot

# Install dependencies if needed
if (-not (Test-Path -Path "node_modules")) {
    Write-Host "Installing dependencies..."
    npm install
}

# Check if path is provided as an argument
$frontendPath = $args[0]
if (-not $frontendPath) {
    $frontendPath = "../../src/frontend"
}

# Run the error check agent using TypeScript
Write-Host "Running Frontend Error Check Agent..."
Write-Host "Scanning directory: $frontendPath"
npx ts-node frontend-error-check.ts $frontendPath

Write-Host "Error check complete!"
