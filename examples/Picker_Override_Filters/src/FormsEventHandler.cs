using kCura.EventHandler;

namespace Picker_Override_Filters
{
	[System.Runtime.InteropServices.Guid("458fd0e7-6967-4343-9b67-6575960a5e9a")]
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
				return new string [] {  "picker-override-filters.js" };
			}
		}
	}
}
