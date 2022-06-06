import {Injectable} from '@angular/core';
import {ImageReq} from "../dtos/image-req";
import {HttpClient} from "@angular/common/http";
import {DrawService} from "./map/draw.service";
import {ImageType} from "../models/image-type";
import {GeoTiffService} from "./map/geo-tiff.service";
import {environment} from "../../environments/environment";
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  private imageBaseUrl = environment.apiUrl + "/images/geotiff";

  private imageType: ImageType = ImageType.TCI;
  private selectedItemId$ = new BehaviorSubject<string>("");
  private loading$ = new BehaviorSubject<boolean>(false);
  private error$ = new BehaviorSubject<string>("");

  constructor(
    private httpClient: HttpClient,
    private drawService: DrawService,
    private geoTiffService: GeoTiffService
  ) { }

  public getImageType(): ImageType {
    return this.imageType;
  }

  public getSelectedItemId(): Observable<string> {
    return this.selectedItemId$.asObservable();
  }

  public isLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  public getError(): Observable<string> {
    return this.error$.asObservable();
  }

  public setItemId(id: string) {
    this.selectedItemId$.next(id);
    this.fetchImage();
  }

  public setImageType(type: ImageType) {
    this.imageType = type;
    this.fetchImage();
  }

  public removeLoadedImage() {
    this.geoTiffService.removeGeoTiffLayer();
    this.selectedItemId$.next("");
  }

  private fetchImage(): void {

    const aoi = this.drawService.getLastDrawing();

    if (!this.selectedItemId$.value || !aoi) {
      return;
    }

    const body: ImageReq = {
      itemId: this.selectedItemId$.value,
      imageType: this.imageType,
      areaOfInterest: aoi
    }

    this.loading$.next(true);
    this.error$.next("");

    this.httpClient.post<Blob>(
     this.imageBaseUrl,
     body,
     {
       responseType: 'blob' as 'json'
     }
    ).subscribe({
     next: image => {
       this.geoTiffService.addGeoTiffLayer(image, this.imageType)
         .then(() => {
           this.loading$.next(false);
         });
     },
     error: err => {
       console.log(err);
       this.error$.next("could not fetch image for item: " + this.selectedItemId$.value);
       this.loading$.next(false);
       this.geoTiffService.removeGeoTiffLayer();
     }
    })
  }

}
