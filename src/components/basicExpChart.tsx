import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from "react-chartjs-2";
import backgroundColors from "../utils/userColours";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const periodTypeToAutoSkipPadding = new Map<string, number>([
    ["DAY", 0],
    ["MONTH", 7],
    ["YEAR", 2],
    ["TOTAL", 1]
]);

function BasicExpChart({periodType, labels, chartData}: {periodType: string,labels: Array<string>, chartData: Array<Array<number>>}) {
    const datasets = chartData.map((data, index) => {
        return {
            label: labels[index],
            data: data,
            borderColor: backgroundColors[index],
            fill: false,
            stepped: true,
            radius: chartData[0].length > 1 ? 0 : 3
        }
    });
    
    const data = {
        labels: labels,
        datasets: datasets
    };

    const options = {
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Punkty doświadczenia',
            }
        },
        scales: {
            y: {
                title: {
                    display: false
                }
            },
            x: {
                title: {
                    display: false
                },
                ticks: {
                    autoSkip: true,
                    autoSkipPadding: periodTypeToAutoSkipPadding.get(periodType) || 7,
                    maxRotation: 0
                }
            }
        },
        maintainAspectRatio: false
    }

    return (
        <div className="basicExpChart">
            <Line data={data} options={options}/>
        </div>
    );
}

export default BasicExpChart;