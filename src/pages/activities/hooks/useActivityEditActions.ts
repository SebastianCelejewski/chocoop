import type { Schema } from "../../../../amplify/data/resource";
import { ActivityEditFormState } from "../../../model/ActivityFormState";
import { WorkRequestEditFormState } from "../../../model/WorkRequestFormState";
import reportError from "../../../utils/reportError"
import { useNavigate } from "react-router";
import { generateClient } from "aws-amplify/data";
import { ActivityOperations, ActivityOperation } from "../../../model/ActivityOperation";
import { createActivityObjectFromState, createWorkRequestObjectFromState } from "../../../model/mappers/activityMapper";

export function useActivityEditActions() {

    type ValidationErrors<T> = Partial<Record<keyof T, string>>;
    type ActivityValidationResult = ValidationErrors<ActivityEditFormState>;

    const client = generateClient<Schema>();
    const navigate = useNavigate();

    function handleSubmit(activity: ActivityEditFormState, workRequest: WorkRequestEditFormState | null, operationParam: string | undefined): ActivityValidationResult {
        const errors = validateInputs(activity);
        const isValid = Object.keys(errors).length === 0;

        if (!isValid) {
            return errors;
        }

        if (operationParam === ActivityOperations.CREATE) {
            handleActivityCreation(activity, workRequest)
        }

        if (operationParam === ActivityOperations.UPDATE) {
            handleActivityModification(activity, workRequest)
        }

        if (operationParam === ActivityOperations.PROMOTE_WORK_REQUEST) {
            handleWorkRequestPromotion(activity, workRequest)
        }

        return errors;
    }

    function handleCancel(operation: ActivityOperation | undefined, objectId: string | undefined) {
        if (operation === ActivityOperations.CREATE) {
            navigate("/ActivityList")
        } else if (operation === ActivityOperations.PROMOTE_WORK_REQUEST) {
            navigate("/WorkRequestDetails/" + objectId)
        } else {
            navigate("/ActivityDetails/" + objectId)
        }
    }

    function validateInputs(form: ActivityEditFormState): ActivityValidationResult {
        const errors: ActivityValidationResult = {};
        if (!form.user) errors.user = "Wpisz wykonawcę czynności";
        if (!form.type) errors.type = "Wpisz rodzaj czynności";
        if (!form.exp) errors.exp = "Wpisz zdobyte punkty doświadczenia";
        if (!isNaturalNumber(form.exp)) errors.exp = "Punkty doświadczenia muszą być liczbą naturalną";

        return errors;
    }

    function isNaturalNumber(value: string): boolean {
        return /^\d+$/.test(value);
    }

    function handleActivityCreation(activity: ActivityEditFormState, workRequest: WorkRequestEditFormState | null) {
        const newActivity = createActivityObjectFromState(activity, workRequest);

        client.models.Activity
            .create(newActivity)
            .then((createActivityResponse) => {
                if (createActivityResponse?.errors?.length) {
                    reportError("Failed to create a new activity in the database", createActivityResponse.errors);
                    return;
                }
                navigate("/ActivityList")
            })
            .catch((error) => {
                reportError("Failed to create a new activity in the database", error);
            })
    }

    function handleActivityModification(activity: ActivityEditFormState, workRequest: WorkRequestEditFormState | null) {
        const updatedActivity = createActivityObjectFromState(activity, workRequest);
        if (updatedActivity.id === undefined) {
            throw new Error(reportError("State activityId is undefined during creation of a new activity object"))
        }

        client.models.Activity
            .update({ ...updatedActivity, id: updatedActivity.id })
            .then((updateActivityResponse) => {
                if (updateActivityResponse?.errors?.length) {
                    reportError("Failed to update an activity in the database", updateActivityResponse.errors);
                }
                navigate("/ActivityDetails/" + activity.id)
            })
            .catch((error) => {
                reportError("Failed to update an activity in the database", error);
            })
    }

    function handleWorkRequestPromotion(activity: ActivityEditFormState, workRequest: WorkRequestEditFormState | null) {
        const newActivity = createActivityObjectFromState(activity, workRequest);

        client.models.Activity
            .create(newActivity)
            .then((createActivityResponse) => {
                if (createActivityResponse?.errors?.length) {
                    reportError("Failed to create new activity in the database when promoting a work request", createActivityResponse.errors);
                    return;
                }

                if (createActivityResponse["data"] === null || createActivityResponse["data"]["id"] === null) {
                    reportError("Failed to fetch created activity id from the database")
                    return;
                }

                const newActivityId = createActivityResponse["data"]["id"]

                const updatedWorkRequest = createWorkRequestObjectFromState(newActivityId, workRequest);

                client.models.WorkRequest
                    .update(updatedWorkRequest)
                    .then((updateWorkRequestResponse) => {
                        if (updateWorkRequestResponse?.errors?.length) {
                            reportError("Failed to update a work request in the database", updateWorkRequestResponse.errors);
                        }
                        navigate("/ActivityList")
                    })
                    .catch((error) => {
                        reportError("Failed to update a work request in the database", error);
                    })
            })
            .catch((error) => {
                reportError("Failed to create new activity in the database when promoting a work request", error);
            })
    }

    return { handleSubmit, handleCancel }
}