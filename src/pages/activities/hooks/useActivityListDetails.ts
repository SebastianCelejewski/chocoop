import { useEffect, useState } from "react";
import type { Schema } from "../../../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { UIReaction } from "../../../model/UIReaction";

const client = generateClient<Schema>();

class ActivityQueryResult {
  items: Array<Schema["Activity"]["type"]> = []
}

export function useActivityListDetails() {

    const [activities, setActivities] = useState<Array<Schema["Activity"]["type"]>>([]);
    const [reactions, setReactions] = useState<Array<UIReaction>>([]);

    useEffect(() => {
        const activitiesQuery = client.models.Activity.observeQuery().subscribe({
            next: (data: ActivityQueryResult) => { 
                setActivities(sortByDateTime([...data.items]))
            }
        });

        const reactionsQuery = client.models.Reaction.observeQuery().subscribe({
            next: (data: { items: Array<Schema["Reaction"]["type"]> }) => {
                setReactions(data.items.map(reaction => ({
                    id: reaction.id,
                    reaction: reaction.reaction,
                    user: reaction.user,
                    activityId: reaction.activityId
                })));
            }
        });

        return (() => {
            activitiesQuery.unsubscribe();
            reactionsQuery.unsubscribe();
        })
    }, []);

    return { activities, reactions }
}

function sortByDateTime(activities: Array<Schema["Activity"]["type"]>) {
    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}