import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {ItemInfoDto} from "../dtos/item-info-dto";
import {HttpClient} from "@angular/common/http";
import {DrawService} from "./draw.service";
import {ItemReq} from "../dtos/item-req";
import {ItemInfo} from "../models/item-info";

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  private itemBaseUrl = "http://localhost:8080/v1/items";

  private $loading = new BehaviorSubject<boolean>(false);
  private $items = new Subject<ItemInfo[]>();
  private $error = new Subject<string>();

  private collections: string[];
  private dateTimeFrom: Date;
  private dateTimeTo: Date;
  private items: ItemInfo[] = [];

  constructor(
    private httpClient: HttpClient,
    private drawService: DrawService
  ) { }

  public $isLoading(): Observable<boolean> {
    return this.$loading.asObservable();
  }

  public $getItems(): Observable<ItemInfo[]> {
    return this.$items.asObservable();
  }

  public $getError(): Observable<string> {
    return this.$error.asObservable();
  }

  public setCollection(collection: string[]):void {
    this.collections = collection;
  }

  public setDateTimeFrom(date: Date):void {
    this.dateTimeFrom = date;
  }

  public setDateTimeTo(date: Date):void {
    this.dateTimeTo = date;
  }

  public loadItems(): void {
    if (!this.validateInput()) {
      return;
    }

    this.$loading.next(true);

    const body: ItemReq = {
      areaOfInterest: this.drawService.getLastDrawing(),
      collections: this.collections,
      dateTimeFrom: this.dateTimeFrom.toISOString(),
      filterCloudy: true
    }

    if(this.dateTimeTo){
      body.dateTimeTo = this.dateTimeTo.toISOString();
    }

    this.httpClient.post<ItemInfoDto[]>(
      this.itemBaseUrl,
      body
    ).subscribe({
      next: value => {
        this.items = value.map(item => ItemService.mapDtoToModel(item));
        this.$items.next(this.items);
        this.$error.next("");
        this.$loading.next(false);
      },
      error: err => {
        this.$error.next("could not fetch item from backend");
        console.log(err);
        this.$loading.next(false);
      }
    });

  }

  private validateInput(): boolean {

    if (this.collections === undefined || this.collections.length <= 0) {
      this.$error.next("a collection must be selected");
      return false;
    }

    if (this.dateTimeFrom === undefined ) {
      this.$error.next("dateTime from is not set");
      return false;
    }

    const aoi = this.drawService.getLastDrawing();
    if (aoi === undefined) {
      this.$error.next("pleas draw an area of interest");
      return false;
    }

    return true;

  }

  private static mapDtoToModel(dto: ItemInfoDto): ItemInfo {
    const date = new Date(dto.dateTime);
    return  {
      dateTime: date,
      id: dto.id,
      collectionId: dto.collectionId
    };
  }


}
