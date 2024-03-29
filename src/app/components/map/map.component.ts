import {Component, ElementRef, OnInit} from '@angular/core';
import {MapService} from "../../services/map/map.service";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  constructor(
    private mapService: MapService,
    private elementRef: ElementRef
  ) { }

  ngOnInit(): void {
    const map = this.mapService.getMap();
    map.setTarget(this.elementRef.nativeElement);
  }

}
