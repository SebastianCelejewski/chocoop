import { useState } from "react";
import { useParams } from "react-router";
import { useCurrentUser } from "./hooks/useCurrentUser";

import User from "../../model/User";

import { ActivityEditFormState } from "../../model/ActivityFormState";
import { ActivityFormErrorMessages } from "../../model/ActivityFormErrorMessages";
import { useActivityEditDetails } from "./hooks/useActivityEditDetails";
import { useActivityEditActions } from "./hooks/useActivityEditActions";
import TemplateButtons from "../../components/templateButtons";
import { ActivityOperations, ActivityOperation } from "../../model/ActivityOperation";

const pageTitleMap: Record<ActivityOperation, string> = {
  [ActivityOperations.CREATE]: "Dodawanie wykonanej czynności",
  [ActivityOperations.UPDATE]: "Edycja czynności",
  [ActivityOperations.PROMOTE_WORK_REQUEST]: "Wykonane zlecenie"
};

function getPageTitle(operation?: ActivityOperation) {
  return operation ? pageTitleMap[operation] : "??";
}

function ActivityEdit({ users }: { users: Map<string, User> }) {
    const currentDateTimeUTC = new Date()
    const timeZoneOffset = currentDateTimeUTC.getTimezoneOffset()
    const currentDateTimeLocal = new Date(currentDateTimeUTC.getTime() - timeZoneOffset * 60 * 1000)
    const currentDate = currentDateTimeLocal.toISOString().split("T")[0]
    const yesterdayDateTimeLocal = new Date(currentDateTimeLocal.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayDate = yesterdayDateTimeLocal.toISOString().split("T")[0]

    const initialErrorMessages: ActivityFormErrorMessages = {
        activityPersonErrorMessage: "",
        activityTypeErrorMessage: "",
        activityExpErrorMessage: "",
        activityCommentErrorMessage: ""
    }

    const currentUser = useCurrentUser() ?? undefined;
    const { handleSubmit, handleCancel } = useActivityEditActions();
    const { id: objectId, operation } = useParams<{id?: string, operation?: ActivityOperation}>();
    const { activity, setActivity, workRequest, loading, error } = useActivityEditDetails(operation, objectId, currentUser);
    const [errorMessages, setErrorMessages] = useState<ActivityFormErrorMessages>(initialErrorMessages);

    if (!currentUser) {
        return <div className="notFoundState">User nie jest załadowany</div>;
    }

    if (operation !== ActivityOperations.CREATE && (!objectId || loading)) {
        return <div className="loadingData">Ładowanie danych</div>;
    }

    if (error) {
        return <div className="errorState">Błąd podczas ładowania danych</div>;
    }

    if (!activity) {
        return <div className="notFoundState">Activity nie jest załadowane</div>;
    }

    function handleActivityChange<K extends keyof ActivityEditFormState>(
        key: K,
        value: ActivityEditFormState[K]
    ) {
        setActivity(prev => prev ? { ...prev, [key]: value } : prev);
    }

    function fillTemplate(type: string, exp: number) {
        setActivity(prev => prev ? {...prev, type, exp: exp.toString()} : prev);
    }

    const submit = function(e: any) {
        e.preventDefault();
        const errors = handleSubmit(activity, workRequest, operation);
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

    function cancel() {
        handleCancel(operation, objectId);
    }

return <>
        <h2 className="pageTitle" data-testid="activity-edit-page" data-mode={operation}>{getPageTitle(operation)}</h2>
        <form onSubmit={submit}>
            <div className="entryDetails">
                <p className="label">Data wykonania czynności</p>
                <div>
                    <button type="button" data-testid="yesterday-button" className="entityButton" onClick={() => handleActivityChange("date", yesterdayDate)}>Wczoraj</button>
                    <button type="button" data-testid="today-button" className="entityButton" onClick={() => handleActivityChange("date", currentDate)}>Dziś</button>

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
                <TemplateButtons fillTemplate={fillTemplate} />

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
