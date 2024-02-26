/**
 * Name: Add Modal Button Console Event Handler
 * Description: This event handler adds a button to the console that opens a picker modal when clicked.
 */
(function (eventNames, convenienceApi) {
	var eventHandlers = {};
	var selectedValues = [];
	var dataProvider = convenienceApi.itemListDataProviderFactory.create(
		"object",
		{
			workspaceId: convenienceApi.getCurrentFormState().workspaceId,
			objectTypeId: 10,
			textIdentifierColumnName: "Control Number",
			viewArtifactId: 0, // Use default view for object
		}
	);

	var openCustomPicker = () =>
		convenienceApi.modalService
			.openMultiListPickerModal({ // or .openSingleListPickerModal
				selectedValues: selectedValues,
				persistenceKey: "CustomPickerForDocument",
				columnsPersistenceKey: "CustomPickerForDocumentColumns",
				itemListDataProvider: dataProvider,
				rowKeyName: "ArtifactID",
				objectTypeId: 10,
				label: "Document",
				workspaceId: convenienceApi.getCurrentFormState().workspaceId,
			})
			.then((result) => {
				if (!result.wasCancelled) {
					selectedValue = result.output;
				}
			});

	eventHandlers[eventNames.CREATE_CONSOLE] = function () {
		var button = document.createElement("button");
		button.id = "custompicker";
		button.textContent = "Open Custom Picker";
		button.addEventListener("click", () => {
			openCustomPicker();
		});
		return convenienceApi.console.containersPromise.then(function (containers) {
			containers.rootElement.appendChild(button);
		});
	};

	return eventHandlers;
})(eventNames, convenienceApi);
