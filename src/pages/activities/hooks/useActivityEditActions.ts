import { ActivityEditFormState } from "../../../model/ActivityFormState";
import { WorkRequestEditFormState } from "../../../model/WorkRequestFormState";
import { useNavigate } from "react-router";
import { ActivityOperations, ActivityOperation } from "../../../model/ActivityOperation";
import { ActivityValidationResult } from "../../../model/ActivityValidationResult";
import ActivityService from "../../../services/activityService";
import reportError from "../../../utils/reportError";

export function useActivityEditActions() {

    const navigate = useNavigate();
    const activityService = ActivityService();

    async function handleSubmit(activity: ActivityEditFormState, workRequest: WorkRequestEditFormState | null, operationParam: ActivityOperation | undefined): Promise<ActivityValidationResult> {
        const errors = validateInputs(activity);
        const isValid = Object.keys(errors).length === 0;
        let result = null;

        if (!isValid) {
            return errors;
        }

        switch(operationParam) {
            case ActivityOperations.CREATE:
                result = await activityService.handleActivityCreation(activity, workRequest);
                if (result.success) {
                    navigate("/ActivityList")
                } else {
                    throw new Error(reportError(result.message, result.details));
                }
                break
            case ActivityOperations.UPDATE:
                result = await activityService.handleActivityModification(activity, workRequest)
                if (result.success) {
                    navigate("/ActivityDetails/" + activity.id)
                } else {
                    throw new Error(reportError(result.message, result.details));
                }
                break
            case ActivityOperations.PROMOTE_WORK_REQUEST:
                result = await activityService.handleWorkRequestPromotion(activity, workRequest)
                if (result.success) {
                    navigate("/ActivityList")
                } else {
                    throw new Error(reportError(result.message, result.details));
                }
                break
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

    return { handleSubmit, handleCancel }
}