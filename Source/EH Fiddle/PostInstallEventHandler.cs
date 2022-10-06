using kCura.EventHandler;
using Relativity.API;
using Relativity.Services.Objects;
using System;
using System.Net;

namespace EHFiddlePostInstallHandlerMakeTestInstance
{
    [kCura.EventHandler.CustomAttributes.RunTarget(kCura.EventHandler.Helper.RunTargets.Workspace)]
    [kCura.EventHandler.CustomAttributes.Description("EH Fiddle Post Install EventHandler to make an instance of the Test object")]
    [System.Runtime.InteropServices.Guid("66d3e4f2-fb12-48fb-9d69-e57caedfcaae")]
    public class PostInstallEventHandler : kCura.EventHandler.PostInstallEventHandler
    {
        public override Response Execute()
        {
            IAPILog logger = Helper.GetLoggerFactory().GetLogger();
            logger.LogDebug("EH Fiddle Post Install Event Handler started, logger created.");

            // Update Security Protocol
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

            //Construct a response object with default values.
            kCura.EventHandler.Response retVal = new kCura.EventHandler.Response();
            retVal.Success = true;
            retVal.Message = string.Empty;
            try
            {
                Int32 currentWorkspaceArtifactID = this.Helper.GetActiveCaseID();
                logger.LogDebug(String.Format("EH Fiddle Post Install Event Handler - Case ID Obtained: {0}", currentWorkspaceArtifactID));

                //The Object Manager is the newest and preferred way to interact with Relativity instead of the Relativity Services API(RSAPI).
                using (IObjectManager objectManager = this.Helper.GetServicesManager().CreateProxy<IObjectManager>(ExecutionIdentity.System))
                {
                    // 9BAD9B46-8B4C-4FF3-B260-E31AF3EE4595 is "EH Fiddle Test RDO"
                    // 64683A74-9C8E-485F-A112-6FA0B630BE45 is its Name field
                    var createRequest = new Relativity.Services.Objects.DataContracts.CreateRequest();
                    createRequest.ObjectType = new Relativity.Services.Objects.DataContracts.ObjectTypeRef();
                    createRequest.ObjectType.Guid = new Guid("9BAD9B46-8B4C-4FF3-B260-E31AF3EE4595");
                    var fieldValue = new Relativity.Services.Objects.DataContracts.FieldRefValuePair();
                    var fieldRef = new Relativity.Services.Objects.DataContracts.FieldRef();
                    fieldRef.Guid = new Guid("64683A74-9C8E-485F-A112-6FA0B630BE45");
                    fieldValue.Field = fieldRef;
                    fieldValue.Value = "sample instance";
                    createRequest.FieldValues = new Relativity.Services.Objects.DataContracts.FieldRefValuePair[] { fieldValue };
                    objectManager.CreateAsync(currentWorkspaceArtifactID, createRequest).ConfigureAwait(false).GetAwaiter().GetResult();
                    logger.LogDebug("EH Fiddle Post Install Event Handler - Sample EH Fiddle Test RDO instance created.");
                }
            }
            catch (Exception ex)
            {
                //Change the response Success property to false to let the user know an error occurred
                retVal.Success = false;
                retVal.Message = ex.ToString();
                logger.LogError("EH Fiddle Sample EH Fiddle Test RDO instance creation failed.");
                logger.LogError(retVal.Message);
            }

            return retVal;
        }
    }
}