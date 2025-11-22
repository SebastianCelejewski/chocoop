import type { Schema } from "../../../amplify/data/resource";
import User from "../../model/User";
import AccumulatedExpChart from "../../components/accumulatedExpChart"
import BasicExpChart from "../../components/basicExpChart"

function MonthDataTable({users, expStats, selectedMonth, onDaySelected }: {users: Map<string, User>, expStats: Array<Schema["ExperienceStatistics"]["type"]>, selectedMonth: string, onDaySelected: (day: string) => void}) {
    const gridData = new Map<string, Map<string, number>>();
    const chartLabels = Array<string>();
    const chartData: Array<Array<number>> = Array.from({length: users.size}, () => []);
    const summarizedChartData: Array<Array<number>> = Array.from({length: users.size}, () => []);
    const startDate = new Date(selectedMonth);
    const endDate = new Date(selectedMonth);

    startDate.setDate(1);
    endDate.setDate(31);
    
    let date = startDate;
    let dateIdx = 0;

    while (date <= endDate) {
        const dateStr = date.toISOString().slice(0, 10);
        const userDataForThisDate = new Map<string, number>();

        let idx = 0;
        users.forEach((user) => {
            const exp = expStats
                .filter((record) => record.user == user.id && record.period == dateStr && record.periodType == "DAY")
                .reduce((sum, record) => sum + record.exp, 0)
            userDataForThisDate.set(user.id, exp);

            chartData[idx].push(exp);
            if (dateIdx == 0) {
                summarizedChartData[idx].push(exp);
            } else {
                summarizedChartData[idx].push(summarizedChartData[idx][dateIdx - 1] + exp)
            }
            
            idx++;
        });
        
        gridData.set(dateStr, userDataForThisDate);
        chartLabels.push(dateStr);
        date.setDate(date.getDate() + 1);

        dateIdx++;
    }

    return <>
        <BasicExpChart periodType="MONTH" labels={chartLabels} chartData={chartData}/>
        <AccumulatedExpChart periodType="MONTH" labels={chartLabels} chartData={summarizedChartData}/>
        <p className="statsHint">Kliknij w wiersz tabeli, aby zobaczyć szczegóły</p>
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

export default MonthDataTable;