import { BrowserRouter, Routes, Route } from "react-router";

import ActivityList from "./activities/activityList.tsx"
import ActivityDetails from "./activities/activityDetails.tsx"
import ActivityEdit from "./activities/activityEdit.tsx"
import WorkRequestList from "./workRequests/workRequestList.tsx"
import WorkRequestDetails from "./workRequests/workRequestDetails.tsx"
import WorkRequestEdit from "./workRequests/workRequestEdit.tsx"
import { Authenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { useState } from "react";
import appMenuIcon from "./assets/images/menu/appMenu.png?url";

function App() {

    const [userNickname, setUserNickname] = useState("")
    const [userNicknameFetchInProgress, setUserNicknameFetchInProgress] = useState(false)
    const [appMenuExpanded, setAppMenuExpanded] = useState(false)

    function getUserNickname() {
        setUserNicknameFetchInProgress(true)
        fetchUserAttributes().then((attributes) => {
            if (attributes.nickname !== undefined) {
                setUserNickname(attributes.nickname)
            }
        })
    }

    if (userNicknameFetchInProgress == false) {
        getUserNickname()
    }

    function AppMenu() {
        if (appMenuExpanded) {
            return <div className="appMenu">
                <img src={appMenuIcon} alt="menu" onClick={() => setAppMenuExpanded(false)}/>
                <ul>
                    <li><a href="/activities/list">Wykonane czynności</a></li>
                    <li><a href="/workRequests/list">Zlecenia do wykonania</a></li>
                </ul>
            </div>
        } else {
            return <div className="appMenu">
                <img src={appMenuIcon} alt="menu" onClick={() => setAppMenuExpanded(true)}/>
            </div>
        }
    }

    return (
        <Authenticator>
            {({ signOut }) => {
                return ( 
                    <main>
                        <AppMenu/>
                        <h1>Chores Cooperative</h1>
                        <p className="versionInfo">Wersja 0.3.1</p>

                        <div className="subheader">
                            <p className="userInfo">Witaj, {userNickname}</p>
                            <a className="logoutButton" onClick={signOut}>Wyloguj</a>
                        </div>
                        <div style={{clear: 'both'}}/>
                        <BrowserRouter>
                            <Routes>
                                <Route path="/" element={<ActivityList />} />
                                <Route path="/ActivityList" element={<ActivityList />} />
                                <Route path="/ActivityDetails/:id" element={<ActivityDetails />} />
                                <Route path="/ActivityEdit/:operation/:id?" element={<ActivityEdit />} />
                                <Route path="/WorkRequestList" element={<WorkRequestList />} />
                                <Route path="/workRequestsDetails/:id" element={<WorkRequestDetails />} />
                                <Route path="/WorkRequestEdit/:operation/:id?" element={<WorkRequestEdit />} />
                            </Routes>
                        </BrowserRouter>
                    </main>
                )
            }}
        </Authenticator>
    );
}

export default App;
