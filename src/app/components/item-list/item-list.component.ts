import {Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, debounceTime, filter, Observable, Subject, takeUntil} from "rxjs";
import {ItemInfo} from "../../models/item-info";
import {ItemService} from "../../services/item.service";
import {ImageService} from "../../services/image.service";
import {MatCheckboxChange} from "@angular/material/checkbox";
import {StatisticsService} from "../../services/statistics.service";
import {ImageType} from "../../models/image-type";

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss']
})
export class ItemListComponent implements OnInit, OnDestroy{

  private unsubscribe = new Subject();

  readonly itemList$: Observable<ItemInfo[]> = this.itemService.getItems();
  readonly imageSelectedItemId$ = this.imageService.getSelectedItemId();
  readonly imageError$ = this.imageService.getError();
  readonly imageIsLoading = this.imageService.isLoading();

  readonly imageTypeOptions = ImageType;

  selectedStatsItems$ = new BehaviorSubject<Set<ItemInfo>>(new Set())

  selectedImageType = ImageType.TCI;

  constructor(
    private itemService: ItemService,
    private imageService: ImageService,
    private statisticsService: StatisticsService
  ) { }

  ngOnInit(): void {
    this.selectedStatsItems$.pipe(
      debounceTime(1500),
      filter(set => set.size > 0),
      takeUntil(this.unsubscribe)
    ).subscribe(set => {
      this.statisticsService.setItems([...set]);
    });

    this.itemList$.pipe(
      takeUntil(this.unsubscribe)
    ).subscribe(() => this.selectedStatsItems$.next(new Set()));
  }

  ngOnDestroy() {
    this.unsubscribe.complete();
  }


  loadImage(item: ItemInfo):void {
    this.imageService.setItemId(item.id);
  }

  removeImage():void {
    this.imageService.removeLoadedImage();
  }

  updateSelectedStats(event: MatCheckboxChange, item: ItemInfo){
    const set = this.selectedStatsItems$.value;
    if(event.checked) {
      set.add(item);
    } else {
      set.delete(item);
    }
    this.selectedStatsItems$.next(set);
  }


  setItemType() {
    this.imageService.setImageType(this.selectedImageType);
  }





}
