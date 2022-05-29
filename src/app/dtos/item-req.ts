import {GeoJSONGeometry, GeoJSONGeometryCollection} from "ol/format/GeoJSON";

export interface ItemReq {
  collections: string[];
  dateTimeFrom: string;
  aresOfInterest: GeoJSONGeometry | GeoJSONGeometryCollection;
  dateTimeTo?: string;
  limit?: number;
}
