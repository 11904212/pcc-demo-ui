import { TestBed } from '@angular/core/testing';

import { ImageService } from './image.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('GeoTiffService', () => {
  let service: ImageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ]
    });
    service = TestBed.inject(ImageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
