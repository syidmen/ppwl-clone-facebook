$ErrorActionPreference = "Stop"

$apiRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$staging = Join-Path $apiRoot ".lambda-package"
$zipPath = Join-Path $apiRoot "lambda-backend.zip"
$bundledNodeModules = Join-Path $apiRoot "dist-lambda/node_modules"
$apiNodeModules = Join-Path $apiRoot "node_modules"

if (Test-Path $staging) {
  Remove-Item -LiteralPath $staging -Recurse -Force
}

New-Item -ItemType Directory -Path $staging | Out-Null
New-Item -ItemType Directory -Path (Join-Path $staging "node_modules") | Out-Null

Copy-Item -LiteralPath (Join-Path $apiRoot "dist-lambda/lambda.js") -Destination (Join-Path $staging "lambda.js")

if (Test-Path (Join-Path $bundledNodeModules ".prisma")) {
  Copy-Item -LiteralPath (Join-Path $bundledNodeModules ".prisma") -Destination (Join-Path $staging "node_modules/.prisma") -Recurse
}
elseif (Test-Path (Join-Path $apiNodeModules ".prisma")) {
  Copy-Item -LiteralPath (Join-Path $apiNodeModules ".prisma") -Destination (Join-Path $staging "node_modules/.prisma") -Recurse
}
else {
  throw "Prisma generated client not found. Run `bun --cwd apps/api prisma generate` first."
}

if (Test-Path (Join-Path $bundledNodeModules "@prisma")) {
  Copy-Item -LiteralPath (Join-Path $bundledNodeModules "@prisma") -Destination (Join-Path $staging "node_modules/@prisma") -Recurse
}
else {
  Copy-Item -LiteralPath (Join-Path $apiNodeModules "@prisma") -Destination (Join-Path $staging "node_modules/@prisma") -Recurse
}

if (Test-Path $zipPath) {
  Remove-Item -LiteralPath $zipPath -Force
}

Push-Location $staging
try {
  Compress-Archive -Path "lambda.js", "node_modules" -DestinationPath $zipPath -Force
}
finally {
  Pop-Location
}

Remove-Item -LiteralPath $staging -Recurse -Force
Write-Host "Created $zipPath"
