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
				customGetDataFunction: (defaultGetDataFunction, request) =>
					defaultGetDataFunction(request).then(data => ({
						...data,
						// filter the results to include only items where the 'Name' column has a value of 'apple'.
						Results: data.Results.filter(item => item["Name"] === "apple")
					}))
			}
		}
	}

	return eventHandlers;
}(eventNames, convenienceApi));
