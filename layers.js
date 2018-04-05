



//TODO filter functions for house/rental attributes

//TODO generate map layers based on attributes selected

let populationExtent = d3.extent(geojsonFeature.features, function(d) {
    if (d.properties.census) {
        return Number(d.properties.census.total_pop)
    }
})

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
