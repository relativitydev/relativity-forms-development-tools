(function EH_Fiddle(eventNames, convenienceApi, privilegedEnvelope) {
	"use strict";
	/* ### Header Footnotes

		HF001 - The idea behind the "which" dropdown was to allow more granular development
				and testing of single handlers rather than full file.  The thought was to
				have the content specify only specify either the function itself, or just
				the function's body. Then execution of such a test of verification would
				wrap the content in the iife and event handler object definition, etc. This
				might be a nice enhancement at a later date, but isn't critical for an MVP
				for EH Fiddle, and would increase complexity in validation, test execution,
				and approach for download functionality.

				'which' functionalities:
				* element ids dropdowns Array contains the string, 'which'
				* code block in static options additions:
					ele('which').loading = false;
					const fullFile = document.createElement('optgroup');
					fullFile.setAttribute('label', 'Full File');
					addOpts(fullFile, [['Full File']], true);
					const eventHandlerNames = document.createElement('optgroup');
					eventHandlerNames.setAttribute('label', 'Event Handlers');
					addOpts(eventHandlerNames, Object.entries(EVENT_NAMES), true);
					ele('which_s').append(fullFile, eventHandlerNames);
				* 'which' is included somewhere in the child specification for DOM addition
				* code block in initial selections:
					ele('which').value = 'Full File';
					ele('which').editMode = false;
				* 'which' value considered in verification, testing, and download

		HF002 - We (may) need to check the selected object type for the add forms to work
				correctly in cases where the layout doesn't contain a parent artifact field

		HF003 - Because popup actionbar button defaults work differently from those in opener forms,
				Fiddles can cause the unintended connection to / navigation of the EH Fiddle (opener) form rather
				than the popup itself.  When createActionBar or updateActionBar are not supplied, EH Fiddle 
				supplies default handlers which are suited for popups.  
				This logic also protects against the same problem within CUSTOM generated action bars by
				only providing popup-oriented actionBar method on the convenienceApi given to user-supplied
				handlers. (createDefaultActionBar and generateDefault.actionButtons point to the popup analogs). 

	*/
	const vars = (privilegedEnvelope || {}); // variables for sharing between event handlers, and to expose to testing

	vars.dev = {
		omitReportWhenTestable: false,
		reportModalAvailable: true,
		showTestableInModal: true,
	};
	vars.testOnAccept = true;
	vars.reportOnly = false;

	// add utilities
	const FORMS_RUNTIME_ERROR_LIKELY = ' THIS IS LIKELY TO CAUSE A RUNTIME ERROR IN RELATIVITY FORMS.';
	const CONSOLE_PREFIX = 'EH FIDDLE FORM SAYS:';
	const NEW_FUNCTION_INVOCATION = 'newFunction';
	const TEST_RDO_TYPE_NAME = 'EH Fiddle Test RDO';
	const TEST_RDO_TYPE_LOWER = TEST_RDO_TYPE_NAME.toLocaleLowerCase();
	const ALTERNATE_FUNCTION_REPORT_NAMES = {
		Function: 'new Function()',
		[NEW_FUNCTION_INVOCATION]: 'newly created function',
	};
	function noOp() { }

	vars.elements = {};
	vars.ele = (name) => vars.elements[name];
	vars.NO_VALUE_SENTINEL = '_no-value_';
	vars.ARTIFACT_TYPE_ID = {
		LAYOUT: 16,
		OBJECT_TYPE: 25,
	};
	vars.FORM_MODES = {
		VIEW: 0,
		ADD: 1,
		EDIT: 2,
	};
		
	vars.dataManager = {
		objectManager: {
			transform: {
				dropdownOptionsFromValues: function dropdownOptionsFromValues(response) {
					return response.Objects.map((o) => {
						const [label, value] = o.Values;
						return { value: `${value}`, label: `${label}` };
					});
				},
				dropdownOptionsFromBase: function dropdownOptionsFromBase(response) {
					return response.Objects.map((o) => {
						const value = `${o.ArtifactID}`;
						const [label] = o.Values;
						return { value, label: `${label}` };
					});
				},
				removeSystemObjectTypes: function removeSystemObjectTypes(response) {
					const MINIMUM_DYNAMIC_ARTIFACT_ID = 1000004;
					response.Objects = response.Objects.filter((o) => {
						const [textIdentifier, artifactTypeId, system] = o.Values;
						return ((system !== true) && (artifactTypeId >= MINIMUM_DYNAMIC_ARTIFACT_ID)) ||
								(textIdentifier.toLowerCase() === 'document');
					});
					return response;
				},
				setTestTypeAsSelectedDropdownOption(dropdownOptions) {
					let found = false;
					return dropdownOptions.map((option) => {
						const { label } = option;
						if (!found && label.toLowerCase() === TEST_RDO_TYPE_LOWER) {
							found = true;
							option.selected = true;
						}
						return option;
					});
				}
			},
			queryslim: function queryslimObjectManager(artifactTypeID = 25, fields = [{ Name: "*" }], start = 1, length = 25, condition = "", sorts = []) {
				const url = `Relativity.Objects/workspace/${convenienceApi.getCurrentFormState().workspaceId}/object/queryslim`;
				const payload = {
					request: {
						objectType: { artifactTypeID },
						fields,
						condition,
						"rowCondition": "",
						sorts,
						"convertNumberFieldValuesToString": true,
					},
					start,
					length
				};
				return convenienceApi.relativityHttpClient.keplerPost(url, payload);
			}
		},
		file: {
			downloadFromText: function downloadFromText(filename, fileText) {
				const uricomponentencoding = encodeURIComponent(fileText);
				// const STREAM_URI = `data:application/octet-stream;charset=utf-16le;base64,//${uricomponentencoding}`;
				const PLAINTEXT_URI = `data:text/plain;charset=utf-8,${uricomponentencoding}`;
				const el = document.createElement('a');
				el.style.display = 'none';
				el.setAttribute('download', filename);
				el.setAttribute('href', PLAINTEXT_URI);
				document.body.append(el);
				el.click();
				setTimeout(() => {
					el.remove();
				}, 50000);
			}
		}
	};

	vars.uiCss = {
		// component library
		button: 'rwa-button',
		secondary: 'secondary',
		tertiary: 'tertiary',
		negative: 'negative',
		// eh fiddle specific
		ehfFatal: 'ehf-fatal',
		ehfError: 'ehf-error',
		ehfWarning: 'ehf-warning',
		ehfModalContainer: 'ehf-modal-container',
		ehfModalReportResults: 'ehf-modal-report-results',
	};

	vars.uiText = {
		titleErrors: 'Errors',
		titleWarnings: 'Warnings',
	};

	vars.uiElements = {
		contentContainer: 'div',
		reportGroupTitle: 'h3',
		reportResultSection: 'section',
	};

	vars.uiManager = {
		clearDropdowns: function clearDropdowns(omitObjectType) {
			const dropdowns = ['objectType', 'initialLayout', 'artifactId'];
			if (omitObjectType === true) { dropdowns.shift(); }
			dropdowns.forEach((name) => {
				const el = vars.ele && vars.ele(name);
				el.loading = true;
				if (el && el.setChoices) {
					el.setChoices([]);
				} else {
					if (el) {
						console.error(`"${name}" has no setChoices function.`);
					} else {
						console.error(`"${name}" has no element`);
					}
				}
			});
		},
		createFiddleUi: function createFiddleUi() {

			// element types
			const DROPDOWN = 'rwc-dropdown-input-field';
			const SELECT = 'select';
			const CONTENT = 'textarea';
			const CONTAINER = 'section';
			const SECONDARY_CONTAINER = 'div';
			const BUTTON = 'button';
			const TEXT_INPUT = 'rwc-text-input-field';

			// element ids
			const horizontal_c = ['fiddleArea'];
			const vertical_c = ['content', 'controls', 'real'];
			const containers = horizontal_c.concat(vertical_c);
			const secondaries = ['testButtons']; // ie: inner, lesser containers
			const primaryButton = 'test';
			const secondaryButtons = ['verify','testNoVerify'];
			const tertiaryButtons = ['download'];
			const negativeButtons = [];
			const buttons = [primaryButton, ...secondaryButtons, ...tertiaryButtons, ...negativeButtons];
			const texts = ['downloadFileName'];
			const dropdowns = ['formMode', 'objectType', 'initialLayout', 'artifactId'];

			// elements and accessor function
			const elements = vars.elements;
			const ele = vars.ele;

			const applyFun = (name, fn) => fn(ele(name));
			const addEl = (type, name) => {
				const el = elements[name] = document.createElement(type);
				return el;
			};
			const elFlex = (el) => {
				el.style.display = 'flex';
				return el;
			};
			const elGap6 = (el) => {
				el.style.gap = '6px';
				return el;
			};
			const elGap10 = (el) => {
				el.style.gap = '10px';
				return el;
			};
			const elFlexUp = (el) => {
				elFlex(el).style.flexDirection = 'column';
				return el;
			};
			const elRwaButton = (el) => {
				el.classList.add(vars.uiCss.button);
			};
			const elSecondaryButton = (el) => {
				el.classList.add(vars.uiCss.secondary);
			}
			const elTertiaryButton = (el) => {
				el.classList.add(vars.uiCss.tertiary);
			}
			const elNegativeButton = (el) => {
				el.classList.add(vars.uiCss.negative);
			}
			const elFlex6 = (el) => elGap6(elFlex(el));
			const elFlex10 = (el) => elGap10(elFlex(el));
			const elFlexUp6 = (el) => elGap6(elFlexUp(el));

			const createDropdownEl = (name) => {
				const ddl = addEl(DROPDOWN, name);
				const sel = addEl(SELECT, `${name}_s`);
				sel.classList.add('form-control');
				ddl.editMode = true;
				ddl.loading = true;
				ddl.append(sel);
				return ddl;
			};

			const addOpt = (name, label, value) => {
				const el = typeof name === 'string' ? ele(name) : name;
				const opt = document.createElement('option');
				opt.setAttribute('value', value);
				opt.innerText = label;
				el.append(opt);
			};
			const addOpts = (name, pairs, valueLabel) => {
				pairs.forEach(([l, v], i) => addOpt(name, l, typeof v !== 'undefined' ? v : (valueLabel ? l : i)));
			};

			// Add styles for EH Fiddle (primarily the report dialog)
			const ehfStyle = addEl('style', 'style');
			ehfStyle.innerText = `
	.${vars.uiCss.ehfFatal} {}
	.${vars.uiCss.ehfError} {}
	.${vars.uiCss.ehfWarning} {}
	.${vars.uiCss.ehfModalContainer} { height: 100%; position: relative; display: flex; flex-direction: column; align-items: stretch; }
	.${vars.uiCss.ehfModalReportResults} { overflow-x: hidden; overflow-y: auto; }
	.${ vars.uiCss.ehfModalReportResults } ul { margin-bottom: 0; }
	.${ vars.uiCss.ehfModalReportResults } ul+ul { margin-top: 1em; }
	.${ vars.uiCss.ehfModalReportResults} ul>li+li, .${vars.uiCss.ehfModalReportResults } ul+ul>:first-child { border-top: 1px solid #ccc; }
	.${vars.uiCss.ehfModalReportResults}>:last-chile { margin-bottom: 1em; }
`;
			containers.forEach((name) => addEl(CONTAINER, name));
			secondaries.forEach((name) => addEl(SECONDARY_CONTAINER, name));
			dropdowns.forEach((name) => createDropdownEl(name));
			buttons.forEach((name) => addEl(BUTTON, name));
			texts.forEach((name) => addEl(TEXT_INPUT, name));
			addEl(CONTENT, 'fiddleContent');

			// style them
			secondaries.forEach((name) => applyFun(name, elFlex6));
			horizontal_c.forEach((name) => applyFun(name, elFlex10));
			vertical_c.forEach((name) => applyFun(name, elFlexUp6));
			buttons.forEach((name) => applyFun(name, elRwaButton));
			secondaryButtons.forEach((name) => applyFun(name, elSecondaryButton));
			tertiaryButtons.forEach((name) => applyFun(name, elTertiaryButton));
			negativeButtons.forEach((name) => applyFun(name, elNegativeButton));
			applyFun('fiddleContent', (el) => {
				// completely prep this field, not just style
				// but drop capabilities, too.
				el.style.flex = '1';
				el.style.minHeight = '19rem';
				// suppress drag for file drop
				['dragstart', 'drag', 'dragenter', 'dragover', 'dragleave', 'dragend'].forEach((en) => {
					el.addEventListener(en, (e) => { e.preventDefault(); });
				});
				el.placeholder = 'Type, cut and paste, or drop your event handler JavaScript file here...';
				el.addEventListener('drop', (e) => {
					e.preventDefault();
					const items = e && e.dataTransfer && e.dataTransfer.items;
					if (items && items.length && items.length === 1) {
						const item = items[0];
						switch (item.kind) {
							case 'file':
								item.getAsFile().text().then((fileText) => {
									el.value = fileText;
								});
								vars.ele('downloadFileName').value = e.dataTransfer.files[0].name || '';
								break;
							default: break;
						}
					}
				});
			});
			applyFun('content', (el) => { el.style.flex = '2'; });
			applyFun('controls', (el) => { el.style.flex = '1'; });
			ele('formMode').loading = false;
			applyFun('download', (btn) => { btn.setAttribute('slot', 'input-right'); });
			applyFun('downloadFileName', (rwctext) => {
				rwctext.setAttribute('edit-mode', true);
				rwctext.setAttribute('no-label', true);
				rwctext.setAttribute('size', 'fixed');
				rwctext.setAttribute('placeholder', 'ehFiddleFile.js');
			});

			// add static options to dropdowns
			const { FORM_MODES } = vars;
			addOpts('formMode_s', [
				['add', FORM_MODES.ADD],
				['edit', FORM_MODES.EDIT],
				['view', FORM_MODES.VIEW],
			]);

			// add text
			[
				['formMode', 'Form Mode'],
				['objectType', 'Object Type'],
				['initialLayout', 'Layout'],
				['artifactId', 'Instance'],
			].forEach(([n, t]) => {
				const el = ele(n);
				el.setAttribute('label', t);
				const label = document.createElement('label');
				label.setAttribute('slot', 'label');
				el.append(label);
				el.setAttribute('placeholder', `Select ${t}...`);
			});
			[
				['test', 'Verify and test'],
				['verify', 'Verify without test'],
				['testNoVerify', 'Test without pre-verification'],
				['download','Download eventHandler file'],
			].forEach(([n, t]) => { ele(n).innerText = t; });

			// add handlers
			ele('objectType').addEventListener('change', vars.uiManager.handleDropdownChange.objectType);
			ele('formMode').addEventListener('change', vars.uiManager.handleDropdownChange.formMode);
			ele('verify').addEventListener('click', vars.uiManager.handleButtonClick.verify);
			ele('test').addEventListener('click', () => { vars.uiManager.handleButtonClick.test(); });
			ele('testNoVerify').addEventListener('click', () => { vars.uiManager.handleButtonClick.test(true); });
			ele('download').addEventListener('click', vars.uiManager.handleButtonClick.download);

			// nest them appropriately
			const children = [
				['fiddleArea', ['style', 'controls', 'content']],
				['controls', ['testButtons', 'real']],
				['testButtons', ['test', 'verify', 'testNoVerify']],
				['real', ['objectType', 'formMode', 'initialLayout', 'artifactId']],
				['content', ['downloadFileName', 'fiddleContent']],
				['downloadFileName', ['download']]
			];
			children.forEach(([name, ch]) => {
				ch.forEach((c) => elements[name].append(elements[c]));
			});

			// prep initial selections
			ele('formMode').value = '1';
			// hide the instance value
			vars.uiManager.showHide.formControls(false);

			// hide the test controls
			vars.uiManager.populateDropdownAsync.objectType();

			// return the overall container
			return elements.fiddleArea;
		},
		handleButtonClick: {
			download: function downloadEventHandler() {
				const fileText = vars.ele('fiddleContent').value;
				const fileName = vars.ele('downloadFileName').value || 'ehFiddleFile.js';
				vars.dataManager.file.downloadFromText(fileName, fileText);
			},
			test: function testHandlersOnObjectType(omitCompilationTest) {
				// prep necessary inputs
				const fileText = vars.ele('fiddleContent').value;
				const results = vars.fiddleManager.verify.testControlFields(); // if we're trying to test we NEED object type

				// verify the handlers if user didn't ask to skip that
				if (!omitCompilationTest) { vars.fiddleManager.verify.compilation(fileText, results); }

				// show the report if there are problems or if we're 
				// showing a report for testable stuff (and the user
				// DID NOT ask to verify compilation), show a modal
				const testable = !results.errors.fatal.length
				const checkShouldTest = Promise.resolve(
					(!testable || (!omitCompilationTest && !vars.dev.omitReportWhenTestable)) ?
						vars.userFeedback.reportResults(results, vars.testOnAccept) :
						true
				);

				// run the test if we everything points to running
				checkShouldTest.then((shouldTest) => {
					if (shouldTest) {
						const formMode = vars.ele('formMode').displayValue;
						const needArtifactId = (formMode !== 'add');
						const artifactId = needArtifactId ? parseInt(vars.ele('artifactId').value, 10) : (void 0);
						const layoutDD = vars.ele('initialLayout');
						let layoutId = layoutDD ? parseInt(layoutDD.value, 10) : (void 0);
						// HOW do we get parentArtifactId for 'add' testing? :(
						// hopefully that doesn't prevent EH testing add forms.
						vars.fiddleManager.testHandlerInForms(
							fileText,
							convenienceApi.getCurrentFormState().workspaceId,
							parseInt(vars.ele('objectType').value, 10),
							formMode, artifactId, layoutId,
						);
					}
				});
			},
			verify: function verifyCompilation() {
				vars.userFeedback.reportResults(vars.fiddleManager.verify.compilation(vars.ele('fiddleContent').value), vars.reportOnly);
			},
		},
		handleDropdownChange: {
			formMode: (e) => {
				const { value } = (e && e.detail) || vars.ele('formMode');
				vars.ele('artifactId').style.display = (value === `${vars.FORM_MODES.ADD}`) ? 'none' : '';
			},
			objectType: (e) => {
				let { value, oldValue, field } = (e && e.detail) || {};
				value = (!!value && (value !== vars.NO_VALUE_SENTINEL)) ? value : '';
				vars.uiManager.clearDropdowns(true);
				let result = Promise.resolve();
				if (value &&  (value !== oldValue)) {
					result = Promise.all([
						vars.uiManager.populateDropdownAsync.artifactInstance(value),
						vars.uiManager.populateDropdownAsync.layout(field.displayValue),
					]);
				}
				vars.uiManager.showHide.formControls(!!value);
				return result;
			},
		},
		populateDropdownAsync: {
			artifactInstance: function populateArtifactInstanceDropdownAsyncForType(artifactTypeId) {
				const { dataManager, ele } = vars;
				const { queryslim, transform } = dataManager.objectManager;
				return queryslim(
					artifactTypeId, [{ Name: 'RelativityTextIdentifier' }]
				).then(transform.dropdownOptionsFromBase
				).then((resp) => ele('artifactId').setChoices(resp)
				).catch((err) => console.error('error in queryslim of object type instances', err));
			},
			layout: function populateLayoutDropdownAsynForObjectTypeName(objectTypeName) {
				const { dataManager, ele, ARTIFACT_TYPE_ID } = vars;
				const layoutDD = ele('initialLayout');
				let result = Promise.resolve(false);
				if (layoutDD && typeof layoutDD.setChoices === 'function') {
					const { queryslim, transform } = dataManager.objectManager;
					result = queryslim(
						ARTIFACT_TYPE_ID.LAYOUT,
						[{ Name: 'RelativityTextIdentifier' }], 1, 25, `'Object Type' == '${objectTypeName}'`
					).then(transform.dropdownOptionsFromBase
					).then((resp) => { layoutDD.setChoices(resp);
					}).catch((err) => console.error('error in queryslim of object type layouts', err));
				}
				return result;
			},
			objectType: function populateObjectTypeDropdownAsync() {
				const { dataManager, ele, ARTIFACT_TYPE_ID } = vars;
				const { queryslim, transform } = dataManager.objectManager;
				const objectTypeDropdown = ele('objectType');
				return queryslim(
					ARTIFACT_TYPE_ID.OBJECT_TYPE,
					[{ Name: 'Name' }, { Name: 'Artifact Type Id' }, { Name: 'System' }],
					1, 10000,
					"('System' <> true) OR ('Artifact Type Id' == 10)", [{ FieldIdentifier: { Name: 'Name' }, Order: 0, Direction: 0 }]
				).then((resp) => transform.dropdownOptionsFromValues(transform.removeSystemObjectTypes(resp))
				).then((resp) => {
					objectTypeDropdown.setChoices(resp);
					return resp;
				}).then(transform.setTestTypeAsSelectedDropdownOption
				).then((objecttypes) => {
					const value = (objecttypes.filter((ot) => { return ot.selected })[0] || {value: ""}).value;
					let changeEvent = null;
					if (value) {
						objectTypeDropdown.value = value;
						changeEvent = {
							detail: {
								field: objectTypeDropdown,
								oldValue: vars.NO_VALUE_SENTINEL,
								value,
							}
						};
					}
					return changeEvent;
				}).then(vars.uiManager.handleDropdownChange.objectType
				).catch((err) => console.error(err));
			},
		},
		repopulateFiddleTarget: function repopulateFiddleTarget() {
			let result = false;
			try {
				const fiddleTarget = document.getElementById('fiddleTarget');
				if (fiddleTarget) {
					fiddleTarget.append(vars.uiManager.createFiddleUi());
					result = true;
				}
			} catch (err) {
				console.error(`>>>>>>> ${err}`);
				result = false;
			}
			return result;
		},
		showHide: {
			formControls: function (show) {
				const showHide = (name, hide) => { vars.ele(name).style.display = hide ? 'none' : ''; };
				['formMode', 'initialLayout'].forEach((name) => { showHide(name, !show) });
				if (show) {
					vars.uiManager.handleDropdownChange.formMode();
				} else {
					showHide('artifactId', true);
				}
			}
		},
		showReportModal: function showReportModal(results, testable, testOnAccept) {
			const contentContainer = document.createElement(vars.uiElements.contentContainer);
			contentContainer.classList.add(vars.uiCss.ehfModalContainer);
			const reportResults = document.createElement(vars.uiElements.reportResultSection);
			reportResults.classList.add(vars.uiCss.ehfModalReportResults);
			const titleErrors = document.createElement(vars.uiElements.reportGroupTitle);
			const titleWarnings = document.createElement(vars.uiElements.reportGroupTitle);
			titleErrors.innerText = vars.uiText.titleErrors;
			titleWarnings.innerText = vars.uiText.titleWarnings;
			const reportCount = results.errors.fatal.length + results.errors.other.length + results.warnings.length;
			if (!!reportCount) {
				if (results.errors.fatal.length || results.errors.other.length) {
					reportResults.append(titleErrors);
				}
				if (results.errors.fatal.length) {
					reportResults.append(vars.uiManager.createCollapsibleReportGroup(results.errors.fatal, vars.uiCss.ehfFatal));
				}
				if (results.errors.other.length) {
					reportResults.append(vars.uiManager.createCollapsibleReportGroup(results.errors.other, vars.uiCss.ehfError));
				}
				if (results.warnings.length) {
					reportResults.append(
						titleWarnings,
						vars.uiManager.createCollapsibleReportGroup(results.warnings, vars.uiCss.ehfWarning),
					);
				}
			} else {
				titleWarnings.innerText = 'Congratulations'
				reportResults.append(
					titleWarnings,
					vars.uiManager.createCollapsibleReportGroup(['No warnings or errors!']),
				);
			}
			contentContainer.append(reportResults);
			const model = {
				contentElement: contentContainer,
				title: 'Event Handler Analysis',
			};
			if (testable && testOnAccept) {
				model.actions = [{
					text: 'Test',
					click: () => { model.accept(true); },
				}, {
					text: 'Cancel',
					click: () => { model.cancel(false); },
				}];
			} else {
				model.actions = [{
					text: 'OK',
					click: () => { model.cancel(false); },
				}];
			}
			return convenienceApi.modalService.openCustomModal(model).then((closeResult) => {
				return !closeResult.wasCancelled;
			});
		},
		createCollapsibleReportGroup: function createCollapsibleReportGroup(items, cssClass) {
			const list = document.createElement('ul');
			if (cssClass) { list.classList.add(cssClass); }
			list.append(...items.map((message) => {
				const li = document.createElement('li');
				li.innerText = message;
				return li;
			}));
			return list;
		},
	};

	vars.fiddleManager = {
		makeObject: {
			/*
			mockConvenienceApi: (results) => {
				const info = (what) => { results ? console.info(what) : console.info(what); };
				const warn = (what) => { results ? results.warnings.push(what) : console.warn(what); };
				const error = (what) => { results ? results.errors.other.push(what) : console.error(what); };
				const fatal = (what) => { results ? results.errors.fatal.push(what) : console.error(`fatal error: ${what}`); };
				const cA = convenienceApi;
				const convenienceProxy = (_$name, ob) => {
					const proxIt = new Proxy(ob, {
						set(o, p, v) {
							error(`Attempting to assign to convenienceApi will throw a runtime error in Relativity Forms. Attempted: ${p} = ${v} `);
						},
						get(o, p) {
							const v = o[p];
							const typ = typeof v;
							console.debug(`proxy prop read attempted. typeof ${_$name}.${p} === '${typ}'`);
							switch (typ) {
								case 'number':
								case 'bigint':
									return 8241;
								case 'string':
									return p !== '_$name' ? 'EightTwoFourOne' : _$name;
								case 'boolean':
									return true;
								case 'function':
									return () => (p === 'getCurrentFormState') ? convenienceProxy(`${p}()`, cA.getCurrentFormState()) : (void 0);
								case 'object':
									return convenienceProxy(p, v);
								case 'undefined':
								case 'symbol':
								default:
									return (void 0);
							}
						}
					});
					return proxIt;
				};
				return convenienceProxy(cA);
			},
			*/
			results: function (basis = {}) {
				class FakeNewFunction {
					constructor() {
						++basis.fake.counts.Function;
						return () => {
							++basis.fake.counts[NEW_FUNCTION_INVOCATION];
						}
					}
				}
				basis.eventHandlers = basis.eventHandlers || (void 0);
				basis.errors = basis.errors || {};
				basis.errors.fatal = basis.errors.fatal || [];
				basis.errors.other = basis.errors.other || [];
				basis.warnings = basis.warnings || [];
				basis.fatal = basis.fatal || ((err) => { basis.errors.fatal.push(`FATAL ERROR: ${err}`) });
				basis.error = basis.error || ((err) => { basis.errors.other.push(`ERROR: ${err}`) });
				basis.warn = basis.warn || ((warning) => { basis.warnings.push(`Warning: ${warning}`) });
				basis.fake = basis.fake || {
					resetCounts: () => {
						const bfc = basis.fake.counts;
						Object.entries(bfc).forEach(([k, v]) => { if (typeof v === 'number') { bfc[k] = 0; } });
					},
					counts: {
						eval: 0,
						setTimeout: 0,
						setInterval: 0,
						clearTimeout: 0,
						clearInterval: 0,
						Function: 0,
						[NEW_FUNCTION_INVOCATION]: 0,
					},
					functions: {
						eval: (what) => {
							let result;
							basis.fake.counts.eval++;
							try {
								result = eval(what);
							} catch (err) {
								basis.errors.other.push(`Thrown error during an immediately invoked eval: ${err}${FORMS_RUNTIME_ERROR_LIKELY}`);
								result = (void 0);
							}
							return result;
						},
						setTimeout: (what, when, ...args) => {
							try {
								what(...args);
							} catch (err) {
								basis.errors.other.push(`Thrown error during a ${when || 0}ms setTimeout: ${err}${FORMS_RUNTIME_ERROR_LIKELY}`);
							}
							return ++basis.fake.counts.setTimeout;
						},
						setInterval: (what, when, ...args) => {
							try {
								what(...args);
							} catch (err) {
								basis.errors.other.push(`Thrown error during a ${when || 0}ms setInterval: ${err}${FORMS_RUNTIME_ERROR_LIKELY}`);
							}
							return ++basis.fake.counts.setInterval;
						},
						clearTimeout: () => { ++basis.fake.counts.clearTimeout; },
						clearInterval: () => { ++basis.fake.counts.clearInterval; },
						Function: FakeNewFunction,
						[NEW_FUNCTION_INVOCATION]: noOp
					},
				};
				const reportInvocationsAsErrors = ['eval'];
				reportInvocationsAsErrors.forEach((fn) => {
					if (basis.fake.functions[fn]) {
						basis.fake.functions[fn].reportInvocationAsError = true;
					}
				});
				basis.eventNamesHitCount = basis.eventNamesHitCount || 0;
				basis.proxyEventNames = basis.proxyEventNames || new Proxy(eventNames, {
					get(obj, prop) {
						if (prop in obj) {
							basis.eventNamesHitCount++;
						}
						return obj[prop];
					},
				});
				basis.convenienceApiHitCount = basis.convenienceApiHitCount || 0;
				basis.convenienceApiHits = basis.convenienceApiHits = [];
				basis.proxyConvenienceApi = basis.proxyConvenienceApi || new Proxy({}, {
					get(obj, prop) {
						if (basis.convenienceApiHits.indexOf[prop] < 0) { basis.convenienceApiHits.push(prop); }
						basis.convenienceApiHitCount++;
						return (prop in obj) ? obj[prop] : (void 0);
					},
				});
				basis.privilegedEnvelopeReads = basis.privilegedEnvelopeReads || 0;
				basis.privilegedEnvelopeWrites = basis.privilegedEnvelopeWrites || 0;
				basis.proxyPrivilegedEnvelope = basis.proxyPrivilegedEnvelope || new Proxy({}, {
					get(obj, prop) {
						basis.privilegedEnvelopeReads++;
						return (prop in obj) ? obj[prop] : (void 0);
					},
					set(obj, prop, value) {
						basis.privilegedEnvelopeWrites++;
						obj[prop] = value;
						return true;
					}
				});
				return basis;
			},
		},
		testHandlerInForms: function testHandlerInForms(textContent, workspaceId, artifactTypeId, formModeName, artifactId = 0, layoutId = 0) {
			const eventHandlerFactory = function (popupControlApi, popupEventNames, popupConvenienceApi) {
				// Replacing unsupplied createActionBar and updateActionBar with default generation of popup action bar.
				// See Header Footnote HF003
				const createDefaultPopupActionBar = function() {
					return popupConvenienceApi.actionBar.destroy().then(() => {
						return popupConvenienceApi.actionBar.containersPromise;
					}).then(({ leftSlotElement, centerSlotElement, rootElement }) => {
						const buttons = popupConvenienceApi.actionBar.generateDefault.actionButtonsForPopup(popupControlApi, popupConvenienceApi.formSettings.ObjectTypeName);
						const layoutDropdown = popupConvenienceApi.actionBar.generateDefault.layoutDropdown();
						rootElement.className = "rwa-button-group";
						buttons.forEach((button) => {
							centerSlotElement.appendChild(button);
						});
						leftSlotElement.appendChild(layoutDropdown);
					});
				};
				// Providing a popupConvenienceApi clone to allow correction of actionBar button generation away from OPENER oriented actions.
				// See Header Footnote HF003
				const targetGenerateDefault = { ...popupConvenienceApi.actionBar.generateDefault };
				targetGenerateDefault.actionButtons = () => targetGenerateDefault.actionButtonsForPopup(popupControlApi, popupConvenienceApi.formSettings.ObjectTypeName);
				const targetPopupConvenienceApi = { ...popupConvenienceApi };
				targetPopupConvenienceApi.actionBar = { ...targetPopupConvenienceApi.actionBar };
				targetPopupConvenienceApi.actionBar.createDefaultActionBar = createDefaultPopupActionBar;
				targetPopupConvenienceApi.actionBar.generateDefault = targetGenerateDefault;

				let handlers = null;
				try {
					handlers = (new Function('eventNames', 'convenienceApi',
					`"use strict";
					try {
var document = convenienceApi.console.generate.button().ownerDocument;
var window = document.defaultView;
const { setTimeout, console, alert, clearTimeout, setInterval, clearInterval, Promise } = window;
const handlers = ${textContent};
return handlers; } catch (err) { console.error(\`FATAL ERROR: \${err}\`); }`)(popupEventNames, targetPopupConvenienceApi));
					const success = typeof handlers === 'object' && handlers;
					if (success) {
						const { createActionBar = createDefaultPopupActionBar, updateActionBar = createDefaultPopupActionBar } = handlers;
						handlers.createActionBar = createActionBar;
						handlers.updateActionBar = updateActionBar;
					} else {
						vars.userFeedback.reportResults({
							errors: {
								fatal: [
									'FATAL ERROR DURING EXECUTION: Failed to create Relativity Forms event handlers object within the popup.'
								],
								other: [],
							},
							warnings: [],
						}, false);
					}
					return success ? handlers : { createActionBar: createDefaultPopupActionBar, updateActionBar: createDefaultPopupActionBar };
				} catch (err) {
					const msg = `${CONSOLE_PREFIX} - FATAL ERROR TRYING TO MAKE FIDDLE IN POPUP: ${err}`;
					console.error(msg);
					alert(msg);
				}
			};
			let method;
			let includeArtifactId = true;
			switch (formModeName) {
				case 'view':
					method = 'openView';
					break;
				case 'edit':
					method = 'openEdit';
					break;
				case 'add':
					includeArtifactId = false;
					method = 'openAdd';
					break;
				default:
					vars.userFeedback.error(`Invalid formMode supplied: '${formModeName}'. Valid modes: ['add','edit','view']`);
					return;
			}
			const openArgs = {
				workspaceId,
				artifactTypeId,
				eventHandlerFactory,
			};
			if (includeArtifactId) {
				openArgs.artifactId = artifactId;
			}
			if (typeof layoutId === 'number' && layoutId > 0) {
				openArgs.layoutId = layoutId;
			}
			convenienceApi.relativityFormsPopup[method](openArgs);
		},
		verify: {
			compilation: function verifyCompilation(textContent, resultBasis) {
				const results = vars.fiddleManager.makeObject.results(resultBasis);
				const fakeFunctions = [];
				const fakeFunctionNames = [];
				Object.getOwnPropertyNames(results.fake.functions).forEach((ffn) => {
					if (ffn !== NEW_FUNCTION_INVOCATION) {
						fakeFunctionNames.push(ffn);
						fakeFunctions.push(results.fake.functions[ffn]);
					}
				});
				if (typeof textContent === 'string' && textContent && textContent.trim()) {
					try {
						if (textContent.indexOf('=eval') >= 0 || textContent.indexOf('= eval') >= 0 || textContent.indexOf('=   eval') >= 0) {
							results.warn('Handler file seems to alias potentially dangerous function \'eval()\'.');
						}
						if (textContent.indexOf('eval(') >= 0) {
							results.warn('Handler file seems to invoke potentially dangerous function \'eval()\'.');
						}
						if (textContent.indexOf('setTimeout') >= 0) {
							results.warn('Handler file uses \'setTimeout\'; perhaps it could be refactored with Promise?');
						}
						// things operate differently in compiling when we tack-in the return, so we test this both ways
						// to make certain we catch compile errors which DON'T show up when we've tacked-in the return.
						// this catches problems which would cause forms to fail during execution but not within the
						// conversion from text to function (such as use of an undeclared variable further down than the
						// return line).
						try {
							(new Function(...fakeFunctionNames, 'eventNames', 'convenienceApi', 'privilegedEnvelope', `${textContent.trim()}`)(...fakeFunctions, results.proxyEventNames, results.proxyConvenienceApi, results.proxyPrivilegedEnvelope));
						} catch (err) {
							results.fatal(`(first-pass parsing): ${err}`);
						}
						results.firstPass = {
							eventNamesHitCount: results.eventNamesHitCount,
							convenienceApiHitCount: results.convenienceApiHitCount,
							convenienceApiHits: [].concat(results.convenienceApiHits),
							privilegedEnvelopeReads: results.privilegedEnvelopeReads,
							privilegedEnvelopeWrites: results.privilegedEnvelopeWrites,
						};
						(function resetVariableHitStatistics() {
							results.eventNamesHitCount = 0;
							results.convenienceApiHitCount = 0;
							results.convenienceApiHits = [];
							results.privilegedEnvelopeReads = 0;
							results.privilegedEnvelopeWrites = 0;
						}());
						results.fake.firstPassCounts = JSON.parse(JSON.stringify(results.fake.counts));
						results.fake.resetCounts();
						// parse the compilation WITH the return
						// gotta remove the eval fake in the more realistic compilation
						// because the "use strict"; throws errors on our fake's addition
						// of the 'eval' function.  But oddly NOT in usage within the actual
						// text content --> head-scratcher, that.
						let pullOutEval = true;
						let fakesHadEval = false;
						try {
							const evalIdx = fakeFunctionNames.indexOf('eval');
							if (pullOutEval && evalIdx >= 0) {
								fakesHadEval = true;
								fakeFunctionNames.splice(evalIdx, 1);
								fakeFunctions.splice(evalIdx, 1);
							}
							results.eventHandlers = (new Function(...fakeFunctionNames, 'eventNames', 'convenienceApi', 'privilegedEnvelope', `"use strict"; return ${textContent}`)(...fakeFunctions, results.proxyEventNames, results.proxyConvenienceApi, results.proxyPrivilegedEnvelope));
						} catch (err) {
							results.fatal(`(second-pass parsing): ${err}`);
						}
						// report warnings of iife execution of potentially questionable functions
						// put eval back in if it was in there, so that we can include warnings about its invocation
						if (fakesHadEval && pullOutEval) { fakeFunctionNames.push('eval'); }
						fakeFunctionNames.push(NEW_FUNCTION_INVOCATION); // so we can report if the Function constructor is used
						fakeFunctionNames.forEach((ffn) => {
							const reportedFunctionName = ALTERNATE_FUNCTION_REPORT_NAMES[ffn] || ffn;
							const fn = results.fake.functions[ffn];
							const fnReportAsError = fn && fn.reportInvocationAsError;
							const suffix = fnReportAsError ? FORMS_RUNTIME_ERROR_LIKELY : '';
							const resultArrayToUse = fnReportAsError ? results.errors.other : results.warnings;
							const fpc = results.fake.firstPassCounts[ffn];
							const spc = results.fake.counts[ffn];
							if (fpc !== spc) {
								if (fpc) { resultArrayToUse.push(`${fpc} immediate invocations of ${reportedFunctionName} in first-pass of handler file compilation analysis.${suffix}`); }
								if (spc) { resultArrayToUse.push(`${spc} immediate invocations of ${reportedFunctionName} in final handler file compilation analysis.${suffix}`); }
							} else if (spc) {
								resultArrayToUse.push(`${spc} immediate invocations of ${reportedFunctionName} in final handler file compilation analysis.${suffix}`);
							}
						});
						// report issues with compilation results
						if (!results.eventHandlers || (typeof results.eventHandlers !== 'object')) {
							results.fatal('Handler file does not return an object.');
						} else {
							let ehEntries = Object.entries(results.eventHandlers);
							let ehFunctionEntries = ehEntries.filter((e) => typeof e[1] === 'function');
							if (ehEntries.length !== ehFunctionEntries.length) {
								results.warn(`${ehEntries.length - ehFunctionEntries.length} non-function properties returned from handler file. These will be ignored.`);
							}
							if (ehFunctionEntries.length < 1) {
								results.fatal('Handler file returns no event handlers.');
							} else {
								const EH_VALUES = Object.values(eventNames);
								const actualHandlers = ehFunctionEntries.filter(([key, val]) => { return (EH_VALUES.indexOf(key) >= 0); });
								if (actualHandlers.length !== ehFunctionEntries.length) {
									results.warn(`${ehFunctionEntries.length - actualHandlers.length} functions which are not event handlers. These will be ignored.`);
								}
								if (actualHandlers.length < 1) {
									results.fatal('Handler file returns no event handlers.');
								}
							}
						}
						// report other analysis statistics
							// check count of accessors on event names; warn if 0
							// check count of accessors of convenienceApi in immediately-invoked code; warn if > 0
						const reportHitDifferenceWarning = (first, second, what) => {
							results.warn(`${what} differs between analysis passes. first pass: (${first})  final: (${second})`+'\ndifferences could be due to execptions thrown in execution');
						}
						if (results.firstPass.eventNamesHitCount !== results.eventNamesHitCount) {
							reportHitDifferenceWarning(results.firstPass.eventNamesHitCount, results.eventNamesHitCount, 'Number of eventNames used');
						}
						if (results.firstPass.convenienceApiHitCount !== results.convenienceApiHitCount) {
							reportHitDifferenceWarning(results.firstPass.convenienceApiHitCount, results.convenienceApiHitCount, 'Number of convenienceApi functions used');
						}
						if (results.firstPass.convenienceApiHits.length !== results.convenienceApiHits.length) {
							reportHitDifferenceWarning(results.firstPass.convenienceApiHits.join(''), results.convenienceApiHits.join(''), 'convenienceApi functions hit');
						}
						if (results.firstPass.privilegedEnvelopeWrites !== results.privilegedEnvelopeWrites) {
							reportHitDifferenceWarning(results.firstPass.privilegedEnvelopeWrites, results.privilegedEnvelopeWrites, 'Number of writes to privilegedEnvelope');
						}
						if (results.firstPass.privilegedEnvelopeReads !== results.privilegedEnvelopeReads) {
							reportHitDifferenceWarning(results.firstPass.privilegedEnvelopeReads, results.privilegedEnvelopeReads, 'Number of reads from privilegedEnvelope');
						}
						if (!results.eventNamesHitCount) {
							results.warn('Handler file does not appear to use eventNames object. We recommend use of this object over hard-coded event name literal strings.');
						}
						if (results.convenienceApiHitCount) {
							results.warn(`Handler file makes use of convenience api during immediately invoked logic. This could be unsafe. (Properties used: [${results.convenienceApiHits.join(', ')}])`);
						}
					} catch (err) {
						const msg = `UNEXPECTED FATAL ERROR DURING ANALYSIS: ${err}`;
						!results.errors.fatal.includes(msg) && results.errors.fatal.push(msg);
					}
				} else {
					results.fatal('Handler file is empty or whitespace-only.');
				}
				return results;
			},
			testControlFields: function verifyTestControlFields() {
				const { ele, NO_VALUE_SENTINEL } = vars;
				const results = vars.fiddleManager.makeObject.results();
				let artifactId = ele('artifactId').value;
				let layoutId = ele('initialLayout').value;
				artifactId = (artifactId && artifactId !== NO_VALUE_SENTINEL) ? parseInt(artifactId, 10) : (void 0);
				layoutId = (layoutId && layoutId !== NO_VALUE_SENTINEL) ? parseInt(layoutId, 10) : (void 0);
				artifactId = Math.abs(artifactId || 0);
				layoutId = Math.abs(layoutId || 0);
				const formMode = ele('formMode').displayValue;
				const artifactTypeId = parseInt(ele('objectType').value, 10) || 0;
				if (!artifactTypeId) {
					results.fatal('An Object Type must be selected in order to test the event handlers');
				}
				switch (formMode) {
					case 'view':
					case 'edit':
						if (!artifactId) {
							results.fatal(`In order to test the ${formMode} mode, and artifact instance must be selected.`);
						}
						break;
					case 'add':
						// nothing special
						if (artifactId) {
							results.warn(`The artifact instance will be ignored in test the ${formMode} mode.`);
						}
						break;
					default:
						results.fatal('A form mode must be selected in order to test the event handlers');
						break;
				}
				return results;
			},
		},
	}

	vars.userFeedback = {
		// TODO: Remove commented code: commenting as I believe confirm is unused
		// confirm: function confirm(what) {
		//     console.error('EH FIDDLE AUTO-SENT FALSE TO CONFIRM:', what);
		//     return false;
		// },
		error: function error(what) {
			console.error(CONSOLE_PREFIX, what);
		},
		info: function info(what) {
			console.info(CONSOLE_PREFIX, what);
		},
		warn: function warn(what) {
			console.warn(CONSOLE_PREFIX, what);
		},
		reportResults: function reportResults(results, testOnAccept) {
			const testable = !results.errors.fatal.length;
			let result = Promise.resolve(testable);
			if (vars.dev.reportModalAvailable && (!testable || vars.dev.showTestableInModal)) {
				result = vars.uiManager.showReportModal(results, testable, testOnAccept);
			} else {
				vars.userFeedback.reportResultsToConsole(results, testable, testOnAccept);
			}
			return result;
		},
		reportResultsToConsole: function reportResultsToConsole(results, testable) {
			const { warnings, eventHandlers, errors } = results;
			const { fatal, other } = errors;
			console.group(`results: (${testable ? (!other.length ? 'testable' : 'testable, with errors') : 'not testable'})`);
			if (!testable) {
				console.group('fatal errors');
				fatal.forEach((e) => console.error(e));
				console.groupEnd();
			}
			if (other.length) {
				console.group('non-fatal errors');
				other.forEach((e) => console.error(e));
				console.groupEnd();
			}
			if (warnings.length) {
				console.group('warnings');
				warnings.forEach((e) => console.warn(e));
				console.groupEnd();
			}
			if ((typeof eventHandlers === 'object') && (eventHandlers)) {
				const ehValues = Object.values(eventNames);
				console.log(`Handler file contains ${Object.entries(eventHandlers).filter(([key, value]) => {
					return ((typeof value === 'function') && (ehValues.indexOf(key) >= 0));
				}).length} event handlers.`);
			}
			console.log('results object:');
			console.dir(results);
			console.groupEnd();
		},
	};

	////////////////////////////////////////////////////////////////////////////////////
	// FORMS SPECIFICS FOLLOW
	const eventHandlers = {};

	eventHandlers[eventNames.TRANSFORM_LAYOUT] = function (layoutData) {
		// EH Fiddle expects only a single layout for this type, and that
		// layout contains only a single category, which in turn contains
		// only a single custom text. This transform places the EH Fiddle
		// DOM target within the custom text.
		const texts = convenienceApi.layout.getCustomTexts(layoutData);
		texts.forEach((t) => { t.Value = '<div id="fiddleTarget"></div>' });
		// TODO: remove -- convenent code used when developing/debugging EH Fiddle
		// window.ehFiddle = {
		//     vars,
		//     convenienceApi,
		//     layoutData,
		//     texts
		// };
	};

	eventHandlers[eventNames.HYDRATE_LAYOUT_COMPLETE] = function () {
		// By HYDRATE_LAYOUT_COMPLETE Relativity Forms has done everything
		// which it can to ensure that the layout is hydrated; however, the
		// actual DOM rendering and conversion of underlying web components
		// from flat markup to fully functional and rendered content is
		// handled by the browser and its ability to scan and interpret the
		// DOM put in place by Relativity Forms. Sometimes, this happens
		// later than HYDRATE_LAYOUT_COMPLETE and so fiddleTarget may not
		// be present in the DOM, yet.  This function polls every 10ms for
		// its presence, and once it exists, populates the EH Fiddle controls.
		let working;
		let interval = setInterval(() => {
			if (!working) {
				working = true;
				if (vars.uiManager.repopulateFiddleTarget()) {
					clearInterval(interval);
					working = false;
				} else {
					working = false;
				}
			}
		}, 10);
	}

	eventHandlers[eventNames.CREATE_ACTION_BAR] = eventHandlers[eventNames.UPDATE_ACTION_BAR] = function emptyActionBar() {
		convenienceApi.actionBar.destroy();
	};
	return eventHandlers;
}(eventNames, convenienceApi, privilegedEnvelope));