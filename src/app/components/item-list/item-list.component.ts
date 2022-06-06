import { Component } from '@angular/core';
import {Observable} from "rxjs";
import {ItemInfo} from "../../models/item-info";
import {ItemService} from "../../services/item.service";
import {ImageService} from "../../services/image.service";

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss']
})
export class ItemListComponent {

  readonly $itemList: Observable<ItemInfo[]> = this.itemService.getItems();
  readonly imageSelectedItemId$ = this.imageService.getSelectedItemId();
  readonly imageError$ = this.imageService.getError();
  readonly imageIsLoading = this.imageService.isLoading();

  constructor(
    private itemService: ItemService,
    private imageService: ImageService
  ) { }

  loadImage(item: ItemInfo):void {
    this.imageService.setItemId(item.id);
  }

  removeImage():void {
    this.imageService.removeLoadedImage();
  }

}
