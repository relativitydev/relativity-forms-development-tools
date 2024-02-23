/**
 * Name: Field Manipulation Event Handlers
 * Description: This is a set of event handlers that demonstrate the various methods to manipulate fields.
 */
(function (eventNames, convenienceApi) {
	var eventHandlers = {};

	// https://platform.relativity.com/RelativityOne/Content/FormsAPI/Load_Pipeline.htm#transformlayout
	eventHandlers[eventNames.TRANSFORM_LAYOUT] = function(layoutData) {
		console.log("Inside TRANSFORM_LAYOUT event handler");
		console.log(JSON.stringify(layoutData));
		layoutData.splice(3, 1); //assuming the category you want to remove is at the bottome of the layout, you can remove it like this.
	};

	// https://platform.relativity.com/RelativityOne/Content/FormsAPI/Load_Pipeline.htm#hydratelayout
	eventHandlers[eventNames.HYDRATE_LAYOUT] = function(layoutData, objectInstanceData) {
        console.log("Inside HYDRATE_LAYOUT event handler");
        console.log(JSON.stringify(objectInstanceData));
		// Depending on if you need the previously saved values of the hidden fields, you can retrieve them out of this object instance data object.
    };

	eventHandlers[eventNames.PAGE_INTERACTION] = function() { 
		console.log( "Inside PAGE_INTERACTION event handler" ); 
		// If you need to update the values of the hidden fields while changes are being made you can do that here
    };

	// https://platform.relativity.com/RelativityOne/Content/FormsAPI/Submit_Pipeline.htm#replacesave
	eventHandlers[eventNames.REPLACE_SAVE] = function(objectInstanceData, objectVersionToken) { 
		console.log( "Inside REPLACE_SAVE event handler" ); 
		// If you need to update the values of the hidden fields as a part of the save process, you can do that here
   };

	return eventHandlers;
}(eventNames, convenienceApi));
