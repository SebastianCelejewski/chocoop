import type { Schema } from "../../amplify/data/resource";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { generateClient } from "aws-amplify/data";
import { dateToString } from "../utils/dateUtils";

const client = generateClient<Schema>();

class activityQueryResult {
  items: Array<Schema["Activity"]["type"]> = []
}

function sortByDateTime(activities: Array<Schema["Activity"]["type"]>) {
    return activities.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
}

function ActivityList() {
    const [activities, setActivities] = useState<Array<Schema["Activity"]["type"]>>([]);
    const navigate = useNavigate();
    
    useEffect(() => {
        client.models.Activity.observeQuery({
            authMode: 'userPool',
        }).subscribe({
            next: (data: activityQueryResult) => { 
              setActivities(sortByDateTime([...data.items]))
            }
        });
    }, []);

    function createActivity() {
        const navLink = `/activities/new`
        navigate(navLink)
    }

    function showActivity(id: string) {
        const navLink = `/activities/${id}`
        navigate(navLink)
    }

    return (
          <>
            <ul className="entryList">
            {activities.map(activity => {
                return <li
                        className="entryListElement"
                        onClick={() => showActivity(activity.id)}
                        key={activity.id}>
                        <div>
                            <p className="activityDateTime">{dateToString(activity.dateTime)}</p>
                            <p className="activityPerson">{activity.user}</p>
                            <p className="activityType">{activity.type}</p>
                            <p className="activityExp">{activity.exp} xp</p>
                            <p className="activityComment">{activity.comment}</p>
                            <div style={{clear: 'both'}}/>
                        </div>
                      </li>
                }
            )}
          </ul>
        <button onClick={createActivity}>Dodaj czynność</button>
    </>
  );
}

export default ActivityList;