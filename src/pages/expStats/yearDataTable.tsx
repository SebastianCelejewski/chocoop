import type { Schema } from "../../../amplify/data/resource";
import User from "../../model/User";
import AccumulatedExpChart from "../../components/accumulatedExpChart"
import BasicExpChart from "../../components/basicExpChart"

function YearDataTable({users, expStats, selectedYear, onMonthSelected}: {users: Map<string, User>, expStats: Array<Schema["ExperienceStatistics"]["type"]>, selectedYear: string, onMonthSelected: (month: string) => void} ) {
    const gridData = new Map<string, Map<string, number>>();
    const chartLabels = Array<string>();
    const chartData: Array<Array<number>> = Array.from({length: users.size}, () => []);
    const summarizedChartData: Array<Array<number>> = Array.from({length: users.size}, () => []);

    const startMonth = 1;
    const endMonth = 12;

    let month = startMonth;
    let dateIdx = 0;

    while (month <= endMonth) {
        const dateStr = selectedYear + "-" + month.toString().padStart(2, "0")

        const userDataForThisMonth = new Map<string, number>();

        let idx = 0;
        users.forEach((user) => {
            const exp = expStats
                .filter((record) => record.user == user.id && record.period == dateStr && record.periodType == "MONTH")
                .reduce((sum, record) => sum + record.exp, 0)
            userDataForThisMonth.set(user.id, exp);
            chartData[idx].push(exp);
            if (dateIdx == 0) {
                summarizedChartData[idx].push(exp);
            } else {
                summarizedChartData[idx].push(summarizedChartData[idx][dateIdx - 1] + exp)
            }
        
            idx++;
        })

        gridData.set(dateStr, userDataForThisMonth);
        chartLabels.push(dateStr);
        dateIdx++;
        
        month++;
    }

    return <>
        <BasicExpChart periodType="YEAR" labels={chartLabels} chartData={chartData}/>
        <AccumulatedExpChart periodType="YEAR" labels={chartLabels} chartData={summarizedChartData}/>
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

export default YearDataTable;