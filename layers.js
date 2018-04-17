// show population local information
// @params: feature -> geojsonfeature; map: instantiated Leaflet map object;
// variable -> string representation of variables from the census data
function showMapLayer(feature, map, variable) {
  let geo;
  // return the range of selected variable
  let dataRange = d3.extent(feature.features, function(d) {
    return (d.properties.census !== null) ? Number(d.properties.census[variable]) : 0;
  })

  let colors = ["#ffc6c4",
            "#ee919b",
            "#cc607d",
            "#9e3963",
            "#672044"];

  let colorize = d3.scaleOrdinal().domain(dataRange).range(colors);

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

  // helper function to divide an array into equal parts
  // @params: array to divide, num of parts
  let divideRange = function(array, num) {
    let step = (array[1] - array[0])/num
    let result = [];
    for (i=0; i < num+1; i++) {
      if (result.length === 0) {
        result.push(i*step)
      } else {
        result.push(result[i-1] + step)
      }
    }
    return result;
  }

  // add legend
  let legend = L.control({position: 'bottomright'});
  legend.onAdd = function(map) {
    let div = L.DomUtil.create('div', 'info legend'),
        grades = divideRange(dataRange, 5),
        labels = [];

    // loop through density intervals and generate a label with a colored square for interval
    for (var i=0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' + colorize(grades[i] + 1) + '"></i>' +
        grades[i] + (grades[i+1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  }
  legend.addTo(map);
}
