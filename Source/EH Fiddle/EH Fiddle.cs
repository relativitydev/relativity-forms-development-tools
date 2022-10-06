using kCura.EventHandler;

namespace EH_Fiddle
{
    [kCura.EventHandler.CustomAttributes.Description("RelativityForms PageInteractionEventHandler for EH Fiddle")]
    [System.Runtime.InteropServices.Guid("d1316a39-0baf-48a7-b88c-f38eac9eb56c")]
    public class EH_Fiddle : kCura.EventHandler.PageInteractionEventHandler
    {
        public override Response PopulateScriptBlocks()
        {
            // Leave Empty - It is ignored by RelativityForms.
            return new kCura.EventHandler.Response();
        }
        public override string[] ScriptFileNames
        {
            get
            {
                return new string[] {
                    "EH Fiddle.js"
                };
            }
        }

        public override string[] AdditionalHostedFileNames
        {
            get
            {
                return new string[] {
                };
            }
        }
    }
}