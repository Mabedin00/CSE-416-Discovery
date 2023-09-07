import React, { useState, useEffect} from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import * as shapefile from 'shapefile';
import toGeoJSON from 'togeojson';
import { geoJSON } from 'leaflet';
import { useMap } from 'react-leaflet';
import shp from 'shpjs';

function StartScreen() {
    const [geoJsonData, setGeoJsonData] = useState(null);
    const [center, setCenter] = useState([50.5, 30.5]);

    const onFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        let reader = new FileReader();

        reader.onload = async (event) => {
            let content = event.target.result;

            if (file.name.endsWith('.zip')) {
                // Assuming it's a Shapefile
                // const geojson = await convertShapefileToGeoJSON(file);
                // setGeoJsonData(geojson);
                console.log("Coming Soon");
            } else if (file.name.endsWith('.geojson') || file.name.endsWith('.json')) {
                setGeoJsonData(JSON.parse(content));
            } else if (file.name.endsWith('.kml')) {
                // Convert KML to GeoJSON
                const parser = new DOMParser();
                const kml = parser.parseFromString(content, 'text/xml');
                const converted = toGeoJSON.kml(kml);
                setGeoJsonData(converted);
            }
        };

        if (file.name.endsWith('.zip')) {
            reader.readAsArrayBuffer(file);
        } else {
            reader.readAsText(file);
        }
    };
    


    async function convertShapefileToGeoJSON(file) {
        const arrayBuffer = await file.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        console.log("data:", data);
        const geojson = await shapefile.read(data);
        return geojson;
      }

    useEffect(() => {
        if (geoJsonData) {
            const bounds = geoJSON(geoJsonData).getBounds();
            console.log("geoJsonData center:", bounds.getCenter());
            setCenter(bounds.getCenter());
        }
    }, [geoJsonData]);

    function SetViewTo() {

        const map = useMap()
    
        useEffect(() => {
            map.setView(center)
        }, [center])
    
        return null
    }

    return (
        <div>
            <input type="file" onChange={onFileChange} />
            
            {geoJsonData && (
                <MapContainer center={center} zoom={13} style={{ height: "500px", width: "100%" }}>
                    <SetViewTo/>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <GeoJSON data={geoJsonData} />
                </MapContainer>
            )}
        </div>
    );
}

export default StartScreen;
