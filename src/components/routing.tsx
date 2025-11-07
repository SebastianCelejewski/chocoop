import { BrowserRouter, Routes, Route } from "react-router";

import ActivityList from "../pages/activities/activityList.tsx"
import ActivityDetails from "../pages/activities/activityDetails.tsx"
import ActivityEdit from "../pages/activities/activityEdit.tsx"
import WorkRequestList from "../pages/workRequests/workRequestList.tsx"
import WorkRequestDetails from "../pages/workRequests/workRequestDetails.tsx"
import WorkRequestEdit from "../pages/workRequests/workRequestEdit.tsx"
import ExpStatsSummary from "../pages/expStats/expStatsSummary.tsx"
import WhatsNew from "../pages/about/whatsNew.tsx"

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