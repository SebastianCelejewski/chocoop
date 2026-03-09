import type { Schema } from "../../../amplify/data/resource";

import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { generateClient } from "aws-amplify/data";
import { getCurrentUser, type AuthUser } from 'aws-amplify/auth';

import User from "../../model/User";
import reportError from "../../utils/reportError"

import { ActivityFormState } from "../../model/ActivityFormState";
import { WorkRequestFormState } from "../../model/WorkRequestFormState";
import { ActivityFormErrorMessages } from "../../model/ActivityFormErrorMessages";
import { useActivityEditActions } from "./hooks/useActivityEditActions";

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

const pageTitleMap: Record<string, string> = {
  "create": 'Dodawanie wykonanej czynności',
  "update": 'Edycja czynności',
  "promoteWorkRequest": 'Wykonane zlecenie'
};

function ActivityEdit({ users }: { users: Map<string, User> }) {

    const { handleSubmit, handleCancel } = useActivityEditActions();

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

    const initialErrorMessages: ActivityFormErrorMessages = {
        activityPersonErrorMessage: "",
        activityTypeErrorMessage: "",
        activityExpErrorMessage: "",
        activityCommentErrorMessage: ""
    }

    const [activity, setActivity] = useState<ActivityFormState>(initialActivity);
    const [errorMessages, setErrorMessages] = useState<ActivityFormErrorMessages>(initialErrorMessages);
    const [workRequest, setWorkRequest] = useState<WorkRequestFormState | null>(null);

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

    function fillTemplate(type: string, exp: number) {
        setActivity(prev => ({...prev, type: type, exp: exp.toString()} ));
    }

    function submit(e: any) {
        e.preventDefault();
        const errors = handleSubmit(activity, workRequest, operationParam);
        const isValid = Object.keys(errors).length === 0;

        if (!isValid) {
            const newErrorMessages: ActivityFormErrorMessages = {
                activityPersonErrorMessage: errors.user ?? "",
                activityTypeErrorMessage: errors.type ?? "",
                activityExpErrorMessage: errors.exp ?? "",
                activityCommentErrorMessage: errors.comment ?? ""
            }

            setErrorMessages(newErrorMessages);
        }
    }

    function cancel(e: any) {
        handleCancel(e, operationParam, workRequest);
    }

    return <>
        <h2 className="pageTitle" data-testid="activity-edit-page" data-mode={operationParam}>{pageTitleMap[operationParam]}</h2>
        <form onSubmit={submit}>
            <div className="entryDetails">
                <p className="label">Data wykonania czynności</p>
                <div>
                    <button type="button" data-testid="yesterday-button" className="entityButton" onClick={() => setActivity( prev => ({...prev, date: yesterdayDate}))}>Wczoraj</button>
                    <button type="button" data-testid="today-button" className="entityButton" onClick={() => setActivity( prev => ({...prev, date: currentDate}))}>Dziś</button>

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
                {errorMessages.activityPersonErrorMessage.length > 0 ? (<p className="validationMessage">{errorMessages.activityPersonErrorMessage}</p>) : (<></>)}
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
                    <img src={vacuuming} data-testid="template-button" onClick={() => fillTemplate("odkurzanie", 10)} alt="odkurzanie"></img>
                    <img src={dishwashing} data-testid="template-button" onClick={() => fillTemplate("zmywanie naczyń", 20)} alt="zmywanie naczyń"></img>
                    <img src={shopping_local} data-testid="template-button" onClick={() => fillTemplate("zakupy osiedle", 10)} alt="zakupy osiedle"></img>
                    <img src={shopping_Auchan} data-testid="template-button" onClick={() => fillTemplate("zakupy Auchan", 20)} alt="zakupy Auchan"></img>
                    <img src={cooking} data-testid="template-button" onClick={() => fillTemplate("ugotowanie obiadu", 40)} alt="ugotowanie obiadu"></img>
                </div>
                <div className="templateActivities">
                    <img src={laundry_start} data-testid="template-button" onClick={() => fillTemplate("nastawianie prania", 10)} alt="nastawianie prania"></img>
                    <img src={laundry_end} data-testid="template-button" onClick={() => fillTemplate("wywieszanie prania", 10)} alt="wywieszanie prania"></img>
                    <img src={laundry_sorting} data-testid="template-button" onClick={() => fillTemplate("ściąganie prania", 10)} alt="ściąganie prania"></img>
                    <img src={taking_garbage_out} data-testid="template-button" onClick={() => fillTemplate("wyniesienie śmieci", 10)} alt="wyniesienie śmieci"></img>
                    <img src={unpacking_frisco} data-testid="template-button" onClick={() => fillTemplate("rozpakowanie zakupów Frisco", 5)} alt="rozpakowanie zakupów Frisco"></img>
                </div>

                <p className="label">Czynność</p>
                {errorMessages.activityTypeErrorMessage.length > 0 ? (<p className="validationMessage">{errorMessages.activityTypeErrorMessage}</p>) : (<></>)}
                <p><input
                        id="activityType"
                        data-testid="activity-type-input"
                        type="text"
                        className="entityTextArea"
                        value={activity.type}
                        onChange={ e => handleActivityChange("type", e.target.value)}
                /></p>

                <p className="label">Zdobyte punkty doświadczenia</p>
                {errorMessages.activityExpErrorMessage.length > 0 ? (<p className="validationMessage">{errorMessages.activityExpErrorMessage}</p>) : (<></>)}
                <p><input
                    id="activityExp"
                    data-testid="activity-exp-input"
                    type="text"
                    className="entityText"
                    value={activity.exp}
                    onChange={ e => handleActivityChange("exp", e.target.value)}
                /></p>

                <p className="label">Komentarz</p>
                {errorMessages.activityCommentErrorMessage.length > 0 ? (<p className="validationMessage">{errorMessages.activityCommentErrorMessage}</p>) : (<></>)}
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
                <button type="submit" data-testid="submit-button">Zatwierdź</button>
                <button type="button" data-testid="cancel-button" onClick={cancel}>Anuluj</button>
            </div>
        </form>
    </>
}

export default ActivityEdit;
