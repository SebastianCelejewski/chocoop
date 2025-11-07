import type { Schema } from "../../../amplify/data/resource";
import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";

import User from "../../model/User";
import { Button } from "@aws-amplify/ui-react";
import MonthsDataTable from "./monthsDataTable";
import DaysDataTable from "./daysDataTable";
import MonthSummary from "./monthSummary";
import DaySummary from "./daySummary";

const client = generateClient<Schema>();

class ExpStatsQueryResult {
  items: Array<Schema["ExperienceStatistics"]["type"]> = []
}

function ExpStatsSummary({users}: {users: Map<string, User>}) {
    const [expStats, setExpStats] = useState<Array<Schema["ExperienceStatistics"]["type"]>>([]);
    const [viewMode, setViewMode] = useState<string>("MONTHS");
    const [selectedMonth, setSelectedMonth] = useState<string>("");
    const [selectedDay, setSelectedDay] = useState<string>("");
    
    useEffect(() => {
        if (client.models.ExperienceStatistics !== undefined) {
            client.models.ExperienceStatistics.observeQuery().subscribe({
                next: (data: ExpStatsQueryResult) => { 
                    setExpStats([...data.items])
                }
            });
        }
    }, []);

    if (expStats.length == 0) {
        return <>
            <p className="pageTitle">Statystyki doświadczenia</p>
            <p className="loadingData">Ładowanie danych</p>
        </>
    }

    function onMonthSelected(month: string) {
        setSelectedMonth(month)
        setViewMode("MONTH")
    }

    function onDaySelected(day: string) {
        setSelectedDay(day)
        setViewMode("DAY")
    }

    function onBackToAllMonths() {
        setViewMode("MONTHS")
    }

    function onBackToAllDays() {
        setViewMode("MONTH")
    }

    if (viewMode == "MONTHS") {
        return <>
            <p className="pageTitle">Statystyki doświadczenia</p>
            <ul className="entityList">
                <MonthsDataTable users={users} expStats={expStats} onMonthSelected={onMonthSelected}/>
            </ul>
        </>
    } else if (viewMode == "MONTH") {
        return <>
            <p className="pageTitle">Statystyki doświadczenia</p>
            <ul className="entityList">
                <MonthSummary users={users} expStats={expStats} selectedMonth={selectedMonth}/>
                <DaysDataTable users={users} expStats={expStats} selectedMonth={selectedMonth} onDaySelected={onDaySelected}/>
                <Button onClick={() => onBackToAllMonths()}>Powrót</Button>
            </ul>
        </>
    } else if (viewMode == "DAY") {
        return <>
            <p className="pageTitle">Statystyki doświadczenia</p>
            <ul className="entityList">
                <DaySummary users={users} expStats={expStats} selectedDay={selectedDay}/>
                <Button onClick={() => onBackToAllDays()}>Powrót</Button>
            </ul>
        </>
    } else{
        return <>
        </>
    }
}

export default ExpStatsSummary;