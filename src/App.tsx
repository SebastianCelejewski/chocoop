import { BrowserRouter, Routes, Route } from "react-router";

import MeasurementList from "./measurements/measurementList.tsx"
import MeasurementDetails from "./measurements/measurementDetails.tsx"
import MeasurementAdd from "./measurements/measurementAdd.tsx"
import { Authenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { useState} from 'react'

function App() {

  const [userNickname, setUserNickname] = useState<string>("");

  function getUserNickname() {
    fetchUserAttributes().then((attributes) => {
      if (attributes.nickname === undefined) {
        setUserNickname("")
      } else {
        setUserNickname(attributes.nickname)
      }
    })
  }

  getUserNickname()

  return (
    <Authenticator>
      {({ signOut }) => {
        return ( 
          <main>
            <h1>Chores Cooperative</h1>
            <div className="subheader">
              <p className="userInfo">Witaj, {userNickname}</p>
              <p className="versionInfo">Wersja 0.1.0</p>
            </div>
            <div style={{clear: 'both'}}/>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<MeasurementList />} />
                <Route path="/measurements" element={<MeasurementList />} />
                <Route path="/measurements/new" element={<MeasurementAdd />} />
                <Route path="/measurements/:id" element={<MeasurementDetails />} />
              </Routes>
            </BrowserRouter>
            <button onClick={signOut}>Wyloguj się</button>
          </main>
        )
      }}
    </Authenticator>
  );
}

export default App;
