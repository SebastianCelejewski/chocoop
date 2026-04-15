import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { Schema } from "../../../amplify/data/resource";
import { dateToString } from "../../utils/dateUtils";
import { List, AutoSizer, CellMeasurer, CellMeasurerCache } from "react-virtualized";

import User from "../../model/User";
import { urgencyList } from "../../model/Urgency";
import WorkRequestService from "../../services/WorkRequestService";

const cache = new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 100
});

const workRequestService = WorkRequestService();

function sortByUrgency(workRequests: Array<Schema["WorkRequest"]["type"]>) {
    return workRequests.sort((a, b) => a.urgency - b.urgency);
}

function WorkRequestList({ users }: { users: Map<string, User> }) {
    const [workRequests, setWorkRequests] = useState<Array<Schema["WorkRequest"]["type"]>>([]);
    const [showCompletedWorkRequests, setShowCompletedWorkRequests] = useState(false);
    const navigate = useNavigate();

    const visibleWorkRequests = workRequests.filter((workRequest) => !workRequest.completed || showCompletedWorkRequests);

    useEffect(() => {
        return workRequestService.observeWorkRequests((items) => {
            setWorkRequests(sortByUrgency([...items]));
        });
    }, []);

    function createWorkRequest() {
        navigate("/WorkRequestEdit/create");
    }

    function showWorkRequest(id: string) {
        navigate(`/WorkRequestDetails/${id}`);
    }

    function CompletnessStatus({ workRequest }: { workRequest: Schema["WorkRequest"]["type"] }) {
        if (workRequest.completed) {
            return <p className="workItemCompletness" data-testid="completed-property">Zlecenie wykonane</p>;
        }

        return null;
    }

    function navigateToActivities() {
        navigate("/ActivityList");
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
                            data-testid="work-request-card"
                            data-objectid={workRequest.id}
                            className="entityListElement"
                            onClick={() => showWorkRequest(workRequest.id)}
                            key={workRequest.id}>
                            <div>
                                <p className="entityDate" data-testid="date-property">{dateToString(workRequest.createdDate)}</p>
                                <p className="entityPerson" data-testid="person-property">{users.get(workRequest.createdBy)?.nickname}</p>
                                <p className="entityType" data-testid="type-property">{workRequest.type}</p>
                                <p className="entityExp" data-testid="exp-property">{workRequest.exp} xp</p>
                                <div style={{ clear: "both" }} />
                                <CompletnessStatus workRequest={workRequest} />
                                <p className="workRequestUrgency" data-testid="urgency-property">Pilność: {urgencyList[workRequest.urgency]?.label}</p>
                            </div>
                        </li>
                    </div>
                )}
            </CellMeasurer>
        );
    }

    cache.clearAll();

    return <>
        <h2 className="pageTitle" data-testid="work-request-list-page" onClick={navigateToActivities}>Lista zleceń do wykonania</h2>

        <p><input data-testid="show-completed-checkbox" type="checkbox" name="showCompleted" id="showCompleted" checked={showCompletedWorkRequests} onChange={handleShowCompletedToggled} />Pokaż ukończone</p>
        <ul className="entityList">
            <AutoSizer>
                {({ width, height }) => (
                    <List
                        width={width}
                        height={height}
                        deferredMeasurementCache={cache}
                        rowHeight={cache.rowHeight}
                        rowRenderer={renderRow}
                        rowCount={visibleWorkRequests.length}
                        overscanRowCount={3} />
                )}
            </AutoSizer>
        </ul>
        <div className="buttonPanel">
            <button data-testid="create-button" onClick={createWorkRequest}>Dodaj zlecenie</button>
        </div>
    </>;
}

export default WorkRequestList;
