import type { Schema } from "../../../amplify/data/resource";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { generateClient } from "aws-amplify/data";
import { dateTimeToString } from "../../utils/dateUtils";
import { List, AutoSizer, CellMeasurer, CellMeasurerCache } from 'react-virtualized';

import User from "../../model/User";
import { urgencyList } from "../../model/Urgency"

const client = generateClient<Schema>();

const cache = new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 100
});

class WorkRequestQueryResult {
    items: Array<Schema["WorkRequest"]["type"]> = []
}

function sortByUrgency(workRequests: Array<Schema["WorkRequest"]["type"]>) {
    return workRequests.sort((a, b) => a.urgency - b.urgency);
}

function WorkRequestList({ users }: { users: Map<string, User> }) {
    const [workRequests, setWorkRequests] = useState<Array<Schema["WorkRequest"]["type"]>>([]);
    const [showCompletedWorkRequests, setShowCompletedWorkRequests] = useState(false);
    const navigate = useNavigate();

    let visibleWorkRequests = workRequests.filter((workRequest) => !workRequest.completed || showCompletedWorkRequests)

    useEffect(() => {
        const workRequestsQuery = client.models.WorkRequest.observeQuery().subscribe({
            next: (data: WorkRequestQueryResult) => {
                setWorkRequests(sortByUrgency([...data.items]))
            }
        });
        return () => {
            workRequestsQuery.unsubscribe();
        }
    }, []);

    function createWorkRequest() {
        const navLink = `/WorkRequestEdit/create`
        navigate(navLink)
    }

    function showWorkRequest(id: string) {
        const navLink = `/WorkRequestDetails/${id}`
        navigate(navLink)
    }

    function CompletnessStatus({ workRequest }: { workRequest: Schema["WorkRequest"]["type"] }) {
        if (workRequest.completed) {
            return <p className="workItemCompletness">Zlecenie wykonane</p>
        } else {
            return <></>
        }
    }

    function navigateToActivities() {
        const navLink = `/ActivityList`
        navigate(navLink)
    }

    function handleShowCompletedToggled(): void {
        setShowCompletedWorkRequests(!showCompletedWorkRequests);
    }

    function renderRow({ index, key, style, parent }: { index: number, key: string, style: React.CSSProperties, parent: any }) {
        const workRequest = visibleWorkRequests[index];
        return (
            <CellMeasurer
                key={key}
                cache={cache}
                parent={parent}
                columnIndex={0}
                rowIndex={index}>
                {({ registerChild }) => (
                    <div style={style} className="row" ref={registerChild}>
                        <li
                            className="entityListElement"
                            onClick={() => showWorkRequest(workRequest.id)}
                            key={workRequest.id}>
                            <div>
                                <p className="entityDateTime">{dateTimeToString(workRequest.createdDateTime)}</p>
                                <p className="entityPerson">{users.get(workRequest.createdBy)?.nickname}</p>
                                <p className="entityType">{workRequest.type}</p>
                                <p className="entityExp">{workRequest.exp} xp</p>
                                <div style={{ clear: 'both' }} />
                                <p className="workRequestUrgency">Pilność: {urgencyList[workRequest.urgency]?.label}</p>
                                <CompletnessStatus workRequest={workRequest} />
                            </div>
                        </li>
                    </div>
                )}
            </CellMeasurer>
        );
    }

    cache.clearAll()

    return <>
        <p className="pageTitle" onClick={navigateToActivities}>Lista zleceń do wykonania</p>
        <p><input type="checkbox" name="showCompleted" id="showCompleted" checked={showCompletedWorkRequests} onChange={handleShowCompletedToggled} />Pokaż ukończone</p>
        <ul className="entityList">
            <AutoSizer>
                {
                    ({ width, height }) => (<List
                        width={width}
                        height={height}
                        deferredMeasurementCache={cache}
                        rowHeight={cache.rowHeight}
                        rowRenderer={renderRow}
                        rowCount={visibleWorkRequests.length}
                        overscanRowCount={3} />
                    )
                }
            </AutoSizer>
        </ul>
        <div className="buttonPanel">
            <button onClick={createWorkRequest}>Dodaj zlecenie</button>
        </div>
    </>
}

export default WorkRequestList;