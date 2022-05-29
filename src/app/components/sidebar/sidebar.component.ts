import {Component} from '@angular/core';
import {ItemService} from "../../services/item.service";
import {Observable} from "rxjs";
import {ItemInfo} from "../../dtos/item-info";
import {GeoTiffService} from "../../services/geo-tiff.service";
import {ImageType} from "../../dtos/image-type";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  readonly imageTypeOptions = ImageType;

  $itemList: Observable<ItemInfo[]> = this.itemService.$getItems();
  $error = this.itemService.$getError();
  $itemsLoading = this.itemService.$isLoading();

  selectedImageType = ImageType.TCI;

  constructor(
    private itemService: ItemService,
    private geoTiffService: GeoTiffService
  ) { }

  loadItems():void {
    this.itemService.setCollection(['sentinel-2-l2a']);
    this.itemService.setDateTimeFrom(new Date(2021,5,22));
    this.itemService.loadItems();
  }

  loadImage(item: ItemInfo):void {
    this.geoTiffService.getGeoTiff(item.id, this.selectedImageType);
  }

}
