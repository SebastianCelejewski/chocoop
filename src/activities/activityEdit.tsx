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

function ActivityEdit() {

    const navigate = useNavigate();

    const params = useParams();
    const operationParam = params["operation"]
    const objectIdParam = params["id"]

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

    const [workRequestId, setWorkRequestId] = useState(String || undefined)
    const [workRequestCreatedDateTime, setWorkRequestCreatedDateTime] = useState(String || undefined);
    const [workRequestCreatedBy, setWorkRequestCreatedBy] = useState("");
    const [workRequestType, setWorkRequestType] = useState("");
    const [workRequestExp, setWorkRequestExp] = useState(0);
    const [workRequestUrgency, setWorkRequestUrgency] = useState(0);
    const [workRequestInstructions, setWorkRequestInstructions] = useState("");

    const [activityPersonErrorMessage, setActivityPersonErrorMessage] = useState("")
    const [activityTypeErrorMessage, setActivityTypeErrorMessage] = useState("");
    const [activityExpErrorMessage, setActivityExpErrorMessage] = useState("");
    const [activityCommentErrorMessage, setActivityCommentErrorMessage] = useState("");    

    const [personLoadingInProgress, setPersonLoadingInProgress] = useState(false)
    const [dateTimeSettingInProgress, setDateTimeLoadingInProgress] = useState(false)

    function setNewActivityPerson() {
        fetchUserAttributes().then((attributes) => {
            if (attributes.nickname !== undefined) {
                console.log("Setting new activity person to " + attributes.nickname)
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

    async function getWorkRequest(workRequestId: string) {
        return await client.models.WorkRequest.get({ id: workRequestId});
    }

    if (operationParam == "update" && objectIdParam !== undefined && activityId == "") {
        getActivity(objectIdParam).then((result) => {
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

    if (operationParam == "promoteWorkRequest" && objectIdParam !== undefined && workRequestId == "") {
        getWorkRequest(objectIdParam).then((result) => {
            if (result["data"] != undefined) {
                const workrequestDateTimeFromDatabaseAsString = result["data"]["createdDateTime"]
                const workrequestDateTimeFromDatabaseAsDate = Date.parse(workrequestDateTimeFromDatabaseAsString)
                const workrequestDateTimeLocal = new Date(workrequestDateTimeFromDatabaseAsDate - timeZoneOffset * 60 * 1000)
                const workrequestDateTimeToSetToDateTimePicker = workrequestDateTimeLocal.toISOString().split(".")[0]

                setWorkRequestId(result["data"]["id"]);
                setWorkRequestCreatedBy(result["data"]["createdBy"]);
                setWorkRequestCreatedDateTime(workrequestDateTimeToSetToDateTimePicker);
                setWorkRequestType(result["data"]["type"]);
                setWorkRequestExp(result["data"]["exp"]);
                setWorkRequestUrgency(result["data"]["urgency"]);
                setWorkRequestInstructions(result["data"]["instructions"]);

                setActivityDateTime(currentDateTime);
                setActivityType(result["data"]["type"]);
                setActivityExp(result["data"]["exp"]);
                setActivityComment("Utworzone na podstawie zlecenia: " + result["data"]["instructions"] );
            }
        })
    }

    if ((operationParam == "create" || operationParam == "promoteWebRequest") && activityPerson === "" && personLoadingInProgress == false) {
        console.log("Activity person needs to be filled with logged in person")
        setNewActivityPerson()                
    }

    if ((operationParam == "create" || operationParam == "promoteWebRequest") && activityDateTime === "" && dateTimeSettingInProgress == false) {
        setNewActivityDateTime()
    }

    var pageTitle = "Dodawanie wykonanej czynności"

    if (operationParam == "update") {
        pageTitle = "Edycja czynności"
    }

    if (operationParam == "promoteWorkRequest") {
        pageTitle = "Wykonane zlecenie zlecenie"
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
        
        if (operationParam == "create" || operationParam == "promoteWorkRequest") {
            const newActivity = {
                dateTime: new Date(activityDateTime).toISOString(),
                user: activityPerson,
                type: activityType,
                exp: activityExp,
                comment: activityComment
            }

            const result = client.models.Activity.create(newActivity);
            result.then((createActivityResponse) => {
                if (createActivityResponse !== undefined
                    && createActivityResponse.errors !== undefined
                    && createActivityResponse.errors.length > 0) {
                    console.log("Failed to create new activity:");
                    console.log(JSON.stringify(createActivityResponse.errors))
                    alert("Nie udało się utworzyć nowej czynności. Powiadom twórcę aplikacji.")
                    return;
                }
                navigate("/ActivityList")
            })
        }

        if (operationParam == "promoteWorkRequest") {
            const newActivity = {
                dateTime: new Date(activityDateTime).toISOString(),
                user: activityPerson,
                type: activityType,
                exp: activityExp,
                comment: activityComment,
                requestedAs: workRequestId
            }

            const createActivityResult = client.models.Activity.create(newActivity);
            createActivityResult.then((createActivityResponse) => {

                if (createActivityResponse !== undefined
                    && createActivityResponse.errors !== undefined
                    && createActivityResponse.errors.length > 0) {
                    console.log("Failed to create new activity:");
                    console.log(JSON.stringify(createActivityResponse.errors))
                    alert("Nie udało się utworzyć nowej czynności. Powiadom twórcę aplikacji.")
                    return;
                }

                var newActivityId = "unknown"
                if (createActivityResponse["data"] !== null) {
                    newActivityId = createActivityResponse["data"]["id"]
                }  

                const updatedWorkRequest = {
                    id: workRequestId,
                    createdDateTime: new Date(workRequestCreatedDateTime).toISOString(),
                    createdBy: workRequestCreatedBy,
                    type: workRequestType,
                    exp: workRequestExp,
                    urgency: workRequestUrgency,
                    instructions: workRequestInstructions,
                    completed: true,
                    completedAs: newActivityId
                }

                const workRequestUpdateResult = client.models.WorkRequest.update(updatedWorkRequest);

                workRequestUpdateResult.then((updateWorkRequestResponse) => {
                    if (updateWorkRequestResponse !== undefined
                        && updateWorkRequestResponse.errors !== undefined
                        && updateWorkRequestResponse.errors.length > 0) {
                        console.log("Failed to update a work request:");
                        console.log(JSON.stringify(updateWorkRequestResponse.errors))
                        alert("Nie udało się utworzyć nowej czynności. Powiadom twórcę aplikacji.")
                    }
                    navigate("/ActivityList")
                })
            })
        }

        if (operationParam == "update") {
            const updatedActivity = {
                id: activityId,
                dateTime: new Date(activityDateTime).toISOString(),
                user: activityPerson,
                type: activityType,
                exp: activityExp,
                comment: activityComment
            }

            const result = client.models.Activity.update(updatedActivity);

            result.then((updateActivityResponse) => {
                 if (updateActivityResponse !== undefined
                    && updateActivityResponse.errors !== undefined
                    && updateActivityResponse.errors.length > 0) {
                    console.log("Failed to update an activity:");
                    console.log(JSON.stringify(updateActivityResponse.errors))
                    alert("Nie udało się zaktualizować czynności. Powiadom twórcę aplikacji.")
                }
                navigate("/ActivityDetails/" + activityId)
            })
        }
    }

    function handleCancel() {
        if (operationParam == "create") {
            navigate("/ActivityList")
        } else if (operationParam == "promoteWorkRequest") {
            navigate("/WorkRequestDetails/" + workRequestId)
        } else {
            navigate("/ActivityDetails/" + activityId)
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

export default ActivityEdit;
