# EH Fiddle
Open Source Community: The EH Fiddle Application is a tool which allows rapid testing of Relativity Forms PageInteraction event hander JavaScript without having to create the .NET PageInteraction event handler or even a Relativity Application to host it, yet.

EH Fiddle is itself a Relativity Forms event handler, extending the Application's _**EH Fiddle**_ Object Type. It will analyze your event handler JavaScript, and execute it over existing Object Types and Layouts to which you have permission. This is intended to be a development tool only.




## Core EH Fiddle Features

* Built as a Relativity Forms event handler.
* Executes code as the logged-in Relativity user.
* Allows drag and drop of JavaScript files to be analyzed and tested, as well as editing within the UI.
* Allows for 1-click download of event handler JavaScript from the UI.
* Allows for code analysis and testing separately or consecutively.
* Checks candidate Relativity Forms event handler JavaScript for common problems and best practice issues, then displays them in the UI.
* Tests your code on existing Object Types to which you have permissions via the [convenienceApi.relativityFormsPopup methods](https://platform.relativity.com/RelativityOne/Content/Relativity_Forms/convenienceApi_object.htm#relativi2).
* Does not bind your candidate code to Object Types on which it is tested.
* Includes a sample target/testing Object Type, _**EH Fiddle Test RDO**_, and a dummy/sample instance of the type.

## System Requirements
* RelativityOne -- WhiteSedge 13.1.228.7 or later
* Relativity Liquid Forms -- v 6.77.0 or later

## RAP File Download
* [EH_Fiddle.rap](/ready-to-use/EH_Fiddle.rap)




# Usage
## Getting to EH Fiddle
1. Install the EH Fiddle Application to your desired Workspace.
2. Navigate to the EH Fiddle tab within that Workspace.
3. Type, Cut and Paste, or Drag and drop your Relativity Forms JavaScript from your computer into the EH Fiddle into the EH Fiddle content area.

## Verifying and testing (your) code
4. To analyze the code within the fiddle, click "_Verify without test_".
5. To include testing of the code on a real Object Type Layout, select a target Object Type from the **Object Type** dropdown.
6. Once an Object Type is selected, set the Form Mode, Layout, and (when applicatble) Instance of the type on which to test the code.
7. Click the "_Verify and test_" or "_Test without pre-verification_" button to test the current code on the specified object.

## Downloading code as a JavaScript file
8. Optionally, edit or specify the downloaded file's desired name. If the name field is left empty, the placeholder text's value, "_ehFiddleFile.js_" will be used.
9. Click the "_Download eventHandler file_" to start the file download.

## Known Caveats and Limitations
* Event handlers applied by EH Fiddle are added after any event handlers which already exist for the Object Types upon which they are tested. For this reason, your handlers for any of the eventNames for which only single handlers may be registered ({ _eventNames.REPLACE_DELETE, eventNames.REPLACE_GET_NEW_OBJECT_INSTANCE, eventNames.REPLACE_OBTAIN_ADDITIONAL_DATA, eventNames.REPLACE_READ, eventNames.REPLACE_SAVE_ }) will be ignored by Relativity Forms if the target Object Type already contains a handler for the event.




# Help and Support for EH Fiddle
Support for this Application is only available through through [devhelp.relativity.com](https://devhelp.relativity.com/). You are welcome to use the RAP or the code and solution as you see fit within the confines of the license under which it is released; however, if you are looking for support or modifications to the solution, please do reach out to us with a post to the _**RelativityForms**_ category within [devhelp.relativity.com](https://devhelp.relativity.com/).




# EH Fiddle Application Source and Testing
## Source

### .NET code
The EH Fiddle .NET project is used for developing the .NET portions of the Application's event handlers:
* ListPageInteractionEventHandler - Relativity.Lists extension, instructing the use of lists.ext.ehfiddle.js
* PageInteractionEventHandler - Relativity Forms extension, instructing the use of EH Fiddle.js
* PostInstallEventHandler - Application level event handler for adding instances of the EH Fiddle object types when installed in a workspace
The .NET solution and project files include the extension JavaScript files for convenience's sake; however the .NET build only creates the .DLL file for the EH Fiddle Application. It does *not* bundle/include the JavaScript files into the .DLL, and does not create a .RAP
The .NET files include:
* EH Fiddle.sln - the root of the .NET project
* EH Fiddle.csproj - the project file for the .NET project
* EH Fiddle.cs - the PageInteractionEventHandler for Relativity Forms
* PostInstallEventHandler.cs - the Application's Workspace-level PostInstallEventHandler (creates object instances in the Workspace)
* RelativityListsListPageInteractionEventHandler.cs - the ListPageInteractionEventHandler for Relativity.Lists
* packages.config - Visual Studio's xml for NuGet packages installed in this project

### JavaScript code
The EH Fiddle JavaScript code includes:
* EH Fiddle.js - The heavy-lifting for the EH Fiddle Application, this is a Relativity Forms event handler JavaScript file
* lists.ext.ehfiddle.js - The Relativity.Lists extension which force-navigates the EH Fiddle tab away from the EH Fiddle list to the Relativity Forms page for EH Fiddle.
* TESTING ASSETS - These files allow unit testing of the EH Fiddle JavaScript:
    * package.json - a nodejs file allowing the commands `npm install` and `npm run test`
    * /spec/support/jasmine.json - configuration for the Jasmine test library
    * EH Fiddle.spec.js - Jasmine unit tests for the Relativity Forms handlers (EH Fiddle.js)

### .RAP assets (contents)
While none of the code in this repository builds the EH Fiddle .RAP file, the pieces which define the RAP's content are present in the Source, or can be generated from it.  They include:
* application.xml - The EH Fiddle Application schema file
* assemblies
    * EH Fiddle.dll - Generated by building or rebuilding the EH Fiddle.sln in Visual Studio
* resourcefiles
    * EH Fiddle.js
    * lists.ext.ehfiddle.js

## Testing the EH Fiddle Application's Relativity Forms event handler JavaScript (EH Fiddle.js)
Unit testing is available in this repository via Jasmine within NodeJS.
To run the unit tests:
* Install NodeJS (16 or later) on your development environment
* Download the Source folder from this repository
* At a commandline in this `/Source/EH Fiddle/` folder, run the following:
    * `npm install`
    * `npm run test`

