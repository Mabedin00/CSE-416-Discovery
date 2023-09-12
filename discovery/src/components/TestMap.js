import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import shp from 'shpjs';
import toGeoJSON from 'togeojson';
import * as L from 'leaflet';

const TestMap = () => {
  const [geoJSONData, setGeoJSONData] = useState(null);
  const [view, setView] = useState({center: [0,0], zoom: 1});
  const [map, setMap] = useState();

  const onMapReady = (map) => {
    console.log("map ready");
  };

  const handleUpload = (event) => {
    const file = event.target.files[0];
    handleFileUpload(file); 
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    console.log("file uploaded");
    const extension = file.name.split('.').pop().toLowerCase();
    if (extension === 'zip') {
      console.log("zip detected");
      // Read the zip file as an ArrayBuffer
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        parseZipFile(arrayBuffer);
      };
      reader.readAsArrayBuffer(file);
    } else if (extension === 'geojson' || extension === 'json' || extension === 'kml') {
      console.log("text detected")
      // Handle GeoJSON or KML
      const reader = new FileReader();
      reader.onload = (e) => {
        let geoJSON;
        if (extension === 'kml') {
          const parser = new DOMParser();
          const kml = parser.parseFromString(e.target.result, 'text/xml');
          geoJSON = toGeoJSON.kml(kml);
        } else {
          geoJSON = JSON.parse(e.target.result);
        }
        setGeoJSONData(geoJSON);
      };
      reader.readAsText(file);
      console.log("finished reading");
    } else {
      console.log("unsupported file type", extension);
    }
  };

  const parseZipFile = (arrayBuffer) => {
    // Use shpjs to parse shapefiles from the ArrayBuffer
    const shapefileData = shp.parseZip(arrayBuffer);
    const geoJSON = {
      type: 'FeatureCollection',
      features: shapefileData.features,
    };
    setGeoJSONData(geoJSON);
  };

function FlyMapTo(bounds) {
  useEffect(() => {
    if (map != null)
      map.flyTo(view.center, view.zoom);
  }, [view])
}

useEffect(() => {
  if (geoJSONData) {
    const bounds = new L.GeoJSON(geoJSONData).getBounds();
    setView({center: bounds.getCenter(), zoom: map.getBoundsZoom(bounds)});
  }
}, [geoJSONData])

  return (
    <div>
      <input
        type="file"
        accept=".zip,.geojson,.json,.kml"
        onChange={handleUpload}
        id="fileInput"
      />
      <div>
        <MapContainer
          center={view.center}
          zoom={view.zoom}
          style={{ height: '400px' }} // Set an explicit height for the map container
          whenCreated={onMapReady}
          ref={setMap}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {geoJSONData && <GeoJSON key={Math.random()} data={geoJSONData} />}
          <FlyMapTo/>
        </MapContainer>
      </div>
    </div>
  );
};

export default TestMap;
