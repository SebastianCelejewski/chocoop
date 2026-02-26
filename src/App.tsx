import { Authenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { useState, useEffect } from "react";

import User from "./model/User";
import { fetchAllUsers } from "./utils/managementUtils";
import AppMenu from "./components/appMenu";
import UserMenu from "./components/userMenu";
import Routing from "./components/routing";

function App() {

    const version = "0.4.13"
    const [userNickname, setUserNickname] = useState<string | null>(null)
    const [allUsers, setAllUsers] = useState<Map<string, User> | null>(null)

    useEffect(() => {
        fetchAllUsers().then(setAllUsers);
        fetchUserAttributes().then((attributes) => {
                    setUserNickname(attributes.nickname ?? "")
                });
    }, [])

    return (
        <Authenticator>
            {({ signOut }) => {
                return ( 
                    <main>
                        <AppMenu/>
                        <UserMenu signoutFunction={signOut}/>
                        <h1>Chores Cooperative</h1>
                        <p className="versionInfo">{version}</p>

                        <div className="subheader">
                            <p className="userInfo">Witaj, <span data-testid="user-nickname">{userNickname}</span></p>
                            
                        </div>
                        <div style={{clear: 'both'}}/>

                        {userNickname === null || allUsers === null ? (
                            <div>Ładuję dane...</div>
                        ) : (
                            <Routing allUsers={allUsers}/>
                        )}
                    </main>
                )
            }}
        </Authenticator>
    );
}

export default App;
