function cerr(...args) {
	console.error("EH FIDDLE Relativity.Lists extension error", ...args);
}

if (convenienceApi) {
	const atid = Number.parseInt(convenienceApi.artifactTypeID, 10);
	if (!isNaN(atid)) {
		if (atid > 0) {
			if (window.top.relativity && window.top.relativity.navigation && (typeof window.top.relativity.navigation.navigate === "function")) {
				// tell Relativity to navigate immediately away from the EH Fiddle list page to the creation form
				window.top.relativity.navigation.navigate(`/Relativity/RelativityInternal.aspx?Mode=Forms&FormMode=add&AppID=${convenienceApi.workspaceID}&ArtifactTypeID=${atid}`);
			} else {
				cerr("Could not find the Relativity window via window.top");
			}
		} else {
			cerr("The convenienceApi.artifactTypeID less than 1, which is invalid.");
		}
	} else {
		cerr("The convenienceApi.artifactTypeID is NaN.");
	}
} else {
	cerr("The convenienceApi is falsy.");
}