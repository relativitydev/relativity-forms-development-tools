/**
 * Name: Relativity Back To List Action Bar Event Handler
 * Description: This event handler adds a "Back to List" button to the action bar that navigates the user to the List Page of the current active `ArtifactTypeId`.
 * Compatibility: Server 2022 & 2023
 */
(function(eventNames, convenienceApi) {
    const APP_ID = "appid";
    const ARTIFACT_TYPE_ID = "artifacttypeid";
    const PARENT_ARTIFACT_ID = "parentartifactid";
    const LIST_PAGE_MODE = "ListPage";
    const RELATIVITY_INTERNAL_PAGE = "relativityinternal.aspx";
    const FORMS_IFRAME = "fdfeeecf-449d-4c86-8c10-b062f58020c5/index.html";
    const BACK_TO_LIST_BUTTON_ID = "backToListButton";

    /**
    * @desc returns corresponding List Page URL
    * @returns {String|undefined} the URL to redirect to
    */
    function generateBackListPageUrl() {
        const currentUrl = new URL(window.location.href);
        const lowercasedCurrentUrl = new URL(window.location.href.toLocaleLowerCase()); // force lowercase to avoid case ambiguity
        const lowercasedSearchParams = lowercasedCurrentUrl.searchParams;
        const isRelativityInternalPage = lowercasedCurrentUrl.pathname.includes(RELATIVITY_INTERNAL_PAGE);
        const isFormsIframe = lowercasedCurrentUrl.pathname.includes(FORMS_IFRAME);

        if (isRelativityInternalPage) {
            // we're attempting to parse https://example/Relativity/RelativityInternal.aspx?AppID=1018203&ArtifactTypeID=1000053&ParentArtifactID=1003663&Mode=Forms&FormMode=add&LayoutID=1040819&SelectedTab=null&navigateListPage=true#/ViewId=1040818
            const pathname = currentUrl.pathname;
            const appId = lowercasedSearchParams.get(APP_ID);
            const artifactTypeId = lowercasedSearchParams.get(ARTIFACT_TYPE_ID);
            const parentArtifactId = lowercasedSearchParams.get(PARENT_ARTIFACT_ID);
            if (appId && artifactTypeId && parentArtifactId) {
                return `${pathname}?AppID=${appId}&ArtifactTypeID=${artifactTypeId}&ArtifactID=${parentArtifactId}&Mode=${LIST_PAGE_MODE}&navigateListPage=true`;
            } else {
                console.error(`Could not determine appId, parentArtifactId and/or artifactTypeId from ${window.location.href}. Aborting.`);
            }
        } else if (isFormsIframe) {
            // we're attempting to parse https://example/Relativity/CustomPages/FDFEEECF-449D-4C86-8C10-B062F58020C5/index.html#/add/1018203/1000053/1003663/1040819?associatedArtifactId=0
            const hash = lowercasedCurrentUrl.hash;
            if (!!hash) {
                const pageBaseWindow = convenienceApi.utilities.getRelativityPageBaseWindow();
                const pathname = (pageBaseWindow && pageBaseWindow.GetApplicationPath()) || "/Relativity"; // fallback to /Relativity if we can't get the application path
                const hashParams = hash.split("/");
                const appId = hashParams[2];
                const artifactTypeId = hashParams[3];
                const parentArtifactId = hashParams[4];
                if (appId && artifactTypeId && parentArtifactId) {
                    return `${pathname}/RelativityInternal.aspx?AppID=${appId}&ArtifactTypeID=${artifactTypeId}&ArtifactID=${parentArtifactId}&Mode=${LIST_PAGE_MODE}&navigateListPage=true`;
                } else {
                    console.error(`Could not determine appId, parentArtifactId and/or artifactTypeId from ${window.location.href}. Aborting.`);
                }
            }
        }
    }

    /**
    * @desc Triggers a redirection to the list page
    * @returns {undefined}
    */
    function returnToListPage() {
        const pageBaseWindow = convenienceApi.utilities.getRelativityPageBaseWindow();
        const navigationApi = pageBaseWindow && pageBaseWindow.relativity && pageBaseWindow.relativity.navigation;
        const listPageUrl = generateBackListPageUrl();

        if (!listPageUrl) {
            alert("Could not determine list page URL. Aborting.");
            return;
        } else {
            console.info("Attempting to navigate to list page URL: ", listPageUrl);
        }

        if (navigationApi) {
            // Use the relativity navigation API to navigate to the list page.
            navigationApi.navigate(listPageUrl);
        } else {
            // There's no relativity in here! Manually go to the URL and cross fingers.
            window.location.href = listPageUrl;
        }
    }


    /**
    * @desc Adds a button to the action bar to return to the list page
    * @param {Object} containers Object containing reference to the action bar container
    * @returns {undefined}
    */
    function addBackToListButtonToActionBar(containers) {
        const button = containers.centerSlotElement.querySelector(`#${BACK_TO_LIST_BUTTON_ID}`);
        if (!button) {
            // Add button if it doesn't exist
            const button = document.createElement("button");
            button.classList.add("rwa-button", "secondary");
            button.textContent = "Back to List";
            button.id = BACK_TO_LIST_BUTTON_ID;
            button.addEventListener("click", function() {
                returnToListPage();
            });

            // centerSlotElement should correspond to the container with the 'action bar buttons'.
            const spanToAppendTo = containers.centerSlotElement;
            spanToAppendTo.appendChild(button);
        }
    }

    const eventHandlers = {};

    eventHandlers[eventNames.CREATE_ACTION_BAR] = function() {
        return convenienceApi.actionBar.containersPromise.then(function(containers) {
            let promise = Promise.resolve();

            // Check to see if buttons already exist
            const hasActionBarButtons = !!containers.centerSlotElement.querySelector("button");

            if (!hasActionBarButtons) {
                promise = convenienceApi.actionBar.createDefaultActionBar();
            }

            return promise.then(() => containers);
        }).then((containers) => {
            addBackToListButtonToActionBar(containers);
        });
    }

    eventHandlers[eventNames.UPDATE_ACTION_BAR] = function() {
        return convenienceApi.actionBar.containersPromise.then(function(containers) {
            addBackToListButtonToActionBar(containers);
        });
    }

    return eventHandlers;
}(eventNames, convenienceApi));
