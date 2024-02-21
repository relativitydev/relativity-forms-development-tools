using kCura.EventHandler;

namespace Console_OpenModalButton
{
	[System.Runtime.InteropServices.Guid("6141e332-7433-4246-a447-aa7cc4100667")]
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
