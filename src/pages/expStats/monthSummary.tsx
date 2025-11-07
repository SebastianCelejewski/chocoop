import type { Schema } from "../../../amplify/data/resource";
import User from "../../model/User";

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

export default MonthSummary;