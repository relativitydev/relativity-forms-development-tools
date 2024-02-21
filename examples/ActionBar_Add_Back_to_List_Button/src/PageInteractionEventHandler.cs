using kCura.EventHandler;

namespace Relativity_BackToList_Button
{
	[kCura.EventHandler.CustomAttributes.Description("Relativity Forms Event Handler - This event handler adds a 'Back To List' button in Forms to attached applications")]
	[System.Runtime.InteropServices.Guid("81db139e-ec16-4620-af05-87f0b40172e5")]
	public class PageInteractionEventHandler : kCura.EventHandler.PageInteractionEventHandler
	{
		public override Response PopulateScriptBlocks()
		{
			return new Response();
		}

		public override string[] ScriptFileNames
		{
			get
			{
				return new[] {
					"RelativityFormsBackToList.js"
				};
			}
		}
	}
}