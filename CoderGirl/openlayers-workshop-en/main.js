import 'ol/ol.css';
import GeoJSON from 'ol/format/geojson';
import Map from 'ol/map';
import VectorLayer from 'ol/layer/vector';
import VectorSource from 'ol/source/vector';
import View from 'ol/view';
import sync from 'ol-hashed';
import DragDrop from 'ol/interaction/draganddrop';
import Modify from 'ol/interaction/modify';
import Draw from 'ol/interaction/draw';
import snap from 'ol/interaction/snap';
import Fill from 'ol/style/fill';
import Stroke from 'ol/style/stroke';
import Style from 'ol/style/style';
import colormap from 'colormap';
import sphere from 'ol/sphere';
import Snap from 'ol/interaction/snap';

const source = new VectorSource();
const map = new Map({
  target: 'map-container',
  layers: [
    //new VectorLayer ({
      //source: new VectorSource({
        //format: new GeoJSON(),
        //url: './data/countries.json'
      //})
    //})
  ],
  view: new View({
    center: [0, 0],
    zoom: 2
  })
});

const min = 1e8; // the smallest area
const max = 2e13; // the biggest area
const steps = 50;
const ramp = colormap({
  colormap: 'blackbody',
  nshades: steps
});

function clamp(value, low, high) {
  return Math.max(low, Math.min(value, high));
}

function getColor(feature) {
  const area = sphere.getArea(feature.getGeometry());
  const f = Math.pow(clamp((area - min) / (max - min), 0, 1), 1 / 2);
  const index = Math.round(f * (steps - 1));
  return ramp[index];
}

const layer = new VectorLayer({
  source: source,
  style: function(feature) {
    return new Style({
      fill: new Fill({
        color: getColor(feature)
      }),
      stroke: new Stroke({
        color: 'rgba(255,255,255,0.8)'
      })
    });
  }
});


const clear = document.getElementById('clear');
clear.addEventListener('click', function() {
  source.clear();
});

const format = new GeoJSON({featureProjection: 'EPSG:3857'});
const download = document.getElementById('download');
source.on('change', function() {
  const features = source.getFeatures();
  const json = format.writeFeatures(features);
  download.href = 'data:text/json;charset=utf-8,' + json;
});

map.addLayer(layer);

map.addInteraction(new DragDrop({
  source: source,
  formatConstructors: [GeoJSON]
}));

map.addInteraction(new Draw({
  type: 'Polygon',
  source: source
}));

map.addInteraction(new Snap({
  source: source
}));

map.addInteraction(new Modify({
  source: source
}));

sync(map);
