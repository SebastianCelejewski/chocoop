import type { Schema } from "../../../amplify/data/resource";

import { useState } from "react";
import { NavLink, useParams, useNavigate } from "react-router";

import User from "../../model/User";
import { useActivityDetails } from "./hooks/useActivityDetails";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { useActivityActions } from "./hooks/useActivityActions";
import { useActivityReactions } from "./hooks/useActivityReactions";
import { ReactionsByUser } from "../../components/reactions"
import { dateToString } from "../../utils/dateUtils";

import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

function ActivityDetails({users}: {users: Map<string, User>}) {
    const navigate = useNavigate();

    const { id: activityId } = useParams();
    const { activity, loading, error } = useActivityDetails(activityId ?? null);
    const currentUser = useCurrentUser();
    const { reactions, refetch } = useActivityReactions(activityId);
    const { deleteActivity, addReaction } = useActivityActions();

    const [reactionsPopupVisible, setReactionsPopupVisible] = useState<boolean>(false);

    if (loading) {
        return <div className="loadingData">Ładowanie danych</div>;
    }

    if (error) {
        return <div className="errorState">Błąd podczas ładowania danych</div>;
    }

    if (!activity) {
        return <div className="notFoundState">Activity nie jest załadowane</div>;
    }

    if (!currentUser) {
        return <div className="notFoundState">User nie jest załadowany</div>;
    }

    const handleBack = () => {
        navigate("/ActivityList/")
    }

    const handleEdit = () => {
        const navLink = `/ActivityEdit/update/${activity.id}`
        navigate(navLink)
    }

    const handleDelete = async () => {
        if (!confirm("Czy na pewno usunąć aktywność?")) return;

        await deleteActivity(activity.id);
        navigate("/ActivityList");
    }

    const handleReaction = () => {
        setReactionsPopupVisible(!reactionsPopupVisible);
    }

    const handleEmojiSelected = async (emojiData: EmojiClickData) => {
        setReactionsPopupVisible(false);

        await addReaction({
            activityId: activity.id,
            userId: currentUser.userId,
            reaction: emojiData.emoji,
        });

        await refetch();
    };

    function ReactionsPopup() {
        if (!reactionsPopupVisible) return null;

        return <>
            <div className="reactionsPopup">
                <EmojiPicker onEmojiClick={handleEmojiSelected} />
            </div>
        </>
    }

    function WorkRequestInfo({ activity }: { activity: Schema["Activity"]["type"]}) {
      if (activity.requestedAs) {
        const linkTarget = "/WorkRequestDetails/" + activity.requestedAs;
        return <>
            <p>Na podstawie zlecenia. <NavLink to={linkTarget}>Przejdź do zlecenia</NavLink></p>
        </>
      } else {
        return <>
            <p>Bez zlecenia</p>
        </>
      }
    }

    return <>
        <h2 className="pageTitle" data-testid="activity-details-page">Szczegóły wykonanej czynności</h2>
        <div className="entryDetails">
            <ReactionsPopup/>
            <p className="label">Data wykonania czynności</p>
            <p>{dateToString(activity.date)}</p>

            <p className="label">Tryb</p>
            <WorkRequestInfo activity={activity}/>

            <p className="label">Wykonawca</p>
            <p>{users.get(activity.user)?.nickname}</p>

            <p className="label">Rodzaj aktywności</p>
            <p>{activity.type}</p>

            <p className="label">Zdobyte punkty doświadczenia</p>
            <p>{activity.exp}</p>

            <p className="label">Komentarz</p>
            <p className="commentTextArea">{activity.comment}</p>

            <p className="label">Reakcje</p>
            <ReactionsByUser reactions={reactions} users={users}/>
        </div>
        <div>
            <button type="button" onClick={handleBack}>Wróć</button>
            <button type="button" onClick={handleEdit}>Edytuj</button>
            <button type="button" onClick={handleDelete}>Usuń</button>
            <button type="button" onClick={handleReaction}>Zareaguj</button>
        </div>
    </>
}

export default ActivityDetails;
