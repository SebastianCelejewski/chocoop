import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { generateClient } from "aws-amplify/data";
import { getCurrentUser, type AuthUser } from 'aws-amplify/auth';

import type { Schema } from "../../../amplify/data/resource";
import { urgencyList, Urgency } from "../../model/Urgency"
import User from "../../model/User";
import reportError from "../../utils/reportError"

import vacuuming from "../../assets/images/activities/vacuuming.png?url";
import dishwashing from "../../assets/images/activities/dishwashing.png?url";
import shopping_local from "../../assets/images/activities/shopping_local.png?url";
import shopping_Auchan from "../../assets/images/activities/shopping_Auchan.png?url";
import cooking from "../../assets/images/activities/cooking.png?url";
import laundry_start from "../../assets/images/activities/laundry_start.png?url";
import laundry_end from "../../assets/images/activities/laundry_end.png?url";
import laundry_sorting from "../../assets/images/activities/laundry_sorting.png?url";
import taking_garbage_out from "../../assets/images/activities/taking_garbage_out.png?url";

const client = generateClient<Schema>();

function WorkRequestEdit({users}: {users: Map<string, User>}) {

    const navigate = useNavigate();

    const params = useParams();
    const operationParam = params["operation"]
    const workrequestIdParam = params["id"]

    const currentDateTimeUTC = new Date()
    const timeZoneOffset = currentDateTimeUTC.getTimezoneOffset()
    const currentDateTimeLocal = new Date(currentDateTimeUTC.getTime() - timeZoneOffset * 60 * 1000)
    const currentDateTime = currentDateTimeLocal.toISOString().split(".")[0]

    const [workRequestId, setWorkRequestId] = useState<string | undefined>(undefined);
    const [workRequestCreatedDateTime, setWorkRequestCreatedDateTime] = useState<string | undefined>(undefined)
    const [workRequestCreatedBy, setWorkRequestCreatedBy] = useState<string | undefined>(undefined)
    const [workRequestType, setWorkRequestType] = useState("");
    const [workRequestExp, setWorkRequestExp] = useState("");
    const [workRequestUrgency, setWorkRequestUrgency] = useState("");
    const [workRequestInstructions, setWorkRequestInstructions] = useState("");
    const [workRequestCompleted, setWorkRequestCompleted] = useState(false);
    const [workRequestCompletedAs, setWorkRequestCompletedAs] = useState<string | undefined>(undefined)

    const [workRequestCreatedByErrorMessage, setWorkRequestCreatedByErrorMessage] = useState("")
    const [workRequestTypeErrorMessage, setWorkRequestTypeErrorMessage] = useState("");
    const [workRequestExpErrorMessage, setWorkRequestExpErrorMessage] = useState("");
    const [workRequestUrgencyErrorMessage, setWorkRequestUrgencyErrorMessage] = useState("");
    const [workRequestInstructionsErrorMessage, setWorkRequestInstructionsErrorMessage] = useState("");    

    useEffect(() => {
        if (operationParam === "create") {
            console.log("Preparing component for creation of a new work request");

            setNewWorkRequestPerson();
            setNewWorkRequestDateTime();
        }

        if (operationParam === "update") {
            console.log("Preparing component for updating an existing work request");

            if (workrequestIdParam === undefined) {
                throw new Error(reportError("Error while fetching work request " + workrequestIdParam + " to be updated: id is undefined"));
            }

            loadWorkRequestToBeUpdated(workrequestIdParam);
        }
    },[operationParam, workrequestIdParam])

    function setNewWorkRequestPerson() {
        getCurrentUser().then((user : AuthUser) => {
            setWorkRequestCreatedBy(user.username);
        })
    }

    function setNewWorkRequestDateTime() {
        setWorkRequestCreatedDateTime(currentDateTime);
    }
    
    function loadWorkRequestToBeUpdated(workRequestId: string) {
        client.models.WorkRequest
            .get({ id: workRequestId })
            .then((result) => {
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
                    setWorkRequestCompleted(result["data"]["completed"]);
                    setWorkRequestCompletedAs(result["data"]["completedAs"] || "");
                }
            })
            .catch((error) => {
                throw new Error(reportError("Error while fetching work request " + workrequestIdParam + " to be updated: " + error));
            })
    }

    function handleWorkRequestCreatedDateTimeChange(e: any) {
        setWorkRequestCreatedDateTime(e.target.value)
    }

    function handleWorkRequestCreatedByChange(e: any) {
        setWorkRequestCreatedBy(e.target.value);
    }

    function handleWorkRequestTypeChange(e: any) {
        setWorkRequestType(e.target.value);
    }

    function handleWorkRequestExpChange(e: any) {
        setWorkRequestExp(e.target.value);
    }

    function handleWorkRequestUrgencyChange(e: any) {
        setWorkRequestUrgency(e.target.value);
    }

    function handleWorkRequestInstructionsChange(e: any) {
        setWorkRequestInstructions(e.target.value);
    }

    function validateInputs() {
        var isValid = true

        if (workRequestCreatedBy === undefined || workRequestCreatedBy.length == 0) {
            setWorkRequestCreatedByErrorMessage("Wpisz zleceniodawcę")
            isValid = false
        } else {
            setWorkRequestCreatedByErrorMessage("")
        }

        if (workRequestType === undefined || workRequestType.length == 0) {
            setWorkRequestTypeErrorMessage("Wpisz rodzaj czynności")
            isValid = false
        } else {
            setWorkRequestTypeErrorMessage("")
        }

        if (isNaN(Number(workRequestExp))) {
            setWorkRequestExpErrorMessage("Wpisz punkty doświadczenia do zdobycia")
            isValid = false
        } else {
            setWorkRequestExpErrorMessage("")
        }

        if (isNaN(Number(workRequestUrgency))) {
            setWorkRequestUrgencyErrorMessage("Wpisz pilność")
            isValid = false
        } else {
            setWorkRequestUrgencyErrorMessage("")
        }

        setWorkRequestInstructionsErrorMessage("")

        return isValid
    }

    function createWorkRequestObjectFromState() {
        if (workRequestCreatedBy === undefined) {
            throw new Error(reportError("State workRequestCreatedBy is undefined during creation of a new work request object"))
        }

        if (workRequestCreatedDateTime === undefined) {
            throw new Error(reportError("State workRequestCreatedDateTime is undefined during creation of a new work request object"))
        }
        
        if (workRequestType === undefined) {
            throw new Error(reportError("State workRequestType is undefined during creation of a new work request object"))
        }

        if (isNaN(Number(workRequestExp))) {
            throw new Error(reportError("State workRequestExp is not a number during creation of a new work request object"))
        }

        if (isNaN(Number(workRequestUrgency))) {
            throw new Error(reportError("State workRequestUrgency is not a number during creation of a new work request object"))
        }

        return {
            id: workRequestId,
            createdDateTime: new Date(workRequestCreatedDateTime).toISOString(),
            createdBy: workRequestCreatedBy,
            type: workRequestType,
            exp: Number(workRequestExp),
            urgency: Number(workRequestUrgency),
            instructions: workRequestInstructions,
            completed: workRequestCompleted,
            completedAs: workRequestCompletedAs
        }
    }

    function handleSubmit(e: any) {
        e.preventDefault();
        const validationStatus = validateInputs()

        if (validationStatus == false) {
            return
        }
        
        if (operationParam == "create") {
            const newWorkRequest = createWorkRequestObjectFromState();
            client.models.WorkRequest
                .create(newWorkRequest)
                .then((createdWorkRequestResponse) => {
                    if (createdWorkRequestResponse?.errors?.length) {
                        reportError("Failed to create a work request in the database", createdWorkRequestResponse.errors);
                    }
                    navigate("/WorkRequestList")
                }).catch((error) => {
                    reportError("Failed to create a new work request in the database", error);
                })
        }

        if (operationParam == "update") {
            const updatedWorkRequest = createWorkRequestObjectFromState();
            if (updatedWorkRequest.id === undefined) {
                throw new Error(reportError("State workRequestId is undefined during creation of a new work request object"))
            }

            client.models.WorkRequest
                .update({...updatedWorkRequest,id: updatedWorkRequest.id})
                .then((updatedWorkRequestResponse) => {
                    if (updatedWorkRequestResponse?.errors?.length) {
                        reportError("Failed to update a work request in the database", updatedWorkRequestResponse.errors);
                    }
                    navigate("/WorkRequestDetails/" + workRequestId)
                })
                .catch((error) => {
                    reportError("Failed to update a work request in the database", error);
                })
        }
    }

    function handleCancel() {
        if (operationParam == "create") {
            navigate("/WorkRequestList")
        } else {
            navigate("/WorkRequestDetails/" + workRequestId)
        }
    }

    function fillTemplate(type: string, exp: number) {
        setWorkRequestType(type)
        setWorkRequestExp(exp.toString())
    }

    return <>
        <p className="pageTitle">Dodawanie zlecenia</p>
        <form onSubmit={handleSubmit}>
            <div className="entryDetails">
                <p className="label">Data i godzina utworzenia zlecenia</p>
                <p><input
                        id="workrequestCreatedDateTime"
                        aria-label="Date and time"
                        type="datetime-local"
                        defaultValue={workRequestCreatedDateTime}
                        onChange={handleWorkRequestCreatedDateTimeChange}
                    /></p>

                <p className="label">Status</p>
                <p>Zlecenie wykonane: <input type="checkbox" id="workRequestCompleted" checked={workRequestCompleted} onChange={(e) => setWorkRequestCompleted(e.target.checked)}/></p>

                <p className="label">Zleceniodawca</p>
                { workRequestCreatedByErrorMessage.length > 0 ? (<p className="validationMessage">{workRequestCreatedByErrorMessage}</p>) : (<></>) }
                <p><select id="workRequestCreatedBy" onChange={handleWorkRequestCreatedByChange}>{ Array.from(users.values()).map((user: User) => {
                    if (user.id == workRequestCreatedBy) {
                        return <option key={user.id} value={user.id} selected>{user.nickname}</option>
                    } else {
                        return <option key={user.id} value={user.id}>{user.nickname}</option>
                    }
                })}
                </select></p>

                <p className="label">Szablony</p>
                <div className="templateWorkRequests">
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
                { workRequestTypeErrorMessage.length > 0 ? (<p className="validationMessage">{workRequestTypeErrorMessage}</p>) : (<></>) }
                <p><input type="text" id="workRequestComment" className="entityTextArea" onChange={handleWorkRequestTypeChange} value={workRequestType}/></p>

                <p className="label">Punkty doświadczenia do zdobycia</p>
                { workRequestExpErrorMessage.length > 0 ? (<p className="validationMessage">{workRequestExpErrorMessage}</p>) : (<></>) }
                <p><input type="text" id="workRequestComment" className="newWorkrequestTextArea" onChange={handleWorkRequestExpChange} value={workRequestExp}/></p>

                <p className="label">Pilność</p>
                { workRequestUrgencyErrorMessage.length > 0 ? (<p className="validationMessage">{workRequestUrgencyErrorMessage}</p>) : (<></>) }
                <p><select onChange={handleWorkRequestUrgencyChange} value={workRequestUrgency}>
                {
                    urgencyList.map((urgency: Urgency) => {
                        return <option key={urgency.level} value={urgency.level}>{urgency.label}</option>
                    })
                }
                </select></p>
                    
                <p className="label">Instrukcje</p>
                { workRequestInstructionsErrorMessage.length > 0 ? (<p className="validationMessage">{workRequestInstructionsErrorMessage}</p>) : (<></>) }
                <p><textarea id="workRequestComment" className="entityTextArea" rows={5} onChange={handleWorkRequestInstructionsChange} value={workRequestInstructions}/></p>
            </div>
            <div>
                <button type="submit">Zatwierdź</button>
                <button type="button" onClick={handleCancel}>Anuluj</button>
            </div>
        </form>
    </>
}

export default WorkRequestEdit;
