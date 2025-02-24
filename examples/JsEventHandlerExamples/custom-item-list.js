(function(eventNames, convenienceApi) {
    const eventHandlers = {};
    const COLUMN_1_ID = 1000001;
    const COLUMN_2_ID = 1000002;
    
    eventHandlers[eventNames.TRANSFORM_LAYOUT] = function(layoutData) {        
        layoutData.push({
            Elements: [{
                "View": {
                    "Name": "Test",
                    "ArtifactID": 0, // Artifact ID of the view.
                    "FieldsIds": [COLUMN_1_ID, COLUMN_2_ID], // Artifact IDs of the fields.
                    "Sorts": [],
                    "RenderLinks": true,
                    "HasConditions": false,
                    "GroupDefinitionFieldName": "",
                    "QueryHint": "",
                    ObjectTypeID: 0
                },
                "FieldCollection": [{
                        AvfID: COLUMN_1_ID,
                        "IsVisible": true,
                        "ItemListType": "Text",
                        "IsSortable": true,
                        HeaderName: "Modified By"
                    },
                    {
                        AvfID: COLUMN_2_ID,
                        "IsVisible": true,
                        "ItemListType": "Text",
                        "IsSortable": true,
                        HeaderName: "Modified On"
                    }
                ]
            }]
        });
    };

    eventHandlers[eventNames.ITEM_LIST_MODIFY_ACTIONS] = function(itemListActionsApi, itemListView) {        
        // Override default item list action bar buttons to show no buttons
        itemListActionsApi.initialize();

        // Add an item list action bar button to refresh the item list
        const customAction = itemListActionsApi.addAction(convenienceApi.constants.ACTION_TYPES.NEW);
        customAction.title = "Refresh";
        customAction.action = function() {
            const historyItemListFieldId = self.fieldNameToFieldIdMap.get(HISTORY_ITEM_LIST_NAME);

            convenienceApi.fieldHelper.getHtmlElement(historyItemListFieldId).then(function(itemListElement) {
                const refreshEvent = document.createEvent("Event");
                refreshEvent.initEvent("reloadItemListData", true, true);
                itemListElement.dispatchEvent(refreshEvent);
            });
        }

        // Override item list data source
        itemListActionsApi.setCustomGetDataFunction(function(category, request) {
            // Create some example data to show in the item list with the current date.
            // That way the Modified On time will update to the current time when the item list refreshes.
            const currentDate = new Date();
            const exampleData = [
                {
                    "ArtifactID": 1000010,
                    "Modified By": "Test User",
                    "Modified On": currentDate.toString()
                }, {
                    "ArtifactID": 1000011,
                    "Modified By": "Test User 2",
                    "Modified On": currentDate.toString()
                }
            ];

            return {
                TotalCount: exampleData.length,
                Results: exampleData
            };
        });
    };
    
    return eventHandlers;
})(eventNames, convenienceApi);