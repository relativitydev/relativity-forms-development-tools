using kCura.EventHandler;

namespace TransformLayout_AddField
{
	[System.Runtime.InteropServices.Guid("88b0f647-057b-46a6-8177-73a688f871dd")]
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
				return new string [] {  "transformLayout-addField.js" };
			}
		}
	}
}
