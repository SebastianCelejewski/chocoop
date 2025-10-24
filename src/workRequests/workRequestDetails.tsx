import type { Schema } from "../../amplify/data/resource";

import { useState } from "react";
import { NavLink, useParams, useNavigate } from "react-router";
import { generateClient } from "aws-amplify/data";
import { dateToString } from "../utils/dateUtils";

const client = generateClient<Schema>();

function WorkRequestDetails() {
    const navigate = useNavigate();

    const params = useParams();
    const workRequestIdParam = params["id"]

    const [workRequest, setWorkRequest] = useState<Schema["WorkRequest"]["type"]>();

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
                + workRequest.createdBy + " " + workRequest.type + "\n\nCzy na pewno chcesz usunąć to zlecenie?") == true) {
                client.models.WorkRequest.delete({ id: workRequestIdParam }).then(() => {
                    navigate("/WorkRequestList")
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

    async function getWorkRequest(workRequestId: string) {
        return await client.models.WorkRequest.get({ id: workRequestId });
    }

    if (workRequest == undefined && workRequestIdParam != undefined) {
        getWorkRequest(workRequestIdParam).then((result) => {
            if (result["data"] != undefined) {
                setWorkRequest(result["data"])
            }
        })
    }

    if (workRequest == undefined) {
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
                <p>{workRequest.createdBy}</p>

                <p className="label">Rodzaj aktywności</p>
                <p>{workRequest.type}</p>

                <p className="label">Punkty doświadczenia do zdobycia</p>
                <p>{workRequest.exp}</p>

                <p className="label">Pilność</p>
                <p>{workRequest.urgency}</p>

                <p className="label">Instrukcje</p>
                <p>{workRequest.instructions}</p>

                <div className="verticalFill"/>
            </div>
            <div className="buttonPanel">
                <button type="button" onClick={handleBack}>Wróć</button>
                <button type="button" onClick={handleEdit}>Edytuj</button>
                <button type="button" onClick={handleDone} disabled={workRequest.completed}>Zrobione</button>
                <button type="button" onClick={handleDelete}>Usuń</button>
            </div>
        </>
    }
}

export default WorkRequestDetails;
