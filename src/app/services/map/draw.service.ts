import { Injectable } from '@angular/core';
import {MapService} from "./map.service";
import VectorSource from "ol/source/Vector";
import {Draw, Modify, Snap} from "ol/interaction";
import Map from 'ol/Map';
import VectorLayer from "ol/layer/Vector";
import {BehaviorSubject, Observable} from "rxjs";
import {GeoJSON, WKT} from "ol/format";
import {GeoJSONGeometry, GeoJSONGeometryCollection} from "ol/format/GeoJSON";
import {Geometry} from "ol/geom";
import {environment} from "../../../environments/environment";
import {Feature} from "ol";

@Injectable({
  providedIn: 'root'
})
export class DrawService {

  private map: Map;
  private drawSource: VectorSource;
  private interactionDraw: Draw;
  private interactionSnap: Snap;
  private interactionModify: Modify;

  private $userIsDrawing = new BehaviorSubject<boolean>(false);


  constructor(
    private mapService: MapService
  ) {
    this.map = this.mapService.getMap();
    this.initDraw();
    this.loadDefaultPolygon();
  }

  public isDrawing(): Observable<boolean> {
    return this.$userIsDrawing.asObservable();
  }

  public toggleDrawing(): void {
    if (this.$userIsDrawing.getValue()) {
      this.endDrawing();
    } else {
      this.startDrawing();
    }
  }

  public startDrawing(): void {
    this.addInteractions();
    this.$userIsDrawing.next(true);
  }

  public endDrawing(): void {
    this.removeInteractions();
    this.$userIsDrawing.next(false);
  }

  public getLastDrawing(): GeoJSONGeometry | GeoJSONGeometryCollection | undefined {
    const geoJson = new GeoJSON()

    let result = undefined;

    this.drawSource.getFeatures().forEach(feature => {
      const geom: Geometry | undefined  = feature.getGeometry();
      if (geom !== undefined) {
        const geomClone = geom.clone();
        geomClone.transform(environment.crsMap,environment.crsApi)
        result = geoJson.writeGeometryObject(geomClone);
      }
    });
    return result;
  }

  public getDrawingVectorSource(): VectorSource {
    return this.drawSource;
  }

  private addInteractions():void {
    this.map.addInteraction(this.interactionDraw);
    this.map.addInteraction(this.interactionSnap);
    this.map.addInteraction(this.interactionModify);
  }

  private removeInteractions():void {
    this.map.removeInteraction(this.interactionDraw);
    this.map.removeInteraction(this.interactionSnap);
    this.map.removeInteraction(this.interactionModify);
  }

  private undoLastPoint():void {
    if (this.interactionDraw){
      this.interactionDraw.removeLastPoint();
    }
  }

  private initDraw(): void {
    this.drawSource = new VectorSource();

    const drawing = new VectorLayer({
      source: this.drawSource,
      visible: true
    });

    drawing.setZIndex(10);

    this.map.addLayer(drawing);

    this.interactionSnap = new Snap({
      source: this.drawSource
    });

    this.interactionModify= new Modify({source: this.drawSource});

    this.interactionDraw = new Draw({
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
    this.interactionDraw.on("drawstart", () => this.drawSource.clear());

    // end drawing on double click
    this.interactionDraw.on("drawend", () => this.endDrawing());
  }

  private loadDefaultPolygon(){
    const wkt = environment.defaultPolygon;
    if (wkt) {
      const wktReader = new WKT();

      const feature: Feature = wktReader.readFeature(wkt, {
        dataProjection: environment.crsApi,
        featureProjection: environment.crsMap,
      });
      if (!feature){
        console.log("could not read default polygon");
        return;
      }
      this.drawSource.addFeature(feature);

      const geometry = feature.getGeometry();
      if (!geometry) {
        return;
      }

      const extend = geometry.getExtent();
      if (!extend) {
        return;
      }

      this.mapService.getMap().getView().fit(
        extend,
        {
          duration: 1000
        }
      )
    }
  }
}
