import type { Schema } from "../../../amplify/data/resource";
import User from "../../model/User";

function TotalDataTable({users, expStats, onYearSelected}: {users: Map<string, User>, expStats: Array<Schema["ExperienceStatistics"]["type"]>, onYearSelected: (month: string) => void} ) {
    const gridData = new Map<string, Map<string, number>>();
    const earliestYear : string = expStats
        .filter((record) => record.periodType == "YEAR")
        .reduce((earliest, record) => earliest < record.period ? earliest : record.period, expStats[0].period)
    const latestYear : string = expStats
        .filter((record) => record.periodType == "YEAR")
        .reduce((latest, record) => latest > record.period ? latest : record.period, expStats[0].period)

    const startDate = new Date(earliestYear);
    const endDate = new Date(latestYear);
    
    startDate.setMonth(0)
    startDate.setDate(1)

    endDate.setMonth(11)
    endDate.setDate(31)

    let date = startDate;

    while (date <= endDate) {
        const dateStr = date.toISOString().slice(0, 4);

        const userDataForThisYear = new Map<string, number>();

        users.forEach((user) => {
            const exp = expStats
                .filter((record) => record.user == user.id && record.period == dateStr && record.periodType == "YEAR")
                .reduce((sum, record) => sum + record.exp, 0)
            userDataForThisYear.set(user.id, exp);
        })
        gridData.set(dateStr, userDataForThisYear);

        date.setFullYear(date.getFullYear() + 1)
    }

    return <>
        <p className="statsHint">Kliknij w wiersz tabeli, aby zobaczyć szczegóły</p>
        <table className="entityTable">
            <thead>
                <tr>
                    <th>Rok</th>
                    {Array.from(users.keys()).map((userId) => (
                        <th className="rotated90" key={userId}>{users.get(userId)?.nickname}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {Array.from(gridData.keys()).map((year) => (
                    <tr key={year} onClick={() => onYearSelected(year)}>
                        <td>{year}</td>
                        {Array.from(users.keys()).map((userId) => (
                            <td key={userId}>{gridData.get(year)?.get(userId) || 0}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </>
}

export default TotalDataTable;