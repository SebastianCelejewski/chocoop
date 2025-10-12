import { BrowserRouter, Routes, Route } from "react-router";

import ActivityList from "./activities/activityList.tsx"
import ActivityDetails from "./activities/activityDetails.tsx"
import ActivityAdd from "./activities/activityAdd.tsx"
import { Authenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { useState } from "react";

function App() {

    const [userNickname, setUserNickname] = useState("")
    const [userNicknameFetchInProgress, setUserNicknameFetchInProgress] = useState(false)

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

    return (
        <Authenticator>
            {({ signOut }) => {
                return ( 
                    <main>
                        <h1>Chores Cooperative</h1>
                        <p className="versionInfo">Wersja 0.2.2</p>

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
                            </Routes>
                        </BrowserRouter>
                    </main>
                )
            }}
        </Authenticator>
    );
}

export default App;
