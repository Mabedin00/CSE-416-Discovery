import './App.css';
import StartScreen from './components/StartScreen.js'
import MapView from './components/MapView.js'
import TestMap from './components/TestMap.js';

import 'leaflet/dist/leaflet.css';


import React, { useState } from 'react';

function App() {

  const [uploadedData, setUploadedData] = useState(null);

  const handleFileUpload = (data) => {
    setUploadedData(data);
  };

  return (
    <div className="App">
      {/* <StartScreen/> */}
      {/* <MapView/> */}
      { <TestMap/> }
    </div>
  );
}

export default App;
