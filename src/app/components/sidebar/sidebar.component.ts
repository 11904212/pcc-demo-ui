import {Component, OnInit} from '@angular/core';
import {ItemService} from "../../services/item.service";
import {UntypedFormControl, UntypedFormGroup, Validators} from "@angular/forms";
import {DrawService} from "../../services/map/draw.service";
import {environment} from "../../../environments/environment";
import {combineLatest, debounceTime, filter, map, tap} from "rxjs";

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

  readonly $lockInput = combineLatest([this.$itemsLoading, this.$userIsDrawing]).pipe(
    map(([lodaing, drawing]) => lodaing || drawing)
  );

  toggleCloudyForm = new UntypedFormControl(true, []);

  range = new UntypedFormGroup({
    start: new UntypedFormControl(null, Validators.required),
    end: new UntypedFormControl(null, Validators.required),
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

    this.itemService.setDateRange(
      this.defaultStart,
      this.today
    );

    this.range.valueChanges.pipe(
      debounceTime(100),
      tap(() => this.range.markAllAsTouched()),
      filter(() => this.range.valid)
    ).subscribe(value => {
      this.itemService.setDateRange(
        value.start,
        value.end
      );
    });
  }

  loadItems():void {
    this.itemService.loadItems();
  }

  drawPolygon():void {
    this.drawService.toggleDrawing()
  }

}
