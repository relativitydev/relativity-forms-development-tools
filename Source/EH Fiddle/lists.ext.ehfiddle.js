function cerr(...args) {
	console.error("EH FIDDLE Relativity.Lists extension error", ...args);
}

if (convenienceApi) {
	const atid = Number.parseInt(convenienceApi.artifactTypeID, 10);
	if (!isNaN(atid)) {
		if (atid > 0) {
			if (window.top.relativity && window.top.relativity.navigation && (typeof window.top.relativity.navigation.navigate === "function")) {
				// tell Relativity to navigate immediately away from the EH Fiddle list page to the creation form
				const { artifactID: aid, workspaceID: wid } = convenienceApi;
				const dest = `/Relativity/RelativityInternal.aspx?Mode=Forms&FormMode=add&AppID=${wid}&ArtifactTypeID=${atid}&ParentArtifactID=${aid||-1}`;
				console.log("EH FIDDLE Relativity.Lists extension navigating to", dest);
				window.top.relativity.navigation.navigate(dest);
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