import { Cartesian3 } from "cesium";
import * as Cesium from "cesium";
import { OperationalIntentStateColor } from "@/shared/model";
import type {
  OperationalIntent,
  Constraint,
  IdentificationServiceAreaFull,
  Flight,
  Rectangle,
  Volume3D,
  Volume4D,
  FlightArea,
} from "@/shared/model";
import {
  areArraysEqual,
  isConstraint,
  isIdentificationServiceArea,
  isOperationalIntent,
} from "@/shared/lib";

const DEFAULT_POLYGON_ALPHA = 0.3;
const SELECTED_POLYGON_ALPHA = 0.5;

function sum(arr: number[]): number {
  return arr.reduce((acc, val) => acc + val, 0);
}

function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

type RegionId = string;
type RegionOvn = string;

interface DisplayedEntity {
  ovn: RegionOvn;
  entityIds: RegionId[];
}

interface GeoJsonFormat {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: {
      name?: string;
      color?: string;
      height?: number;
      [key: string]: any;
    };
    geometry: {
      type: "Polygon";
      coordinates: number[][][];
    };
  }>;
}

export class MapEntityManager {
  private viewer: Cesium.Viewer;
  private displayedEntities: Record<RegionId, DisplayedEntity> = {};
  private handler: Cesium.ScreenSpaceEventHandler;
  private flights: Record<string, Cesium.Entity[]> = {};
  private geoJsonData: GeoJsonFormat | null = null;
  private geoJsonEntities: Cesium.Entity[] = [];
  private selectedGeoJsonEntities: Set<Cesium.Entity> = new Set();

  private onSelectedGeoJsonEntitiesChange: () => void = () => { };

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;

    this.viewer.cesiumWidget.creditContainer.remove();
    this.viewer.scene.mode = Cesium.SceneMode.SCENE2D;

    const [latitude, longitude] = [-23.713416, -46.693356];
    const cameraAltitude = 5000;

    this.viewer.camera.setView({
      destination: Cartesian3.fromDegrees(longitude, latitude, cameraAltitude),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-70),
        roll: 0,
      },
    });

    this.handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

    this.loadGeoJsonZones();

    this.addGeojsonEntityClickCallback((pickedEntity: Cesium.Entity) => {
      console.log("Clicked on an entity");
      // Make a logic for selecting the regions
      if (this.selectedGeoJsonEntities.size > 1) {
        this.selectedGeoJsonEntities.forEach((entity) => {
          this.deselectGeoJsonEntity(entity);
        });
      }

      if (this.selectedGeoJsonEntities.has(pickedEntity)) {
        this.deselectGeoJsonEntity(pickedEntity);
      } else {
        this.selectedGeoJsonEntities.forEach((entity) => {
          this.deselectGeoJsonEntity(entity);
        });
        this.selectGeoJsonEntity(pickedEntity);
      }
    });

    this.addGeojsonMultiEntityClickCallback((pickedEntity: Cesium.Entity) => {
      console.log("Clicked on an entity with CTRL");
      // Make a logic for selecting the regions
      if (this.selectedGeoJsonEntities.has(pickedEntity)) {
        this.deselectGeoJsonEntity(pickedEntity);
      } else {
        this.selectGeoJsonEntity(pickedEntity);
      }
    });

    // Add ESC key to deselect all
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        this.selectedGeoJsonEntities.forEach((entity) => {
          this.deselectGeoJsonEntity(entity);
        });
      }
    });
  }

  setSceneMode(mode: Cesium.SceneMode) {
    this.viewer.scene.mode = mode;
  }

  private selectGeoJsonEntity(entity: Cesium.Entity) {
    const selectedRegionId = entity.id;
    const color =
      this.geoJsonData?.features.find(
        (feature) => feature.properties?.name === selectedRegionId,
      )?.properties?.color || "#808080";
    entity.polygon.material = Cesium.Color.fromCssColorString(color).withAlpha(
      SELECTED_POLYGON_ALPHA,
    );
    this.selectedGeoJsonEntities.add(entity);
    this.onSelectedGeoJsonEntitiesChange();
  }

  private deselectGeoJsonEntity(entity: Cesium.Entity) {
    const selectedRegionId = entity.id;
    const color =
      this.geoJsonData?.features.find(
        (feature) => feature.properties?.name === selectedRegionId,
      )?.properties?.color || "#808080";
    entity.polygon.material = Cesium.Color.fromCssColorString(color).withAlpha(
      DEFAULT_POLYGON_ALPHA,
    );
    this.selectedGeoJsonEntities.delete(entity);
    this.onSelectedGeoJsonEntitiesChange();
  }

  addSelectedEntitiesChangeCallback(
    callback: (entities: Set<Cesium.Entity>) => void,
  ) {
    this.onSelectedGeoJsonEntitiesChange = () => {
      callback(this.selectedGeoJsonEntities);
    };
  }

  updateSelectedEntities(arr: Array<FlightArea>) {
    const currentSelectedIds = Array.from(this.selectedGeoJsonEntities).map(
      (entity) => entity.id,
    );

    if (areArraysEqual(currentSelectedIds, arr)) {
      return;
    }

    console.log("The Entity Manager is trying to update itself with", arr);

    this.selectedGeoJsonEntities.forEach((entity) => {
      this.deselectGeoJsonEntity(entity);
    });

    console.log("GeoJsonEntities", this.geoJsonEntities);

    this.geoJsonEntities.forEach((entity) => {
      if (arr.includes(entity.id as FlightArea)) {
        this.selectGeoJsonEntity(entity);
      }
    });
  }

  addMoveEndCallback(callback: () => void) {
    this.viewer.camera.moveEnd.addEventListener(callback);
  }

  addGeojsonEntityClickCallback(callback: (entity: Cesium.Entity) => void) {
    console.log("Handler", this.handler);
    this.handler.setInputAction(
      (event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        console.log("Left Click w/o CTRL");
        const pickedObject = this.viewer.scene.pick(event.position);
        if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
          const pickedEntity = pickedObject.id as Cesium.Entity;
          console.log("GeoJsonEntities", this.geoJsonEntities);
          if (this.geoJsonEntities.some((e) => e.id === pickedEntity.id)) {
            callback(pickedEntity);
          }
        } else {
          this.selectedGeoJsonEntities.forEach((entity) => {
            this.deselectGeoJsonEntity(entity);
          });
        }
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
    );
  }

  addGeojsonMultiEntityClickCallback(
    callback: (entity: Cesium.Entity) => void,
  ) {
    console.log("Handler", this.handler);
    this.handler.setInputAction(
      (event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        const pickedObject = this.viewer.scene.pick(event.position);
        if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
          const pickedEntity = pickedObject.id as Cesium.Entity;
          if (this.geoJsonEntities.some((e) => e.id === pickedEntity.id)) {
            callback(pickedEntity);
          }
        }
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
      Cesium.KeyboardEventModifier.CTRL,
    );
  }

  addEntityClickCallback(
    callback: (entity: Cesium.Entity, regionId: RegionId) => void,
  ) {
    this.handler.setInputAction(
      (event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        const pickedObject = this.viewer.scene.pick(event.position);
        if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
          const pickedEntity = pickedObject.id as Cesium.Entity;
          const regionId = Object.keys(this.displayedEntities).find((id) =>
            this.displayedEntities[id].entityIds.includes(pickedEntity.id),
          );
          callback(pickedEntity, regionId as RegionId);
        }
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
    );
  }

  clearFlights() {
    if (Object.keys(this.flights).length === 0) {
      return;
    }

    Object.values(this.flights).forEach((entities) => {
      entities.forEach((entity) => {
        this.viewer.entities.removeById(entity.id);
      });
    });

    this.flights = {};
  }

  displayFlights(newFlights: Array<Flight>) {
    const newFlightIds = new Set(newFlights.map((flight) => flight.id));

    // Remove flights that are no longer in the newFlights array
    Object.keys(this.flights).forEach((flightId) => {
      if (!newFlightIds.has(flightId)) {
        this.flights[flightId].forEach((entity) => {
          this.viewer.entities.removeById(entity.id);
        });
        delete this.flights[flightId];
      }
    });

    // For each entity in the flights set. Remove it and add the new flights
    newFlights.forEach((newFlight) => {
      // TODO: If flight stop displaying. What happens?
      const { current_state, id } = newFlight;
      const { position, operational_status } = current_state;

      if (!position || !position.lat || !position.lng) {
        return;
      }

      if (this.flights[id]) {
        const entity = this.flights[id][0];
        entity.position = Cesium.Cartesian3.fromDegrees(
          position.lng,
          position.lat,
          position.alt,
          Cesium.Ellipsoid.WGS84,
        );

        if (this.flights[id].length > 1) {
          const label = this.flights[id][1];
          label.position = Cesium.Cartesian3.fromDegrees(
            position.lng,
            position.lat,
            position.alt + 10,
            Cesium.Ellipsoid.WGS84,
          );
        }
      } else {
        this.flights[id] = [];

        // const entity = this.viewer.entities.add({
        //   position: Cesium.Cartesian3.fromDegrees(
        //     position.lng,
        //     position.lat,
        //     position.alt,
        //     Cesium.Ellipsoid.WGS84,
        //   ),
        //   model: {
        //     uri: "/Inspire.glb",
        //     minimumPixelSize: 100,
        //     maximumScale: 1,
        //   },
        // });

        const entity = this.viewer.entities.add({
          id: id,
          position: Cesium.Cartesian3.fromDegrees(
            position.lng,
            position.lat,
            position.alt,
            Cesium.Ellipsoid.WGS84,
          ),
          // Replace point with sphere
          ellipsoid: {
            radii: new Cesium.Cartesian3(5, 5, 5), // Adjust radius as needed
            material: Cesium.Color.BLACK.withAlpha(0.8),
          },
        });

        this.flights[id].push(entity);

        if (newFlight.details?.uas_id || newFlight.id) {
          const label = this.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(
              position.lng,
              position.lat,
              position.alt + 10,
              Cesium.Ellipsoid.WGS84,
            ),
            label: {
              text: newFlight.details?.uas_id.registration_id || newFlight.id,
              font: "14px sans-serif",
              fillColor: Cesium.Color.BLACK,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            },
          });
          if (label) {
            this.flights[id].push(label);
          }
        }
      }
    });
  }

  async loadGeoJsonZones() {
    try {
      const response = await fetch("/zones.geojson");
      if (!response.ok) {
        throw new Error(`Failed to load GeoJSON: ${response.statusText}`);
      }

      this.geoJsonData = await response.json();
      this.displayGeoJsonPolygons(this.geoJsonData);
      console.log(this.geoJsonEntities);
    } catch (error) {
      console.error("Error loading GeoJSON zones:", error);
    }
  }

  clearGeoJsonZones() {
    this.geoJsonEntities.forEach((entity) => {
      this.viewer.entities.removeById(entity.id);
    });
    this.geoJsonEntities = [];
  }

  private displayGeoJsonPolygon(
    id: string,
    coordinates: number[][],
    color: string,
  ) {
    // Convert hex color to Cesium Color
    let cesiumColor: Cesium.Color;
    try {
      cesiumColor = Cesium.Color.fromCssColorString(color);
    } catch (error) {
      console.warn(`Invalid color "${color}", using gray`);
      cesiumColor = Cesium.Color.GRAY;
    }

    // Convert GeoJSON coordinates to Cesium Cartesian3
    const positions = coordinates.map((coord) =>
      Cesium.Cartesian3.fromDegrees(coord[0], coord[1], 0),
    );

    const entity = this.viewer.entities.add({
      id,
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(positions),
        material: cesiumColor.withAlpha(DEFAULT_POLYGON_ALPHA),
        outline: true,
        outlineColor: cesiumColor,
        height: 750,
        extrudedHeight: 850, // Example extruded height
      },
    });

    this.geoJsonEntities.push(entity);
  }

  private displayGeoJsonPolygons(geoJsonData: any) {
    // Clear existing GeoJSON entities
    this.clearGeoJsonZones();

    if (!geoJsonData.features || !Array.isArray(geoJsonData.features)) {
      console.warn("Invalid GeoJSON format: no features array found");
      return;
    }

    geoJsonData.features.forEach((feature: any, index: number) => {
      if (feature.geometry?.type !== "Polygon") {
        return; // Skip non-polygon features
      }

      const coordinates = feature.geometry.coordinates[0]; // Get outer ring
      const colorProperty = feature.properties?.color || "#808080"; // Default to gray
      const id = feature.properties?.name || `${index}`;

      this.displayGeoJsonPolygon(id, coordinates, colorProperty);
    });
  }

  displayRegions(
    regions: Array<
      Constraint | OperationalIntent | IdentificationServiceAreaFull
    >,
  ) {
    // TODO: Verify if this is really needed
    if (
      this.viewer.entities.values.length !==
      sum(
        Object.values(this.displayedEntities).map(
          (entity) => entity.entityIds.length,
        ),
      ) +
      Object.values(this.flights).flat().length
    ) {
      this.viewer.entities.removeAll();
      this.displayedEntities = {};
    }

    // Clearning RegionIds that are not in regions
    Object.keys(this.displayedEntities).forEach((regionId) => {
      if (!regions.some((region) => region.reference.id === regionId)) {
        this.displayedEntities[regionId].entityIds.forEach((entityId) => {
          this.viewer.entities.removeById(entityId);
        });
        delete this.displayedEntities[regionId];
      }
    });

    regions.forEach((region) => {
      const { reference, details } = region;
      const { volumes }: { volumes: Volume4D[] } = details;

      if (!volumes || volumes.length === 0) {
        return;
      }

      if (!("id" in reference)) {
        return;
      }

      const ovn = "ovn" in reference ? reference!.ovn : "";

      if (
        reference.id in this.displayedEntities &&
        this.displayedEntities[reference.id].ovn === ovn
      ) {
        return;
      }

      if (!(reference.id in this.displayedEntities)) {
        this.displayedEntities[reference.id] = {
          ovn: ovn!,
          entityIds: [],
        };
      }

      if (
        reference.id in this.displayedEntities &&
        this.displayedEntities[reference.id].ovn !== ovn
      ) {
        this.displayedEntities[reference.id].entityIds.forEach((entityId) => {
          this.viewer.entities.removeById(entityId);
        });
        this.displayedEntities[reference.id].entityIds = [];
        this.displayedEntities[reference.id].ovn = ovn!;
      }

      for (const volume of volumes) {
        let color: Cesium.Color = Cesium.Color.GREY;
        if (isOperationalIntent(region)) {
          color = OperationalIntentStateColor[reference["state"]];
        } else if (isConstraint(region)) {
          color = Cesium.Color.RED;
        } else if (isIdentificationServiceArea(region)) {
          color = Cesium.Color.BLUE;
        }

        if (
          "outline_circle" in volume.volume &&
          volume.volume["outline_circle"]
        ) {
          const entity = this.drawCylinder(volume.volume, color);

          if (entity) {
            this.displayedEntities[reference.id].entityIds.push(entity.id);
          }
        } else if (
          "outline_polygon" in volume.volume &&
          volume.volume["outline_polygon"]
        ) {
          const entity = this.drawPolygon(volume.volume, color);

          if (entity) {
            this.displayedEntities[reference.id].entityIds.push(entity.id);
          }
        }
      }
    });
  }

  getViewRectangle = (): Rectangle | undefined => {
    const rect = this.viewer.camera.computeViewRectangle();

    if (!rect) {
      return;
    }

    const ret: Rectangle = {
      north: radiansToDegrees(rect.north),
      east: radiansToDegrees(rect.east),
      south: radiansToDegrees(rect.south),
      west: radiansToDegrees(rect.west),
    };

    return ret;
  };

  private drawCylinder(
    volume: Volume3D,
    color: Cesium.Color = Cesium.Color.GREY,
  ): Cesium.Entity | undefined {
    if (!("outline_circle" in volume) || !volume.outline_circle) {
      return;
    }

    const radius = volume.outline_circle.radius.value;

    const height = volume.altitude_upper.value - volume.altitude_lower.value;

    const center = Cesium.Cartesian3.fromDegrees(
      volume.outline_circle.center.lng,
      volume.outline_circle.center.lat,
      volume.altitude_lower.value + height / 2,
      Cesium.Ellipsoid.WGS84,
    );

    return this.viewer.entities.add({
      position: center,
      cylinder: {
        length: height,
        topRadius: radius,
        bottomRadius: radius,
        material: color.withAlpha(0.5),
        outline: true,
        outlineColor: color,
      },
    });
  }

  private drawPolygon(
    volume: Volume3D,
    color: Cesium.Color = Cesium.Color.GREY,
  ): Cesium.Entity | undefined {
    if (!("outline_polygon" in volume)) {
      return;
    }

    const minHeight = Math.min(
      volume.altitude_lower.value,
      volume.altitude_upper.value,
    );
    const maxHeight = Math.max(
      volume.altitude_upper.value,
      volume.altitude_lower.value,
    );

    const vertices = volume.outline_polygon.vertices.map((vertex) =>
      Cesium.Cartesian3.fromDegrees(
        vertex.lng,
        vertex.lat,
        minHeight,
        Cesium.Ellipsoid.WGS84,
      ),
    );

    return this.viewer.entities.add({
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(vertices),
        material: color.withAlpha(0.5),
        height: minHeight,
        extrudedHeight: maxHeight,
        outline: true,
        outlineColor: color,
      },
    });
  }
}
