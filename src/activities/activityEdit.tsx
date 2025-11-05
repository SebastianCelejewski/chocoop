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
import unpacking_frisco from "../assets/images/activities/unpacking_frisco.png?url";

import { getCurrentUser, type AuthUser } from 'aws-amplify/auth';

import User from "../model/User";

const client = generateClient<Schema>();

function reportError(message: string, cause?: any) {
    const errorGuid = crypto.randomUUID();
    
    console.log(errorGuid + ": " + message)
    
    if (cause !== undefined) {
        console.log(errorGuid + ": " + cause)
    }
    
    alert("Wystąpił błąd. Powiadom twórcę aplikacji wysyłając mu ten identyfikator błędu: " + errorGuid)
    return message;
}

function ActivityEdit({users}: {users: Map<string, User>}) {

    const navigate = useNavigate();

    const params = useParams();
    const operationParam = params["operation"]
    const objectIdParam = params["id"]

    const currentDateTimeUTC = new Date()
    const timeZoneOffset = currentDateTimeUTC.getTimezoneOffset()
    const currentDateTimeLocal = new Date(currentDateTimeUTC.getTime() - timeZoneOffset * 60 * 1000)
    const currentDateTime = currentDateTimeLocal.toISOString().split(".")[0]

    const [activityId, setActivityId] = useState<string | undefined>(undefined)
    const [activityDateTime, setActivityDateTime] = useState<string | undefined>(undefined);
    const [activityPerson, setActivityPerson] = useState<string | undefined>(undefined)
    const [activityType, setActivityType] = useState("");
    const [activityExp, setActivityExp] = useState("");
    const [activityComment, setActivityComment] = useState("");

    const [workRequestId, setWorkRequestId] = useState<string | undefined>(undefined)
    const [workRequestCreatedDateTime, setWorkRequestCreatedDateTime] = useState<string | undefined>(undefined);
    const [workRequestCreatedBy, setWorkRequestCreatedBy] = useState<string | undefined>(undefined)
    const [workRequestType, setWorkRequestType] = useState("")
    const [workRequestExp, setWorkRequestExp] = useState("")
    const [workRequestUrgency, setWorkRequestUrgency] = useState("")
    const [workRequestInstructions, setWorkRequestInstructions] = useState("")

    const [activityPersonErrorMessage, setActivityPersonErrorMessage] = useState("")
    const [activityTypeErrorMessage, setActivityTypeErrorMessage] = useState("");
    const [activityExpErrorMessage, setActivityExpErrorMessage] = useState("");
    const [activityCommentErrorMessage, setActivityCommentErrorMessage] = useState("");    

    const [personLoadingInProgress, setPersonLoadingInProgress] = useState(false)
    const [dateTimeSettingInProgress, setDateTimeSettingInProgress] = useState(false)

    function setNewActivityPerson() {
        setPersonLoadingInProgress(true)
        getCurrentUser().then((user : AuthUser) => {
            setActivityPerson(user.username);
        })
    }

    function setNewActivityDateTime() {
        setActivityDateTime(currentDateTime)
        setDateTimeSettingInProgress(true)
    }
    
    async function getActivity(activityId: string) {
        return await client.models.Activity.get({ id: activityId });
    }

    async function getWorkRequest(workRequestId: string) {
        return await client.models.WorkRequest.get({ id: workRequestId});
    }

    if (operationParam === "update" && objectIdParam !== undefined && activityId === undefined) {
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
                setActivityExp(result["data"]["exp"].toString());
                setActivityComment(result["data"]["comment"]);
            }
        })
        .catch((error) => {
            throw new Error(reportError("Error while fetching activity " + objectIdParam + " to be updated: " + error));
        })
    }

    if (operationParam == "promoteWorkRequest" && objectIdParam !== undefined && workRequestId === undefined) {
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
                setWorkRequestExp(result["data"]["exp"].toString());
                setWorkRequestUrgency(result["data"]["urgency"].toString());
                setWorkRequestInstructions(result["data"]["instructions"]);

                setActivityDateTime(currentDateTime);
                setActivityType(result["data"]["type"]);
                setActivityExp(result["data"]["exp"].toString());
            }
        })
        .catch((error) => {
            throw new Error(reportError("Error while fetching work request " + objectIdParam + " to be promoted: " + error));
        })
    }

    if ((operationParam == "create" || operationParam == "promoteWorkRequest") && activityPerson === undefined && personLoadingInProgress == false) {
        setNewActivityPerson()                
    }

    if ((operationParam == "create" || operationParam == "promoteWorkRequest") && activityDateTime === undefined && dateTimeSettingInProgress == false) {
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

        if (activityPerson === undefined || activityPerson.length === 0) {
            setActivityPersonErrorMessage("Wpisz wykonawcę czynności")
            temporaryValidationStatus = false
        } else {
            setActivityPersonErrorMessage("")
        }

        if (activityType === undefined || activityType.length === 0) {
            setActivityTypeErrorMessage("Wpisz rodzaj czynności")
            temporaryValidationStatus = false
        } else {
            setActivityTypeErrorMessage("")
        }

        if (activityExp === undefined || isNaN(Number(activityExp))) {
            setActivityExpErrorMessage("Wpisz zdobyte punkty doświadczenia")
            temporaryValidationStatus = false
        } else {
            setActivityExpErrorMessage("")
        }

        setActivityCommentErrorMessage("")

        return temporaryValidationStatus
    }

    function createActivityObjectFromState() {
        if (activityDateTime === undefined) {
            throw new Error(reportError("State activityDateTime is undefined during creation of a new activity object"))
        }
        if (activityPerson === undefined) {
            throw new Error(reportError("State activityPerson is undefined during creation of a new activity object"))
        }
        if (activityType === undefined) {
            throw new Error(reportError("State activityType is undefined during creation of a new activity object"))
        }
        if (activityExp === undefined || isNaN(Number(activityExp))) {
            throw new Error(reportError("State activityExp is undefined during creation of a new activity object"))
        }
        if (activityComment === undefined) {
            throw new Error(reportError("State activityComment is undefined during creation of a new activity object"))
        }
        return {
            id: activityId,
            dateTime: new Date(activityDateTime).toISOString(),
            user: activityPerson,
            type: activityType,
            exp: Number(activityExp),
            comment: activityComment,
            requestedAs: workRequestId
        }
    }

    function createWorkRequestObjectFromState(newActivityId : string) {
        if (newActivityId === undefined) {
            throw new Error(reportError("Argument newActivityId is undefined during creation of a new work request object"))
        }
        if (workRequestId === undefined) {
            throw new Error(reportError("State workRequestId is undefined during creation of a new work request object"))
        }
        if (workRequestCreatedDateTime === undefined) {
            throw new Error(reportError("State workRequestCreatedDateTime is undefined during creation of a new work request object"))
        }
        if (workRequestCreatedBy === undefined) {
            throw new Error(reportError("State workRequestCreatedBy is undefined during creation of a new work request object"))
        }
        if (workRequestType === undefined) {
            throw new Error(reportError("State workRequestType is undefined during creation of a new work request object"))
        }
        if (workRequestExp === undefined || isNaN(Number(workRequestExp))) {
            throw new Error(reportError("State workRequestExp is undefined during creation of a new work request object"))
        }
        if (workRequestUrgency === undefined || isNaN(Number(workRequestUrgency))) {
            throw new Error(reportError("State workRequestUrgency is undefined during creation of a new work request object"))
        }
        if (workRequestInstructions === undefined) {
            throw new Error(reportError("State workRequestInstructions is undefined during creation of a new work request object"))
        }
        return {
            id: workRequestId,
            createdDateTime: new Date(workRequestCreatedDateTime).toISOString(),
            createdBy: workRequestCreatedBy,
            type: workRequestType,
            exp: Number(workRequestExp),
            urgency: Number(workRequestUrgency),
            instructions: workRequestInstructions,
            completed: true,
            completedAs: newActivityId
        }
    }

    function handleSubmit(e: any) {
        e.preventDefault();
        const validationStatus = validateInputs()

        if (validationStatus == false) {
            return
        }
        
        if (operationParam == "create") {
            const newActivity = createActivityObjectFromState();

            client.models.Activity
                .create(newActivity)
                .then((createActivityResponse) => {
                    if (createActivityResponse?.errors?.length) {
                        reportError("Failed to create a new activity in the database", createActivityResponse.errors);
                        return;
                    }
                    navigate("/ActivityList")
                })
                .catch((error) => {
                    reportError("Failed to create a new activity in the database", error);
                })
        }

        if (operationParam == "promoteWorkRequest") {
            const newActivity = createActivityObjectFromState();

            const createActivityResult = client.models.Activity.create(newActivity);
            createActivityResult.then((createActivityResponse) => {

                if (createActivityResponse?.errors?.length) {
                    reportError("Failed to create new activity in the database when promoting a work request", createActivityResponse.errors);
                    return;
                }

                if (createActivityResponse["data"] === null || createActivityResponse["data"]["id"] === null) {
                    reportError("Failed to fetch created activity id from the database")
                    return;
                }

                const newActivityId = createActivityResponse["data"]["id"]

                const updatedWorkRequest = createWorkRequestObjectFromState(newActivityId);

                client.models.WorkRequest
                .update(updatedWorkRequest)
                .then((updateWorkRequestResponse) => {
                    if (updateWorkRequestResponse?.errors?.length) {
                        reportError("Failed to update a work request in the database", updateWorkRequestResponse.errors);
                    }
                    navigate("/ActivityList")
                }).catch((error) => {
                    reportError("Failed to update a work request in the database", error);
                })
            }).catch((error) => {
                reportError("Failed to create new activity in the database when promoting a work request", error);
            })
        }

        if (operationParam == "update") {
            const updatedActivity = createActivityObjectFromState();
            if (updatedActivity.id === undefined) {
                throw new Error(reportError("State activityId is undefined during creation of a new activity object"))
            }

            const result = client.models.Activity.update({
                ...updatedActivity,
                id: updatedActivity.id
            });

            result.then((updateActivityResponse) => {
                 if (updateActivityResponse?.errors?.length) {
                    reportError("Failed to update an activity in the database", updateActivityResponse.errors);
                }
                navigate("/ActivityDetails/" + activityId)
            }).catch((error) => {
                reportError("Failed to update an activity in the database", error);
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
        setActivityExp(exp.toString())
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
                <p><select id="activityPerson" onChange={handleActivityPersonChange} value={activityPerson}>
                    { Array.from(users.values()).map((user: User) => {
                            return <option key={user.id} value={user.id}>{user.nickname}</option>
                        }
                    )}
                </select></p>

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
                    <img src={unpacking_frisco} onClick={() => fillTemplate("rozpakowanie zakupów Frisco", 5)} alt="rozpakowanie zakupów Frisco"></img>
                </div>

                <p className="label">Czynność</p>
                { activityTypeErrorMessage.length > 0 ? (<p className="validationMessage">{activityTypeErrorMessage}</p>) : (<></>) }
                <p><input id="activityType" type="text" className="entityTextArea" onChange={handleActivityTypeChange} value={activityType}/></p>

                <p className="label">Zdobyte punkty doświadczenia</p>
                { activityExpErrorMessage.length > 0 ? (<p className="validationMessage">{activityExpErrorMessage}</p>) : (<></>) }
                <p><input id="activityExp" type="text" onChange={handleActivityExpChange} value={activityExp}/></p>

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
