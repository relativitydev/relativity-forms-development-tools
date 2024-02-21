using kCura.EventHandler;

namespace eh_sandbox
{
	[System.Runtime.InteropServices.Guid("0cae30b4-a591-4029-acf7-ac85302ac83f")]
	[kCura.EventHandler.CustomAttributes.Description("Example Page Interaction event handler for Relativity Forms")]
	public class FormsEventHandler : PageInteractionEventHandler
	{
		public override Response PopulateScriptBlocks()
		{
			return new Response();
		}

		public override string [] ScriptFileNames
		{
			get
			{
				return new string [] {  "console-openModalButton.js" };
			}
		}
	}
}
