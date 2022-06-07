import {Injectable} from '@angular/core';
import {MapService} from "./map.service";
import {ImageType} from "../../models/image-type";
import ImageLayer from "ol/layer/Image";
import {ImageStatic} from "ol/source";
import VectorLayer from "ol/layer/Vector";
import {Fill, Style} from "ol/style";
import {getVectorContext} from "ol/render";
import {DrawService} from "./draw.service";
import {fromBlob, GeoTIFF, GeoTIFFImage, TypedArray} from "geotiff";
import {environment} from "../../../environments/environment";
import {filter} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class GeoTiffService{

  private geotiffLayer = new ImageLayer();
  private clipLayer = new VectorLayer();

  constructor(
    private mapService: MapService,
    private drawService: DrawService
  ) {
    this.initGeoTiffLayer();
    this.initClipLayer();
    this.mapService.getMap().addLayer(this.geotiffLayer);
    this.mapService.getMap().addLayer(this.clipLayer);

    this.drawService.isDrawing().pipe(
      filter(isDrawing => isDrawing)
    ).subscribe(() => this.removeGeoTiffLayer());
  }


  public async addGeoTiffLayer(geoTiff: Blob, type: ImageType) {

    const tiff: GeoTIFF = await fromBlob(geoTiff);
    const image = await tiff.getImage();

    await this.updateGeoTiffLayer(image, type);

    this.geotiffLayer.setVisible(true);

  }

  public removeGeoTiffLayer():void {
    this.geotiffLayer.setVisible(false);

  }

  private initClipLayer() {
    // based on https://openlayers.org/en/latest/examples/layer-clipping-vector.html

    const userDrawing = this.drawService.getDrawingVectorSource();

    this.clipLayer.setSource(userDrawing);


    //Giving the clipped layer an extent is necessary to avoid rendering when the feature is outside the viewport
    userDrawing.on('addfeature', () => {
      this.geotiffLayer.setExtent(userDrawing.getExtent());
    });

    const featureStyle = new Style({
      fill: new Fill({
        color: 'black',
      }),
    });


    this.geotiffLayer.on('postrender', (e: any) => {
      const vectorContext = getVectorContext(e);
      e.context.globalCompositeOperation = 'destination-in';
      userDrawing.forEachFeature(function (feature) {
        vectorContext.drawFeature(feature, featureStyle);
      });
      e.context.globalCompositeOperation = 'source-over';
    });

  }

  private async updateGeoTiffLayer(image: GeoTIFFImage, type: ImageType) {

    let canvas;
    if (type == ImageType.NDVI) {
      canvas = await this.createCanvasNdvi(image);
    } else {
      canvas = await this.createCanvasRGB(image);
    }

    const bbox = image.getBoundingBox();

    const epsgCode = image.geoKeys.ProjectedCSTypeGeoKey || image.geoKeys.GeographicTypeGeoKey;
    const imgSource = new ImageStatic({
      url: canvas.toDataURL("image/png"),
      imageExtent: bbox,
      projection: 'EPSG:' + epsgCode, //to enable on-the-fly raster reprojection
      imageSmoothing: false
    })

    this.geotiffLayer.setSource(imgSource);

  }

  private initGeoTiffLayer() {
    this.geotiffLayer.setZIndex(101);
    this.geotiffLayer.setVisible(false);
  }

  private async createCanvasRGB(image: GeoTIFFImage): Promise<HTMLCanvasElement> {

    const width = image.getWidth();
    const height = image.getHeight();
    const geoTiffDataRGB = await image.readRGB({
      enableAlpha: true,
    });

    // https://dev.luciad.com/portal/productDocumentation/LuciadRIA/docs/articles/howto/geotiff/loading_geotiff_images.html?subcategory=ria_geotiff
    const canvas = document.createElement('canvas'); //create an offscreen canvas for rendering

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;  // array of RGBA values

    // convert GeoTiff's RGB values to ImageData's RGBA values
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const srcIdx = 3 * i * width + 3 * j;
        const idx = 4 * i * width + 4 * j;
        // @ts-ignore
        data[idx] = geoTiffDataRGB[srcIdx];
        // @ts-ignore
        data[idx + 1] = geoTiffDataRGB[srcIdx + 1];
        // @ts-ignore
        data[idx + 2] = geoTiffDataRGB[srcIdx + 2];
        // @ts-ignore
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);

    return canvas;

  }

  private async createCanvasNdvi(image: GeoTIFFImage): Promise<HTMLCanvasElement> {

    const geoTiffData: TypedArray|TypedArray[] = await image.readRasters();
    if (geoTiffData.length < 1 || !(geoTiffData[0] instanceof Float32Array)) {
      throw new Error("backend returned an unknown geotiff format")
    }
    const band0: Float32Array = geoTiffData[0];
    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;

    band0.forEach(value => {
      min = value < min ? value : min;
      max = value > max ? value : max;
    })

    // https://jsrepos.com/lib/geotiffjs-geotiff-js-javascript-maps#what-to-do-with-the-data
    const canvas = document.createElement('canvas'); //create an offscreen canvas for rendering

    const plot = new plotty.plot({
      canvas: canvas,
      data: band0,
      width: image.getWidth(),
      height: image.getHeight(),
      domain: [min, max],
      colorScale: environment.ndviColorScale,
      clampLow: true,
      clampHigh: true
    });
    plot.render();

    return canvas;

  }
}
