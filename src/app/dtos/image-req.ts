import {GeoJSONGeometry, GeoJSONGeometryCollection} from "ol/format/GeoJSON";
import {ImageType} from "../models/image-type";

export interface ImageReq {
  areaOfInterest: GeoJSONGeometry | GeoJSONGeometryCollection;
  itemId: string;
  imageType: ImageType;
}
