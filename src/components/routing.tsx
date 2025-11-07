import { BrowserRouter, Routes, Route } from "react-router";

import ActivityList from "../activities/activityList.tsx"
import ActivityDetails from "../activities/activityDetails.tsx"
import ActivityEdit from "../activities/activityEdit.tsx"
import WorkRequestList from "../workRequests/workRequestList.tsx"
import WorkRequestDetails from "../workRequests/workRequestDetails.tsx"
import WorkRequestEdit from "../workRequests/workRequestEdit.tsx"
import ExpStatsSummary from "../expStats/expStatsSummary.tsx"
import WhatsNew from "../about/whatsNew.tsx"

import User from "../model/User";

function Routing({allUsers}: {allUsers: Map<string, User>}) {
    return <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<ActivityList users={allUsers} />} />
                    <Route path="/ActivityList" element={<ActivityList users={allUsers}/>} />
                    <Route path="/ActivityDetails/:id" element={<ActivityDetails users={allUsers}/>} />
                    <Route path="/ActivityEdit/:operation/:id?" element={<ActivityEdit users={allUsers}/>} />
                    <Route path="/WorkRequestList" element={<WorkRequestList users={allUsers}/>} />
                    <Route path="/workRequestDetails/:id" element={<WorkRequestDetails users={allUsers}/>} />
                    <Route path="/WorkRequestEdit/:operation/:id?" element={<WorkRequestEdit users={allUsers}/>} />
                    <Route path="/ExpStatsSummary" element={<ExpStatsSummary users={allUsers}/>} />
                    <Route path="/About/WhatsNew" element={<WhatsNew />} />
                </Routes>
            </BrowserRouter>
        </>
}

export default Routing;