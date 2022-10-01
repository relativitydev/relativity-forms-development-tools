As this is not only a repository intended as a development tool, this is also an experiment in getting RAPCI working in the RelativityDev github org, there are some RAPCI template steps needed:

* Take a look at the RAPCI documentation
* Take a look at the RAPCI template for other documentation to read
* These items from the RAPCI template README:
  * Update all references to `RAPTemplate`
    * update the reference to `Invoke-Tests` in the psakefile.ps1
    * update application.xml and build.xml with RAP information - **Important: Make sure to update the 'Guid' node in ApplicationsXML\application.xml**
  * **After cloning this repository, you must edit the `ServiceConnectionName` and `KeyVaultName` parameters in `azure-pipelines.yml`. See the documentation above for more information on service connection and variable group required to use the  RAPCD template.**
