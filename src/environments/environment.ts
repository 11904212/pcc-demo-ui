// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: "http://localhost:8080/v1",
  defaultPolygon: "POLYGON ((15.3478831 48.2094401, 15.3466774 48.2135189, 15.3433063 48.2126641, 15.3443565 48.2091379, 15.3478831 48.2094401))",
  defaultDateRange: 90,
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
