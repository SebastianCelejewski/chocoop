import type { Schema } from "../../../amplify/data/resource";
import User from "../../model/User";

import SummaryChart from "../../components/summaryChart";
import SummaryTable from "../../components/summaryTable";

function TotalSummary({users, expStats}: {users: Map<string, User>, expStats: Array<Schema["ExperienceStatistics"]["type"]>}) {
    const totalExp = expStats
            .filter((record) => record.periodType == "TOTAL")
            .reduce((sum, record) => sum + record.exp, 0)

    const gridData = new Array();
    const chartLabels = new Array();
    const chartData = new Array();

    users.forEach((user) => {
        const exp = expStats
            .filter((record) => record.user == user.id && record.periodType == "TOTAL")
            .reduce((sum, record) => sum + record.exp, 0)
        const expPerCent = totalExp > 0 ? (100 * exp / totalExp).toFixed(0) + "%" : "-";
        gridData.push({user: user.id, exp: exp, expPerCent: expPerCent});
        chartLabels.push(user.nickname);
        chartData.push(exp);        
    })

    return <>
        <SummaryTable users={users} data={gridData}/>
        <SummaryChart description="TOTAL" labels={chartLabels} chartData={chartData}/>
    </>
}

export default TotalSummary;