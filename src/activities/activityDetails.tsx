import type { Schema } from "../../amplify/data/resource";

import { useState } from "react";
import { NavLink, useParams, useNavigate } from "react-router";
import { generateClient } from "aws-amplify/data";
import { dateToString } from "../utils/dateUtils";

const client = generateClient<Schema>();

function ActivityDetails() {
    const navigate = useNavigate();

    const params = useParams();
    const activityIdParam = params["id"]

    const [activity, setActivity] = useState<Schema["Activity"]["type"]>();

    function handleBack() {
        navigate(-1)
    }

    function handleEdit() {
        const navLink = `/ActivityEdit/update/${activityIdParam}`
        navigate(navLink)
    }

    function handleDelete() {
        if (activityIdParam != undefined && activity !== undefined) {
            if (confirm("Usuwanie aktywności\n\n"
                + activity.dateTime + "\n"
                + activity.user + " " + activity.type + "\n\nCzy na pewno chcesz usunąć tę aktywność?") == true) {
                client.models.Activity.delete({ id: activityIdParam }).then(() => {
                    navigate("/ActivityList")
                })
            } 
        }
    }

    async function getactivity(activityId: string) {
        return await client.models.Activity.get({ id: activityId });
    }

    if (activity == undefined && activityIdParam != undefined) {
        getactivity(activityIdParam).then((result) => {
            if (result["data"] != undefined) {
                setActivity(result["data"])
            }
        })
    }

    if (activity == undefined) {
        return <>
            <nav>
                  <NavLink to="/ActivityList" end>Powrót na listę czynności</NavLink>
            </nav>
        </>
    } else {
        return <>
            <p className="pageTitle">Szczegóły wykonanej czynności</p>
            <div className="entryDetails">
                <p className="label">Data i godzina czynności</p>
                <p>{dateToString(activity.dateTime)}</p>

                <p className="label">Wykonawca</p>
                <p>{activity.user}</p>

                <p className="label">Rodzaj aktywności</p>
                <p>{activity.type}</p>

                <p className="label">Zdobyte punkty doświadczenia</p>
                <p>{activity.exp}</p>

                <p className="label">Komentarz</p>
                <p>{activity.comment}</p>
            </div>
            <div className="buttonPanel">
                <button type="button" onClick={handleBack}>Wróć</button>
                <button type="button" onClick={handleEdit}>Edytuj</button>
                <button type="button" onClick={handleDelete}>Usuń</button>
            </div>
        </>
    }
}

export default ActivityDetails;
