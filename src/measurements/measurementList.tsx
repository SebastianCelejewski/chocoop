import type { Schema } from "../../amplify/data/resource";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { generateClient } from "aws-amplify/data";
import { dateToString } from "../utils/dateUtils";
import { valueImagePaths, valueDescriptions } from "../utils/descriptions";

const client = generateClient<Schema>();

class MeasurementQueryResult {
  items: Array<Schema["Measurement"]["type"]> = []
}

function sortByDateTime(measurements: Array<Schema["Measurement"]["type"]>) {
    return measurements.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
}

function MeasurementList() {
    const [measurements, setMeasurements] = useState<Array<Schema["Measurement"]["type"]>>([]);
    const navigate = useNavigate();
    
    useEffect(() => {
        client.models.Measurement.observeQuery({
            authMode: 'userPool',
        }).subscribe({
            next: (data: MeasurementQueryResult) => { 
              setMeasurements(sortByDateTime([...data.items]))
            }
        });
    }, []);

    function createMeasurement() {
        const navLink = `/measurements/new`
        navigate(navLink)
    }

    function showMeasurement(id: string) {
        const navLink = `/measurements/${id}`
        navigate(navLink)
    }

    return (
          <>
            <ul className="entryList">
            {measurements.map(measurement => {
                const valueImagePath = valueImagePaths[measurement.value]
                const valueDescription = valueDescriptions[measurement.value]

                return <li
                        className="entryListElement"
                        onClick={() => showMeasurement(measurement.id)}
                        key={measurement.id}>
                        <div>
                            <p className="measurementDateTime">{dateToString(measurement.dateTime)}</p>
                            <p><span className="measurementValue"><img src={valueImagePath} alt={valueDescription}/></span></p>
                            <p className="measurementComment">{measurement.comment}</p>
                            <div style={{clear: 'both'}}/>
                        </div>
                      </li>
                }
            )}
          </ul>
        <button onClick={createMeasurement}>Dodaj pomiar</button>
    </>
  );
}

export default MeasurementList;