import type { Schema } from "../../../amplify/data/resource";
import User from "../../model/User";

import SummaryChart from "../../components/summaryChart";
import SummaryTable from "../../components/summaryTable";

function MonthSummary({users, expStats, selectedMonth}: {users: Map<string, User>, expStats: Array<Schema["ExperienceStatistics"]["type"]>, selectedMonth: string}) {
    const totalExpThisMonth = expStats
            .filter((record) => record.period == selectedMonth && record.periodType == "MONTH")
            .reduce((sum, record) => sum + record.exp, 0)

    const gridData = new Array();
    const chartLabels = new Array();
    const chartData = new Array();

    users.forEach((user) => {
        const exp = expStats
            .filter((record) => record.user == user.id && record.period == selectedMonth && record.periodType == "MONTH")
            .reduce((sum, record) => sum + record.exp, 0)
        const expPerCent = totalExpThisMonth > 0 ? (100 * exp / totalExpThisMonth).toFixed(0) + "%" : "-";
        gridData.push({user: user.id, exp: exp, expPerCent: expPerCent});
        chartLabels.push(user.nickname);
        chartData.push(exp);
    })

    return <>
        <SummaryTable users={users} data={gridData}/>
        <SummaryChart description={selectedMonth} labels={chartLabels} chartData={chartData}/>
    </>
}

export default MonthSummary;