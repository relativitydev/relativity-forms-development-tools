const fs = require("fs").promises;
const SpecReporter = require('jasmine-spec-reporter').SpecReporter

jasmine.getEnv().clearReporters(); // remove default reporter logs
jasmine.getEnv().addReporter(
	new SpecReporter({
		spec: {
			displayPending: true,
		},
	})
);

describe("EH Fiddle event handler file", () => {
	let privilegedEnvelope;
	beforeEach(() => {
		privilegedEnvelope = {};
	});
	it("Produces an event handlers object", () => {
		return createEventHandlersForFileUrl("EH Fiddle.js", {
			privilegedEnvelope
		}).then((eventHandlers) => {
			if (eventHandlers && typeof eventHandlers === "object") {
				expectEventHandlersSurfaceArea(eventHandlers, [
					EVENT_NAMES.TRANSFORM_LAYOUT,
					EVENT_NAMES.HYDRATE_LAYOUT_COMPLETE,
					EVENT_NAMES.CREATE_ACTION_BAR,
					EVENT_NAMES.UPDATE_ACTION_BAR
				]);
			}
		});
	})
});


/* ### TEST UTILITY FUNCTIONS FOLLOW ### */
const EVENT_NAMES = {
	EVENT_HANDLERS_REGISTERED: "eventHandlersRegistered",
	VALIDATION: "validation",
	TRANSFORM_LAYOUT: "transformLayout",
	HYDRATE_LAYOUT: "hydrateLayout",
	HYDRATE_LAYOUT_COMPLETE: "hydrateLayoutComplete",
	REPLACE_OBTAIN_ADDITIONAL_DATA: "replaceObtainAdditionalData",
	POST_OBTAIN_ADDITIONAL_DATA: "postObtainAdditionalData",
	PAGE_LOAD_COMPLETE: "pageLoadComplete",
	PAGE_UNLOAD: "pageUnload",
	CREATE_ACTION_BAR: "createActionBar",
	CREATE_CONSOLE: "createConsole",
	OVERRIDE_PICKER_DATASOURCE: "overridePickerDataSource",
	PAGE_INTERACTION: "pageInteraction",
	PRE_SAVE: "preSave",
	POST_SAVE: "postSave",
	REPLACE_READ: "replaceRead",
	REPLACE_SAVE: "replaceSave",
	REPLACE_GET_NEW_OBJECT_INSTANCE: "replaceGetNewObjectInstance",
	UPDATE_ACTION_BAR: "updateActionBar",
	UPDATE_CONSOLE: "updateConsole",
	VALIDATE_SAVE: "validateSave",
	ITEM_LIST_RELOADED: "itemListReloaded",
	PRE_DELETE: "preDelete",
	REPLACE_DELETE: "replaceDelete",
	POST_DELETE: "postDelete",
	ITEM_LIST_MODIFY_COLUMNS: "itemListModifyColumns",
	ITEM_LIST_MODIFY_ACTIONS: "itemListModifyActions",
	REPLACE_READ_DELETE_DEPENDENCY_LIST: "replaceReadDeleteDependencyList",
	REPLACE_FILE_ACTIONS: "replaceFileActions"
};

/**
 * @desc Turn eventHandler iife text (file content) into code.
 * @param {String} fileTextContent Text of a well-formed eventHandler file. This should be an immediately invoked function (iife) taking three parameters: eventNames, convenienceApi, and privilegedEnvelope, which returns an object.
 * @param {Object} settings Object containing the convenienceApi and privilegedEnvelope to be supplied to the eventHandler construction function.
 * @param {Object} settings.convenienceApi [Optional] Mock or actual instance of the Relativity Forms convenienceApi or the portions of it needed by the test about to be run. While optional, tests are likely to fail if this is not provided, as undefined will be passed to the eventHandler construction if this isn't supplied.
 * @param {Object} settings.privilegedEnvelope [Optional] Object onto which the eventHandlers to be constructed may define their privileged data or functions. If not provided, undefined will be passed to the eventHandler iife. Utility of this envelope in tests depends upon the implementation in the iife.
 * @returns {Object<eventHandlers>} Returns the eventHandlers object created by the fileTextContent.
 */
function createEventHandlersFromFileTextContent(fileTextContent, settings = {}) {
	const {convenienceApi = {} , privilegedEnvelope = {}} = settings;
	let eventHandlers;
	let transformationError = "";
	try {
		eventHandlers = new Function( // eslint-disable-line no-new-func
			"eventNames",
			"convenienceApi",
			"privilegedEnvelope",
			`"use strict"; console.log('entering and executing function wrapper'); return ${fileTextContent}`
		)(
			EVENT_NAMES,
			convenienceApi,
			privilegedEnvelope
		);
	} catch(err) {
		eventHandlers = (void 0);
		transformationError = `Transformation error: ${err}`;
	}
	expect(transformationError).toBe("");
	if (!(eventHandlers && typeof eventHandlers === "object")) {
		expect(`eventHandlers (${eventHandlers})`).toBe("a truthy object");
	}
	return eventHandlers;
};

/**
 * @desc Turn the specified relativeFilePath into event handler code.
 * @param {String} relativeFilePath The location of the requested file.
 * @param {Object} settings Object containing the convenienceApi and privilegedEnvelope to be supplied to the eventHandler construction function.
 * @param {Object} settings.convenienceApi [Optional] Mock or actual instance of the Relativity Forms convenienceApi or the portions of it needed by the test about to be run. While optional, tests are likely to fail if this is not provided, as undefined will be passed to the eventHandler construction if this isn't supplied.
 * @param {Object} settings.privilegedEnvelope [Optional] Object onto which the eventHandlers to be constructed may define their privileged data or functions. If not provided, undefined will be passed to the eventHandler iife. Utility of this envelope in tests depends upon the implementation in the iife.
 * @returns {Promise<Object<eventHandlers>>} A Promise which resolves into the eventHandlers object for the specified fileUrl.
 */
function createEventHandlersForFileUrl(relativeFilePath, settings = {}) {
	const fileTextContentPromise = fs.readFile(relativeFilePath);
	const eventHandlersPromise = fileTextContentPromise.then((fileTextContent) => {
		const eventHandlers = createEventHandlersFromFileTextContent(
			fileTextContent,
			settings
		);
		return eventHandlers;
	});
	return eventHandlersPromise;
};

function expectEventHandlersSurfaceArea (eventHandlers, expectedEventNames) {
	const EMPTY_STRING = "";
	const invalidEventNames = [];
	const missingEventHandlers = [];
	const unexpectedProperties = [];
	const incorrectTypes = [];
	const eventNames = Object.keys(EVENT_NAMES).map((key) => { return EVENT_NAMES[key]; });
	expectedEventNames.forEach((expectedEventName) => {
		if (eventNames.findIndex((key) => { return (key === expectedEventName); }) < 0) {
			invalidEventNames.push(expectedEventName);
		} else if (typeof eventHandlers[expectedEventName] !== "function") {
			missingEventHandlers.push(expectedEventName);
		}
	});
	Object.getOwnPropertyNames(eventHandlers).forEach((propName) => {
		const typeOfProp = typeof eventHandlers[propName];
		const propNameAndType = `${propName} (${typeOfProp})`;
		if (expectedEventNames.includes(propName)) {
			if (typeOfProp !== "function") {
				incorrectTypes.push(propNameAndType);
			}
		} else {
			unexpectedProperties.push(propNameAndType);
		}
	});
	
	let invalidEventNamesExpected = "";
	if (invalidEventNames.length) { invalidEventNamesExpected = `Invalid event names expected: ${invalidEventNames.join(", ")}` }
	expect(invalidEventNamesExpected).toBe(EMPTY_STRING);

	let missingExpectedEventHandlers = "";
	if (missingEventHandlers.length) { missingExpectedEventHandlers = `Missing expected event handlers: ${missingEventHandlers.join(", ")}`; }
	expect(missingExpectedEventHandlers).toBe(EMPTY_STRING);

	if (unexpectedProperties.length) {
		expect(`Unexpected properties found on eventHandlers: ${unexpectedProperties.join(", ")}`).toBe(EMPTY_STRING);
	}

	if (incorrectTypes.length) {
		expect(`The following event handlers were not functions: ${incorrectTypes.join(", ")}`).toBe(EMPTY_STRING);
	}
};

// eof
