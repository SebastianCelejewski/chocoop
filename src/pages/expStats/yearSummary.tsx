import type { Schema } from "../../../amplify/data/resource";
import User from "../../model/User";

import SummaryChart from "../../components/summaryChart";
import SummaryTable from "../../components/summaryTable";

function YearSummary({users, expStats, selectedYear}: {users: Map<string, User>, expStats: Array<Schema["ExperienceStatistics"]["type"]>, selectedYear: string}) {
    const totalExpThisYear = expStats
            .filter((record) => record.period == selectedYear && record.periodType == "YEAR")
            .reduce((sum, record) => sum + record.exp, 0)

    const gridData = new Array();
    const chartLabels = new Array();
    const chartData = new Array();

    users.forEach((user) => {
        const exp = expStats
            .filter((record) => record.user == user.id && record.period == selectedYear && record.periodType == "YEAR")
            .reduce((sum, record) => sum + record.exp, 0)
        const expPerCent = totalExpThisYear > 0 ? (100 * exp / totalExpThisYear).toFixed(0) + "%" : "-";
        gridData.push({user: user.id, exp: exp, expPerCent: expPerCent});
        chartLabels.push(user.nickname);
        chartData.push(exp);
    })

    return <>
        <SummaryTable users={users} data={gridData}/>
        <SummaryChart description={selectedYear} labels={chartLabels} chartData={chartData}/>
    </>
}

export default YearSummary;