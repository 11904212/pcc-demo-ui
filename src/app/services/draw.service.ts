import { Injectable } from '@angular/core';
import {MapService} from "./map.service";
import VectorSource from "ol/source/Vector";
import {Draw, Modify, Snap} from "ol/interaction";
import Map from 'ol/Map';
import VectorLayer from "ol/layer/Vector";
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DrawService {

  private map: Map;
  private drawSource: VectorSource;
  private drawingInteraction: Draw;

  private $userIsDrawing = new BehaviorSubject<boolean>(false);


  constructor(
    private mapService: MapService
  ) {
    this.map = this.mapService.getMap();
    this.initDraw();
  }

  public isDrawing(): Observable<boolean> {
    return this.$userIsDrawing;
  }

  public toggleDrawing(): void {
    if (this.$userIsDrawing.getValue()) {
      this.endDrawing();
    } else {
      this.startDrawing();
    }
  }

  public startDrawing(): void {
    this.map.addInteraction(this.drawingInteraction);
    this.$userIsDrawing.next(true);
  }

  public endDrawing(): void {
    this.map.removeInteraction(this.drawingInteraction);
    this.$userIsDrawing.next(false);
  }

  private undoLastPoint():void {
    if (this.drawingInteraction){
      this.drawingInteraction.removeLastPoint();
    }
  }

  private initDraw(): void {
    this.drawSource = new VectorSource();

    const drawing = new VectorLayer({
      source: this.drawSource,
    });

    this.map.addLayer(drawing);

    const snap = new Snap({
      source: this.drawSource
    });
    this.map.addInteraction(snap);

    const modify = new Modify({source: this.drawSource});
    this.map.addInteraction(modify);

    this.drawingInteraction = new Draw({
      source: this.drawSource,
      type: "Polygon",
      condition: e => {
        const buttonCode = e.originalEvent.button;
        if (buttonCode === 2) {
          this.undoLastPoint();
          return false;
        }
        return true;
      }
    });

    // prevent multipolygon by clearing the layer on start
    this.drawingInteraction.on("drawstart", () => this.drawSource.clear());
  }
}
