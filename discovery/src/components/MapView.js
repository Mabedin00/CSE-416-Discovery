import React, { useState, useRef } from "react";
import L, { popup } from "leaflet";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
  Marker,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import toGeoJSON from "@mapbox/togeojson";
import "leaflet/dist/images/marker-shadow.png";
import { ZipReader } from "@zip.js/zip.js";
import { BlobReader, Uint8ArrayWriter } from "@zip.js/zip.js";
import shpjs from "shpjs";

function MapView() {
  const [geojsonData, setGeojsonData] = useState(null);

  const mapRef = useRef(null);

  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  });

  const onFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.name.endsWith(".kml")) {
        const reader = new FileReader();
        reader.onload = function (evt) {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(evt.target.result, "text/xml");
          const data = toGeoJSON.kml(xmlDoc);
          handleGeoJSONData(data);
        };
        reader.readAsText(file);
      } else if (
        file.name.endsWith(".geojson") ||
        file.name.endsWith(".json")
      ) {
        const reader = new FileReader();
        reader.onload = function (evt) {
          const data = JSON.parse(evt.target.result);
          handleGeoJSONData(data);
        };
        reader.readAsText(file);
      } else if (file.name.endsWith(".zip")) {
        // Using zip.js to handle the ZIP file
        const zipReader = new ZipReader(new BlobReader(file));
        const entries = await zipReader.getEntries();
        const requiredExtensions = ["shp", "shx", "dbf"];
        const presentExtensions = entries.map((entry) =>
          entry.filename.split(".").pop().toLowerCase()
        );

        const missingFiles = requiredExtensions.filter(
          (ext) => !presentExtensions.includes(ext)
        );

        if (missingFiles.length > 0) {
          alert(
            `ZIP file is missing the following shapefile components: ${missingFiles.join(
              ", "
            )}.`
          );
          return;
        }

        // Extract the necessary shapefile components
        const shpEntry = entries.find((entry) =>
          entry.filename.endsWith(".shp")
        );
        const shxEntry = entries.find((entry) =>
          entry.filename.endsWith(".shx")
        );
        const dbfEntry = entries.find((entry) =>
          entry.filename.endsWith(".dbf")
        );

        const shpBuffer = await shpEntry.getData(new Uint8ArrayWriter());
        const shxBuffer = await shxEntry.getData(new Uint8ArrayWriter());
        const dbfBuffer = await dbfEntry.getData(new Uint8ArrayWriter());

        const shpObject = shpjs.parseShp(shpBuffer);
        const dbfObject = shpjs.parseDbf(dbfBuffer);

        // Process with shpjs
        const geojsonFeatures = shpObject.map((geometry, index) => ({
          type: "Feature",
          geometry: geometry,
          properties: dbfObject[index],
        }));

        const combinedGeoJSON = {
          type: "FeatureCollection",
          features: geojsonFeatures,
        };

        console.log("Combined GeoJSON:", combinedGeoJSON);

        handleGeoJSONData(combinedGeoJSON);

        zipReader.close();
      } else {
        alert("Unsupported file type.");
      }
    }
  };

  const handleGeoJSONData = (data) => {
    const bounds = L.geoJSON(data).getBounds();
    if (mapRef.current && mapRef.current.leafletElement) {
      mapRef.current.leafletElement.fitBounds(bounds);
    }
    setGeojsonData(data);
  };

  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
        // console.log(feature.properties);
      let popupContent = "<div>";

      if (feature.properties.name) {
        popupContent += `<strong>${feature.properties.name}</strong><hr>`;
      } else if (feature.properties.NAME) {
        popupContent += `<strong>${feature.properties.NAME}</strong><hr>`;
      }
      if (feature.properties.image) {
        popupContent += `<img src="${feature.properties.image}" alt="${feature.properties.name}" style="width:100%;"><br>`;
      }
      
    let bannedKeys = ["name", "NAME", "styleUrl", "styleHash", "styleMapHash"]; //properties to not include in popups
    if (Object.keys(feature.properties).filter(item => !bannedKeys.includes(item)).length) {
        popupContent += '<p>Extra Info:</p><table>';
        for (let key in feature.properties) {
            if (feature.properties.hasOwnProperty(key) && !bannedKeys.includes(key) && feature.properties[key] != null) {
                popupContent += '<tr>';
                    popupContent += `<td>${key}</td>`;
                    popupContent += `<td>${feature.properties[key]}</td>`;
                popupContent += '</tr>';
            }
        }
        popupContent += '</table>';
    }
      popupContent += '</div>';
      layer.bindPopup(popupContent);
    }
  };

  function MapInstance() {
    const map = useMap();
    if (geojsonData) {
      const bounds = L.geoJSON(geojsonData).getBounds();
      map.fitBounds(bounds);
      mapRef.current = map;
    }
    return null;
  }

  return (
    <div style={{ width: "100%", height: "80vh" }}>
      <input type="file" onChange={onFileChange} />
      {geojsonData && (
        <MapContainer
          center={[0,0]}
          zoom={13}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <GeoJSON
            key={Math.random()}
            data={geojsonData}
            onEachFeature={onEachFeature}
          />
          <MapInstance />
        </MapContainer>
      )}
    </div>
  );
}

export default MapView;
