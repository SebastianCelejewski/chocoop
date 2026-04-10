import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import reportError from "../utils/reportError"
import { createActivityObjectFromState} from "../model/mappers/activityMapper";
import { ActivityFormState} from "../model/ActivityFormState";
import { OperationResult } from "../model/OperationResult";
import { success, failure } from "../model/OperationResult";

export default function ActivityService() {
    const client = generateClient<Schema>();

    async function createActivity(activity: ActivityFormState): Promise<OperationResult> {
        const newActivity = createActivityObjectFromState(activity);

        try {
            const createActivityResponse = await client.models.Activity.create(newActivity)

            if (createActivityResponse.errors?.length) {
                return failure("Failed to create a new activity in the database", createActivityResponse.errors);
            }
            if (!createActivityResponse.data) {
                return failure("Failed to create a new activity in the database", "No activity id was returned");
            }

            const activityId = createActivityResponse.data.id;
            return success(activityId);
        }
        catch(error) {
            return failure("Failed to create a new activity in the database", error);
        }
    }

    async function updateActivity(activity: ActivityFormState): Promise<OperationResult>
    {
        const updatedActivity = createActivityObjectFromState(activity);
        if (updatedActivity.id === undefined) {
            throw new Error(reportError("State activityId is undefined during creation of a new activity object"))
        }

        try {
            const updateActivityResponse = await client.models.Activity.update({ ...updatedActivity, id: updatedActivity.id })
            if (updateActivityResponse.errors?.length) {
                return failure("Failed to update an activity in the database", updateActivityResponse.errors);
            }
            return success(activity.id!);
        } catch(error) {
            return failure("Failed to update an activity in the database", error);
        }
    }

    return {
        createActivity,
        updateActivity
    }
}