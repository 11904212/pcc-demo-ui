import {GeoJSONGeometry, GeoJSONGeometryCollection} from "ol/format/GeoJSON";
import {ImageType} from "./image-type";

export interface ImageReq {
  areaOfInterest: GeoJSONGeometry | GeoJSONGeometryCollection;
  itemId: string;
  imageType: ImageType;
}
