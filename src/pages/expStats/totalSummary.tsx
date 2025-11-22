import type { Schema } from "../../../amplify/data/resource";
import User from "../../model/User";

function TotalSummary({users, expStats}: {users: Map<string, User>, expStats: Array<Schema["ExperienceStatistics"]["type"]>}) {
    const totalExp = expStats
            .filter((record) => record.periodType == "TOTAL")
            .reduce((sum, record) => sum + record.exp, 0)

    const totalGridData = new Array();
    users.forEach((user) => {
        const exp = expStats
            .filter((record) => record.user == user.id && record.periodType == "TOTAL")
            .reduce((sum, record) => sum + record.exp, 0)
        const expPerCent = totalExp > 0 ? (100 * exp / totalExp).toFixed(0) + "%" : "-";
        totalGridData.push({user: user.id, exp: exp, expPerCent: expPerCent});
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
                {totalGridData.map((record) => (
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

export default TotalSummary;