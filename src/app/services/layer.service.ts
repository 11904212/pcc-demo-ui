import { Injectable } from '@angular/core';
import {Layer, Tile} from "ol/layer";
import {OSM, Stamen} from "ol/source";
import {MapService} from "./map.service";

@Injectable({
  providedIn: 'root'
})
export class LayerService {

  private layers: Layer[];

  constructor(
    private mapService: MapService
  ) {
    this.initLayers();
  }

  public getLayers(): Layer[] {
    return this.layers;
  }

  public switchLayer(layer: Layer): void {
    if (this.layers.includes(layer)) {
      this.layers.forEach(entry =>
        entry.setVisible(entry === layer)
      )
    }
  }

  private initLayers(): void {
    const osmLayer = new Tile({
      source: new OSM(),
      visible: true,
      className: 'osm'
    });

    const stamenLayer = new Tile({
      source: new Stamen({
        layer: 'terrain'
      }),
      visible: false,
      className: 'stamen'
    });

    this.layers = [ osmLayer, stamenLayer ];

    const map = this.mapService.getMap();
    this.layers.forEach(layer => map.addLayer(layer));

  }
}
