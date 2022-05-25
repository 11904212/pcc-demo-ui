import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {ItemInfo} from "../dtos/item-info";
import {HttpClient, HttpParams} from "@angular/common/http";
import {DrawService} from "./draw.service";

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

    let params = new HttpParams()
      .set('collections', this.collections.toString())
      .set('dateTimeFrom', this.dateTimeFrom.toISOString())
    if(this.dateTimeTo){
      params = params.set('dateTimeTo', this.dateTimeTo.toISOString())
    }

    const aresOfInterest = this.drawService.getLastDrawing();

    this.httpClient.post<ItemInfo[]>(
      this.itemBaseUrl,
      aresOfInterest,
      {
        params: params
      }
    ).subscribe({
      next: value => {
        this.items.push(...value);
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

}
