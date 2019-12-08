import { Component, OnInit, AfterViewInit } from '@angular/core';

// import 'ol/ol.css';
import { Map, View } from 'ol';
import GeoJSON from 'ol/format/GeoJSON';
import OSM from 'ol/source/OSM';

import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { Tile as TileLayer } from 'ol/layer';
import Overlay from 'ol/Overlay';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  map: any;
  vectorSource;
  pointsLayer: any;
  literalStyle: any;
  pointStyle = {
    HN: new Style({
      image: new CircleStyle({
        radius: 20,
        fill: new Fill({ color: 'red' }),
        stroke: new Stroke({ color: 'yellow', width: 1 })
      })
    }),
    HCM: new Style({
      image: new CircleStyle({
        radius: 10,
        fill: new Fill({ color: 'yellow' }),
        stroke: new Stroke({ color: 'red', width: 1 })
      })
    })
  };
  container;
  content;
  closer;
  overlay;

  constructor() { }
  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.container = document.getElementById('popup');
    this.content = document.getElementById('popup-content');
    this.closer = document.getElementById('popup-closer');
    this.closer.addEventListener('click', () => {
      this.overlay.setPosition(undefined);
      this.closer.blur();
      return false;
    });
    this.overlay = new Overlay({
      element: this.container,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    });
    this.initializeMap();
    this.refreshLayer();
    this.map.on('pointermove', (e) => {
      if (e.dragging) {
        return;
      }

      const pixel = this.map.getEventPixel(e.originalEvent);
      const hit = this.map.hasFeatureAtPixel(pixel);

      if (hit) {
        const currentFeature = this.map.getFeaturesAtPixel(pixel)[0];
        const city = currentFeature.get('city');
        const country = currentFeature.get('country');
        this.content.innerHTML = `<div>${city} - ${country}</div>`;
        this.overlay.setPosition(e.coordinate);
      }

      this.map.getTarget().style.cursor = hit ? 'pointer' : '';
    });
  }

  initializeMap(): void {
    this.vectorSource = new VectorSource({
      url: '../assets/data.json',
      format: new GeoJSON(),
      wrapX: false
    });
    this.map = new Map({
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      overlays: [this.overlay],
      target: document.getElementById('map'),
      view: new View({
        center: [0, 0],
        zoom: 2
      })
    });
  }
  refreshLayer() {
    const previousLayer = this.pointsLayer;
    this.pointsLayer = new VectorLayer({
      source: this.vectorSource,
      style: (feature) => {
        return feature.get('city').includes('Ho Chi Minh') ? this.pointStyle.HCM : this.pointStyle.HN;
      }
    });
    this.map.addLayer(this.pointsLayer);

    if (previousLayer) {
      this.map.removeLayer(previousLayer);
      previousLayer.dispose();
    }
  }
}
