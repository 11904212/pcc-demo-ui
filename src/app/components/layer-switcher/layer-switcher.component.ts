import { Component, OnInit } from '@angular/core';
import {LayerService} from "../../services/layer.service";
import {Layer} from "ol/layer";

@Component({
  selector: 'app-layer-switcher',
  templateUrl: './layer-switcher.component.html',
  styleUrls: ['./layer-switcher.component.scss']
})
export class LayerSwitcherComponent implements OnInit {

  layers: Layer[];

  constructor(
    private layerService: LayerService
  ) { }

  ngOnInit(): void {
    this.layers = this.layerService.getLayers();
  }

  public selectLayer(layer: Layer): void {
    this.layerService.switchLayer(layer);
  }

}
