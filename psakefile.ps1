FormatTaskName "------- Executing Task: {0} -------"

properties {
    $SourceDir = Join-Path $PSScriptRoot "source"
    $Solution = ((Get-ChildItem -Path $SourceDir -Filter *.sln -File)[0].FullName)
    $ArtifactsDir = Join-Path $PSScriptRoot "Artifacts"
    $LogsDir = Join-Path $ArtifactsDir "Logs"
    $LogFilePath = Join-Path $LogsDir "buildsummary.log"
    $ErrorLogFilePath = Join-Path $LogsDir "builderrors.log"
}

Task default -Depends Analyze, Compile, Test, Package -Description "Build and run unit tests. All the steps for a local build.";

Task Analyze -Description "Run build analysis" {
    # Leaving this blank until we are ready to add in analyzers later
}

Task NugetRestore -Description "Restore the packages needed for this build" {
    exec { & $NugetExe @('restore', $Solution) }
}

Task Compile -Depends NugetRestore -Description "Compile code for this repo" {
    Initialize-Folder $ArtifactsDir -Safe
    Initialize-Folder $LogsDir -Safe

    $buildCommand = @($Solution,
    ("/property:Configuration=$BuildConfig"),
    ("/consoleloggerparameters:Summary"),
    ("/property:PublishWebProjects=True"),
    ("/nodeReuse:False"),
    ("/maxcpucount"),
    ("/nologo"),
    ("/fileloggerparameters1:LogFile=`"$LogFilePath`""),
    ("/fileloggerparameters2:errorsonly;LogFile=`"$ErrorLogFilePath`""))

    if ($RAPVersion) {
        $buildCommand += ("/property:RAPVersion=$RAPVersion")
    }

    exec { msbuild $buildCommand }
}

Task Test -Description "Run tests that don't require a deployed environment." {
    $LogPath = Join-Path $LogsDir "UnitTestResults.xml"
    Invoke-Tests -WhereClause "namespace !~ FunctionalTests" -OutputFile $LogPath -WithCoverage
}

Task FunctionalTest -Description "Run functional tests that require a deployed environment." {
    $LogPath = Join-Path $LogsDir "FunctionalTestResults.xml"
    Invoke-Tests -WhereClause "namespace =~ FunctionalTests && TestExecutionCategory == CI" -OutputFile $LogPath -TestSettings (Join-Path $PSScriptRoot FunctionalTestSettings)
}

Task Package -Description "Package up the build artifacts" {
    # RAP Template now uses implicit organization of RAP Builder https://einstein.kcura.com/x/E2Z4E

    Get-ChildItem -Path $ArtifactsDir -Filter *.nuspec |
    ForEach-Object {
        exec { & $NugetExe pack $_.FullName -OutputDirectory (Join-Path $ArtifactsDir "NuGet") -Version $PackageVersion }
    }

    Save-PDBs -SourceDir $SourceDir -ArtifactsDir $ArtifactsDir
}

Task Clean -Description "Delete build artifacts" {
    Initialize-Folder $ArtifactsDir

    Write-Verbose "Running Clean target on $Solution"
    exec { msbuild @($Solution,
        ("/target:Clean"),
        ("/property:Configuration=$BuildConfig"),
        ("/consoleloggerparameters:Summary"),
        ("/nodeReuse:False"),
        ("/maxcpucount"),
        ("/nologo"))
    }
}

Task Rebuild -Description "Do a rebuild" {
    Initialize-Folder $ArtifactsDir

    Write-Verbose "Running Rebuild target on $Solution"
    exec { msbuild @($Solution,
        ("/target:Rebuild"),
        ("/property:Configuration=$BuildConfig"),
        ("/consoleloggerparameters:Summary"),
        ("/property:PublishWebProjects=True"),
        ("/nodeReuse:False"),
        ("/maxcpucount"),
        ("/nologo"),
        ("/fileloggerparameters1:LogFile=`"$LogFilePath`""),
        ("/fileloggerparameters2:errorsonly;LogFile=`"$ErrorLogFilePath`""))
    }
}

Task Help -Alias ? -Description "Display task information" {
    WriteDocumentation
}

function Invoke-Tests
{
    param (
        [Parameter(Mandatory=$true, Position=0)]
        [String] $WhereClause,
        [Parameter()]
        [String] $OutputFile,
        [Parameter()]
        [String] $TestSettings,
        [Parameter()]
        [Switch]$WithCoverage
    )

    $NUnit = Resolve-Path (Join-Path $BuildToolsDir "NUnit.ConsoleRunner.*\tools\nunit3-console.exe")
    $settings = if($TestSettings) { "@$TestSettings" }
    Initialize-Folder $ArtifactsDir -Safe
    Initialize-Folder $LogsDir -Safe
    if($WithCoverage)
    {
        $OpenCover = Join-Path $BuildToolsDir "opencover.*\tools\OpenCover.Console.exe"
        $ReportGenerator = Join-Path $BuildToolsDir "reportgenerator.*\tools\net47\ReportGenerator.exe"
        $CoveragePath = Join-Path $LogsDir "Coverage.xml"

        exec { & $OpenCover -target:$NUnit -targetargs:"$Solution --where=\`"$WhereClause\`" --noheader --labels=OnOutputOnly --skipnontestassemblies --result=$OutputFile $settings" -register:user -filter:"+[RAPTemplate*]* -[*Tests*]* -[*NUnit*]*" -hideskipped:All -output:"$LogsDir\OpenCover.xml" -returntargetcode }
        exec { & $ReportGenerator -reports:"$LogsDir\OpenCover.xml" -targetdir:$LogsDir -reporttypes:Cobertura }
        Move-Item (Join-Path $LogsDir Cobertura.xml) $CoveragePath -Force
    }
    else
    {
        exec { & $NUnit $Solution `
            "--where=`"$WhereClause`"" `
            "--noheader" `
            "--labels=OnOutputOnly" `
            "--skipnontestassemblies" `
            "--result=$OutputFile" `
            "--result=Artifacts\Logs\testexecutionparser.log;format=testexecutionparser" `
            $settings
        }
    }
}