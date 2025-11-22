import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import backgroundColors from "../utils/userColours";

ChartJS.register(ArcElement, Tooltip, Legend);

function SummaryChart({description, labels, chartData}: {description: string, labels: Array<string>, chartData: Array<number>}) {
    const data = {
        labels: labels,
        datasets: [{
            label: description,
            data: chartData,
            backgroundColor: backgroundColors,
            hoverOffset: 4
        }]
    };

    const options = {
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Udział procentowy',
            }
        }
    }

    return (
        <div className="expSummaryChart">
            <Doughnut data={data} options={options}/>
        </div>
    );
}

export default SummaryChart;