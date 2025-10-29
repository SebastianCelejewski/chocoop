import type { Schema } from "../../amplify/data/resource";
import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";

import User from "../model/User";

const client = generateClient<Schema>();

class ExpStatsQueryResult {
  items: Array<Schema["ExperienceStatistics"]["type"]> = []
}

function ExpStatsSummary({users}: {users: Map<string, User>}) {
    const [expStats, setExpStats] = useState<Array<Schema["ExperienceStatistics"]["type"]>>([]);
    
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

    var earliestDay : string | undefined = undefined;
    var latestDay : string | undefined = undefined;
    var earliestMonth : string | undefined = undefined;
    var latestMonth : string | undefined = undefined;

    expStats.forEach((expStat) => {
        if (expStat.periodType == "DAY") {
            if (earliestDay == undefined || expStat.period < earliestDay) {
                earliestDay = expStat.period;
            }
            if (latestDay == undefined || expStat.period > latestDay) {
                latestDay = expStat.period;
            }
        } else if (expStat.periodType == "MONTH") {
            if (earliestMonth == undefined || expStat.period < earliestMonth) {
                earliestMonth = expStat.period;
            }
            if (latestMonth == undefined || expStat.period > latestMonth) {
                latestMonth = expStat.period;
            }
        }
    })

    const thisMonth = new Date().toISOString().slice(0, 7);
    const today = new Date().toISOString().slice(0, 10);

    var totalExpThisMonth = expStats
            .filter((record) => record.period == thisMonth && record.periodType == "MONTH")
            .reduce((sum, record) => sum + record.exp, 0)

    var totalExpToday = expStats
            .filter((record) => record.period == today && record.periodType == "DAY")
            .reduce((sum, record) => sum + record.exp, 0)

    var monthlyGridData = new Array();
    users.forEach((user) => {
        const exp = expStats
            .filter((record) => record.user == user.id && record.period == thisMonth && record.periodType == "MONTH")
            .reduce((sum, record) => sum + record.exp, 0)
        const expPerCent = 100 * exp / totalExpThisMonth;
        monthlyGridData.push({user: user.id, exp: exp, expPerCent: expPerCent});
    })

    var dailyGridData = new Array();
    users.forEach((user) => {
        const exp = expStats
            .filter((record) => record.user == user.id && record.period == today && record.periodType == "DAY")
            .reduce((sum, record) => sum + record.exp, 0)
        const expPerCent = 100 * exp / totalExpToday;
        dailyGridData.push({user: user.id, exp: exp, expPerCent: expPerCent});
    })

    return <>
        <p className="pageTitle">Statystyki doświadczenia</p>

        <ul className="entityList">
            <p className="statsHeader">Ten miesiąc</p>
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
                            <td>{parseFloat(record.expPerCent).toFixed(0)}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
    
            <p className="statsHeader">Dzisiaj</p>
            <table className="entityTable">
                <thead>
                    <tr>
                        <th>Użytkownik</th>
                        <th>Punkty doświadczenia</th>
                        <th>Udział procentowy</th>
                    </tr>
                </thead>
                <tbody>
                    {dailyGridData.map((record) => (
                        <tr key={users.get(record.user)?.nickname}>
                            <td>{users.get(record.user)?.nickname}</td>
                            <td>{record.exp}</td>
                            <td>{parseFloat(record.expPerCent).toFixed(0)}%</td>                            
                        </tr>
                    ))}
                </tbody>
            </table>
        </ul>
    </>
}

export default ExpStatsSummary;