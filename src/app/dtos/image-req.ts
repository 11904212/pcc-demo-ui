import {GeoJSONGeometry, GeoJSONGeometryCollection} from "ol/format/GeoJSON";

export interface ImageReq {
  areaOfInterest: GeoJSONGeometry | GeoJSONGeometryCollection;
  itemId: string;
  imageType: 'visual' | 'ndvi';
}
