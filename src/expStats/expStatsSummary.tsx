import type { Schema } from "../../amplify/data/resource";
import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

class ExpStatsQueryResult {
  items: Array<Schema["ExperienceStatistics"]["type"]> = []
}

function ExpStatsSummary() {
    const [expStats, setExpStats] = useState<Array<Schema["ExperienceStatistics"]["type"]>>([]);
    
    useEffect(() => {
        if (client.models.ExperienceStatistics !== undefined) {
            client.models.ExperienceStatistics.observeQuery().subscribe({
                next: (data: ExpStatsQueryResult) => { 
                    console.log("Loaded data: " + JSON.stringify(data))
                    setExpStats([...data.items])
                }
            });
        }
    }, []);

    if (expStats.length == 0) {
        return <>
            <p className="pageTitle">Statystyki doświadczenia</p>
            <p className="loadingData">Ładowanie danych</p>
        </>
    }

    var users = new Set<string>();
    var earliestDay : string | undefined = undefined;
    var latestDay : string | undefined = undefined;
    var earliestMonth : string | undefined = undefined;
    var latestMonth : string | undefined = undefined;

    expStats.forEach((expStat) => {
        console.log("Processing record " + JSON.stringify(expStat))
        if (expStat === undefined) {
            console.log("expStat is undefined")
            return
        }
        if (expStat === null) {
            console.log("expStat is null")
            return
        }

        console.log("Record seems to be OK: " + JSON.stringify(expStat) );

        users.add(expStat.user);
        if (expStat.periodType == "DAY") {
            if (earliestDay == undefined || expStat.period < earliestDay) {
                earliestDay = expStat.period;
            }
            if (latestDay == undefined || expStat.period > latestDay) {
                latestDay = expStat.period;
            }
        } else if (expStat.periodType == "MONTH") {
            if (earliestMonth == undefined || expStat.period < earliestMonth) {
                earliestMonth = expStat.period;
            }
            if (latestMonth == undefined || expStat.period > latestMonth) {
                latestMonth = expStat.period;
            }
        }
    })

    console.log("Earliest day: " + earliestDay)
    console.log("Latest day: " + latestDay)
    console.log("Earliest month: " + earliestMonth)
    console.log("Latest month: " + latestMonth)

    return <>
        <p className="pageTitle">Statystyki doświadczenia</p>
        <ul className="entityList">
            {expStats.map(expStat => {
                if (expStat === undefined || expStat === null) {

                    console.log("Not rendering - null records");
                    console.log("Data contains " + expStats.length + " records");
                    return <></>
                } else {
                    return <li className="entityListElement" key={expStat.id}>
                        <div>
                            <p className="entityPerson">{expStat.periodType}</p>
                            <p className="entityPerson">{expStat.period}</p>
                            <p className="entityPerson">{expStat.user}</p>
                            <p className="entityExp">{expStat.exp} xp</p>
                            <div style={{clear: 'both'}}/>
                        </div>
                    </li>
                }
            })}
        </ul>
    </>
}

export default ExpStatsSummary;