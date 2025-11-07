import type { Schema } from "../../../amplify/data/resource";
import User from "../../model/User";

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

export default DaysDataTable;