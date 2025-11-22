import User from "../model/User";
import backgroundColors from "../utils/userColours";

interface SummaryData {
    user: string;
    exp: number;
    expPerCent: string;
}

function SummaryTable({users, data}: {users: Map<string, User>, data: SummaryData[]}) {
    return (
        <table className="summaryTable">
            <thead>
                <tr style={{backgroundColor: "#e0e0e0"}}>
                    <th>Użytkownik</th>
                    <th>Punkty doświadczenia</th>
                    <th>Udział procentowy</th>
                </tr>
            </thead>
            <tbody>
                {
                    data.map((record, index) => (
                    <tr key={record.user} style={{backgroundColor: backgroundColors[index % backgroundColors.length]}}>
                        <td>{users.get(record.user)?.nickname}</td>
                        <td>{record.exp}</td>
                        <td>{record.expPerCent}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default SummaryTable;