import {GeoJSONGeometry, GeoJSONGeometryCollection} from "ol/format/GeoJSON";

export interface StatsReq {
  areaOfInterest: GeoJSONGeometry | GeoJSONGeometryCollection;
  itemIds: string[];
}
