import type { Schema } from "../../../amplify/data/resource";
import User from "../../model/User";

function YearSummary({users, expStats, selectedYear}: {users: Map<string, User>, expStats: Array<Schema["ExperienceStatistics"]["type"]>, selectedYear: string}) {
    const totalExpThisYear = expStats
            .filter((record) => record.period == selectedYear && record.periodType == "YEAR")
            .reduce((sum, record) => sum + record.exp, 0)

    const annualGridData = new Array();
    users.forEach((user) => {
        const exp = expStats
            .filter((record) => record.user == user.id && record.period == selectedYear && record.periodType == "YEAR")
            .reduce((sum, record) => sum + record.exp, 0)
        const expPerCent = totalExpThisYear > 0 ? (100 * exp / totalExpThisYear).toFixed(0) + "%" : "-";
        annualGridData.push({user: user.id, exp: exp, expPerCent: expPerCent});
    })

    return <>
        <table className="entityTable">
            <thead>
                <tr>
                    <th>Użytkownik</th>
                    <th>Punkty doświadczenia</th>
                    <th>Udział procentowy</th>
                </tr>
            </thead>
            <tbody>
                {annualGridData.map((record) => (
                    <tr key={record.user}>
                        <td>{users.get(record.user)?.nickname}</td>
                        <td>{record.exp}</td>
                        <td>{record.expPerCent}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </>
}

export default YearSummary;