using kCura.EventHandler;

namespace FormsExamplePageInteractionEventHandler
{
	[kCura.EventHandler.CustomAttributes.Description("This is an example Page Interaction Event Handler used for a Relativity Forms JS Event Handler")]
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
					"<EXAMPLE_FILE_NAME>.js" // replace with the name of your JS event handler file name
				};
			}
		}
	}
}