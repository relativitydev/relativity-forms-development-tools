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

## Usage
### Getting to EH Fiddle
1. Install the EH Fiddle Application to your desired Workspace.
2. Navigate to the EH Fiddle tab within that Workspace.
3. Type, Cut and Paste, or Drag and drop your Relativity Forms JavaScript from your computer into the EH Fiddle into the EH Fiddle content area.
### Verifying and testing (your) code
4. To analyze the code within the fiddle, click "_Verify without test_".
5. To include testing of the code on a real Object Type Layout, select a target Object Type from the **Object Type** dropdown.
6. Once an Object Type is selected, set the Form Mode, Layout, and (when applicatble) Instance of the type on which to test the code.
7. Click the "_Verify and test_" or "_Test without pre-verification_" button to test the current code on the specified object.
### Downloading code as a JavaScript file
8. Optionally, edit or specify the downloaded file's desired name. If the name field is left empty, the placeholder text's value, "_ehFiddleFile.js_" will be used.
9. Click the "_Download eventHandler file_" to start the file download.

## Known Caveats and Limitations
* Event handlers applied by EH Fiddle are added after any event handlers which already exist for the Object Types upon which they are tested. For this reason, your handlers for any of the eventNames for which only single handlers may be registered ({ _eventNames.REPLACE_DELETE, eventNames.REPLACE_GET_NEW_OBJECT_INSTANCE, eventNames.REPLACE_OBTAIN_ADDITIONAL_DATA, eventNames.REPLACE_READ, eventNames.REPLACE_SAVE_ }) will be ignored by Relativity Forms if the target Object Type already contains a handler for the event.

## Testing (of the EH Fiddle Relativity Forms event handler)
Unit testing is available in this repository via jasmine within NodeJS.
To run the unit tests:
* Install NodeJS (16 or later) on your development environment
* Download the Source folder from this repository
* At a commandline in this `/Source/EH Fiddle/` folder, run the following:
    * `npm install`
    * `npm run test`

## Help and Support for EH Fiddle
Support for this Application is only available through through [devhelp.relativity.com](https://devhelp.relativity.com/). You are welcome to use the RAP or the code and solution as you see fit within the confines of the license under which it is released; however, if you are looking for support or modifications to the solution, please do reach out to us with a post to the _**RelativityForms**_ category within [devhelp.relativity.com](https://devhelp.relativity.com/).
