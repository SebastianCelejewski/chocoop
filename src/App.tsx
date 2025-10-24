import { BrowserRouter, Routes, Route } from "react-router";
import { Authenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { useState } from "react";

import ActivityList from "./activities/activityList.tsx"
import ActivityDetails from "./activities/activityDetails.tsx"
import ActivityEdit from "./activities/activityEdit.tsx"
import WorkRequestList from "./workRequests/workRequestList.tsx"
import WorkRequestDetails from "./workRequests/workRequestDetails.tsx"
import WorkRequestEdit from "./workRequests/workRequestEdit.tsx"
import ExpStatsSummary from "./expStats/expStatsSummary.tsx"

import appMenuIcon from "./assets/images/menu/appMenu.png?url";
import userMenuIcon from "./assets/images/menu/userMenu.png?url";

function App() {

    const [userNickname, setUserNickname] = useState("")
    const [userNicknameFetchInProgress, setUserNicknameFetchInProgress] = useState(false)
    const [appMenuExpanded, setAppMenuExpanded] = useState(false)
    const [userMenuExpanded, setUserMenuExpanded] = useState(false)

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
                    <li><a href="/ActivityList">Wykonane czynności</a></li>
                    <li><a href="/WorkRequestList">Zlecenia do wykonania</a></li>
                    <li><a href="/ExpStatsSummary">Statystyki</a></li>
                </ul>
            </div>
        } else {
            return <div className="appMenu">
                <img src={appMenuIcon} alt="menu" onClick={() => { setAppMenuExpanded(true); setUserMenuExpanded(false)}}/>
            </div>
        }
    }

    function UserMenu({ signoutFunction }: { signoutFunction?: (data?: any) => void }) {
        if (userMenuExpanded) {
            return <div className="userMenu">
                <img src={userMenuIcon} alt="menu" onClick={() => setUserMenuExpanded(false)}/>
                <ul>
                    <li><a onClick={() => signoutFunction?.()}>Wyloguj</a></li>
                </ul>
            </div>
        } else {
            return <div className="userMenu">
                <img src={userMenuIcon} alt="menu" onClick={() => { setUserMenuExpanded(true); setAppMenuExpanded(false)}}/>
            </div>
        }
    }

    return (
        <Authenticator>
            {({ signOut }) => {
                return ( 
                    <main>
                        <AppMenu/>
                        <UserMenu signoutFunction={signOut}/>
                        <h1>Chores Cooperative</h1>
                        <p className="versionInfo">Wersja 0.4.2</p>

                        <div className="subheader">
                            <p className="userInfo">Witaj, {userNickname}</p>
                            
                        </div>
                        <div style={{clear: 'both'}}/>
                        <BrowserRouter>
                            <Routes>
                                <Route path="/" element={<ActivityList />} />
                                <Route path="/ActivityList" element={<ActivityList />} />
                                <Route path="/ActivityDetails/:id" element={<ActivityDetails />} />
                                <Route path="/ActivityEdit/:operation/:id?" element={<ActivityEdit />} />
                                <Route path="/WorkRequestList" element={<WorkRequestList />} />
                                <Route path="/workRequestDetails/:id" element={<WorkRequestDetails />} />
                                <Route path="/WorkRequestEdit/:operation/:id?" element={<WorkRequestEdit />} />
                                <Route path="/ExpStatsSummary" element={<ExpStatsSummary />} />
                            </Routes>
                        </BrowserRouter>
                    </main>
                )
            }}
        </Authenticator>
    );
}

export default App;
