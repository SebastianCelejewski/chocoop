import { useState } from "react";

import userMenuIcon from "../assets/images/menu/userMenu.png?url";

function UserMenu({ signoutFunction }: { signoutFunction?: (data?: any) => void }) {
    const [userMenuExpanded, setUserMenuExpanded] = useState(false)

    if (userMenuExpanded) {
        return <div className="userMenu">
            <img src={userMenuIcon} alt="menu" onClick={() => setUserMenuExpanded(false)}/>
            <ul>
                <li><a onClick={() => {signoutFunction?.(); setUserMenuExpanded(false);}}>Wyloguj</a></li>
            </ul>
        </div>
    } else {
        return <div className="userMenu">
            <img src={userMenuIcon} alt="menu" onClick={() => setUserMenuExpanded(true)}/>
        </div>
    }
}

export default UserMenu;