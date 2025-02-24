# Relativity Forms Event Handler Examples
This directory includes a set of example Relativity Forms Event Handlers.

**Note:** These event handlers are meant to serve as samples and not all of them may work out of the box. Some may require setup. We recommend you use them as a template and/or reference, not for their intended functionality.

## The Basics
A Relativity Forms event handler consists of two parts:
* A .NET Page Interaction event handler that tells Relativity Forms what your JS file's filename is -- one example is included here in the root level `examples` directory.
* A JS file that can hook into one or more lifecycle events that Relativity Forms exposes. Our examples are located in the [JsEventHandlerExamples directory](./JsEventHandlerExamples/).

For detailed instructions on how to build a Relativity Forms Javascript Event Handler please see our [platform documentation](https://platform.relativity.com/RelativityOne/Content/Relativity_Forms/Implementing_Relativity_Forms_event_handlers.htm).


## Contents
### Action Bar Customization
* [Add a back to list button](./JsEventHandlerExamples/actionBar-back-to-list.js)

### Console Customization
* [Add a console button](./JsEventHandlerExamples/console-addButton.js)
* [Add a console button that opens a modal](./JsEventHandlerExamples/console-openModalButton.js)

### General Templates
* [Field manipulation](./JsEventHandlerExamples/multi-field-manipulation.js)

### Page Interaction
* [Hide fields when dropdown choice is selected](./JsEventHandlerExamples/pageInteraction-hideFields.js)

### Picker Overrides
* [Override picker filter](./JsEventHandlerExamples/picker-override-filters.js)

### Pre Save
* [Disable buttons on save](./JsEventHandlerExamples/preSave-disable-buttons.js)

### Transform Layout
* [Add a field to a layout programmatically](./JsEventHandlerExamples/transformLayout-addField.js)
* [Remove a category](./JsEventHandlerExamples/multi-field-manipulation.js)

### Item List
* [Adding a custom item list](./JsEventHandlerExamples/custom-item-list.js)

## Contributing
If you have an example that you would like to contribute to our Relativity Forms Developer Community, please follow the steps in the [CONTRIBUTING.md](./CONTRIBUTING.md).