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

function WorkRequestEdit() {

    const navigate = useNavigate();

    const params = useParams();
    const workrequestIdParam = params["id"]

    const currentDateTimeUTC = new Date()
    const timeZoneOffset = currentDateTimeUTC.getTimezoneOffset()
    const currentDateTimeLocal = new Date(currentDateTimeUTC.getTime() - timeZoneOffset * 60 * 1000)
    const currentDateTime = currentDateTimeLocal.toISOString().split(".")[0]

    const [workRequestId, setWorkRequestId] = useState(String || undefined)
    const [workRequestCreatedDateTime, setWorkRequestCreatedDateTime] = useState(String || undefined);
    const [workRequestCreatedBy, setWorkRequestCreatedBy] = useState("");
    const [workRequestType, setWorkRequestType] = useState("");
    const [workRequestExp, setWorkRequestExp] = useState(0);
    const [workRequestUrgency, setWorkRequestUrgency] = useState(0);
    const [workRequestInstructions, setWorkRequestInstructions] = useState("");

    const [workRequestCreatedByErrorMessage, setWorkRequestCreatedByErrorMessage] = useState("")
    const [workRequestTypeErrorMessage, setWorkRequestTypeErrorMessage] = useState("");
    const [workRequestExpErrorMessage, setWorkRequestExpErrorMessage] = useState("");
    const [workRequestUrgencyErrorMessage, setWorkRequestUrgencyErrorMessage] = useState("");
    const [workRequestInstructionsErrorMessage, setWorkRequestInstructionsErrorMessage] = useState("");    

    let mode : String | undefined
    const [personLoadingInProgress, setPersonLoadingInProgress] = useState(false)
    const [dateTimeSettingInProgress, setDateTimeLoadingInProgress] = useState(false)

    function setNewWorkRequestPerson() {
        fetchUserAttributes().then((attributes) => {
            if (attributes.nickname !== undefined) {
                setWorkRequestCreatedBy(attributes.nickname)
            }
        })
        setPersonLoadingInProgress(true)
    }

    function setNewWorkRequestDateTime() {
        setWorkRequestCreatedDateTime(currentDateTime)
        setDateTimeLoadingInProgress(true)
    }
    
    async function getWorkRequest(workrequestId: string) {
        return await client.models.WorkRequest.get({ id: workrequestId });
    }

    if (mode === undefined) {
        if (workrequestIdParam !== undefined && workrequestIdParam != "new") { 
            mode = "edit"
        } else {
            mode = "create"
        }
    }

    if (mode == "edit" && workrequestIdParam !== undefined && workRequestId == "") {
        getWorkRequest(workrequestIdParam).then((result) => {
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
            }
        })
    }

    if (mode == "create" && workRequestCreatedBy === "" && personLoadingInProgress == false) {
        setNewWorkRequestPerson()                
    }

    if (mode == "create" && workRequestCreatedDateTime === "" && dateTimeSettingInProgress == false) {
        setNewWorkRequestDateTime()
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
        var temporaryValidationStatus = true

        if (workRequestCreatedBy === undefined || workRequestCreatedBy.length == 0) {
            setWorkRequestCreatedByErrorMessage("Wpisz zleceniodawcę")
            temporaryValidationStatus = false
        } else {
            setWorkRequestCreatedByErrorMessage("")
        }

        if (workRequestType === undefined || workRequestType.length == 0) {
            setWorkRequestTypeErrorMessage("Wpisz rodzaj czynności")
            temporaryValidationStatus = false
        } else {
            setWorkRequestTypeErrorMessage("")
        }

        if (workRequestExp === undefined || workRequestExp == 0 || isNaN(workRequestExp)) {
            setWorkRequestExpErrorMessage("Wpisz punkty doświadczenia do zdobycia")
            temporaryValidationStatus = false
        } else {
            setWorkRequestExpErrorMessage("")
        }

        if (workRequestUrgency === undefined || workRequestUrgency == 0 || isNaN(workRequestUrgency)) {
            setWorkRequestUrgencyErrorMessage("Wpisz pilność")
            temporaryValidationStatus = false
        } else {
            setWorkRequestUrgencyErrorMessage("")
        }

        setWorkRequestInstructionsErrorMessage("")

        return temporaryValidationStatus
    }

    function handleSubmit(e: any) {
        e.preventDefault();
        const validationStatus = validateInputs()

        if (validationStatus == false) {
            return
        }
        
        if (mode == "create") {
            const newWorkRequest = {
                createdDateTime: new Date(workRequestCreatedDateTime).toISOString(),
                createdBy: workRequestCreatedBy,
                type: workRequestType,
                exp: workRequestExp,
                urgency: workRequestUrgency,
                instructions: workRequestInstructions
            }

            const result = client.models.WorkRequest.create(newWorkRequest);
            result.then(() => {
                navigate("/workRequests/list")
            })
        }

        if (mode == "edit") {
            const updatedWorkRequest = {
                id: workRequestId,
                createdDateTime: new Date(workRequestCreatedDateTime).toISOString(),
                createdBy: workRequestCreatedBy,
                type: workRequestType,
                exp: workRequestExp,
                urgency: workRequestUrgency,
                instructions: workRequestInstructions
            }

            const result = client.models.WorkRequest.update(updatedWorkRequest);

            result.then(() => {
                navigate("/workRequests/show/" + workRequestId)
            })
        }
    }

    function handleCancel() {
        if (mode == "create") {
            navigate("/workRequests/list")
        } else {
            navigate("/workRequests/show/" + workRequestId)
        }
    }

    function fillTemplate(type: string, exp: number) {
        setWorkRequestType(type)
        setWorkRequestExp(exp)
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

                <p className="label">Zleceniodawca</p>
                { workRequestCreatedByErrorMessage.length > 0 ? (<p className="validationMessage">{workRequestCreatedByErrorMessage}</p>) : (<></>) }
                <p><input id="workRequestCreatedBy" type="text" className="newWorkRequestTextArea" onChange={handleWorkRequestCreatedByChange} value={workRequestCreatedBy}/></p>

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
                <p><input type="text" id="workRequestUrgency" className="newWorkrequestTextArea" onChange={handleWorkRequestUrgencyChange} value={workRequestUrgency}/></p>

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
