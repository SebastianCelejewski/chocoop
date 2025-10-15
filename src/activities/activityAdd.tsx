import type { Schema } from "../../amplify/data/resource";

import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { generateClient } from "aws-amplify/data";

import vacuuming from "../assets/images/activities/vacuuming.png?url";
import dishwashing from "../assets/images/activities/dishwashing.png?url";
import shopping_local from "../assets/images/activities/shopping_local.png?url";
import shopping_Auchan from "../assets/images/activities/shopping_Auchan.png?url";
import cooking from "../assets/images/activities/cooking.png?url";
import laundry_start from "../assets/images/activities/laundry_start.png?url";
import laundry_end from "../assets/images/activities/laundry_end.png?url";
import laundry_sorting from "../assets/images/activities/laundry_sorting.png?url";
import taking_garbage_out from "../assets/images/activities/taking_garbage_out.png?url";

import { fetchUserAttributes } from 'aws-amplify/auth';

const client = generateClient<Schema>();

function ActivityAdd() {

    const navigate = useNavigate();

    const params = useParams();
    const activityIdParam = params["id"]

    const currentDateTimeUTC = new Date()
    const timeZoneOffset = currentDateTimeUTC.getTimezoneOffset()
    const currentDateTimeLocal = new Date(currentDateTimeUTC.getTime() - timeZoneOffset * 60 * 1000)
    const currentDateTime = currentDateTimeLocal.toISOString().split(".")[0]

    const [activityId, setActivityId] = useState(String || undefined)
    const [activityDateTime, setActivityDateTime] = useState(String || undefined);
    const [activityPerson, setActivityPerson] = useState("");
    const [activityType, setActivityType] = useState("");
    const [activityExp, setActivityExp] = useState(0);
    const [activityComment, setActivityComment] = useState("");

    const [activityPersonErrorMessage, setActivityPersonErrorMessage] = useState("")
    const [activityTypeErrorMessage, setActivityTypeErrorMessage] = useState("");
    const [activityExpErrorMessage, setActivityExpErrorMessage] = useState("");
    const [activityCommentErrorMessage, setActivityCommentErrorMessage] = useState("");    

    let mode : String | undefined
    const [personLoadingInProgress, setPersonLoadingInProgress] = useState(false)
    const [dateTimeSettingInProgress, setDateTimeLoadingInProgress] = useState(false)

    function setNewActivityPerson() {
        fetchUserAttributes().then((attributes) => {
            if (attributes.nickname !== undefined) {
                setActivityPerson(attributes.nickname)
            }
        })
        setPersonLoadingInProgress(true)
    }

    function setNewActivityDateTime() {
        setActivityDateTime(currentDateTime)
        setDateTimeLoadingInProgress(true)
    }
    
    async function getActivity(activityId: string) {
        return await client.models.Activity.get({ id: activityId });
    }

    if (mode === undefined) {
        if (activityIdParam !== undefined && activityIdParam != "new") { 
            mode = "edit"
        } else {
            mode = "create"
        }
    }

    if (mode == "edit" && activityIdParam !== undefined && activityId == "") {
        getActivity(activityIdParam).then((result) => {
            if (result["data"] != undefined) {
                const activityDateTimeFromDatabaseAsString = result["data"]["dateTime"]
                const activityDateTimeFromDatabaseAsDate = Date.parse(activityDateTimeFromDatabaseAsString)
                const activityDateTimeLocal = new Date(activityDateTimeFromDatabaseAsDate - timeZoneOffset * 60 * 1000)
                const activityDateTimeToSetToDateTimePicker = activityDateTimeLocal.toISOString().split(".")[0]

                setActivityId(result["data"]["id"]);
                setActivityPerson(result["data"]["user"]);
                setActivityDateTime(activityDateTimeToSetToDateTimePicker);
                setActivityType(result["data"]["type"]);
                setActivityExp(result["data"]["exp"]);
                setActivityComment(result["data"]["comment"]);
            }
        })
    }

    if (mode == "create" && activityPerson === "" && personLoadingInProgress == false) {
        setNewActivityPerson()                
    }

    if (mode == "create" && activityDateTime === "" && dateTimeSettingInProgress == false) {
        setNewActivityDateTime()
    }

    var pageTitle = "Dodawanie wykonanej czynności"

    if (mode == "edit") {
        pageTitle = "Edycja czynności"
    }

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

        setActivityCommentErrorMessage("")

        return temporaryValidationStatus
    }

    function handleSubmit(e: any) {
        e.preventDefault();
        const validationStatus = validateInputs()

        if (validationStatus == false) {
            return
        }
        
        if (mode == "create") {
            const newActivity = {
                dateTime: new Date(activityDateTime).toISOString(),
                user: activityPerson,
                type: activityType,
                exp: activityExp,
                comment: activityComment
            }

            const result = client.models.Activity.create(newActivity);
            result.then(() => {
                navigate("/activities/list")
            })
        }

        if (mode == "edit") {
            const updatedActivity = {
                id: activityId,
                dateTime: new Date(activityDateTime).toISOString(),
                user: activityPerson,
                type: activityType,
                exp: activityExp,
                comment: activityComment
            }

            const result = client.models.Activity.update(updatedActivity);

            result.then(() => {
                navigate("/activities/show/" + activityId)
            })
        }
    }

    function handleCancel() {
        if (mode == "create") {
            navigate("/activities/list")
        } else {
            navigate("/activities/show/" + activityId)
        }
    }

    function fillTemplate(type: string, exp: number) {
        setActivityType(type)
        setActivityExp(exp)
    }


    return <>
        <p className="pageTitle">{pageTitle}</p>
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
                <p><input id="activityPerson" type="text" onChange={handleActivityPersonChange} value={activityPerson}/></p>

                <p className="label">Szablony</p>
                <div className="templateActivities">
                    <img src={vacuuming} onClick={() => fillTemplate("odkurzanie", 10)} alt="odkurzanie"></img>
                    <img src={dishwashing} onClick={() => fillTemplate("zmywanie naczyń", 20)} alt="zmywanie naczyń"></img>
                    <img src={shopping_local} onClick={() => fillTemplate("zakupy osiedle", 10)} alt="zakupy osiedle"></img>
                    <img src={shopping_Auchan} onClick={() => fillTemplate("zakupy Auchan", 20)} alt="zakupy Auchan"></img>
                    <img src={cooking} onClick={() => fillTemplate("ugotowanie obiadu", 40)} alt="ugotowanie obiadu"></img>
                    <img src={laundry_start} onClick={() => fillTemplate("nastawianie prania", 10)} alt="nastawianie prania"></img>
                    <img src={laundry_end} onClick={() => fillTemplate("wywieszanie prania", 10)} alt="wywieszanie prania"></img>
                    <img src={laundry_sorting} onClick={() => fillTemplate("ściąganie prania", 10)} alt="ściąganie prania"></img>
                    <img src={taking_garbage_out} onClick={() => fillTemplate("wyniesienie śmieci", 10)} alt="wyniesienie śmieci"></img>
                </div>

                <p className="label">Czynność</p>
                { activityTypeErrorMessage.length > 0 ? (<p className="validationMessage">{activityTypeErrorMessage}</p>) : (<></>) }
                <p><input type="text" id="activityComment" className="entityTextArea" onChange={handleActivityTypeChange} value={activityType}/></p>

                <p className="label">Zdobyte punkty doświadczenia</p>
                { activityExpErrorMessage.length > 0 ? (<p className="validationMessage">{activityExpErrorMessage}</p>) : (<></>) }
                <p><input type="text" id="activityComment" onChange={handleActivityExpChange} value={activityExp}/></p>

                <p className="label">Komentarz</p>
                { activityCommentErrorMessage.length > 0 ? (<p className="validationMessage">{activityCommentErrorMessage}</p>) : (<></>) }
                <p><textarea id="activityComment" className="entityTextArea" rows={5} onChange={handleActivityCommentChange} value={activityComment}/></p>
            </div>
            <div>
                <button type="submit">Zatwierdź</button>
                <button type="button" onClick={handleCancel}>Anuluj</button>
            </div>
        </form>
    </>
}

export default ActivityAdd;
