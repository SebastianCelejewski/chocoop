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
        navigate("/activities")
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
                  <NavLink to="/activitie" end>Powrót na listę czynności</NavLink>
            </nav>
        </>
    } else {
        return <>
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
            </div>
        </>
    }
}

export default ActivityDetails;
