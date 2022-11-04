using kCura.EventHandler;
using Relativity.API;
using Relativity.Services.Objects;
using System;
using System.Net;

namespace EH_Fiddle
{
	[kCura.EventHandler.CustomAttributes.Description("List Page Interaction EventHandler")]
	[System.Runtime.InteropServices.Guid("274a55ca-d37f-4bd8-ba91-950dd13fc633")]
	public class RelativityListsListPageInteractionEventHandler : kCura.EventHandler.ListPageInteractionEventHandler
	{
		public override Response PopulateScriptBlocks()
		{
			// Create an empty response object with default values
			// Purely for syntax correctness of the class -- Relativity.Lists ignores this function
			ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
			kCura.EventHandler.Response retVal = new kCura.EventHandler.Response();
			retVal.Success = true;
			retVal.Message = string.Empty;
			return retVal;
		}

		public override string[] ScriptFileNames => new string[] { "lists.ext.ehfiddle.js" };

		public override string[] AdditionalHostedFileNames => new string[] { };
	}
}
