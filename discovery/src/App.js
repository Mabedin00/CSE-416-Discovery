import logo from './logo.svg';
import FileUpload from './components/FileUpload.js';
import Map from './components/Map.js';
import './App.css';
import StartScreen from './components/StartScreen.js'

import React, { useState } from 'react';

function App() {

  const [uploadedData, setUploadedData] = useState(null);

  const handleFileUpload = (data) => {
    setUploadedData(data);
  };

  return (
    <div className="App">
      {/* <StartScreen/> */}
      <StartScreen/>
    </div>
  );
}

export default App;
