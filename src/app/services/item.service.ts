import { Injectable } from '@angular/core';
import {BehaviorSubject, filter, Observable} from "rxjs";
import {ItemInfoDto} from "../dtos/item-info-dto";
import {HttpClient} from "@angular/common/http";
import {DrawService} from "./map/draw.service";
import {ItemReq} from "../dtos/item-req";
import {ItemInfo} from "../models/item-info";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  private itemBaseUrl = environment.apiUrl + "/items";

  private loading$ = new BehaviorSubject<boolean>(false);
  private items$ = new BehaviorSubject<ItemInfo[]>([]);
  private error$ = new BehaviorSubject<string>("");

  private collections: string[] = ['sentinel-2-l2a'];
  private dateRangeStart: Date;
  private dateRangeEnd: Date;
  private filterCloudy: boolean = true;

  constructor(
    private httpClient: HttpClient,
    private drawService: DrawService
  ) {
    this.drawService.isDrawing().pipe(
      filter(isDrawing => isDrawing)
    ).subscribe(() => this.resetState());
  }

  public isLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  public getItems(): Observable<ItemInfo[]> {
    return this.items$.asObservable();
  }

  public getError(): Observable<string> {
    return this.error$.asObservable();
  }

  public setCollection(collection: string[]):void {
    this.collections = collection;
  }

  public setDateRange(start: Date, end: Date):void {
    this.dateRangeStart = start;
    this.dateRangeEnd = end;
  }

  public setFilterCloudy(filterCloudy: boolean):void {
    this.filterCloudy = filterCloudy;
  }

  public loadItems(): void {
    const aoi = this.drawService.getLastDrawing();

    if (!this.validateInput() || !aoi) {
      return;
    }

    this.loading$.next(true);

    const body: ItemReq = {
      areaOfInterest: this.drawService.getLastDrawing(),
      collections: this.collections,
      dateTimeFrom: this.dateRangeStart.toISOString(),
      dateTimeTo: this.dateRangeEnd.toISOString(),
      filterCloudy: this.filterCloudy
    }

    this.httpClient.post<ItemInfoDto[]>(
      this.itemBaseUrl,
      body
    ).subscribe({
      next: value => {
        this.items$.next(value.map(item => ItemService.mapDtoToModel(item)));
        this.error$.next("");
        this.loading$.next(false);
      },
      error: err => {
        console.log(err);
        if (err.status === 404) {
          this.error$.next("could not find item in date range");
        } else {
          this.error$.next("could not fetch item from backend");
        }
        this.loading$.next(false);
      }
    });
  }

  private resetState():void {
    this.items$.next([]);
    this.error$.next("");
    this.loading$.next(false);
  }

  private validateInput(): boolean {

    if (!this.collections|| this.collections.length <= 0) {
      this.error$.next("a collection must be selected");
      return false;
    }

    if (!this.dateRangeStart || !this.dateRangeEnd) {
      this.error$.next("date range is not set");
      return false;
    }

    if (this.dateRangeStart > this.dateRangeEnd) {
      this.error$.next("invalid date range, start can not be after end");
      return false;
    }

    const aoi = this.drawService.getLastDrawing();
    if (!aoi) {
      this.error$.next("pleas draw an area of interest");
      return false;
    }

    return true;

  }

  private static mapDtoToModel(dto: ItemInfoDto): ItemInfo {
    const date = new Date(dto.dateTime);
    return  {
      ...dto,
      dateTime: date
    };
  }


}
