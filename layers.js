// show population local information
// @params: feature -> geojsonfeature; map: instantiated Leaflet map object;
// variable -> string representation of variables from the census data
function showMapLayer(feature, map, variable) {
  let geo;
  // draw choropleth
  // let populationColorScheme = function(d) {
  //     return d > 10000 ? '#800026' :
  //            d > 5000  ? '#BD0026' :
  //            d > 2000  ? '#E31A1C' :
  //            d > 1000  ? '#FC4E2A' :
  //            d > 500   ? '#FD8D3C' :
  //            d > 200   ? '#FEB24C' :
  //            d > 100   ? '#FED976' :
  //                       '#FFEDA0';
  // }

  // return the range of selected variable
  let dataRange = d3.extent(feature.features, function(d) {
    return (d.properties.census !== null) ? Number(d.properties.census[variable]) : 0;
  })

  let colors = ["#FFEDA0", "#FED976",  "#FEB24C", "#9955a8", "#573b88"];

  let colorize = d3.scaleThreshold().domain(dataRange).range(colors);

  let populationMapLayer = function(feature) {
    return {
        fillColor: colorize((feature.properties.census !== null) ? Number(feature.properties.census[String(variable)]) : 0),
        weight: 1,
        opacity: 0.5,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.4
    };
  }

  // custom zoom onclick feature
  let highlightFeature = function(e) {
    let layer = e.target;
    layer.setStyle({
      weight: 5,
      color: "#666",
      dashArray: "",
      fillOpacity: 0.7
    });
    info.update(layer.feature.properties);
  }

  let resetHighlight = function(e) {
    geo.resetStyle(e.target);
    info.update();
  }

  let zoomToFeature = function(e) {
    map.fitBounds(e.target.getBounds());
  }

  let onEachFeature = function(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature
    })
  }

  geo = L.geoJSON(feature, {
    style: populationMapLayer,
    onEachFeature: onEachFeature
  }).addTo(map);

}
