import type { Schema } from "../../amplify/data/resource";

import { useState } from "react";
import { useNavigate } from "react-router";
import { generateClient } from "aws-amplify/data";
import { valueImagePaths, valueDescriptions } from "../utils/descriptions";

const client = generateClient<Schema>();

function MeasurementAdd() {
    const navigate = useNavigate();

    const currentDateTimeUTC = new Date()
    const timeZoneOffset = currentDateTimeUTC.getTimezoneOffset()
    const currentDateTimeLocal = new Date(currentDateTimeUTC.getTime() - timeZoneOffset * 60 * 1000)
    const currentDateTime = currentDateTimeLocal.toISOString().split(".")[0]

    const [measurementDateTime, setMeasurementDateTime] = useState(currentDateTime);
    const [measurementValue, setMeasurementValue] = useState(0);
    const [measurementComment, setMeasurementComment] = useState("");

    function handleMeasurementValueChange(e: any) {
        setMeasurementValue(e.target.value);
    }

    function handleMeasurementCommentChange(e: any) {
        setMeasurementComment(e.target.value);
    }

      function handleMeasurementDateTimeChange(e: any) {
          setMeasurementDateTime(e.target.value)
    }

    function handleSubmit(e: any) {
        e.preventDefault();

        const newMeasurement = {
            dateTime: new Date(measurementDateTime).toISOString(),
            value: measurementValue,
            comment: measurementComment
        }

        const result = client.models.Measurement.create(newMeasurement,   
        {
            authMode: 'userPool',
        });

        result.then(() => {
            navigate("/measurements")
        })
    }

    function handleCancel() {
        navigate("/measurements")
    }

    return <>
        <form onSubmit={handleSubmit}>
            <div className="entryDetails">
                <p className="label">Data i godzina pomiaru</p>
                <p><input
                        id="measurementDateTime"
                        aria-label="Date and time"
                        type="datetime-local"
                        defaultValue={measurementDateTime}
                        onChange={handleMeasurementDateTimeChange}
                    /></p>

                <p className="label">Poziom duszności</p>
                <div>
                    <p><label><input type="radio" name="measurementValue" value="0" onChange={handleMeasurementValueChange} defaultChecked/>&nbsp;<img className="radioIcon" src={valueImagePaths[0]} alt={valueDescriptions[0]}/>&nbsp;<span>{valueDescriptions[0]}</span></label></p>
                    <p><label><input type="radio" name="measurementValue" value="1" onChange={handleMeasurementValueChange}/>&nbsp;<img className="radioIcon" src={valueImagePaths[1]} alt={valueDescriptions[1]}/> <span>{valueDescriptions[1]}</span></label></p>
                    <p><label><input type="radio" name="measurementValue" value="2" onChange={handleMeasurementValueChange}/>&nbsp;<img className="radioIcon" src={valueImagePaths[2]} alt={valueDescriptions[2]}/> <span>{valueDescriptions[2]}</span></label></p>
                    <p><label><input type="radio" name="measurementValue" value="3" onChange={handleMeasurementValueChange}/>&nbsp;<img className="radioIcon" src={valueImagePaths[3]} alt={valueDescriptions[3]}/> <span>{valueDescriptions[3]}</span></label></p>
                </div>

                <p className="label">Okoliczności</p>
                <p><textarea id="measurementComment" className="newMeasurementTextArea" rows={5} onChange={handleMeasurementCommentChange}/></p>
            </div>
            <button type="submit">Zatwierdź</button>
            <button type="button" onClick={handleCancel}>Anuluj</button>
        </form>
    </>
}

export default MeasurementAdd;
