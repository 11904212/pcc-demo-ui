import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {Stats} from "../models/stats";
import {ItemInfo} from "../models/item-info";
import {StatsReq} from "../dtos/stats-req";
import {DrawService} from "./map/draw.service";
import {HttpClient} from "@angular/common/http";
import {StatsDto} from "../dtos/stats-dto";

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  private statisticsBaseUrl = "http://localhost:8080/v1/statistics/ndvi";

  private stats$ = new BehaviorSubject<Stats[]>([]);
  private loading$ = new BehaviorSubject<boolean>(false);
  private error$ = new BehaviorSubject<string>("");

  private items: ItemInfo[];

  constructor(
    private httpClient: HttpClient,
    private drawService: DrawService
  ) { }

  public setItems(items: ItemInfo[]) {
    this.items = items;
    this.loadStats();
  }

  public getStatistics(): Observable<Stats[]> {
    return this.stats$.asObservable();
  }

  private loadStats() {

    const aoi = this.drawService.getLastDrawing();

    if (this.items.length === 0 || !aoi) {
      return;
    }

    this.loading$.next(true);

    const body: StatsReq = {
      areaOfInterest: aoi,
      itemIds: this.items.map(item => item.id)
    }

    this.httpClient.post<StatsDto[]>(
      this.statisticsBaseUrl,
      body
    ).subscribe({
      next: value => {
        this.stats$.next(value.map(stat => StatisticsService.mapDtoToModel(stat)));
        this.error$.next("");
        this.loading$.next(false);
      },
      error: err => {
        this.error$.next("could not fetch statistics from backend");
        console.log(err);
        this.loading$.next(false);
      }
    });

  }

  private static mapDtoToModel(dto: StatsDto): Stats {
    const date = new Date(dto.dateTime);
    return {
      ...dto,
        dateTime: date
    };
  }
}
