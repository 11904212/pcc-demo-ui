import {Injectable} from '@angular/core';
import {ImageReq} from "../dtos/image-req";
import {HttpClient} from "@angular/common/http";
import {DrawService} from "./map/draw.service";
import {ImageType} from "../models/image-type";
import {GeoTiffService} from "./map/geo-tiff.service";

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  private imageBaseUrl = "http://localhost:8080/v1/images/geotiff";
  private itemId: string;
  private imageType: ImageType = ImageType.TCI;

  constructor(
    private httpClient: HttpClient,
    private drawService: DrawService,
    private geoTiffService: GeoTiffService
  ) { }

  public getImageType(): ImageType {
    return this.imageType;
  }

  public setItemId(id: string) {
    this.itemId = id;
    this.fetchImage();
  }

  public setImageType(type: ImageType) {
    this.imageType = type;
    this.fetchImage();
  }

  private fetchImage(): void {

    const aoi = this.drawService.getLastDrawing();

    if (!this.itemId || !aoi) {
      return;
    }

    const body: ImageReq = {
      itemId: this.itemId,
      imageType: this.imageType,
      areaOfInterest: aoi
    }

     this.httpClient.post<Blob>(
       this.imageBaseUrl,
       body,
       {
         responseType: 'blob' as 'json'
       }
     ).subscribe({
       next: image => {
         this.geoTiffService.addGeoTiffLayer(image, this.imageType);
       },
       error: err => {
         console.log(err)
         this.geoTiffService.removeGeoTiffLayer();
       }
     })
  }

}
