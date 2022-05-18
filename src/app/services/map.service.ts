import { Injectable } from '@angular/core';
import {View, Map} from "ol";
import TileLayer from "ol/layer/Tile";
import {OSM} from "ol/source";
import {fromLonLat} from "ol/proj";

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
      ]
    });

    console.log('map loaded')
  }
}
