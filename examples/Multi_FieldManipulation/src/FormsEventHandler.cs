using kCura.EventHandler;

namespace Multi_FieldManipulation
{
	[System.Runtime.InteropServices.Guid("b0337481-50f1-4306-aff5-bbdfb9821001")]
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
				return new string [] {  "multi-field-manipulation.js" };
			}
		}
	}
}
