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
        navigate("/workRequests/list")
    }

    function handleEdit() {
        const navLink = `/workRequests/edit/${workRequestIdParam}`
        navigate(navLink)
    }

    function handleDelete() {
        if (workRequestIdParam != undefined && workRequest !== undefined) {
            if (confirm("Usuwanie aktywności\n\n"
                + workRequest.createdDateTime + "\n"
                + workRequest.createdBy + " " + workRequest.type + "\n\nCzy na pewno chcesz usunąć to zlecenie?") == true) {
                client.models.WorkRequest.delete({ id: workRequestIdParam }).then(() => {
                    navigate("/workRequests/list")
                })
            } 
        }
    }

    function handleDone() {
        
    }

    async function getworkRequest(workRequestId: string) {
        return await client.models.WorkRequest.get({ id: workRequestId });
    }

    if (workRequest == undefined && workRequestIdParam != undefined) {
        getworkRequest(workRequestIdParam).then((result) => {
            if (result["data"] != undefined) {
                setWorkRequest(result["data"])
            }
        })
    }

    if (workRequest == undefined) {
        return <>
            <nav>
                  <NavLink to="/activitie" end>Powrót na listę czynności</NavLink>
            </nav>
        </>
    } else {
        return <>
            <div className="entryDetails">
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
            </div>
            <div className="buttonPanel">
                <button type="button" onClick={handleBack}>Wróć</button>
                <button type="button" onClick={handleDone}>Zamień w czynność wykonaną</button>
                <button type="button" onClick={handleEdit}>Edytuj</button>
                <button type="button" onClick={handleDelete}>Usuń</button>
            </div>
        </>
    }
}

export default WorkRequestDetails;
