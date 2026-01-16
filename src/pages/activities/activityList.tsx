import type { Schema } from "../../../amplify/data/resource";
import React, { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import { dateToString } from "../../utils/dateUtils";
import { List, AutoSizer, CellMeasurer, CellMeasurerCache } from 'react-virtualized';

import User from "../../model/User";
import { ReactionsFromAllUsers } from "../../components/reactions";
import { useActivityListActions } from "./hooks/useActivityListActions";

const client = generateClient<Schema>();

const cache = new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 100
});

class ActivityQueryResult {
  items: Array<Schema["Activity"]["type"]> = []
}

function sortByDateTime(activities: Array<Schema["Activity"]["type"]>) {
    return activities.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
}

function ActivityList({users}: {users: Map<string, User>}) {

    const [activities, setActivities] = useState<Array<Schema["Activity"]["type"]>>([]);
    const [reactions, setReactions] = useState<Array<Schema["Reaction"]["type"]>>([]);
    const {createActivity, showActivity, navigateToWorkRequests} = useActivityListActions();

    cache.clearAll()
    
    useEffect(() => {
        const activitiesQuery = client.models.Activity.observeQuery().subscribe({
            next: (data: ActivityQueryResult) => { 
                setActivities(sortByDateTime([...data.items]))
            }
        });

        const reactionsQuery = client.models.Reaction.observeQuery().subscribe({
            next: (data: { items: Array<Schema["Reaction"]["type"]> }) => {
                setReactions(data.items)
            }
        });

        return (() => {
            activitiesQuery.unsubscribe();
            reactionsQuery.unsubscribe();
        })
    }, []);


    if (activities.length == 0) {
        return <>
            <p className="pageTitle" onClick={navigateToWorkRequests}>Lista wykonanych czynności</p>
            <div className="loadingData">Ładowanie danych</div>
            <div className="buttonPanel">
                <button onClick={createActivity}>Dodaj czynność</button>
            </div>
        </>
    }

    function renderRow({ index, key, style, parent }: { index: number, key: string, style: React.CSSProperties, parent: any}) {
        const activity = activities[index];
        return (
            <CellMeasurer
                key={key}
                cache={cache}
                parent={parent}
                columnIndex={0}
                rowIndex={index}>
                {({registerChild}) => (
                    <div style={style} className="row" ref={registerChild}>
                        <li
                            className="entityListElement"
                            onClick={() => showActivity(activity.id)}
                            key={activity.id}>
                            <p className="entityDateTime">{dateToString(activity.dateTime)}</p>
                            <p className="entityPerson">{users.get(activity.user)?.nickname}</p>
                            <p className="entityType">{activity.type}</p>
                            <p className="entityExp">{activity.exp} xp</p>
                            <div style={{clear: 'both'}}/>
                            <ReactionsFromAllUsers activityId={activity.id} reactions={reactions}/>
                        </li>
                    </div>
                )}
            </CellMeasurer>
        );
    }

    return (
        <>
            <p className="pageTitle" onClick={navigateToWorkRequests}>Lista wykonanych czynności</p>
            <ul className="entityList">
                <AutoSizer>
                {
                    ({ width, height }) => (<List
                        width={width}
                        height={height}
                        deferredMeasurementCache={cache}
                        rowHeight={cache.rowHeight}
                        rowRenderer={renderRow}
                        rowCount={activities.length}
                        overscanRowCount={3} />
                    )
                }
                </AutoSizer>
            </ul>
            <div className="buttonPanel">
                <button onClick={createActivity}>Dodaj czynność</button>
            </div>
        </>
    );
}

export default ActivityList;