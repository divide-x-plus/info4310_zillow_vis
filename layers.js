function showPopMapLayer(feature, map) {
  let geo;
  // draw choropleth
  let populationColorScheme = function(d) {
      return d > 10000 ? '#800026' :
             d > 5000  ? '#BD0026' :
             d > 2000  ? '#E31A1C' :
             d > 1000  ? '#FC4E2A' :
             d > 500   ? '#FD8D3C' :
             d > 200   ? '#FEB24C' :
             d > 100   ? '#FED976' :
                        '#FFEDA0';
  }

  let populationMapLayer = function(feature) {
    return {
        fillColor: populationColorScheme((feature.properties.census !== null) ? Number(feature.properties.census.total_pop) : 0),
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

  let info = L.control();
  info.onAdd = function(map) {
    // create a div with class "info"
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
  }
  // helper function to update the control based on feature properties
  info.update = function(props) {
    this._div.innerHTML = '<h4>Population Density in this region</h4>' + (
        props ? '<b>' + 'size of population: ' + props.census.total_pop + '</b>' : 'Missing Data 😢');
  }
  info.addTo(map);
}
