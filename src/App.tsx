import { Authenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { useState, useEffect } from "react";

import User from "./model/User";
import { fetchAllUsers } from "./utils/managementUtils";
import AppMenu from "./components/appMenu";
import UserMenu from "./components/userMenu";
import Routing from "./components/routing";

function App() {

    const [userNickname, setUserNickname] = useState("")
    const [allUsers, setAllUsers] = useState<Map<string, User>>(new Map<string, User>())

    useEffect(() => {
        fetchAllUsers()
            .then((fetchedUsers) => {
                console.log("Fetched users: " + fetchedUsers)
                setAllUsers(fetchedUsers)
            });
        fetchUserAttributes()
            .then((attributes) => {
                console.log
                if (attributes.nickname !== undefined) {
                    setUserNickname(attributes.nickname)
                }
            })
    }, [])

    return (
        <Authenticator>
            {({ signOut }) => {
                return ( 
                    <main>
                        <AppMenu/>
                        <UserMenu signoutFunction={signOut}/>
                        <h1>Chores Cooperative</h1>
                        <p className="versionInfo">Wersja 0.4.9</p>

                        <div className="subheader">
                            <p className="userInfo">Witaj, {userNickname}</p>
                            
                        </div>
                        <div style={{clear: 'both'}}/>
                        <Routing allUsers={allUsers}/>
                    </main>
                )
            }}
        </Authenticator>
    );
}

export default App;
