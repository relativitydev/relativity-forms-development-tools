/**
 * Name: Override Picker Filter Event Handler
 * Description: This event handler overrides the filter for a field which opens a picker modal.
 */
(function(eventNames, convenienceApi) {
	const eventHandlers = {};

	eventHandlers[eventNames.OVERRIDE_PICKER_DATASOURCE] = function(potentialPickerFields) {
		for (var i = 0; i < potentialPickerFields.length; i++) {
			// ideally you'd target which specific field you want to override, but in this case, let's naively replace all potential picker fields
			potentialPickerFields[i].pickerDataSource = {
				customGetDataFunction: function(defaultGetDataFunction, request) {
					// override the filter for the request, you can set this to a value that you can get from the layout (i.e. via FieldHelper)
					request.filters[2].condition = { 
						value: "Apple",
						displayValue: "Apple",
						operator: "is like"
					};

					return defaultGetDataFunction(request);
				}
			}
		}
	}

	return eventHandlers;
}(eventNames, convenienceApi));
