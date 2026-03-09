import type { Schema } from "../../../../amplify/data/resource";
import { ActivityFormState } from "../../../model/ActivityFormState";
import { WorkRequestFormState } from "../../../model/WorkRequestFormState";
import reportError from "../../../utils/reportError"
import { useNavigate } from "react-router";
import { generateClient } from "aws-amplify/data";

export function useActivityEditActions() {

    type ValidationErrors<T> = Partial<Record<keyof T, string>>;
    type ActivityValidationResult = ValidationErrors<ActivityFormState>;

    const client = generateClient<Schema>();
    const navigate = useNavigate();

    function handleSubmit(activity: ActivityFormState, workRequest: WorkRequestFormState | null, operationParam: string): ActivityValidationResult {
        const errors = validateInputs(activity);
        const isValid = Object.keys(errors).length === 0;

        if (!isValid) {
            // setActivityPersonErrorMessage(errors.user ?? "")
            // setActivityTypeErrorMessage(errors.type ?? "")
            // setActivityExpErrorMessage(errors.exp ?? "")
            // setActivityCommentErrorMessage(errors.comment ?? "")
            return errors;
        }

        if (operationParam === "create") {
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

        if (operationParam === "promoteWorkRequest") {
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

        if (operationParam === "update") {
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

        return errors;
    }

    function handleCancel(operationParam: string, objectIdParam: string, workRequest: WorkRequestFormState | null) {
        if (operationParam == "create") {
            navigate("/ActivityList")
        } else if (operationParam == "promoteWorkRequest") {
            if (workRequest !== null) {
                navigate("/WorkRequestDetails/" + objectIdParam)
            }
        } else {
            navigate("/ActivityDetails/" + objectIdParam)
        }
    }

    function validateInputs(form: ActivityFormState): ActivityValidationResult {
        const errors: ActivityValidationResult = {};

        if (!form.user) errors.user = "Wpisz wykonawcę czynności";
        if (!form.type) errors.type = "Wpisz rodzaj czynności";
        if (!form.exp) errors.exp = "Wpisz zdobyte punkty doświadczenia";
        if (!isNaturalNumber(form.exp)) errors.exp = "Punkty doświadczenia muszą być liczbą naturalną";

        return errors;
    }

    function createActivityObjectFromState(activity: ActivityFormState, workRequest: WorkRequestFormState | null) {
        if (activity.date === undefined) {
            throw new Error(reportError("State activityDate is undefined during creation of a new activity object"))
        }
        if (activity.user === undefined) {
            throw new Error(reportError("State activityPerson is undefined during creation of a new activity object"))
        }
        if (activity.type === undefined) {
            throw new Error(reportError("State activityType is undefined during creation of a new activity object"))
        }
        if (activity.exp === undefined || isNaN(Number(activity.exp))) {
            throw new Error(reportError("State activityExp is undefined during creation of a new activity object"))
        }
        return {
            id: activity.id,
            date: activity.date,
            user: activity.user,
            type: activity.type,
            exp: Number(activity.exp),
            comment: activity.comment,
            requestedAs: workRequest?.id
        }
    }

    function createWorkRequestObjectFromState(newActivityId: string, workRequest: WorkRequestFormState | null) {
        if (workRequest === null) {
            throw new Error(reportError("State workRequest is null during creation of a new work request object"))
        }
        if (newActivityId === undefined) {
            throw new Error(reportError("Argument newActivityId is undefined during creation of a new work request object"))
        }
        if (workRequest.id === undefined) {
            throw new Error(reportError("State workRequestId is undefined during creation of a new work request object"))
        }
        if (workRequest.createdDateTime === undefined) {
            throw new Error(reportError("State workRequestCreatedDateTime is undefined during creation of a new work request object"))
        }
        if (workRequest.createdBy === undefined) {
            throw new Error(reportError("State workRequestCreatedBy is undefined during creation of a new work request object"))
        }
        if (workRequest.type === undefined) {
            throw new Error(reportError("State workRequestType is undefined during creation of a new work request object"))
        }
        if (workRequest.exp === undefined || isNaN(Number(workRequest.exp))) {
            throw new Error(reportError("State workRequestExp is undefined during creation of a new work request object"))
        }
        if (workRequest.urgency === undefined || isNaN(Number(workRequest.urgency))) {
            throw new Error(reportError("State workRequestUrgency is undefined during creation of a new work request object"))
        }
        if (workRequest.instructions === undefined) {
            throw new Error(reportError("State workRequestInstructions is undefined during creation of a new work request object"))
        }
        return {
            id: workRequest.id,
            createdDateTime: new Date(workRequest.createdDateTime).toISOString(),
            createdBy: workRequest.createdBy,
            type: workRequest.type,
            exp: Number(workRequest.exp),
            urgency: Number(workRequest.urgency),
            instructions: workRequest.instructions,
            completed: true,
            completedAs: newActivityId
        }
    }

    function isNaturalNumber(value: string): boolean {
        return /^\d+$/.test(value);
    }

    return { handleSubmit, handleCancel }
}