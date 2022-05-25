import { Component } from '@angular/core';
import {ItemService} from "../../services/item.service";
import {Observable} from "rxjs";
import {ItemInfo} from "../../dtos/item-info";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  $itemList: Observable<ItemInfo[]> = this.itemService.$getItems();
  $error = this.itemService.$getError();
  $itemsLoading = this.itemService.$isLoading();

  constructor(
    private itemService: ItemService
  ) { }

  loadItems():void {
    this.itemService.setCollection(['sentinel-2-l2a']);
    this.itemService.setDateTimeFrom(new Date(2021,5,22));
    this.itemService.loadItems();
  }

}
