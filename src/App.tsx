import { BrowserRouter, Routes, Route } from "react-router";
import { Authenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';
import { useState, useEffect } from "react";
import { CognitoIdentityProviderClient, ListUsersCommand, UserType } from '@aws-sdk/client-cognito-identity-provider';
import outputs from '../amplify_outputs.json';

import ActivityList from "./activities/activityList.tsx"
import ActivityDetails from "./activities/activityDetails.tsx"
import ActivityEdit from "./activities/activityEdit.tsx"
import WorkRequestList from "./workRequests/workRequestList.tsx"
import WorkRequestDetails from "./workRequests/workRequestDetails.tsx"
import WorkRequestEdit from "./workRequests/workRequestEdit.tsx"
import ExpStatsSummary from "./expStats/expStatsSummary.tsx"
import WhatsNew from "./about/whatsNew.tsx"

import appMenuIcon from "./assets/images/menu/appMenu.png?url";
import userMenuIcon from "./assets/images/menu/userMenu.png?url";

import User from "./model/User";

function convertToLocalUser(userType: UserType) : User {
    if (userType.Username === undefined || userType.Username === null) {
        throw new Error("Username is null")
    }
    const id = userType.Username

    if (userType.Attributes === undefined || userType.Attributes === null) {
        throw new Error("Attributes are null")
    }

    const nickName = userType.Attributes.find((attribute) => attribute.Name === "nickname")?.Value
    if (nickName === undefined) {
        throw new Error("Nickname is null")
    }

    return new User(id, nickName);
}

function App() {

    const [userNickname, setUserNickname] = useState("")
    const [userNicknameFetchInProgress, setUserNicknameFetchInProgress] = useState(false)
    const [appMenuExpanded, setAppMenuExpanded] = useState(false)
    const [userMenuExpanded, setUserMenuExpanded] = useState(false)

    const [userListIsLoading, setUserListIsLoading] = useState(false)
    const [allUsers, setAllUsers] = useState<Map<string, User>>(new Map<string, User>())

    useEffect(() => {
        async function fetchAllUsers() {
            setUserListIsLoading(true)
            const session = await fetchAuthSession()
            const client = new CognitoIdentityProviderClient({ 
                region: outputs.auth.aws_region,
                credentials: session.credentials
            })
            const command = new ListUsersCommand({
                UserPoolId: outputs.auth.user_pool_id,
                AttributesToGet: ["nickname"]
            })
            const response = await client.send(command)
            const convertedUsers = response.Users?.map((user: UserType) => convertToLocalUser(user)) || [];
            const usersAsKeyValues = convertedUsers.map((user: User) => [user.id, user] as [string, User])
            setAllUsers(new Map<string, User>(usersAsKeyValues))
        }
        if (!userListIsLoading) {
            fetchAllUsers()
        }
    }, [])

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
                    <li><a href="/About/WhatsNew">O aplikacji</a></li>
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
                        <p className="versionInfo">Wersja 0.4.6</p>

                        <div className="subheader">
                            <p className="userInfo">Witaj, {userNickname}</p>
                            
                        </div>
                        <div style={{clear: 'both'}}/>
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
                    </main>
                )
            }}
        </Authenticator>
    );
}

export default App;
