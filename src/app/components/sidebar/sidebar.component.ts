import {Component, OnInit} from '@angular/core';
import {ItemService} from "../../services/item.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {DrawService} from "../../services/map/draw.service";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit{

  readonly today = new Date();
  readonly defaultStart = new Date(this.today.valueOf() - (environment.defaultDateRange * 24 * 60 * 60 *1000));

  readonly $error = this.itemService.getError();
  readonly $itemsLoading = this.itemService.isLoading();
  readonly $userIsDrawing = this.drawService.isDrawing();

  toggleCloudyForm = new FormControl(true, []);

  range = new FormGroup({
    start: new FormControl(null, Validators.required),
    end: new FormControl(null, Validators.required),
  });

  dateFilter = (date: Date) => date <= this.today;

  constructor(
    private itemService: ItemService,
    private drawService: DrawService
  ) { }

  ngOnInit(): void {
    this.toggleCloudyForm.valueChanges.subscribe(value => {
      this.itemService.setFilterCloudy(value);
    });

    this.range.setValue({
      start: this.defaultStart,
      end: this.today
    })
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

}
