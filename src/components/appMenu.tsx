import { useState } from "react";

import appMenuIcon from "../assets/images/menu/appMenu.png?url";

function AppMenu() {
    const [appMenuExpanded, setAppMenuExpanded] = useState(false)

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
            <img src={appMenuIcon} alt="menu" onClick={() => setAppMenuExpanded(true)}/>
        </div>
    }
}

export default AppMenu;