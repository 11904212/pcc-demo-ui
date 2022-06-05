import {Injectable} from '@angular/core';
import {MapService} from "./map.service";
import {ImageType} from "../../models/image-type";
import ImageLayer from "ol/layer/Image";
import {ImageStatic} from "ol/source";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {Fill, Stroke, Style} from "ol/style";
import {getVectorContext} from "ol/render";
import {DrawService} from "./draw.service";
import {fromBlob, GeoTIFF, GeoTIFFImage, TypedArray} from "geotiff";

@Injectable({
  providedIn: 'root'
})
export class GeoTiffService{

  constructor(
    private mapService: MapService,
    private drawService: DrawService
  ) {
  }


  public async addGeoTiffLayer(geoTiff: Blob, type: ImageType) {

    const tiff: GeoTIFF = await fromBlob(geoTiff);
    const image = await tiff.getImage();

    const geotiffLayer = await this.createGeoTiffLayer(image, type);

    const clipLayer = await this.clippLayerWithDrawing(geotiffLayer);

    this.mapService.getMap().addLayer(geotiffLayer);
    this.mapService.getMap().addLayer(clipLayer);
  }

  public removeGeoTiffLayer():void {

  }

  private async clippLayerWithDrawing(geotiffLayer: ImageLayer<ImageStatic>):  Promise<VectorLayer<VectorSource>>{
    // https://openlayers.org/en/latest/examples/layer-clipping-vector.html

    const vectorSource = this.drawService.getDrawingVectorSource();

    const clipLayer = new VectorLayer({
      style: new Style({
        stroke: new Stroke({
          color: 'red',
          width: 2
        })
      }),
      source: vectorSource
    });


    //Giving the clipped layer an extent is necessary to avoid rendering when the feature is outside the viewport
    vectorSource.on('addfeature', function () {
      geotiffLayer.setExtent(vectorSource.getExtent());
    });

    const style = new Style({
      fill: new Fill({
        color: 'black',
      }),
    });


    geotiffLayer.on('postrender', (e: any) => {
      const vectorContext = getVectorContext(e);
      e.context.globalCompositeOperation = 'destination-in';
      vectorSource.forEachFeature(function (feature) {
        vectorContext.drawFeature(feature, style);
      });
      e.context.globalCompositeOperation = 'source-over';
    });

    return clipLayer;
  }

  private async createGeoTiffLayer(image: GeoTIFFImage, type: ImageType): Promise<ImageLayer<ImageStatic>> {

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

    const geotiffLayer = new ImageLayer({
      source: imgSource,
      visible: true
    });

    geotiffLayer.setZIndex(101);

    return geotiffLayer;
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
      colorScale: 'magma',
      clampLow: true,
      clampHigh: true
    });
    plot.render();

    return canvas;

  }
}
