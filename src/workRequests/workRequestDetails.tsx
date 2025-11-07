import type { Schema } from "../../amplify/data/resource";

import { useEffect, useState } from "react";
import { NavLink, useParams, useNavigate } from "react-router";
import { generateClient } from "aws-amplify/data";
import { dateToString } from "../utils/dateUtils";

import reportError from "../utils/reportError"
import User from "../model/User";
import { urgencyList } from "../model/Urgency"

const client = generateClient<Schema>();

function WorkRequestDetails({users}: {users: Map<string, User>}) {
    const navigate = useNavigate();

    const params = useParams();
    const workRequestIdParam = params["id"]

    const [workRequest, setWorkRequest] = useState<Schema["WorkRequest"]["type"]>();

    useEffect(() => {
        if (workRequestIdParam === undefined) {    
            throw new Error(reportError("Error while fetching work request to be displayed: id is undefined"));
        }
     
        client.models.WorkRequest
        .get({ id: workRequestIdParam })
        .then((result) => {
            if (result["data"] != undefined) {
                setWorkRequest(result["data"])
            }
        })
        .catch((error) => {
            throw new Error(reportError("Error while fetching work request to be displayed: " + error));
        })
    },[workRequestIdParam])

    function handleBack() {
        navigate("/WorkRequestList")
    }

    function handleEdit() {
        const navLink = `/WorkRequestEdit/update/${workRequestIdParam}`
        navigate(navLink)
    }

    function handleDelete() {
        if (workRequestIdParam != undefined && workRequest !== undefined) {
            if (confirm("Usuwanie aktywności\n\n"
                + workRequest.createdDateTime + "\n"
                + workRequest.createdBy + " "
                + workRequest.type + "\n\n"
                + "Czy na pewno chcesz usunąć to zlecenie?") == true) {
                    client.models.WorkRequest
                    .delete({ id: workRequestIdParam })
                    .then(() => {
                        navigate("/WorkRequestList")
                    })
                    .catch((error) => {
                        throw new Error(reportError("Error while deleting work request: " + error));
                    })
            } 
        }
    }

    function handleDone() {
        navigate("/ActivityEdit/promoteWorkRequest/" + workRequestIdParam)
    }

    function WorkRequestCompletness({ workRequest }: { workRequest: Schema["WorkRequest"]["type"]}) {
      if (workRequest.completed) {
        const linkTarget = "/ActivityDetails/" + workRequest.completedAs;
        return <>
            <p>Zlecenie wykonane. <NavLink to={linkTarget}>Przejdź do czynności</NavLink></p>
        </>
      } else {
        return <>
            <p>Zlecenie niewykonane</p>
        </>
      }
    }

    if (workRequest === undefined) {
        return <>
            <nav>
                <NavLink to="/WorkRequestList" end>Powrót na listę zleceń</NavLink>
            </nav>
        </>
    } else {
        return <>
            <p className="pageTitle">Szczegóły zlecenia</p>
            <div className="entryDetails">
                <p className="label">Status</p>
                <WorkRequestCompletness workRequest={workRequest}/>

                <p className="label">Data i godzina utworzenia zlecenia</p>
                <p>{dateToString(workRequest.createdDateTime)}</p>

                <p className="label">Twórca zlecenia</p>
                <p>{users.get(workRequest.createdBy)?.nickname}</p>

                <p className="label">Rodzaj aktywności</p>
                <p>{workRequest.type}</p>

                <p className="label">Punkty doświadczenia do zdobycia</p>
                <p>{workRequest.exp}</p>

                <p className="label">Pilność</p>
                <p>{urgencyList[workRequest.urgency].label}</p>

                <p className="label">Instrukcje</p>
                <p className="commentTextArea">{workRequest.instructions}</p>
            </div>
            <div>
                <button type="button" onClick={handleBack}>Wróć</button>
                <button type="button" onClick={handleEdit}>Edytuj</button>
                <button type="button" onClick={handleDone} disabled={workRequest.completed}>Zrobione</button>
                <button type="button" onClick={handleDelete}>Usuń</button>
            </div>
        </>
    }
}

export default WorkRequestDetails;
