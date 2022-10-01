[CmdletBinding()]
param (
    [Parameter()]
    [String]
    $TestVMName,

    [Parameter()]
    [String]
    $ServerBindingType,

    [Parameter()]
    [String]
    $SqlServer,

    [Parameter()]
    [String]
    $SqlUsername,

    [Parameter()]
    [String]
    $SqlPassword,

    [Parameter()]
    [String]
    $RelativityHostAddress,

    [Parameter()]
    [String]
    $RestServicesHostAddress,

    [Parameter()]
    [String]
    $RsapiServicesHostAddress,

    [Parameter()]
    [String]
    $WebApiHostAddress,

    [Parameter()]
    [String]
    $AdminUsername,

    [Parameter()]
    [String]
    $AdminPassword,

    [Parameter()]
    [String]
    $RAPDirectory,

    [Parameter()]
    [String]
    $ChromeBinaryLocation,

    [Parameter()]
    [ValidateScript({Test-Path -PathType leaf $_})]
    [String]
    $AdditionalRunSettingsFilePath = "$PSScriptRoot\additional.runsettings"
)

if($TestVMName)
{
    $testvm = Get-TestVm | Where-Object { $_.BoxName -eq $TestVMName }

    if(-not $ServerBindingType)
    {
        $PSBoundParameters['ServerBindingType'] = "https"
    }

    if(-not $SqlServer)
    {
        $PSBoundParameters['SqlServer'] = "$TestVMName\EDDSINSTANCE001"
    }

    if(-not $SqlUsername)
    {
        $PSBoundParameters['SqlUsername'] = "eddsdbo"
    }

    if(-not $SqlPassword)
    {
        $PSBoundParameters['SqlPassword'] = $testvm.Box.Secrets.sqleddsdbopassword
    }

    if(-not $RelativityHostAddress)
    {
        if($testvm.Box.Parameters.joinDomain -eq 0)
        {
            $PSBoundParameters['RelativityHostAddress'] = "$TestVMName.kcura.corp"
        }
        else
        {
            $PSBoundParameters['RelativityHostAddress'] = "$TestVMName"
        }
    }

    if(-not $AdminUsername)
    {
        $PSBoundParameters['AdminUsername'] = "relativity.admin@kcura.com"
    }

    if(-not $AdminPassword)
    {
        $PSBoundParameters['AdminPassword'] = "Test1234!"
    }
}

if(-not $RestServicesHostAddress)
{
    $PSBoundParameters['RestServicesHostAddress'] = "$($PSBoundParameters['RelativityHostAddress'])"
}

if(-not $RsapiServicesHostAddress)
{
    $PSBoundParameters['RsapiServicesHostAddress'] = "$($PSBoundParameters['RelativityHostAddress'])"
}

if (-not $WebApiHostAddress)
{
    $PSBoundParameters['WebApiHostAddress'] = "$($PSBoundParameters['RelativityHostAddress'])"
}

if(-not $RAPDirectory)
{
    $PSBoundParameters['RAPDirectory'] = Join-Path $PSScriptRoot ..\Artifacts
}

if(-not $ChromeBinaryLocation)
{
    $BuildToolsDir = Join-Path $PSScriptRoot ..\buildtools
    $ChromeBinaryDirectory = (Get-ChildItem -Recurse -Directory -Path $BuildToolsDir -Filter "Relativity.Chromium.Portable*")
    if ($ChromeBinaryDirectory)
    {
        $ChromeBinaryLocation = (Get-ChildItem -Recurse -File -Include chrome.exe -Path $ChromeBinaryDirectory.FullName).Directory.FullName
        $PSBoundParameters['ChromeBinaryLocation'] = $ChromeBinaryLocation
    }
}

Remove-Item (Join-Path $PSScriptRoot ..\FunctionalTestSettings) -Force -ErrorAction SilentlyContinue
Remove-Item (Join-Path $PSScriptRoot ..\FunctionalTest.runsettings) -Force -ErrorAction SilentlyContinue

if (Test-Path $AdditionalRunSettingsFilePath)
{
    [xml]$runSettingsDocument = Get-Content $AdditionalRunSettingsFilePath
    $runSettings = $runSettingsDocument.SelectSingleNode("//RunSettings")
    $testRunParameters = $runSettings.SelectSingleNode("//TestRunParameters")
    $additionalParameters = $testRunParameters.ChildNodes.name
} else
{
    [xml]$runSettingsDocument = New-Object System.Xml.XmlDocument
    $runSettings = $runSettingsDocument.AppendChild($runSettingsDocument.CreateNode("element", "RunSettings", $null))
    $testRunParameters = $runSettings.AppendChild($runSettingsDocument.CreateNode("element", "TestRunParameters", $null))
}

foreach($parameterKey in $PSBoundParameters.Keys)
{
    if (@("TestVmName","AdditionalRunSettingsFilePath") -notcontains $parameterKey)
    {
        if ($additionalParameters -contains $parameterKey)
        {
            $parameter = $testRunParameters.SelectSingleNode("//Parameter[@name='$parameterKey']")
        } else
        {
            $parameter = $testRunParameters.AppendChild($runSettingsDocument.CreateNode("element", "Parameter", $null))
        }
        $parameter.SetAttribute("name", $parameterKey)
        $parameter.SetAttribute("value", $PSBoundParameters[$parameterKey])
    }
}

foreach($parameter in $testRunParameters.ChildNodes)
{
    Add-Content (Join-Path $PSScriptRoot ..\FunctionalTestSettings) "--params `"$($parameter.Name)=$($parameter.Value)`""
}

$runSettingsDocument.Save((Join-Path $PSScriptRoot ..\FunctionalTest.runsettings))