// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: "http://localhost:8080/v1",
  defaultPolygon: "POLYGON((15.343316760000002 48.212645589999994,15.343316070000002 48.21261221,15.34436989 48.20911283000001,15.34791199 48.20942912999999,15.34667922 48.21352336999999,15.34412474 48.212866700000006,15.34412169 48.21287631000001,15.343346749999998 48.21268229000003,15.343323929999999 48.212669189999986,15.343316760000002 48.212645589999994))",
  defaultDateRange: 30,
  crsApi: "EPSG:4326",
  crsMap: "EPSG:3857",
  ndviColorScale: "plasma" //see available https://github.com/santilland/plotty
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
