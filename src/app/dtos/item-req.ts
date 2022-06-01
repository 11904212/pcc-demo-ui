import {GeoJSONGeometry, GeoJSONGeometryCollection} from "ol/format/GeoJSON";

export interface ItemReq {
  collections: string[];
  dateTimeFrom: string;
  areaOfInterest: GeoJSONGeometry | GeoJSONGeometryCollection;
  dateTimeTo?: string;
  limit?: number;
  filterCloudy?: boolean;
}
