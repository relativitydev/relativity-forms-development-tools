using kCura.EventHandler;

namespace PageInteraction_HideFields
{
	[System.Runtime.InteropServices.Guid("701ef7ea-b085-4db5-a7af-ce77f9eaeb6b")]
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
				return new string [] {  "pageInteraction-hideFields.js" };
			}
		}
	}
}
