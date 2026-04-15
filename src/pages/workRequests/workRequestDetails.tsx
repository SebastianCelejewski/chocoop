import type { Schema } from "../../../amplify/data/resource";

import { useEffect, useState } from "react";
import { NavLink, useParams, useNavigate } from "react-router";
import { dateToString } from "../../utils/dateUtils";

import reportError from "../../utils/reportError";
import User from "../../model/User";
import { urgencyList } from "../../model/Urgency";
import WorkRequestService from "../../services/WorkRequestService";
import { useConfirm } from "../../hooks/useConfirm";

const workRequestService = WorkRequestService();

function WorkRequestDetails({users}: {users: Map<string, User>}) {
    const navigate = useNavigate();
    const params = useParams();
    const workRequestIdParam = params["id"];
    const { confirm, dialog } = useConfirm();

    const [workRequest, setWorkRequest] = useState<Schema["WorkRequest"]["type"]>();

    useEffect(() => {
        if (workRequestIdParam === undefined) {
            throw new Error(reportError("Error while fetching work request to be displayed: id is undefined"));
        }

        workRequestService
            .getWorkRequest(workRequestIdParam)
            .then((result) => {
                if (result === null) {
                    throw new Error(reportError("Error while fetching work request to be displayed: work request was not found"));
                }
                setWorkRequest(result);
            })
            .catch((error) => {
                if (error instanceof Error) {
                    throw error;
                }
                throw new Error(reportError("Error while fetching work request to be displayed", error));
            });
    }, [workRequestIdParam]);

    function handleBack() {
        navigate("/WorkRequestList");
    }

    function handleEdit() {
        navigate(`/WorkRequestEdit/update/${workRequestIdParam}`);
    }

    async function handleDelete() {
        if (workRequestIdParam === undefined || workRequest === undefined) {
            return;
        }

        const ok = await confirm("Czy na pewno chcesz usunąć to zlecenie?");
        if (!ok) {
            return;
        }

        const result = await workRequestService.deleteWorkRequest(workRequestIdParam);
        if (result.success) {
            navigate("/WorkRequestList");
            return;
        }

        throw new Error(reportError(result.message, result.details));
    }

    function handleDone() {
        navigate("/ActivityEdit/promoteWorkRequest/" + workRequestIdParam);
    }

    function WorkRequestCompletness({ workRequest }: { workRequest: Schema["WorkRequest"]["type"]}) {
        if (workRequest.completed) {
            const linkTarget = "/ActivityDetails/" + workRequest.completedAs;
            return <p data-testid="work-request-completed-message">Zlecenie wykonane. <NavLink to={linkTarget}>Przejdź do czynności</NavLink></p>;
        }

        return <p data-testid="work-request-pending-message">Zlecenie niewykonane</p>;
    }

    if (workRequest === undefined) {
        return <>
            <nav>
                <NavLink to="/WorkRequestList" end>Powrót na listę zleceń</NavLink>
            </nav>
            {dialog}
        </>;
    }

    return <>
        <h2 className="pageTitle" data-testid="work-request-details-page">Szczegóły zlecenia</h2>
        <div className="entryDetails">
            <p className="label">Data utworzenia zlecenia</p>
            <p data-testid="work-request-created-date">{dateToString(workRequest.createdDate)}</p>

            <p className="label">Twórca zlecenia</p>
            <p data-testid="work-request-created-by">{users.get(workRequest.createdBy)?.nickname}</p>

            <p className="label">Status</p>
            <WorkRequestCompletness workRequest={workRequest}/>

            <p className="label">Rodzaj aktywności</p>
            <p data-testid="work-request-type">{workRequest.type}</p>

            <p className="label">Punkty doświadczenia do zdobycia</p>
            <p data-testid="work-request-exp">{workRequest.exp}</p>

            <p className="label">Pilność</p>
            <p data-testid="work-request-urgency">{urgencyList[workRequest.urgency].label}</p>

            <p className="label">Instrukcje</p>
            <p data-testid="work-request-instructions" className="commentTextArea">{workRequest.instructions}</p>
        </div>
        <div>
            <button data-testid="back-button" type="button" onClick={handleBack}>Wróć</button>
            <button data-testid="edit-button" type="button" onClick={handleEdit}>Edytuj</button>
            <button data-testid="done-button" type="button" onClick={handleDone} disabled={workRequest.completed}>Zrobione</button>
            <button data-testid="delete-button" type="button" onClick={handleDelete}>Usuń</button>
        </div>
        {dialog}
    </>;
}

export default WorkRequestDetails;
