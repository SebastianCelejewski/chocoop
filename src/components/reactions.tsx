import User from "../model/User";
import { UIReaction } from "../model/UIReaction"

function ReactionsByUser({ reactions, users }: { reactions: Array<UIReaction>, users: Map<string, User>}) {
    const reactionsByUser = reactions.reduce((acc, reaction) => acc.set(reaction.user, [...(acc.get(reaction.user) || []), reaction]), new Map<string, UIReaction[]>());

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

function ReactionsFromAllUsers({ activityId, reactions }: { activityId: string, reactions: Array<UIReaction>}) {
    return <p className="reactions"> {
        reactions
            .filter(reaction => reaction.activityId == activityId)
            .map(reaction => {
                return reaction.reaction
            })
        }
    </p>
}

export { ReactionsByUser, ReactionsFromAllUsers };