import type { Schema } from "../../../amplify/data/resource";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { generateClient } from "aws-amplify/data";
import { getCurrentUser, type AuthUser } from 'aws-amplify/auth';

import User from "../../model/User";
import reportError from "../../utils/reportError"

import vacuuming from "../../assets/images/activities/v2/vacuuming_64x64.png?url";
import dishwashing from "../../assets/images/activities/v2/dishwashing_64x64.png?url";
import shopping_local from "../../assets/images/activities/v2/shopping_local_64x64.png?url";
import shopping_Auchan from "../../assets/images/activities/v2/shopping_Auchan_64x64.png?url";
import cooking from "../../assets/images/activities/v2/cooking_64x64.png?url";
import laundry_start from "../../assets/images/activities/v2/laundry_start_64x64.png?url";
import laundry_end from "../../assets/images/activities/v2/laundry_end_64x64.png?url";
import laundry_sorting from "../../assets/images/activities/v2/laundry_sorting_64x64.png?url";
import taking_garbage_out from "../../assets/images/activities/v2/taking_garbage_out_64x64.png?url";
import unpacking_frisco from "../../assets/images/activities/v2/unpacking_frisco_64x64.png?url";

const client = generateClient<Schema>();

type ActivityFormState = {
  id?: string;
  date: string;
  user?: string;
  type: string;
  exp: string;
  comment: string;
  requestedAs?: string;
}

type WorkRequestFormState = {
  id?: string;
  createdDateTime?: string;
  createdBy?: string;
  type: string;
  exp: string;
  urgency: string;
  instructions: string;
}

type ValidationErrors<T> = Partial<Record<keyof T, string>>;
type ActivityValidationResult = ValidationErrors<ActivityFormState>;

const pageTitleMap: Record<string, string> = {
  "create": 'Dodawanie wykonanej czynności',
  "update": 'Edycja czynności',
  "promoteWorkRequest": 'Wykonane zlecenie'
};

function ActivityEdit({ users }: { users: Map<string, User> }) {

    const navigate = useNavigate();

    const params = useParams();
    const operationParam = params["operation"] || "Nieznana operacja"
    const objectIdParam = params["id"]

    const currentDateTimeUTC = new Date()
    const timeZoneOffset = currentDateTimeUTC.getTimezoneOffset()
    const currentDateTimeLocal = new Date(currentDateTimeUTC.getTime() - timeZoneOffset * 60 * 1000)
    const currentDate = currentDateTimeLocal.toISOString().split("T")[0]
    const yesterdayDateTimeLocal = new Date(currentDateTimeLocal.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayDate = yesterdayDateTimeLocal.toISOString().split("T")[0]

    const initialActivity: ActivityFormState = {
        date: "",
        user: undefined,
        type: "",
        exp: "",
        comment: "",
        requestedAs: undefined,
    };

    const [activity, setActivity] = useState<ActivityFormState>(initialActivity);
    const [workRequest, setWorkRequest] = useState<WorkRequestFormState | null>(null);

    const [activityPersonErrorMessage, setActivityPersonErrorMessage] = useState("")
    const [activityTypeErrorMessage, setActivityTypeErrorMessage] = useState("");
    const [activityExpErrorMessage, setActivityExpErrorMessage] = useState("");
    const [activityCommentErrorMessage, setActivityCommentErrorMessage] = useState("");

    useEffect(() => {
        if (operationParam === "create") {
            setActivityUser();
            setActivityDateToCurrentDate();
        }

        if (operationParam === "update") {
            if (objectIdParam === undefined) {
                throw new Error(reportError("Error while fetching activity " + objectIdParam + " to be updated: id is undefined"));
            }
            loadActivityToUpdate(objectIdParam);
        }

        if (operationParam == "promoteWorkRequest") {
            if (objectIdParam === undefined) {
                throw new Error(reportError("Error while fetching work request " + objectIdParam + " to be promoted: id is undefined"));
            }
            setActivityUser();
            setActivityDateToCurrentDate();
            loadWorkRequestToPromote(objectIdParam);
        }
    }, [operationParam, objectIdParam])

    function setActivityUser() {
        getCurrentUser().then((user: AuthUser) => {
            setActivity(prev => ({...prev, user: user.username}));
        })
    }

    function setActivityDateToCurrentDate() {
        setActivity(prev => ({...prev, date: currentDate}))
    }

    function toLocalDate(date: string) {
        const activityDateFromDatabaseAsDate = Date.parse(date)
        const activityDateLocal = new Date(activityDateFromDatabaseAsDate - timeZoneOffset * 60 * 1000)
        return activityDateLocal.toISOString().split("T")[0]
    }

    function hydrateActivityFromModel(model: Schema["Activity"]["type"]) {
        setActivity({
            id: model.id,
            date: toLocalDate(model.date),
            user: model.user,
            type: model.type,
            exp: model.exp.toString(),
            comment: model.comment ?? "",
            requestedAs: model.requestedAs ?? undefined
        });
    }

    function hydrateWorkRequestFromModel(model: Schema["WorkRequest"]["type"]) {
        setWorkRequest({
            id: model.id,
            createdBy: model.createdBy,
            createdDateTime: model.createdDateTime,
            type: model.type,
            exp: model.exp.toString(),
            urgency: model.urgency.toString(),
            instructions: model.instructions
        });

        setActivity({
            date: currentDate,
            user: activity.user,
            type: model.type,
            exp: model.exp.toString(),
            comment: "",
            requestedAs: model.id

        });
    }

    async function loadActivityToUpdate(activityId: string) {
        const result = await client.models.Activity.get({ id: activityId });

        if (!result.data) {
            throw new Error(reportError(`Activity ${activityId} not found`));
        }

        hydrateActivityFromModel(result.data);
    }

    async function loadWorkRequestToPromote(workRequestId: string) {
        const result = await client.models.WorkRequest.get({id: workRequestId})

        if (!result.data) {
            throw new Error(reportError(`Work request ${workRequestId} not found`));
        }

        hydrateWorkRequestFromModel(result.data);
    }

    function handleActivityChange<K extends keyof ActivityFormState>(
        key: K,
        value: ActivityFormState[K]
    ) {
        setActivity(prev => ({ ...prev, [key]: value }));
    }

    function isNaturalNumber(value: string): boolean {
        return /^\d+$/.test(value);
    }

    function validateInputs(form: ActivityFormState): ActivityValidationResult {
        const errors: ActivityValidationResult = {};

        if (!form.user) errors.user = "Wpisz wykonawcę czynności";
        if (!form.type) errors.type = "Wpisz rodzaj czynności";
        if (!form.exp) errors.exp = "Wpisz zdobyte punkty doświadczenia";
        if (!isNaturalNumber(form.exp)) errors.exp = "Punkty doświadczenia muszą być liczbą naturalną";

        return errors;
    }

    function createActivityObjectFromState() {
        if (activity.date === undefined) {
            throw new Error(reportError("State activityDate is undefined during creation of a new activity object"))
        }
        if (activity.user === undefined) {
            throw new Error(reportError("State activityPerson is undefined during creation of a new activity object"))
        }
        if (activity.type === undefined) {
            throw new Error(reportError("State activityType is undefined during creation of a new activity object"))
        }
        if (activity.exp === undefined || isNaN(Number(activity.exp))) {
            throw new Error(reportError("State activityExp is undefined during creation of a new activity object"))
        }
        return {
            id: activity.id,
            date: activity.date,
            user: activity.user,
            type: activity.type,
            exp: Number(activity.exp),
            comment: activity.comment,
            requestedAs: workRequest?.id
        }
    }

    function createWorkRequestObjectFromState(newActivityId: string) {
        if (workRequest === null) {
            throw new Error(reportError("State workRequest is null during creation of a new work request object"))
        }
        if (newActivityId === undefined) {
            throw new Error(reportError("Argument newActivityId is undefined during creation of a new work request object"))
        }
        if (workRequest.id === undefined) {
            throw new Error(reportError("State workRequestId is undefined during creation of a new work request object"))
        }
        if (workRequest.createdDateTime === undefined) {
            throw new Error(reportError("State workRequestCreatedDateTime is undefined during creation of a new work request object"))
        }
        if (workRequest.createdBy === undefined) {
            throw new Error(reportError("State workRequestCreatedBy is undefined during creation of a new work request object"))
        }
        if (workRequest.type === undefined) {
            throw new Error(reportError("State workRequestType is undefined during creation of a new work request object"))
        }
        if (workRequest.exp === undefined || isNaN(Number(workRequest.exp))) {
            throw new Error(reportError("State workRequestExp is undefined during creation of a new work request object"))
        }
        if (workRequest.urgency === undefined || isNaN(Number(workRequest.urgency))) {
            throw new Error(reportError("State workRequestUrgency is undefined during creation of a new work request object"))
        }
        if (workRequest.instructions === undefined) {
            throw new Error(reportError("State workRequestInstructions is undefined during creation of a new work request object"))
        }
        return {
            id: workRequest.id,
            createdDateTime: new Date(workRequest.createdDateTime).toISOString(),
            createdBy: workRequest.createdBy,
            type: workRequest.type,
            exp: Number(workRequest.exp),
            urgency: Number(workRequest.urgency),
            instructions: workRequest.instructions,
            completed: true,
            completedAs: newActivityId
        }
    }

    function handleSubmit(e: any) {
        e.preventDefault();
        const errors = validateInputs(activity);
        const isValid = Object.keys(errors).length === 0;

        if (!isValid) {
            setActivityPersonErrorMessage(errors.user ?? "")
            setActivityTypeErrorMessage(errors.type ?? "")
            setActivityExpErrorMessage(errors.exp ?? "")
            setActivityCommentErrorMessage(errors.comment ?? "")
            return
        }

        if (operationParam === "create") {
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

        if (operationParam === "promoteWorkRequest") {
            const newActivity = createActivityObjectFromState();

            client.models.Activity
                .create(newActivity)
                .then((createActivityResponse) => {
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
                        })
                        .catch((error) => {
                            reportError("Failed to update a work request in the database", error);
                        })
                })
                .catch((error) => {
                    reportError("Failed to create new activity in the database when promoting a work request", error);
                })
        }

        if (operationParam === "update") {
            const updatedActivity = createActivityObjectFromState();
            if (updatedActivity.id === undefined) {
                throw new Error(reportError("State activityId is undefined during creation of a new activity object"))
            }

            client.models.Activity
                .update({ ...updatedActivity, id: updatedActivity.id })
                .then((updateActivityResponse) => {
                    if (updateActivityResponse?.errors?.length) {
                        reportError("Failed to update an activity in the database", updateActivityResponse.errors);
                    }
                    navigate("/ActivityDetails/" + activity.id)
                })
                .catch((error) => {
                    reportError("Failed to update an activity in the database", error);
                })
        }
    }

    function handleCancel() {
        if (operationParam == "create") {
            navigate("/ActivityList")
        } else if (operationParam == "promoteWorkRequest") {
            if (workRequest !== null) {
                navigate("/WorkRequestDetails/" + objectIdParam)
            }
        } else {
            navigate("/ActivityDetails/" + objectIdParam)
        }
    }

    function fillTemplate(type: string, exp: number) {
        setActivity(prev => ({...prev, type: type, exp: exp.toString()} ));
    }

    return <>
        <h2 className="pageTitle" data-testid="activity-edit-page" data-mode={operationParam}>{pageTitleMap[operationParam]}</h2>
        <form onSubmit={handleSubmit}>
            <div className="entryDetails">
                <p className="label">Data wykonania czynności</p>
                <div>
                    <button type="button" data-testId="today-button" className="entityButton" onClick={() => setActivity( prev => ({...prev, date: yesterdayDate}))}>Wczoraj</button>
                    <button type="button" data-testid="yesterday-button" className="entityButton" onClick={() => setActivity( prev => ({...prev, date: currentDate}))}>Dziś</button>

                    <input
                        id="activityDate"
                        data-testid="activity-date-input"
                        aria-label="Date"
                        type="date"
                        value={activity.date}
                        className="entityDatePicker"
                        onChange={ e => handleActivityChange("date", e.target.value)}
                    />
                </div>

                <p className="label">Wykonawca</p>
                {activityPersonErrorMessage.length > 0 ? (<p className="validationMessage">{activityPersonErrorMessage}</p>) : (<></>)}
                <p><select
                    id="activityPerson"
                    data-testid="activity-person-input"
                    className="entityText"
                    value={activity.user}
                    onChange={e => handleActivityChange("user", e.target.value)}
                    >
                        {Array.from(users.values()).map((user: User) => {
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
                </div>
                <div className="templateActivities">
                    <img src={laundry_start} onClick={() => fillTemplate("nastawianie prania", 10)} alt="nastawianie prania"></img>
                    <img src={laundry_end} onClick={() => fillTemplate("wywieszanie prania", 10)} alt="wywieszanie prania"></img>
                    <img src={laundry_sorting} onClick={() => fillTemplate("ściąganie prania", 10)} alt="ściąganie prania"></img>
                    <img src={taking_garbage_out} onClick={() => fillTemplate("wyniesienie śmieci", 10)} alt="wyniesienie śmieci"></img>
                    <img src={unpacking_frisco} onClick={() => fillTemplate("rozpakowanie zakupów Frisco", 5)} alt="rozpakowanie zakupów Frisco"></img>
                </div>

                <p className="label">Czynność</p>
                {activityTypeErrorMessage.length > 0 ? (<p className="validationMessage">{activityTypeErrorMessage}</p>) : (<></>)}
                <p><input
                        id="activityType"
                        data-testid="activity-type-input"
                        type="text"
                        className="entityTextArea"
                        value={activity.type}
                        onChange={ e => handleActivityChange("type", e.target.value)}
                /></p>

                <p className="label">Zdobyte punkty doświadczenia</p>
                {activityExpErrorMessage.length > 0 ? (<p className="validationMessage">{activityExpErrorMessage}</p>) : (<></>)}
                <p><input
                    id="activityExp"
                    data-testid="activity-exp-input"
                    type="text"
                    className="entityText"
                    value={activity.exp}
                    onChange={ e => handleActivityChange("exp", e.target.value)}
                /></p>

                <p className="label">Komentarz</p>
                {activityCommentErrorMessage.length > 0 ? (<p className="validationMessage">{activityCommentErrorMessage}</p>) : (<></>)}
                <p><textarea
                    id="activityComment"
                    data-testid="activity-comment-input"
                    className="entityTextArea"
                    rows={5}
                    value={activity.comment}
                    onChange={ e => handleActivityChange("comment", e.target.value)}
                /></p>
            </div>
            <div>
                <button type="submit" data-testId="submit-button">Zatwierdź</button>
                <button type="button" data-testId="cancel-button" onClick={handleCancel}>Anuluj</button>
            </div>
        </form>
    </>
}

export default ActivityEdit;
