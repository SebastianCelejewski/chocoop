import { WorkRequestFormState } from "../../../model/WorkRequestFormState";
import { useNavigate } from "react-router";
import { WorkRequestOperations, WorkRequestOperation } from "../../../model/WorkRequestOperation";
import reportError from "../../../utils/reportError";
import { OperationResult } from "../../../model/OperationResult";
import WorkRequestService from "../../../services/WorkRequestService";

export function useWorkRequestEditActions() {

    const navigate = useNavigate();
    const workRequestService = WorkRequestService();

    async function handleSubmit(
        workRequest: WorkRequestFormState,
        operationParam: WorkRequestOperation | undefined
    ) {
        switch(operationParam) {
            case WorkRequestOperations.CREATE:
                handleResult(
                    await workRequestService.createWorkRequest(workRequest),
                    () => navigate("/WorkRequestList")
                );
                break;
            case WorkRequestOperations.UPDATE:
                handleResult(
                    await workRequestService.updateWorkRequest(workRequest),
                    () => navigate("/WorkRequestDetails/" + workRequest.id)
                );
                break;
        }
    }

    function handleCancel(operation: WorkRequestOperation | undefined, workRequestId: string | undefined) {
        if (operation === WorkRequestOperations.CREATE) {
            navigate("/WorkRequestList")
        } else {
            navigate("/WorkRequestDetails/" + workRequestId)
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