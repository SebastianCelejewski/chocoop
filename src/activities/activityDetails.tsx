import type { Schema } from "../../amplify/data/resource";

import { useState, useEffect } from "react";
import { NavLink, useParams, useNavigate } from "react-router";
import { generateClient } from "aws-amplify/data";
import { dateToString } from "../utils/dateUtils";
import { getCurrentUser, type AuthUser } from 'aws-amplify/auth';

import reportError from "../utils/reportError"
import User from "../model/User";
import Reactions from "../components/reactions"

import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

const client = generateClient<Schema>();

function ActivityDetails({users}: {users: Map<string, User>}) {
    const navigate = useNavigate();

    const params = useParams();
    const activityIdParam = params["id"]

    const [activity, setActivity] = useState<Schema["Activity"]["type"]>();
    const [reactions, setReactions] = useState<Array<Schema["Reaction"]["type"]>>([]);
    const [reactionsPopupVisible, setReactionsPopupVisible] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState("");

    useEffect(() => {
        if (activityIdParam === undefined) {    
            throw new Error(reportError("Error while fetching activity to be displayed: id is undefined"));
        }

        getCurrentUser()
            .then((user : AuthUser) => {
                console.log("Setting current user to " + user.username);
                setCurrentUser(user.username);
            })

        client.models.Activity
            .get({ id: activityIdParam })
            .then((result) => {
                console.log("Loading activity data from the database")
                if (result["data"] !== undefined && result["data"] !== null) {
                    setActivity(result["data"])
                }
            })
            .catch((error) => {
                throw new Error(reportError("Error while fetching activity to be displayed: " + error));
            })
    
        var reactionsQuery = client.models.Reaction.observeQuery({
            filter: {
                activityId: {
                    eq: activityIdParam
                }
            }
        }).subscribe({
            next: (data: { items: Array<Schema["Reaction"]["type"]> }) => {
                console.log("Loading reactions data from the database")
                setReactions(data.items)
            }
        });

        return (() => {
            reactionsQuery.unsubscribe()
        })
    }, [activityIdParam]);

    function handleBack() {
        navigate("/ActivityList/")
    }

    function handleEdit() {
        const navLink = `/ActivityEdit/update/${activityIdParam}`
        navigate(navLink)
    }

    function handleDelete() {
        if (activityIdParam !== undefined && activity !== undefined) {
            if (confirm("Usuwanie aktywności\n\n"
                + activity.dateTime + "\n"
                + activity.user + " " + activity.type + "\n\nCzy na pewno chcesz usunąć tę aktywność?")) {
                client.models.Activity.delete({ id: activityIdParam }).then(() => {
                    navigate("/ActivityList")
                })
            } 
        }
    }

    function handleReaction() {
        if (currentUser !== null && currentUser !== undefined) {
            setReactionsPopupVisible(!reactionsPopupVisible);
        }
    }

    function handleEmojiSelected(emojiData: EmojiClickData) {
        setReactionsPopupVisible(false);
        if (activity === undefined) {
            return
        }

        const newReaction = {
            reaction: emojiData.emoji,
            user: currentUser,
            activityId: activity.id
        }

        client.models.Reaction
            .create(newReaction)
            .then((result) => {
                if (result["data"] === undefined) {
                    reportError("Failed to create reaction: " + JSON.stringify(result));
                }
            })
            .catch((error) => {
                throw new Error(reportError("Error while creating reaction: " + error));
            })
    }

    function ReactionsPopup() {
        if (reactionsPopupVisible) {
            return <>
                <div className="reactionsPopup">
                    <EmojiPicker onEmojiClick={handleEmojiSelected} />
                </div>
            </>
        } else {
            return <></>
        }
    }

    function WorkRequestInfo({ activity }: { activity: Schema["Activity"]["type"]}) {
      if (activity.requestedAs !== undefined && activity.requestedAs != null && activity.requestedAs != "") {
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

    if (activity === undefined) {
        return <>
            <nav>
                  <NavLink to="/ActivityList" end>Powrót na listę czynności</NavLink>
            </nav>
        </>
    } else {
        return <>
            <p className="pageTitle">Szczegóły wykonanej czynności</p>
            <div className="entryDetails">
                <ReactionsPopup/>
                <p className="label">Data i godzina czynności</p>
                <p>{dateToString(activity.dateTime)}</p>

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
                <Reactions activity={activity} reactions={reactions} users={users}/>
            </div>
            <div>
                <button type="button" onClick={handleBack}>Wróć</button>
                <button type="button" onClick={handleEdit}>Edytuj</button>
                <button type="button" onClick={handleDelete}>Usuń</button>
                <button type="button" onClick={handleReaction}>Zareaguj</button>
            </div>
        </>
    }
}

export default ActivityDetails;
