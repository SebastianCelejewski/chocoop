import { ActivityFormState } from "../../../model/ActivityFormState";
import { WorkRequestEditFormState } from "../../../model/WorkRequestFormState";
import { useNavigate } from "react-router";
import { ActivityOperations, ActivityOperation } from "../../../model/ActivityOperation";
import reportError from "../../../utils/reportError";
import { OperationResult } from "../../../model/OperationResult";
import ActivityService from "../../../services/ActivityService";

export function useActivityEditActions() {

    const navigate = useNavigate();
    const activityService = ActivityService();

    async function handleSubmit(
        activity: ActivityFormState,
        workRequest: WorkRequestEditFormState | null,
        operationParam: ActivityOperation | undefined
    ) {
        switch(operationParam) {
            case ActivityOperations.CREATE:
                handleResult(
                    await activityService.handleActivityCreation(activity, workRequest),
                    () => navigate("/ActivityList")
                );
                break;
            case ActivityOperations.UPDATE:
                handleResult(
                    await activityService.handleActivityModification(activity, workRequest),
                    () => navigate("/ActivityDetails/" + activity.id)
                );
                break;
            case ActivityOperations.PROMOTE_WORK_REQUEST:
                handleResult(
                    await activityService.handleWorkRequestPromotion(activity, workRequest),
                    () => navigate("/ActivityList")
                );
                break;
        }
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



    function handleResult(result: OperationResult, onSuccess: () => void) {
        if (result.success) {
            onSuccess();
        } else {
            throw new Error(reportError(result.message, result.details));
        }
    }

    return { handleSubmit, handleCancel }
}