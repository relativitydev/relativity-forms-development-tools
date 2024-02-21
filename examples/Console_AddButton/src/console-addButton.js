(function (eventNames, convenienceApi) {
	var eventHandlers = {};

	var getCarValue = (carField) => {
		return convenienceApi.fieldHelper.getValue(carField).then(function(value){
			return value.Name;
		});
	};

	var getCarName  = (carValue) => {
		return `${carValue} Button`;
	};

	eventHandlers[eventNames.CREATE_CONSOLE] = function () {
		console.log("Inside CREATE_CONSOLE event handler");
		var button = document.createElement("button"); 
		button.id = "testConsoleButton";

		const carField = this.fieldNameToFieldIdMap.get("Type");

		// Button text is set to the value of the car field once saved
		getCarValue(carField).then(function(value) {
			button.textContent = getCarName(value);
		});

		return convenienceApi.console.containersPromise.then(function (containers) {
			containers.rootElement.appendChild(button);
		});
	};

	eventHandlers[eventNames.UPDATE_CONSOLE] = function () {
		console.log("Inside UPDATE_CONSOLE event handler");

		const carField = this.fieldNameToFieldIdMap.get("Type");
		var button = document.getElementById("testConsoleButton");
		getCarValue(carField).then(function(value) {
			button.textContent = getCarName(value);
		});
	};

	return eventHandlers;
 }(eventNames, convenienceApi));
