import type { Schema } from "../../../amplify/data/resource";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { generateClient } from "aws-amplify/data";
import { dateToString } from "../../utils/dateUtils";

import User from "../../model/User";
import { urgencyList } from "../../model/Urgency"

const client = generateClient<Schema>();

class WorkRequestQueryResult {
  items: Array<Schema["WorkRequest"]["type"]> = []
}

function sortByUrgency(workRequests: Array<Schema["WorkRequest"]["type"]>) {
    return workRequests.sort((a, b) => a.urgency - b.urgency);
}

function WorkRequestList({users}: {users: Map<string, User>}) {
    const [workRequests, setWorkRequests] = useState<Array<Schema["WorkRequest"]["type"]>>([]);
    const [showCompletedWorkRequests, setShowCompletedWorkRequests] = useState(false);
    const navigate = useNavigate();
    
    useEffect(() => {
        if (client.models.WorkRequest !== undefined) {
          client.models.WorkRequest.observeQuery().subscribe({
              next: (data: WorkRequestQueryResult) => { 
                setWorkRequests(sortByUrgency([...data.items]))
              }
          });
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

    function CompletnessStatus({ workRequest }: { workRequest: Schema["WorkRequest"]["type"]}) {
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

    return <>
        <p className="pageTitle" onClick={navigateToActivities}>Lista zleceń do wykonania</p>
        <p><input type="checkbox" name="showCompleted" id="showCompleted" checked={showCompletedWorkRequests} onChange={handleShowCompletedToggled}/>Pokaż ukończone</p>
            <ul className="entityList">
            {workRequests.map(workRequest => {
                if (showCompletedWorkRequests || !workRequest.completed) {
                    return <li
                            className="entityListElement"
                            onClick={() => showWorkRequest(workRequest.id)}
                            key={workRequest.id}>
                            <div>
                                <p className="entityDateTime">{dateToString(workRequest.createdDateTime)}</p>
                                <p className="entityPerson">{users.get(workRequest.createdBy)?.nickname}</p>
                                <p className="entityType">{workRequest.type}</p>
                                <p className="entityExp">{workRequest.exp} xp</p>
                                <div style={{clear: 'both'}}/>
                                <p className="workRequestUrgency">Pilność: {urgencyList[workRequest.urgency]?.label}</p>
                                <CompletnessStatus workRequest={workRequest}/>
                            </div>
                          </li>
                    }
                }
            )}
          </ul>
          <div className="buttonPanel">
            <button onClick={createWorkRequest}>Dodaj zlecenie</button>
          </div>
    </>
}

export default WorkRequestList;