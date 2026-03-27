import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import reportError from "../utils/reportError"
import { createActivityObjectFromState, createWorkRequestObjectFromState } from "../model/mappers/activityMapper";
import { ActivityEditFormState} from "../model/ActivityFormState";
import { WorkRequestEditFormState } from "../model/WorkRequestFormState";
import { OperationResult } from "../model/OperationResult";

export default function ActivityService() {
    const client = generateClient<Schema>();

    async function handleActivityCreation(activity: ActivityEditFormState, workRequest: WorkRequestEditFormState | null): Promise<OperationResult> {
        const newActivity = createActivityObjectFromState(activity, workRequest);

        try {
            const createActivityResponse = await client.models.Activity.create(newActivity)

            if (createActivityResponse.errors?.length) {
                return {success: false, message: "Failed to create a new activity in the database", details: createActivityResponse.errors }
            }

            return { success: true }
        }
        catch(error) {
            return { success: false, message: "Failed to create a new activity in the database", details: error }
        }
    }

    async function handleActivityModification(activity: ActivityEditFormState, workRequest: WorkRequestEditFormState | null): Promise<OperationResult>
    {
        const updatedActivity = createActivityObjectFromState(activity, workRequest);
        if (updatedActivity.id === undefined) {
            throw new Error(reportError("State activityId is undefined during creation of a new activity object"))
        }

        try {
            const updateActivityResponse = await client.models.Activity.update({ ...updatedActivity, id: updatedActivity.id })
            if (updateActivityResponse.errors?.length) {
                return {success: false, message: "Failed to update an activity in the database", details: updateActivityResponse.errors};
            }
            return {success: true};
        } catch(error) {
            return {success: false, message: "Failed to update an activity in the database", details: error};
        }
    }

    async function handleWorkRequestPromotion(activity: ActivityEditFormState, workRequest: WorkRequestEditFormState | null): Promise<OperationResult> {
        const newActivity = createActivityObjectFromState(activity, workRequest);
        var newActivityId = null;
        try {
            const createActivityResponse = await client.models.Activity.create(newActivity);

            if (createActivityResponse?.errors?.length) {
                return {success: false, message: "Failed to create new activity in the database when promoting a work request", details: createActivityResponse.errors};
            }

            if (createActivityResponse["data"] === null || createActivityResponse["data"]["id"] === null) {
                return {success: false, message: "Failed to fetch created activity id from the database"};
            }

            newActivityId = createActivityResponse["data"]["id"]
        } catch (error) {
            return {success: false, message: "Failed to create new activity in the database when promoting a work request", details: error};
        }

        const updatedWorkRequest = createWorkRequestObjectFromState(newActivityId, workRequest);
        try {
            const updateWorkRequestResponse = await client.models.WorkRequest.update(updatedWorkRequest);

            if (updateWorkRequestResponse?.errors?.length) {
                return {success: false, message: "Failed to update a work request in the database", details: updateWorkRequestResponse.errors};
            }

            return {success: true};
        } catch (error) {
            return {success: false, message: "Failed to update a work request after promotion in the database", details: error};
        }
    }

    return {
        handleActivityCreation,
        handleActivityModification,
        handleWorkRequestPromotion
    }
}