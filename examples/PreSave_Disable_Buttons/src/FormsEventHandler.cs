using kCura.EventHandler;

namespace PreSave_Disable_Buttons
{
	[System.Runtime.InteropServices.Guid("1699e42e-9900-42ec-aaa1-a9d3b28bd778")]
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
				return new string [] {  "preSave-disable-buttons.js" };
			}
		}
	}
}
