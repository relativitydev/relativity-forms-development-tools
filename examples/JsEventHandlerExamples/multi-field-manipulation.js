/**
 * Name: Hidden Category Persisted State Event Handlers
 * Description: This is a set of event handlers that demonstrate how you can use a hidden category to persist state.
 * Note: We would recommend only using this for very limited state information.
 * If you have more complex data requirements, we'd recommend you explore other options like building your own custom database.
 */
(function (eventNames, convenienceApi) {
	var eventHandlers = {};

	/**
	 * Scenario: I have a category with persisted state, but I don't want the end-user to see it. I would like to remove this category prior to rendering. 
	 * Note: In transformLayout, you only have access to layout data, so you cannot depend on field values.
	 * https://platform.relativity.com/RelativityOne/Content/FormsAPI/Load_Pipeline.htm#transformlayout
	 */
	eventHandlers[eventNames.TRANSFORM_LAYOUT] = function(layoutData) {
		console.log("Inside TRANSFORM_LAYOUT event handler");
		console.log(JSON.stringify(layoutData));
		layoutData.splice(3, 1); // assuming the category you want to remove is at the bottome of the layout, you can remove it like this.
	};

	/**
	 * Scenario: I need access to Field values that were persisted in my hidden category to accomplish some task.
	 * https://platform.relativity.com/RelativityOne/Content/FormsAPI/Load_Pipeline.htm#hydratelayout
	 */
	eventHandlers[eventNames.HYDRATE_LAYOUT] = function(layoutData, objectInstanceData) {
		console.log("Inside HYDRATE_LAYOUT event handler");
		console.log(JSON.stringify(objectInstanceData)); // objectInstanceData can be used to get the values of the fields in the hidden category
	};

	/**
	 * Scenario: The user interacts with a field, and I need to update the values of the hidden fields based on the user's interaction.
	 * https://platform.relativity.com/RelativityOne/Content/FormsAPI/Change_Pipeline.htm#pageinteraction
	 */
	eventHandlers[eventNames.PAGE_INTERACTION] = function() { 
		console.log( "Inside PAGE_INTERACTION event handler" ); 
		// Update hidden fields based on user interaction using convenienceApi.fieldHelper.setValue
	};

	/**
	 * Scenario: I need to update the values of the hidden fields as a part of the save process.
	 * https://platform.relativity.com/RelativityOne/Content/FormsAPI/Submit_Pipeline.htm#replacesave
	 */
	eventHandlers[eventNames.REPLACE_SAVE] = function(objectInstanceData, objectVersionToken) { 
		console.log( "Inside REPLACE_SAVE event handler" ); 
		// Change the payload to update the hidden fields in the category
	};

	return eventHandlers;
}(eventNames, convenienceApi));
