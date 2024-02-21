(function (eventNames, convenienceApi) {
	var eventHandlers = {};

	eventHandlers[eventNames.PRE_SAVE] = function(modelData, event) { 
		return convenienceApi.actionBar.containersPromise.then(function(containers) {
			var actionBarButtons = containers.centerSlotElement.children
			for(var i = 0; i < actionBarButtons.length; i++){
				actionBarButtons[i].disabled = true;
			}
			setTimeout(function(){
				for(var i = 0; i < actionBarButtons.length; i++){
					actionBarButtons[i].disabled = false;
				}
			}, 5000);
		});
	};

	return eventHandlers;
}(eventNames, convenienceApi));
