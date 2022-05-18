import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapMenuComponent } from './map-menu.component';
import { MatMenuModule } from "@angular/material/menu";

describe('MapMenuComponent', () => {
  let component: MapMenuComponent;
  let fixture: ComponentFixture<MapMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapMenuComponent ],
      imports: [ MatMenuModule ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
