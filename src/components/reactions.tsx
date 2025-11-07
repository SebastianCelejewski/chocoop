import type { Schema } from "../../amplify/data/resource";
import User from "../model/User";

function Reactions({
    activity,
    reactions,
    users
}: {
    activity: Schema["Activity"]["type"],
    reactions: Array<Schema["Reaction"]["type"]>,
    users: Map<string, User>
}) {
    return <div id="reactionsContainer"> {
        reactions
            .filter(reaction => reaction.activityId === activity.id)
            .map(reaction => {
                return <p key={reaction.id}>{users.get(reaction.user)?.nickname}: {reaction.reaction}</p>
            })
        }
    </div>
}

export default Reactions;