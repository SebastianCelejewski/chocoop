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
    const [activityPerson, setActivityPerson] = useState("");
    const [activityType, setActivityType] = useState("");
    const [activityExp, setActivityExp] = useState(0);
    const [activityComment, setActivityComment] = useState("");

    const [activityPersonErrorMessage, setActivityPersonErrorMessage] = useState("")
    const [activityTypeErrorMessage, setActivityTypeErrorMessage] = useState("");
    const [activityExpErrorMessage, setActivityExpErrorMessage] = useState("");
    const [activityCommentErrorMessage, setActivityCommentErrorMessage] = useState("");

    const [validationStatus, setValidationStatus] = useState(true);

    function handleActivityDateTimeChange(e: any) {
        setActivityDateTime(e.target.value)
    }

    function handleActivityPersonChange(e: any) {
        setActivityPerson(e.target.value);
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

    function validateInputs() {
        var temporaryValidationStatus = true

        if (activityPerson === undefined || activityPerson.length == 0) {
            setActivityPersonErrorMessage("Wpisz wykonawcę czynności")
            temporaryValidationStatus = false
        } else {
            setActivityPersonErrorMessage("")
        }

        if (activityType === undefined || activityType.length == 0) {
            setActivityTypeErrorMessage("Wpisz rodzaj czynności")
            temporaryValidationStatus = false
        } else {
            setActivityTypeErrorMessage("")
        }

        if (activityExp === undefined || activityExp == 0 || isNaN(activityExp)) {
            setActivityExpErrorMessage("Wpisz zdobyte punkty doświadczenia")
            temporaryValidationStatus = false
        } else {
            setActivityExpErrorMessage("")
        }

        setActivityExpErrorMessage("")

        setValidationStatus(temporaryValidationStatus)
    }

    function handleSubmit(e: any) {
        e.preventDefault();

        validateInputs()

        if (validationStatus == false) {
            return
        }

        const newActivity = {
            dateTime: new Date(activityDateTime).toISOString(),
            user: activityPerson,
            type: activityType,
            exp: activityExp,
            comment: activityComment
        }

        if (client.models.Activity !== undefined) {
            const result = client.models.Activity.create(newActivity);

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
                { activityPersonErrorMessage.length > 0 ? (<p className="validationMessage">{activityPersonErrorMessage}</p>) : (<></>) }
                <p><input id="activityPerson" type="text" className="newActivityTextArea" onChange={handleActivityPersonChange}/></p>

                <p className="label">Czynność</p>
                { activityTypeErrorMessage.length > 0 ? (<p className="validationMessage">{activityTypeErrorMessage}</p>) : (<></>) }
                <p><input type="text" id="activityComment" className="newactivityTextArea" onChange={handleActivityTypeChange}/></p>

                <p className="label">Zdobyte punkty doświadczenia</p>
                { activityExpErrorMessage.length > 0 ? (<p className="validationMessage">{activityExpErrorMessage}</p>) : (<></>) }
                <p><input type="text" id="activityComment" className="newactivityTextArea" onChange={handleActivityExpChange}/></p>

                <p className="label">Komentarz</p>
                { activityCommentErrorMessage.length > 0 ? (<p className="validationMessage">{activityCommentErrorMessage}</p>) : (<></>) }
                <p><textarea id="activityComment" className="newactivityTextArea" rows={5} onChange={handleActivityCommentChange}/></p>
            </div>
            <button type="submit">Zatwierdź</button>
            <button type="button" onClick={handleCancel}>Anuluj</button>
        </form>
    </>
}

export default ActivityAdd;
