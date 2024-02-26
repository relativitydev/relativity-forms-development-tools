/**
 * Name: Add Field Transform Layout Event Handler
 * Description/Scenario: I'd like to programmatically add a field to my layout. I would like this field to go after the "TR Text Two" field in the same category.
 * Note: This may need to be paired with a replaceSave event handler to ensure that the field is saved.
 */
(function(convenienceApi, EVENT_NAMES) {

	const eh = {};
	
	function addFieldToLayout(layoutData) {
        try {
			const FIELD_TO_ADD = {
				"FieldType": "SingleObject",
				"DisplayType": "Dropdown",
				"ArtifactTypeID": 1000056,
				"PickerViewArtifactID": 0,
				"FieldID": 1040289, // this is Artifact ID but if the field is not real, it can be a string too
				"DisplayName": "Test RDO Single Object",
				"AllowCopyFromPrevious": false,
				"ShowNameColumn": true,
				"IsReadOnly": false,
				"IsRequired": false,
				"IsSystem": false,
				"FieldCategoryID": 0,
				"EnableDataGrid": false,
				"Guids": [], // you can populate your guid(s) here and use them in handlers
				// 1-indexed placement info
				// you'll change this to match where you'd like them to be in the layout
				// layouts are top-down, left-right (so Row is the most significant bit)
				"Colspan": 1, // one column or two?
				"Column": 1,
				"Row": 1
			};

			const fields = convenienceApi.layout.getFields(layoutData);
			const needsToAddField = !fields.find(f => f.DisplayName === FIELD_TO_ADD.DisplayName); 

			if (!needsToAddField) {
				console.log(`Field ${FIELD_TO_ADD.DisplayName} already exists -- skipping addition of new field.`);
			} else {
				// should be useful for adding fields to json
				const categories = convenienceApi.layout.getCategories(layoutData);

				// when you add a field, are you adding it to the top of a category, the bottom of a category,
				// 		between existing rows, or within an existing row?
				// your answer will drive what exactly you need to do to add the field (because you may need
				// 		to shift other fields' Row and maybe Column properties around).
				// I'll assume you're adding it between existing rows.
				// I'll add it to a category containing "TR Text Two", by itself in a row before the TR Text Two.
				// this will mean that I'll find the category by it containing the field, then I'll sort the its
				// fields array by Row, then I'll add the new field before the TR Text Two field, and will adjust
				// the Row of EVERYTHING after the new field by adding 1.
				const targetFieldName = 'TR Text Two';
				const trTwo = fields.find(f => f.DisplayName === targetFieldName);
				if (!trTwo) {
					console.log(`Couldn't find ${targetFieldName} field -- skipping addition of new field.`);
				} else {
					console.dir({
						fields,
						categories
					});
					const targetCategory = categories.find((c) => {
						return c.Elements && c.Elements.find((e) => {
							return e.DisplayName === targetFieldName;
						});
					});
					if (targetCategory) {
						FIELD_TO_ADD.Row = trTwo.Row; // set my row
						// shift all other rows down by one
						targetCategory.Elements.forEach((e) => {
							if (e.Row >= FIELD_TO_ADD.Row) {
								e.Row++;
							}
						});
						// add myself to the category
						targetCategory.Elements.push(FIELD_TO_ADD); // Add new field to targetCategory.Elements
					} else {
						console.log(`Couldn't find category containing ${targetFieldName} field -- skipping addition of new field.`);
					}
				}
			}
		} catch(err) {
			console.error('Error in transformLayout', err);
			throw err;
		}
	}

	// public API
	eh[EVENT_NAMES.TRANSFORM_LAYOUT] = addFieldToLayout;

	return eh;
}(convenienceApi, eventNames, privilegedEnvelope))
