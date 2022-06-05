import { Injectable } from '@angular/core';
import {View, Map} from "ol";
import TileLayer from "ol/layer/Tile";
import {OSM} from "ol/source";
import {fromLonLat} from "ol/proj";
import {Attribution, MousePosition, Rotate, ScaleLine, Zoom, ZoomSlider} from "ol/control";
import {createStringXY} from "ol/coordinate";

@Injectable({
  providedIn: 'root'
})
export class MapService {

  private map: Map;

  constructor() {
    this.initMap();
  }

  public getMap(): Map {
    return this.map;
  }

  private initMap(): void {

    this.map = new Map({
      view: new View({
        center: fromLonLat([15, 48]),
        zoom: 4,
      }),
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      controls: [
        new Zoom(),
        new Rotate(),
        new Attribution(),
        new ScaleLine(),
        new ZoomSlider(),
        new MousePosition({
          projection: 'EPSG:4326',
          coordinateFormat: createStringXY(5)
        })
      ]
    });

    console.log('map loaded')
  }
}
