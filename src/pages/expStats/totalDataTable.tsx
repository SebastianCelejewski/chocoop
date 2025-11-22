import type { Schema } from "../../../amplify/data/resource";
import User from "../../model/User";
import AccumulatedExpChart from "../../components/accumulatedExpChart"
import BasicExpChart from "../../components/basicExpChart"

function TotalDataTable({users, expStats, onYearSelected}: {users: Map<string, User>, expStats: Array<Schema["ExperienceStatistics"]["type"]>, onYearSelected: (month: string) => void} ) {
    const gridData = new Map<string, Map<string, number>>();
    const chartLabels = Array<string>();
    const chartData: Array<Array<number>> = Array.from({length: users.size}, () => []);
    const summarizedChartData: Array<Array<number>> = Array.from({length: users.size}, () => []);

    const expStatsForPeriodType = expStats
        .filter((record) => record.periodType == "YEAR")

    const earliestYear : string = expStatsForPeriodType
        .reduce((earliest, record) => earliest < record.period ? earliest : record.period, expStatsForPeriodType[0].period)
    const latestYear : string = expStatsForPeriodType
        .reduce((latest, record) => latest > record.period ? latest : record.period, expStatsForPeriodType[0].period)

    const startYear = Number.parseInt(earliestYear);
    const endYear = Number.parseInt(latestYear);
    
    let year = startYear;
    let dateIdx = 0;

    while (year <= endYear) {
        const dateStr = year.toString()

        const userDataForThisYear = new Map<string, number>();

        let idx = 0;
        users.forEach((user) => {
            const exp = expStats
                .filter((record) => record.user == user.id && record.period == dateStr && record.periodType == "YEAR")
                .reduce((sum, record) => sum + record.exp, 0)
            userDataForThisYear.set(user.id, exp);
            chartData[idx].push(exp);
            if (dateIdx == 0) {
                summarizedChartData[idx].push(exp);
            } else {
                summarizedChartData[idx].push(summarizedChartData[idx][dateIdx - 1] + exp)
            }
            
            idx++;
        })
        
        gridData.set(dateStr, userDataForThisYear);
        chartLabels.push(dateStr);
        year++;
        
        dateIdx++;
    }

    return <>
        <BasicExpChart periodType="TOTAL" labels={chartLabels} chartData={chartData}/>
        <AccumulatedExpChart periodType="TOTAL" labels={chartLabels} chartData={summarizedChartData}/>
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