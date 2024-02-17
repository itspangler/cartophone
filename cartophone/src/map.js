// src/map.js

import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import { Vector as VectorSource } from 'ol/source';
import { Icon, Style } from 'ol/style';
import * as Tone from 'tone'
import Graticule from 'ol/layer/Graticule.js';
import Feature from 'ol/Feature.js';
import { Point } from 'ol/geom';
import Interaction from 'ol/interaction/Interaction.js';
import GeoJSON from 'ol/format/GeoJSON';
import { notes } from './notes'
import { useGeographic } from 'ol/proj.js';

const synth = new Tone.PolySynth(Tone.Synth).toDestination();

export function initMap() {
    const map = new Map({
        target: 'map',
        layers: [
            new TileLayer({
                source: new OSM(),
            }),
        ],
        view: new View({
            center: [0, 0],
            zoom: 2,
        }),
    });

    const graticule = new Graticule({
        map: map,
        targetSize: 100,
        maxLines: 500,
        minLines: 100,
        showLabels: true,
        wrapX: false,
    });

    map.addControl(graticule);

    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
        source: vectorSource,
    });

    map.addLayer(vectorLayer);

    map.on('click', function (event) {
        const mapExtent = map.getView().calculateExtent()
        const coordinate = event.coordinate;

        const minY = mapExtent[0]
        const minX = mapExtent[1]
        const maxY = mapExtent[2]
        const maxX = mapExtent[3]

        const maxHz = 2093.004
        const minHz = 65.40639

        const coordY = Math.abs(coordinate[0])
        const coordX = Math.abs(coordinate[1])

        const inputStart = minX
        const inputEnd = maxX + 1
        const outputStart = minHz
        const outputEnd = maxHz

        const slope = (outputEnd - outputStart) / (inputEnd - inputStart)
        const output = outputStart + slope * (coordX - inputStart)

        const closest = notes.reduce(function (prev, curr) {
            return (Math.abs(curr - output) < Math.abs(prev - output / maxHz) ? curr : prev);
        });

        console.log(closest);

        const now = Tone.now()
        synth.triggerAttackRelease(closest, "8n");
        map.getView().calculateExtent(map.getSize())

        const pointFeature = new Feature({
            geometry: new Point(coordinate),
        });
        vectorSource.addFeature(pointFeature);

        // Event listener for file input change
        const fileInput = document.getElementById('file-input');
        fileInput.addEventListener('change', handleFileSelect);

        function handleFileSelect(event) {
            useGeographic()
            const file = event.target.files[0];

            if (file) {
                // Read the GeoJSON file
                const reader = new FileReader();
                reader.onload = function (e) {
                    const geojsonText = e.target.result;

                    // Parse GeoJSON and add it as a layer to the map
                    const geojsonFormat = new GeoJSON();
                    const features = geojsonFormat.readFeatures(geojsonText);

                    vectorSource.clear(); // Clear existing features
                    vectorSource.addFeatures(features);

                    // Zoom to the extent of the GeoJSON features
                    const extent = vectorSource.getExtent();
                    map.getView().fit(extent, { padding: [20, 20, 20, 20], maxZoom: 15 });
                };

                reader.readAsText(file);
            }
        }
    });
}
