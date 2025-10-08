import type { Schema } from "../../amplify/data/resource";

import { useState } from "react";
import { useNavigate } from "react-router";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

function ActivityAdd() {
    const navigate = useNavigate();

    const currentDateTimeUTC = new Date()
    const timeZoneOffset = currentDateTimeUTC.getTimezoneOffset()
    const currentDateTimeLocal = new Date(currentDateTimeUTC.getTime() - timeZoneOffset * 60 * 1000)
    const currentDateTime = currentDateTimeLocal.toISOString().split(".")[0]

    const [activityDateTime, setActivityDateTime] = useState(currentDateTime);
    const [activityUser, setActivityUser] = useState("");
    const [activityType, setActivityType] = useState("");
    const [activityExp, setActivityExp] = useState(0);
    const [activityComment, setActivityComment] = useState("");

    function handleActivityDateTimeChange(e: any) {
          setActivityDateTime(e.target.value)
    }

    function handleActivityUserChange(e: any) {
        setActivityUser(e.target.value);
    }

    function handleActivityTypeChange(e: any) {
        setActivityType(e.target.value);
    }

    function handleActivityExpChange(e: any) {
        setActivityExp(e.target.value);
    }

    function handleActivityCommentChange(e: any) {
        setActivityComment(e.target.value);
    }

    function handleSubmit(e: any) {
        e.preventDefault();

        const newActivity = {
            dateTime: new Date(activityDateTime).toISOString(),
            user: activityUser,
            type: activityType,
            exp: activityExp,
            comment: activityComment
        }

        if (client.models.Activity !== undefined) {
            const result = client.models.Activity.create(newActivity,   
            {
                authMode: 'userPool',
            });

            result.then(() => {
                navigate("/activities")
            })
        } else {
            alert("Nie mogę dodać czynności: Brak dostępu do danych czynności.")
        }
    }

    function handleCancel() {
        navigate("/activities")
    }

    return <>
        <form onSubmit={handleSubmit}>
            <div className="entryDetails">
                <p className="label">Data i godzina wykonania czynności</p>
                <p><input
                        id="activityDateTime"
                        aria-label="Date and time"
                        type="datetime-local"
                        defaultValue={activityDateTime}
                        onChange={handleActivityDateTimeChange}
                    /></p>

                <p className="label">Wykonawca</p>
                <p><input type="text" id="activityUser" className="newActivityTextArea" onChange={handleActivityUserChange}/></p>

                <p className="label">Czynność</p>
                <p><input type="text" id="activityComment" className="newactivityTextArea" onChange={handleActivityTypeChange}/></p>

                <p className="label">Zdobyte punkty doświadczenia</p>
                <p><input type="text" id="activityComment" className="newactivityTextArea" onChange={handleActivityExpChange}/></p>

                <p className="label">Komentarz</p>
                <p><textarea id="activityComment" className="newactivityTextArea" rows={5} onChange={handleActivityCommentChange}/></p>
            </div>
            <button type="submit">Zatwierdź</button>
            <button type="button" onClick={handleCancel}>Anuluj</button>
        </form>
    </>
}

export default ActivityAdd;
