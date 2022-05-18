import { Component, OnInit } from '@angular/core';
import {LayerService} from "../../services/layer.service";
import {Layer} from "ol/layer";
import {DrawService} from "../../services/draw.service";

@Component({
  selector: 'app-layer-switcher',
  templateUrl: './map-menu.component.html',
  styleUrls: ['./map-menu.component.scss']
})
export class MapMenuComponent implements OnInit {

  layers = this.layerService.getLayers();

  readonly $userIsDrawing = this.drawService.isDrawing();

  constructor(
    private layerService: LayerService,
    private drawService: DrawService
  ) { }

  ngOnInit(): void {
  }

  public selectLayer(layer: Layer): void {
    this.layerService.switchLayer(layer);
  }

  public toggleDrawing(){
    this.drawService.toggleDrawing();
  }

}
