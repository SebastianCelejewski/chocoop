import type { Schema } from "../../../amplify/data/resource";
import User from "../../model/User";

function MonthsDataTable({users, expStats, onMonthSelected}: {users: Map<string, User>, expStats: Array<Schema["ExperienceStatistics"]["type"]>, onMonthSelected: (month: string) => void} ) {
    const gridData = new Map<string, Map<string, number>>();
    const earliestMonth : string = expStats
        .filter((record) => record.periodType == "MONTH")
        .reduce((earliest, record) => earliest < record.period ? earliest : record.period, expStats[0].period)
    const latestMonth : string = expStats
        .filter((record) => record.periodType == "MONTH")
        .reduce((latest, record) => latest > record.period ? latest : record.period, expStats[0].period)

    const startDate = new Date(earliestMonth);
    const endDate = new Date(latestMonth);
    
    startDate.setDate(1)
    endDate.setDate(28)

    let date = startDate;

    while (date <= endDate) {
        const dateStr = date.toISOString().slice(0, 7);

        const userDataForThisMonth = new Map<string, number>();

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

export default MonthsDataTable;