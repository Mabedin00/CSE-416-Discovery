import './App.css';
import MapView from './components/MapView.js'

import 'leaflet/dist/leaflet.css';


import React, { useState } from 'react';

function App() {
  return (
    <div className="App">
      <MapView/>
    </div>
  );
}

export default App;
