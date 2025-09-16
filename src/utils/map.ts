export const addTerrain = (map: mapboxgl.Map) => {
  if (map.getSource("mapbox-dem")) return;

  map.addSource("mapbox-dem", {
    type: "raster-dem",
    url: "mapbox://mapbox.mapbox-terrain-dem-v1",
    tileSize: 512,
    maxzoom: 20,
  });
  map.setTerrain({ source: "mapbox-dem", exaggeration: 1 });
};
