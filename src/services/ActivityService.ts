import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import reportError from "../utils/reportError"
import { createActivityObjectFromState, createWorkRequestObjectFromState } from "../model/mappers/activityMapper";
import { ActivityFormState} from "../model/ActivityFormState";
import { WorkRequestEditFormState } from "../model/WorkRequestFormState";
import { OperationResult } from "../model/OperationResult";
import { success, failure } from "../model/OperationResult";

export default function ActivityService() {
    const client = generateClient<Schema>();

    async function handleActivityCreation(activity: ActivityFormState, workRequest: WorkRequestEditFormState | null): Promise<OperationResult> {
        const newActivity = createActivityObjectFromState(activity, workRequest);

        try {
            const createActivityResponse = await client.models.Activity.create(newActivity)

            if (createActivityResponse.errors?.length) {
                return failure("Failed to create a new activity in the database", createActivityResponse.errors);
            }

            return success();
        }
        catch(error) {
            return failure("Failed to create a new activity in the database", error);
        }
    }

    async function handleActivityModification(activity: ActivityFormState, workRequest: WorkRequestEditFormState | null): Promise<OperationResult>
    {
        const updatedActivity = createActivityObjectFromState(activity, workRequest);
        if (updatedActivity.id === undefined) {
            throw new Error(reportError("State activityId is undefined during creation of a new activity object"))
        }

        try {
            const updateActivityResponse = await client.models.Activity.update({ ...updatedActivity, id: updatedActivity.id })
            if (updateActivityResponse.errors?.length) {
                return failure("Failed to update an activity in the database", updateActivityResponse.errors);
            }
            return success();
        } catch(error) {
            return failure("Failed to update an activity in the database", error);
        }
    }

    async function handleWorkRequestPromotion(activity: ActivityFormState, workRequest: WorkRequestEditFormState | null): Promise<OperationResult> {
        const newActivity = createActivityObjectFromState(activity, workRequest);
        var newActivityId: string;
        try {
            const createActivityResponse = await client.models.Activity.create(newActivity);

            if (createActivityResponse?.errors?.length) {
                return failure("Failed to create new activity in the database when promoting a work request", createActivityResponse.errors);
            }

            if (!createActivityResponse.data?.id) {
                return failure("Failed to fetch created activity id from the database");
            }

            newActivityId = createActivityResponse.data.id
        } catch (error) {
            return failure("Failed to create new activity in the database when promoting a work request", error);
        }

        const updatedWorkRequest = createWorkRequestObjectFromState(newActivityId, workRequest);
        try {
            const updateWorkRequestResponse = await client.models.WorkRequest.update(updatedWorkRequest);

            if (updateWorkRequestResponse?.errors?.length) {
                return failure("Failed to update a work request in the database", updateWorkRequestResponse.errors);
            }

            return success();
        } catch (error) {
            return failure("Failed to update a work request after promotion in the database", error);
        }
    }

    return {
        handleActivityCreation,
        handleActivityModification,
        handleWorkRequestPromotion
    }
}