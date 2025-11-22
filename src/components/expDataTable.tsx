import User from "../model/User";
import userColors from "../utils/userColours";

interface ExpDataTableProps {
    periodType: string;
    users: Map<string, User>;
    gridData: Map<string, Map<string, number>>;
    onRowSelected: (key: string) => void
}

const headerLabels = new Map<string, string>([
    ["TOTAL", "Rok"],
    ["YEAR", "Miesiąc"],
    ["MONTH", "Dzień"]
])

function ExpDataTable({periodType, users, gridData, onRowSelected}: ExpDataTableProps) {
    return <>
        <p className="statsHint">Kliknij w wiersz tabeli, aby zobaczyć szczegóły</p>
        <table className="entityTable">
            <thead>
                <tr>
                    <th className="headingCell">{headerLabels.get(periodType) || "-"}</th>
                    {Array.from(users.keys()).map((userId, idx) => (
                        <th className="rotated90" key={userId} style={{backgroundColor: userColors[idx]}}>{users.get(userId)?.nickname}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {Array.from(gridData.keys()).map((key) => (
                    <tr key={key} onClick={() => onRowSelected(key)}>
                        <td className="headingCell">{key}</td>
                        {Array.from(users.keys()).map((userId, idx) => (
                            <td key={userId} style={{backgroundColor: userColors[idx]}}>{gridData.get(key)?.get(userId) || 0}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </>;
}

export default ExpDataTable;