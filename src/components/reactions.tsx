import type { Schema } from "../../amplify/data/resource";
import User from "../model/User";

function Reactions({
    reactions,
    users
}: {
    reactions: Array<Schema["Reaction"]["type"]>,
    users: Map<string, User>
}) {

    const reactionsByUser = reactions.reduce((acc, reaction) => acc.set(reaction.user, [...(acc.get(reaction.user) || []), reaction]), new Map<string, Array<Schema["Reaction"]["type"]>>());

    return <div id="reactionsContainer"> {
        reactionsByUser.size === 0 ? <></> : Array.from(reactionsByUser.keys()).map(user => {
            return <p key={user}>{users.get(user)?.nickname}: {
                reactionsByUser.get(user)?.map(reaction => {
                    return reaction.reaction
                }).join("")
            }</p>
        })
    }
    </div>
}

export default Reactions;