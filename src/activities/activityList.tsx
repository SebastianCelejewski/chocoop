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
        if (client.models.Activity !== undefined) {
          client.models.Activity.observeQuery().subscribe({
              next: (data: activityQueryResult) => { 
                setActivities(sortByDateTime([...data.items]))
              }
          });
        }
    }, []);

    function createActivity() {
        const navLink = `/activities/add/new`
        navigate(navLink)
    }

    function showActivity(id: string) {
        const navLink = `/activities/show/${id}`
        navigate(navLink)
    }

    return (
          <>
            <ul className="entityList">
            {activities.map(activity => {
                return <li
                        className="entityListElement"
                        onClick={() => showActivity(activity.id)}
                        key={activity.id}>
                        <div>
                            <p className="entityDateTime">{dateToString(activity.dateTime)}</p>
                            <p className="entityPerson">{activity.user}</p>
                            <p className="entityType">{activity.type}</p>
                            <p className="entityExp">{activity.exp} xp</p>
                            <div style={{clear: 'both'}}/>
                            <p className="activityComment">{activity.comment}</p>
                        </div>
                      </li>
                }
            )}
          </ul>
          <div className="buttonPanel">
            <button onClick={createActivity}>Dodaj czynność</button>
          </div>
    </>
  );
}

export default ActivityList;