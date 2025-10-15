import { BrowserRouter, Routes, Route } from "react-router";

import ActivityList from "./activities/activityList.tsx"
import ActivityDetails from "./activities/activityDetails.tsx"
import ActivityAdd from "./activities/activityAdd.tsx"
import WorkRequestList from "./workRequests/workRequestList.tsx"
import WorkRequestDetails from "./workRequests/workRequestDetails.tsx"
import WorkRequestAdd from "./workRequests/workRequestAdd.tsx"
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
                                <Route path="/activities/list" element={<ActivityList />} />
                                <Route path="/activities/add/:id" element={<ActivityAdd />} />
                                <Route path="/activities/show/:id" element={<ActivityDetails />} />
                                <Route path="/activities/edit/:id" element={<ActivityAdd />} />
                                <Route path="/workRequests/list" element={<WorkRequestList />} />
                                <Route path="/workRequests/add/:id" element={<WorkRequestAdd />} />
                                <Route path="/workRequests/show/:id" element={<WorkRequestDetails />} />
                                <Route path="/workRequests/edit/:id" element={<WorkRequestAdd />} />
                            </Routes>
                        </BrowserRouter>
                    </main>
                )
            }}
        </Authenticator>
    );
}

export default App;
