/**
 * Name: Hide Fields Event Handler
 * Description: This event handler hides the "Other Field" when the "Hide Others" option is chosen in the "Dropdown Field".
 */
(function (eventNames, convenienceApi) {
    var eventHandlers = {};

	eventHandlers[eventNames.PAGE_INTERACTION] = function (modelData, event) { 
		// Scenario: A field with name "Dropdown Field is present on the layout.
		// I would like to hide the field named "Other Field" when the "Hide Others" option (ArtifactID: 123456) is chosen.
		const dropdownFieldId = this.fieldNameToFieldIdMap.get("Dropdown Field");
		if (event.payload.fieldId === dropdownFieldId) {
			const shouldHide = event.payload.htmlEvent.detail.value === "123456"; // could do event.payload.htmlEvent.detail.displayValue === "Hide Others", but may encounter problems if there are duplicates
			convenienceApi.fieldHelper.setIsHidden("Other Field", shouldHide);
		}
	};

    return eventHandlers;
}(eventNames, convenienceApi));