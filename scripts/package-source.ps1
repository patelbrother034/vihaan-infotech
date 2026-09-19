$ErrorActionPreference = 'Stop'
$packageRoot = Split-Path -Parent $PSScriptRoot
$packageInputs = @('src','server','tests','scripts','public','package.json','package-lock.json','index.html','vite.config.js','.gitignore','.env.example','LOCAL-DEVELOPMENT.txt')
$packageFiles = foreach ($packageInput in $packageInputs) { $packageItem = Join-Path $packageRoot $packageInput; if (!(Test-Path -LiteralPath $packageItem)) { throw "Missing source: $packageInput" }; Get-Item -LiteralPath $packageItem }
$packageOutput = Join-Path $packageRoot 'vihaan-infotech-rebuilt-source.zip'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$packageStream = [System.IO.File]::Open($packageOutput,[System.IO.FileMode]::Create)
$packageArchive = [System.IO.Compression.ZipArchive]::new($packageStream,[System.IO.Compression.ZipArchiveMode]::Create)
try { foreach ($packageEntry in $packageFiles) {
 $packageChildren = if ($packageEntry.PSIsContainer) {Get-ChildItem -LiteralPath $packageEntry.FullName -File -Recurse -Force} else {@($packageEntry)}
 foreach ($packageFile in $packageChildren) {
  if (($packageFile.Name -like '.env*' -and $packageFile.Name -ne '.env.example') -or $packageFile.Extension -in '.pem','.key') {throw 'Private file in source directories; packaging stopped.'}
  $packageRelative = $packageFile.FullName.Substring($packageRoot.Length+1).Replace('\','/')
  [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($packageArchive,$packageFile.FullName,$packageRelative,[System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
 }
}} finally {$packageArchive.Dispose();$packageStream.Dispose()}
Write-Output $packageOutput
