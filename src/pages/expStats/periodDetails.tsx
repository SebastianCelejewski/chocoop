import type { Schema } from "../../../amplify/data/resource";
import User from "../../model/User";
import AccumulatedExpChart from "../../components/accumulatedExpChart";
import BasicExpChart from "../../components/basicExpChart";
import ExpDataTable from "../../components/expDataTable";

class CalculationStrategy {
    startSubPeriod: number;
    endSubPeriod: number;
    subPeriodString: (period: string, subPeriod: number) => string

    constructor(startSubPeriod: number, endSubPeriod: number, subPeriodString: (period: string, subPeriod: number) => string ) {
        this.startSubPeriod = startSubPeriod;
        this.endSubPeriod = endSubPeriod;
        this.subPeriodString = subPeriodString;
    }
}

const calculationStrategies = new Map<string, object>([
    ["TOTAL", new CalculationStrategy(2025, 2025, (_: string, subPeriod: number) => subPeriod.toString())],
    ["YEAR", new CalculationStrategy(1, 12, (period: string, subPeriod: number) => period + "-" + subPeriod.toString().padStart(2, "0"))],
    ["MONTH", new CalculationStrategy(1, 31, (period: string, subPeriod: number) => period + "-" + subPeriod.toString().padStart(2, "0"))]
])

function PeriodDetails({periodType, subPeriodType, selectedPeriod, users, expStats, onPeriodSelected}: {periodType:string, subPeriodType: string, selectedPeriod: string, users: Map<string, User>, expStats: Array<Schema["ExperienceStatistics"]["type"]>, onPeriodSelected: (period: string) => void} ) {
    const calculationStrategy = calculationStrategies.get(periodType) as CalculationStrategy
    
    const gridData = new Map<string, Map<string, number>>();
    const chartLabels = Array<string>();
    const chartData: Array<Array<number>> = Array.from({length: users.size}, () => []);
    const summarizedChartData: Array<Array<number>> = Array.from({length: users.size}, () => []);

    const expStatsForPeriodType = expStats
        .filter((record) => record.periodType == subPeriodType)

    if (expStatsForPeriodType.length == 0) {
        return <>
            <p>No data available for period type ${subPeriodType}</p>
        </>
    }

    const earliestYear : string = expStatsForPeriodType
        .reduce((earliest, record) => earliest < record.period ? earliest : record.period, expStatsForPeriodType[0].period)
    const latestYear : string = expStatsForPeriodType
        .reduce((latest, record) => latest > record.period ? latest : record.period, expStatsForPeriodType[0].period)

    let startSubPeriod = calculationStrategy.startSubPeriod;
    let endSubPeriod = calculationStrategy.endSubPeriod;

    if (periodType == "TOTAL") {
        startSubPeriod = parseInt(earliestYear);
        endSubPeriod = parseInt(latestYear);
    }
    
    let subPeriod = startSubPeriod;
    let dateIdx = 0;

    while (subPeriod <= endSubPeriod) {
        const dateStr = calculationStrategy.subPeriodString(selectedPeriod, subPeriod)

        const userDataForThisSubPeriod = new Map<string, number>();

        let idx = 0;
        users.forEach((user) => {
            const exp = expStats
                .filter((record) => record.user == user.id && record.period == dateStr && record.periodType == subPeriodType)
                .reduce((sum, record) => sum + record.exp, 0)
            userDataForThisSubPeriod.set(user.id, exp);
            chartData[idx].push(exp);
            if (dateIdx == 0) {
                summarizedChartData[idx].push(exp);
            } else {
                summarizedChartData[idx].push(summarizedChartData[idx][dateIdx - 1] + exp)
            }
            
            idx++;
        })
        
        gridData.set(dateStr, userDataForThisSubPeriod);
        chartLabels.push(dateStr);
        subPeriod++;
        
        dateIdx++;
    }

    return <>
        <BasicExpChart periodType={periodType} labels={chartLabels} chartData={chartData}/>
        <AccumulatedExpChart periodType={periodType} labels={chartLabels} chartData={summarizedChartData}/>
        <ExpDataTable periodType={periodType} users={users} gridData={gridData} onRowSelected={onPeriodSelected} />
    </>
}

export default PeriodDetails;