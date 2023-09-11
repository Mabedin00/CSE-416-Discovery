import './App.css';
import MapView from './components/MapView.js'
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
      <MapView/>
    </div>
  );
}

export default App;
