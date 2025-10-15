import type { Schema } from "../../amplify/data/resource";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { generateClient } from "aws-amplify/data";
import { dateToString } from "../utils/dateUtils";

const client = generateClient<Schema>();

class workRequestQueryResult {
  items: Array<Schema["WorkRequest"]["type"]> = []
}

function sortByDateTime(workRequests: Array<Schema["WorkRequest"]["type"]>) {
    return workRequests.sort((a, b) => new Date(b.createdDateTime).getTime() - new Date(a.createdDateTime).getTime());
}

function WorkRequestList() {
    const [workRequests, setWorkRequests] = useState<Array<Schema["WorkRequest"]["type"]>>([]);
    const navigate = useNavigate();
    
    useEffect(() => {
        if (client.models.WorkRequest !== undefined) {
          client.models.WorkRequest.observeQuery().subscribe({
              next: (data: workRequestQueryResult) => { 
                setWorkRequests(sortByDateTime([...data.items]))
              }
          });
        }
    }, []);

    function createWorkRequest() {
        const navLink = `/workRequests/add/new`
        navigate(navLink)
    }

    function showWorkRequest(id: string) {
        const navLink = `/workRequests/show/${id}`
        navigate(navLink)
    }

    return (
          <>
            <ul className="workRequestList">
            {workRequests.map(workRequest => {
                return <li
                        className="workRequestListElement"
                        onClick={() => showWorkRequest(workRequest.id)}
                        key={workRequest.id}>
                        <div>
                            <p className="workRequestCreatedDateTime">{dateToString(workRequest.createdDateTime)}</p>
                            <p className="workRequestCreatedBy">{workRequest.createdBy}</p>
                            <p className="workRequestType">{workRequest.type}</p>
                            <p className="workRequestExp">{workRequest.exp} xp</p>
                            <p className="workRequestUrgency">{workRequest.urgency}</p>
                            <div style={{clear: 'both'}}/>
                        </div>
                      </li>
                }
            )}
          </ul>
          <div className="buttonPanel">
            <button onClick={createWorkRequest}>Dodaj zlecenie</button>
          </div>
    </>
  );
}

export default WorkRequestList;