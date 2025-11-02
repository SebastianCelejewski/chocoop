import type { Schema } from "../../amplify/data/resource";
import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";

import User from "../model/User";
import { Button } from "@aws-amplify/ui-react";

const client = generateClient<Schema>();

class ExpStatsQueryResult {
  items: Array<Schema["ExperienceStatistics"]["type"]> = []
}

function MonthsDataTable({users, expStats, onMonthSelected}: {users: Map<string, User>, expStats: Array<Schema["ExperienceStatistics"]["type"]>, onMonthSelected: (month: string) => void} ) {
    var gridData = new Map<string, Map<string, number>>();
    var earliestMonth : string = expStats
        .filter((record) => record.periodType == "MONTH")
        .reduce((earliest, record) => earliest < record.period ? earliest : record.period, expStats[0].period)
    var latestMonth : string = expStats
        .filter((record) => record.periodType == "MONTH")
        .reduce((latest, record) => latest > record.period ? latest : record.period, expStats[0].period)

    var startDate = new Date(earliestMonth);
    var endDate = new Date(latestMonth);
    
    startDate.setDate(1)
    endDate.setDate(28)

    var date = startDate;

    while (date <= endDate) {
        var dateStr = date.toISOString().slice(0, 7);

        var userDataForThisMonth = new Map<string, number>();

        users.forEach((user) => {
            const exp = expStats
                .filter((record) => record.user == user.id && record.period == dateStr && record.periodType == "MONTH")
                .reduce((sum, record) => sum + record.exp, 0)
            userDataForThisMonth.set(user.id, exp);
        })
        gridData.set(dateStr, userDataForThisMonth);

        date.setMonth(date.getMonth() + 1)
    }

    return <>
        <p className="statsHeader">Szczegóły dla kolejnych miesięcy</p>
        <p className="statsHint">Kliknij w wiersz tabeli by przejść do szczegółów miesiąca</p>
        <table className="entityTable">
            <thead>
                <tr>
                    <th>Dzień</th>
                    {Array.from(users.keys()).map((userId) => (
                        <th className="rotated90" key={userId}>{users.get(userId)?.nickname}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {Array.from(gridData.keys()).map((month) => (
                    <tr key={month} onClick={() => onMonthSelected(month)}>
                        <td>{month}</td>
                        {Array.from(users.keys()).map((userId) => (
                            <td key={userId}>{gridData.get(month)?.get(userId) || 0}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </>
}

function DaysDataTable({users, expStats, selectedMonth, onDaySelected }: {users: Map<string, User>, expStats: Array<Schema["ExperienceStatistics"]["type"]>, selectedMonth: string, onDaySelected: (day: string) => void}) {
    var gridData = new Map<string, Map<string, number>>();

    var startDate = new Date(selectedMonth);
    var endDate = new Date(selectedMonth);
    startDate.setDate(1);
    endDate.setDate(31);
    var date = startDate;

    while (date <= endDate) {
        var dateStr = date.toISOString().slice(0, 10);

        var userDataForThisDate = new Map<string, number>();

        users.forEach((user) => {
            const exp = expStats
                .filter((record) => record.user == user.id && record.period == dateStr && record.periodType == "DAY")
                .reduce((sum, record) => sum + record.exp, 0)
            userDataForThisDate.set(user.id, exp);
        })
        gridData.set(dateStr, userDataForThisDate);

        date.setDate(date.getDate() + 1)
    }

    return <>
        <p className="statsHeader">Szczegóły dla kolejnych dni</p>
        <p className="statsHint">Kliknij wiersz tabeli by przejść do szczegółów dnia</p>
        <table className="entityTable">
            <thead>
                <tr>
                    <th>Dzień</th>
                    {Array.from(users.keys()).map((userId) => (
                        <th className="rotated90" key={userId}>{users.get(userId)?.nickname}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {Array.from(gridData.keys()).map((day) => (
                    <tr key={day} onClick={() => onDaySelected(day)}>
                        <td>{day}</td>
                        {Array.from(users.keys()).map((userId) => (
                            <td key={userId}>{gridData.get(day)?.get(userId) || 0}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </>
}

function MonthSummary({users, expStats, selectedMonth}: {users: Map<string, User>, expStats: Array<Schema["ExperienceStatistics"]["type"]>, selectedMonth: string}) {
    var totalExpThisMonth = expStats
            .filter((record) => record.period == selectedMonth && record.periodType == "MONTH")
            .reduce((sum, record) => sum + record.exp, 0)

    var monthlyGridData = new Array();
    users.forEach((user) => {
        const exp = expStats
            .filter((record) => record.user == user.id && record.period == selectedMonth && record.periodType == "MONTH")
            .reduce((sum, record) => sum + record.exp, 0)
        const expPerCent = totalExpThisMonth > 0 ? (100 * exp / totalExpThisMonth).toFixed(0) + "%" : "-";
        monthlyGridData.push({user: user.id, exp: exp, expPerCent: expPerCent});
    })

    return <>
        <p className="statsHeader">Podsumowanie: {selectedMonth}</p>
        <table className="entityTable">
            <thead>
                <tr>
                    <th>Użytkownik</th>
                    <th>Punkty doświadczenia</th>
                    <th>Udział procentowy</th>
                </tr>
            </thead>
            <tbody>
                {monthlyGridData.map((record) => (
                    <tr key={users.get(record.user)?.nickname}>
                        <td>{users.get(record.user)?.nickname}</td>
                        <td>{record.exp}</td>
                        <td>{record.expPerCent}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </>
}

function DaySummary({users, expStats, selectedDay}: {users: Map<string, User>, expStats: Array<Schema["ExperienceStatistics"]["type"]>, selectedDay: string}) {
    var totalExpThisMonth = expStats
            .filter((record) => record.period == selectedDay && record.periodType == "DAY")
            .reduce((sum, record) => sum + record.exp, 0)

    var monthlyGridData = new Array();
    users.forEach((user) => {
        const exp = expStats
            .filter((record) => record.user == user.id && record.period == selectedDay && record.periodType == "DAY")
            .reduce((sum, record) => sum + record.exp, 0)
        const expPerCent = totalExpThisMonth > 0 ? (100 * exp / totalExpThisMonth).toFixed(0) + "%" : "-";
        monthlyGridData.push({user: user.id, exp: exp, expPerCent: expPerCent});
    })

    return <>
        <p className="statsHeader">Podsumowanie: {selectedDay}</p>
        <table className="entityTable">
            <thead>
                <tr>
                    <th>Użytkownik</th>
                    <th>Punkty doświadczenia</th>
                    <th>Udział procentowy</th>
                </tr>
            </thead>
            <tbody>
                {monthlyGridData.map((record) => (
                    <tr key={users.get(record.user)?.nickname}>
                        <td>{users.get(record.user)?.nickname}</td>
                        <td>{record.exp}</td>
                        <td>{record.expPerCent}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </>
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