##########################################################################
# This is the Psake bootstrapper script for PowerShell.
##########################################################################

<#
.SYNOPSIS
This is a Powershell script to bootstrap a Psake build.

.DESCRIPTION
This Powershell script will download NuGet if missing, restore build tools using Nuget
and execute your build tasks with the parameters you provide.

.PARAMETER TaskList
List of build tasks to execute.

.PARAMETER PackageVersion
Version to use in the nuget package during the Package task.

.PARAMETER RAPVersion
Version to use for the RAP during the Package task.

.PARAMETER Configuration
The build configuration to use. Either Debug or Release. Defaults to Debug.

#>

[CmdletBinding()]
param(
	[ArgumentCompleter({
		param($Command, $Parameter, $WordToComplete, $CommandAst, $FakeBoundParams)
		$null = Import-Module (Resolve-Path "$PSScriptRoot\buildtools\psake.*\tools\psake\psake.psd1" | Select-Object -Last 1) -ErrorAction Ignore
		(Get-PSakeScriptTasks).Name | Where-Object { $PSItem -like "$WordToComplete*" } | Sort-Object
	})]
	[string[]]$TaskList = @(),

	[Parameter(Mandatory=$False)]
	[String]$RAPVersion,

	[Parameter(Mandatory=$False)]
	[String]$PackageVersion = "1.0.0",

	[Parameter(Mandatory=$False)]
	[ValidateSet("Debug","Release")]
	[string]$Configuration = "Debug"
)

Set-StrictMode -Version 2.0
$BaseDir = $PSScriptRoot
$ToolsDir = Join-Path $BaseDir "buildtools"
$NugetUrl = "https://dist.nuget.org/win-x86-commandline/latest/nuget.exe"
$NugetExe = Join-Path $ToolsDir "nuget.exe"
$ToolsConfig = Join-Path $ToolsDir "packages.config"

Write-Host "Checking for NuGet in tools path..."
if (-Not (Test-Path $NugetExe -Verbose:$VerbosePreference))
{
	Write-Host "Installing NuGet from $NugetUrl..."
	Invoke-WebRequest $NugetUrl -OutFile $NugetExe -Verbose:$VerbosePreference -ErrorAction Stop
}

Write-Host "Restoring tools from NuGet..."
$NuGetVerbosity = if ($true -gt "SilentlyContinue") { "normal" } else { "quiet" }
& $NugetExe install $ToolsConfig -o $ToolsDir -Verbosity $NuGetVerbosity

if ($LASTEXITCODE -ne 0)
{
	Throw "An error occured while restoring NuGet tools."
}
Write-Host "Importing required Powershell modules..."
Import-Module (Join-Path $ToolsDir "psake.*\tools\psake\psake.psd1") -ErrorAction Stop
Import-Module (Join-Path $ToolsDir "kCura.PSBuildTools.*\PSBuildTools.psd1") -ErrorAction Stop

if(!(Get-Module -Name VSSetup -ListAvailable))
{
	Install-Module VSSetup -Scope CurrentUser -Force
}
Import-Module VSSetup -Force
$Params = @{
	taskList = $TaskList
	nologo = $true
	framework = "4.6"
	parameters = @{
		NugetExe = $NugetExe
		BuildConfig = $Configuration
		BuildToolsDir = $ToolsDir
		RAPVersion = $RAPVersion
		PackageVersion = $PackageVersion
	}
	properties = @{
		build_config = $Configuration
	}
	Verbose = $true
	Debug = $true
	buildFile = (Join-Path $BaseDir "psakefile.ps1")
}

Try
{
	Invoke-PSake @Params
}
Finally
{
	$ExitCode = 0
	If ($psake.build_success -eq $False)
	{
		$ExitCode = 1
	}

	Remove-Module PSake -Force -ErrorAction SilentlyContinue
}

Exit $ExitCode