// src/map.js

// imports 

import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import { Vector as VectorSource } from 'ol/source';
import * as Tone from 'tone'
import Graticule from 'ol/layer/Graticule.js';
import Feature from 'ol/Feature.js';
import { Point } from 'ol/geom';
import GeoJSON from 'ol/format/GeoJSON';
import { notes } from './notes'
import { useGeographic } from 'ol/proj.js';
import { setup, draw, mousePressed } from './sketch';

// define synth
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
        maxLines: 100,
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

        // get map extent and coordinates
        // so we can compute notes based on it

        const mapExtent = map.getView().calculateExtent()
        const coordinate = event.coordinate;
        // const minY = mapExtent[0]
        const minX = mapExtent[1]
        // const maxY = mapExtent[2]
        const maxX = mapExtent[3]
        // const coordY = Math.abs(coordinate[0])
        const coordX = Math.abs(coordinate[1])

        // set max and min desired hertz values
        // the max is set to double my desired right now
        // because for some reason it gets halved on the map
        // idk

        const maxHz = 2093.004
        const minHz = 65.40639

        // calculate slope so we can map
        // range of extent to range of desired hertz values

        const inputStart = minX
        const inputEnd = maxX + 1
        const outputStart = minHz
        const outputEnd = maxHz

        const slope = (outputEnd - outputStart) / (inputEnd - inputStart)
        const raw = outputStart + slope * (coordX - inputStart)

        // slope function to round the raw value to
        // the nearest real note in `notes` array

        const rounded = notes.reduce(function (prev, curr) {
            return (Math.abs(curr - raw) < Math.abs(prev - raw / maxHz) ? curr : prev);
        });

        // play the tone

        const now = Tone.now()
        synth.triggerAttackRelease(rounded, "8n");

        // place the point

        const pointFeature = new Feature({
            geometry: new Point(coordinate),
        });
        vectorSource.addFeature(pointFeature);

    });

    // get geojson from user

    const fileInput = document.getElementById('file-input');
    fileInput.addEventListener('change', handleFileSelect);
    function handleFileSelect(event) {
        useGeographic()
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const geojsonText = e.target.result;
                const geojsonFormat = new GeoJSON();
                const features = geojsonFormat.readFeatures(geojsonText);
                vectorSource.addFeatures(features);
                const extent = vectorSource.getExtent();
                map.getView().fit(extent, { padding: [20, 20, 20, 20], maxZoom: 15 });
            };
            reader.readAsText(file);
        }
    }
}
