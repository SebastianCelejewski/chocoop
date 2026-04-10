import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import reportError from "../utils/reportError"
import { WorkRequestFormState} from "../model/WorkRequestFormState";
import { OperationResult } from "../model/OperationResult";
import { success, failure } from "../model/OperationResult";
import { mapWorkRequestFormStateToWorkRequestModel } from "../model/mappers/workRequestMapper";

export default function WorkRequestService() {
    const client = generateClient<Schema>();

    async function createWorkRequest(workRequest: WorkRequestFormState): Promise<OperationResult> {
        const newWorkRequest = mapWorkRequestFormStateToWorkRequestModel(workRequest);

        try {
            const createWorkRequestResponse = await client.models.WorkRequest.create(newWorkRequest)

            if (createWorkRequestResponse.errors?.length) {
                return failure("Failed to create a new workrequest in the database", createWorkRequestResponse.errors);
            }
            if (!createWorkRequestResponse.data) {
                return failure("Failed to create a new workrequest in the database", "No WorkRequest id was returned");
            }

            const workRequestId = createWorkRequestResponse.data.id;
            return success(workRequestId);
        }
        catch(error) {
            return failure("Failed to create a new workrequest in the database", error);
        }
    }

    async function updateWorkRequest(workRequest: WorkRequestFormState): Promise<OperationResult>
    {
        const updatedWorkRequest = mapWorkRequestFormStateToWorkRequestModel(workRequest);
        if (updatedWorkRequest.id === undefined) {
            throw new Error(reportError("State workrequestId is undefined during creation of a new workrequest object"))
        }

        try {
            const updateWorkRequestResponse = await client.models.WorkRequest.update({ ...updatedWorkRequest, id: updatedWorkRequest.id })
            if (updateWorkRequestResponse.errors?.length) {
                return failure("Failed to update an workrequest in the database", updateWorkRequestResponse.errors);
            }
            return success(workRequest.id!);
        } catch(error) {
            return failure("Failed to update an workrequest in the database", error);
        }
    }

    return {
        createWorkRequest,
        updateWorkRequest
    }
}