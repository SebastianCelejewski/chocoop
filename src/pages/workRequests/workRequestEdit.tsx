import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { getCurrentUser } from "aws-amplify/auth";

import User from "../../model/User";
import { urgencyList, Urgency } from "../../model/Urgency";
import reportError from "../../utils/reportError";
import { getCurrentDateTime } from "../../utils/dateUtils";
import { WorkRequestFormState } from "../../model/WorkRequestFormState";
import { mapWorkRequestModelToWorkRequestFormState } from "../../model/mappers/workRequestMapper";
import { OperationResult } from "../../model/OperationResult";
import WorkRequestService from "../../services/WorkRequestService";

import vacuuming from "../../assets/images/activities/v2/vacuuming_64x64.png?url";
import dishwashing from "../../assets/images/activities/v2/dishwashing_64x64.png?url";
import shopping_local from "../../assets/images/activities/v2/shopping_local_64x64.png?url";
import shopping_Auchan from "../../assets/images/activities/v2/shopping_Auchan_64x64.png?url";
import cooking from "../../assets/images/activities/v2/cooking_64x64.png?url";
import laundry_start from "../../assets/images/activities/v2/laundry_start_64x64.png?url";
import laundry_end from "../../assets/images/activities/v2/laundry_end_64x64.png?url";
import laundry_sorting from "../../assets/images/activities/v2/laundry_sorting_64x64.png?url";
import taking_garbage_out from "../../assets/images/activities/v2/taking_garbage_out_64x64.png?url";

type ValidationState = {
    createdBy?: string;
    type?: string;
    exp?: string;
    urgency?: string;
};

const workRequestService = WorkRequestService();

function createEmptyWorkRequest(createdBy: string): WorkRequestFormState {
    return {
        createdDateTime: getCurrentDateTime(),
        createdBy,
        type: "",
        exp: "",
        urgency: "0",
        instructions: "",
        completed: false,
        completedAs: undefined
    };
}

function WorkRequestEdit({users}: {users: Map<string, User>}) {
    const navigate = useNavigate();
    const params = useParams();
    const operationParam = params["operation"];
    const workRequestIdParam = params["id"];

    const [workRequest, setWorkRequest] = useState<WorkRequestFormState | null>(null);
    const [validationState, setValidationState] = useState<ValidationState>({});

    useEffect(() => {
        async function initializeForm() {
            if (operationParam === "create") {
                const user = await getCurrentUser();
                setWorkRequest(createEmptyWorkRequest(user.username));
                return;
            }

            if (operationParam === "update") {
                if (workRequestIdParam === undefined) {
                    throw new Error(reportError("Error while fetching work request to be updated: id is undefined"));
                }

                const model = await workRequestService.getWorkRequest(workRequestIdParam);
                if (model === null) {
                    throw new Error(reportError("Error while fetching work request to be updated: work request was not found"));
                }
                setWorkRequest(mapWorkRequestModelToWorkRequestFormState(model));
            }
        }

        initializeForm().catch((error) => {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(reportError("Error while initializing work request form", error));
        });
    }, [operationParam, workRequestIdParam]);

    if (workRequest === null) {
        return <div className="loadingData">Ladowanie danych</div>;
    }

    const currentWorkRequest = workRequest;

    function onPropertyChanged<K extends keyof WorkRequestFormState>(key: K, value: WorkRequestFormState[K]) {
        setWorkRequest((previous) => previous ? { ...previous, [key]: value } : previous);
    }

    function validateInputs(formState: WorkRequestFormState): ValidationState {
        const errors: ValidationState = {};

        if (!formState.createdBy) {
            errors.createdBy = "Wpisz zleceniodawcę";
        }
        if (!formState.type) {
            errors.type = "Wpisz rodzaj czynności";
        }
        if (!formState.exp || isNaN(Number(formState.exp))) {
            errors.exp = "Wpisz punkty doświadczenia do zdobycia";
        }
        if (!formState.urgency || isNaN(Number(formState.urgency))) {
            errors.urgency = "Wpisz pilność";
        }

        return errors;
    }

    function handleResult(result: OperationResult, onSuccess: () => void) {
        if (result.success) {
            onSuccess();
            return;
        }

        throw new Error(reportError(result.message, result.details));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const nextValidationState = validateInputs(currentWorkRequest);
        setValidationState(nextValidationState);

        if (Object.keys(nextValidationState).length > 0) {
            return;
        }

        if (operationParam === "create") {
            handleResult(
                await workRequestService.createWorkRequest(currentWorkRequest),
                () => navigate("/WorkRequestList")
            );
            return;
        }

        if (operationParam === "update") {
            handleResult(
                await workRequestService.updateWorkRequest(currentWorkRequest),
                () => navigate("/WorkRequestDetails/" + currentWorkRequest.id)
            );
        }
    }

    function handleCancel() {
        if (operationParam === "create") {
            navigate("/WorkRequestList");
            return;
        }

        navigate("/WorkRequestDetails/" + currentWorkRequest.id);
    }

    function fillTemplate(type: string, exp: number) {
        setWorkRequest((previous) => previous ? { ...previous, type, exp: exp.toString() } : previous);
    }

    function getPageTitle() {
        return operationParam === "update" ? "Edycja zlecenia" : "Dodawanie zlecenia";
    }

    return <>
        <h2 className="pageTitle" data-testid="work-request-edit-page">{getPageTitle()}</h2>
        <form onSubmit={handleSubmit}>
            <div className="entryDetails">
                <p className="label">Data i godzina utworzenia zlecenia</p>
                <p><input
                    data-testid="work-request-created-datetime-input"
                    id="workrequestCreatedDateTime"
                    aria-label="Date and time"
                    type="datetime-local"
                    value={workRequest.createdDateTime ?? ""}
                    onChange={(e) => onPropertyChanged("createdDateTime", e.target.value)}
                /></p>

                <p className="label">Status</p>
                <p>Zlecenie wykonane: <input
                    data-testid="work-request-completed-input"
                    type="checkbox"
                    id="workRequestCompleted"
                    checked={workRequest.completed}
                    onChange={(e) => onPropertyChanged("completed", e.target.checked)}
                /></p>

                <p className="label">Zleceniodawca</p>
                {validationState.createdBy ? <p className="validationMessage">{validationState.createdBy}</p> : null}
                <p><select
                    data-testid="work-request-created-by-input"
                    id="workRequestCreatedBy"
                    value={workRequest.createdBy ?? ""}
                    onChange={(e) => onPropertyChanged("createdBy", e.target.value)}
                >
                    {Array.from(users.values()).map((user: User) => (
                        <option key={user.id} value={user.id}>{user.nickname}</option>
                    ))}
                </select></p>

                <p className="label">Szablony</p>
                <div className="templateWorkRequests">
                    <img data-testid="work-request-template-button" src={vacuuming} onClick={() => fillTemplate("odkurzanie", 10)} alt="odkurzanie"></img>
                    <img data-testid="work-request-template-button" src={dishwashing} onClick={() => fillTemplate("zmywanie naczyń", 20)} alt="zmywanie naczyń"></img>
                    <img data-testid="work-request-template-button" src={shopping_local} onClick={() => fillTemplate("zakupy osiedle", 10)} alt="zakupy osiedle"></img>
                    <img data-testid="work-request-template-button" src={shopping_Auchan} onClick={() => fillTemplate("zakupy Auchan", 20)} alt="zakupy Auchan"></img>
                    <img data-testid="work-request-template-button" src={cooking} onClick={() => fillTemplate("ugotowanie obiadu", 40)} alt="ugotowanie obiadu"></img>
                    <img data-testid="work-request-template-button" src={laundry_start} onClick={() => fillTemplate("nastawianie prania", 10)} alt="nastawianie prania"></img>
                    <img data-testid="work-request-template-button" src={laundry_end} onClick={() => fillTemplate("wywieszanie prania", 10)} alt="wywieszanie prania"></img>
                    <img data-testid="work-request-template-button" src={laundry_sorting} onClick={() => fillTemplate("ściąganie prania", 10)} alt="ściąganie prania"></img>
                    <img data-testid="work-request-template-button" src={taking_garbage_out} onClick={() => fillTemplate("wyniesienie śmieci", 10)} alt="wyniesienie śmieci"></img>
                </div>

                <p className="label">Czynność</p>
                {validationState.type ? <p className="validationMessage">{validationState.type}</p> : null}
                <p><input
                    data-testid="work-request-type-input"
                    type="text"
                    id="workRequestType"
                    className="entityTextArea"
                    onChange={(e) => onPropertyChanged("type", e.target.value)}
                    value={workRequest.type}
                /></p>

                <p className="label">Punkty doświadczenia do zdobycia</p>
                {validationState.exp ? <p className="validationMessage">{validationState.exp}</p> : null}
                <p><input
                    data-testid="work-request-exp-input"
                    type="text"
                    id="workRequestExp"
                    className="newWorkrequestTextArea"
                    onChange={(e) => onPropertyChanged("exp", e.target.value)}
                    value={workRequest.exp}
                /></p>

                <p className="label">Pilność</p>
                {validationState.urgency ? <p className="validationMessage">{validationState.urgency}</p> : null}
                <p><select
                    data-testid="work-request-urgency-input"
                    onChange={(e) => onPropertyChanged("urgency", e.target.value)}
                    value={workRequest.urgency}
                >
                    {urgencyList.map((urgency: Urgency) => (
                        <option key={urgency.level} value={urgency.level}>{urgency.label}</option>
                    ))}
                </select></p>

                <p className="label">Instrukcje</p>
                <p><textarea
                    data-testid="work-request-instructions-input"
                    id="workRequestInstructions"
                    className="entityTextArea"
                    rows={5}
                    onChange={(e) => onPropertyChanged("instructions", e.target.value)}
                    value={workRequest.instructions}
                /></p>
            </div>
            <div>
                <button data-testid="submit-button" type="submit">Zatwierdź</button>
                <button data-testid="cancel-button" type="button" onClick={handleCancel}>Anuluj</button>
            </div>
        </form>
    </>;
}

export default WorkRequestEdit;
