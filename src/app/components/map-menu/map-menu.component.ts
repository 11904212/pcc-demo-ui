import { Component } from '@angular/core';
import {LayerService} from "../../services/map/layer.service";
import {Layer} from "ol/layer";
import {DrawService} from "../../services/map/draw.service";

@Component({
  selector: 'app-layer-switcher',
  templateUrl: './map-menu.component.html',
  styleUrls: ['./map-menu.component.scss']
})
export class MapMenuComponent {

  layers = this.layerService.getLayers();

  readonly $userIsDrawing = this.drawService.isDrawing();

  constructor(
    private layerService: LayerService,
    private drawService: DrawService
  ) { }

  public selectLayer(layer: Layer): void {
    this.layerService.switchLayer(layer);
  }

  public toggleDrawing(){
    this.drawService.toggleDrawing();
  }

}
