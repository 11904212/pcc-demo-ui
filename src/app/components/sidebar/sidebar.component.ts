import {Component, OnInit} from '@angular/core';
import {ItemService} from "../../services/item.service";
import {ImageService} from "../../services/image.service";
import {ImageType} from "../../models/image-type";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {DrawService} from "../../services/map/draw.service";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit{

  readonly imageTypeOptions = ImageType;
  readonly today = new Date();


  readonly $error = this.itemService.getError();
  readonly $itemsLoading = this.itemService.isLoading();
  readonly $userIsDrawing = this.drawService.isDrawing();

  selectedImageType = ImageType.TCI;
  toggleCloudyForm = new FormControl(true, []);

  range = new FormGroup({
    start: new FormControl(null, Validators.required),
    end: new FormControl(null, Validators.required),
  });

  dateFilter = (date: Date) => date <= this.today;

  constructor(
    private itemService: ItemService,
    private imageService: ImageService,
    private drawService: DrawService
  ) { }

  ngOnInit(): void {
    this.toggleCloudyForm.valueChanges.subscribe(value => {
      this.itemService.setFilterCloudy(value);
    });
  }

  loadItems():void {
    this.range.markAllAsTouched();
    if (!this.range.valid) {
      return;
    }

    this.itemService.setDateRange(
      this.range.controls['start'].value,
      this.range.controls['end'].value
    );
    this.itemService.loadItems();
  }

  drawPolygon():void {
    this.drawService.toggleDrawing()
  }

  setItemType() {
    this.imageService.setImageType(this.selectedImageType);
  }

}
