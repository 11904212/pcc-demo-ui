import {Component} from '@angular/core';
import {ItemService} from "../../services/item.service";
import {Observable} from "rxjs";
import {ItemInfo} from "../../dtos/item-info";
import {GeoTiffService} from "../../services/geo-tiff.service";
import {ImageType} from "../../dtos/image-type";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {DrawService} from "../../services/draw.service";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  readonly imageTypeOptions = ImageType;
  readonly today = new Date();

  readonly $itemList: Observable<ItemInfo[]> = this.itemService.$getItems();
  readonly $error = this.itemService.$getError();
  readonly $itemsLoading = this.itemService.$isLoading();
  readonly $userIsDrawing = this.drawService.isDrawing();

  selectedImageType = ImageType.TCI;

  range = new FormGroup({
    start: new FormControl(null, Validators.required),
    end: new FormControl(null, Validators.required),
  });

  dateFilter = (date: Date) => date <= this.today;

  constructor(
    private itemService: ItemService,
    private geoTiffService: GeoTiffService,
    private drawService: DrawService
  ) { }

  loadItems():void {
    this.range.markAllAsTouched();
    if (!this.range.valid) {
      return;
    }

    this.itemService.setCollection(['sentinel-2-l2a']);
    this.itemService.setDateTimeFrom(this.range.controls['start'].value);
    this.itemService.setDateTimeTo(this.range.controls['end'].value);
    this.itemService.loadItems();
  }

  loadImage(item: ItemInfo):void {
    this.geoTiffService.getGeoTiff(item.id, this.selectedImageType);
  }

  drawPolygon():void {
    this.drawService.toggleDrawing()
  }

}
