import type { Schema } from "../../../amplify/data/resource";
import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";

import User from "../../model/User";
import MonthDataTable from "./monthDataTable";
import YearDataTable from "./yearDataTable";
import TotalDataTable from "./totalDataTable";

import DaySummary from "./daySummary";
import MonthSummary from "./monthSummary";
import YearSummary from "./yearSummary";
import TotalSummary from "./totalSummary";

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

const client = generateClient<Schema>();

class ExpStatsQueryResult {
    items: Array<Schema["ExperienceStatistics"]["type"]> = []
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3, padding: 0 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`
    };
}

function ExpStats({users}: {users: Map<string, User>}) {
    const [expStats, setExpStats] = useState<Array<Schema["ExperienceStatistics"]["type"]>>([]);
    
    const [selectedYear, setSelectedYear] = useState<string>(new Date().toISOString().substring(0, 4));
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substring(0, 7));
    const [selectedDay, setSelectedDay] = useState<string>(new Date().toISOString().substring(0, 10));
    
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (client.models.ExperienceStatistics !== undefined) {
            client.models.ExperienceStatistics.observeQuery().subscribe({
                next: (data: ExpStatsQueryResult) => { 
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

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return <>
        <p className="pageTitle">Statystyki doświadczenia</p>
        <ul className="entityList">
            <Box sx={{ width: '100%'}}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                <Tab label="TOTAL" {...a11yProps(0)} />
                <Tab label={selectedYear} {...a11yProps(1)} />
                <Tab label={selectedMonth} {...a11yProps(2)} />
                <Tab label={selectedDay} {...a11yProps(3)} />
                </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
                <TotalSummary users={users} expStats={expStats}/>
                <TotalDataTable users={users} expStats={expStats} onYearSelected={onYearSelected}/>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                <YearSummary users={users} expStats={expStats} selectedYear={selectedYear}/>
                <YearDataTable users={users} expStats={expStats} onMonthSelected={onMonthSelected}/>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
                <MonthSummary users={users} expStats={expStats} selectedMonth={selectedMonth}/>
                <MonthDataTable users={users} expStats={expStats} selectedMonth={selectedMonth} onDaySelected={onDaySelected}/>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={3}>
                <DaySummary users={users} expStats={expStats} selectedDay={selectedDay}/>
            </CustomTabPanel>
            </Box>
        </ul>
    </>;

    function onYearSelected(year: string) {
        if (selectedYear !== year) {
            setSelectedYear(year)
            setSelectedMonth("")
            setSelectedDay("")
        }
        setValue(1)
    }

    function onMonthSelected(month: string) {
        if (selectedMonth !== month) {
            setSelectedMonth(month)
            setSelectedDay("")
        }
        setValue(2)
    }

    function onDaySelected(day: string) {
        setSelectedDay(day)
        setValue(3)
    }
}

export default ExpStats;