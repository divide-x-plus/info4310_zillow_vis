// var houseIcon = L.icon({
//     iconUrl: './imgs/home.png',
//     iconSize:     [25, 25], // size of the icon
//     iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
//     popupAnchor:  [-12, -76] // point from which the popup should open relative to the iconAnchor
// })

function mouse_over_event(d){
  // d.target.setRadius(15);
  d3.selectAll('.circle_plots')
  .transition()
  .duration(1000)
  .attr('fill', 'blue')
  .attr('stroke-opacity', 0);

  d3.selectAll('.circle_plots')
  .enter()
  .attr('fill', function(d){
    console.log(d)
  });
}

function mouse_out_event(d){
  d.target.setRadius(6);
}

function mouse_click_event(d){
  d.target.setRadius(15);
  d3.select(this)
  .transition()
  .duration(500)
  .attr('fill-opacity', 1);
}

//TODO not sure if this function actually works. threw error before.
function addToFavorite(d) {
  d3.select("#" + d["ZPID"])
  .on("click", function(){
    console.log(d["ZPID"]);
  })
}

function show_houses(coords, map){
  // TODO Add To Favorite function

  // add markers and tooltips
  coords.forEach(function(house) {
    house.show = true;
    let contents = String(
      "<b>$" + house["Rent Amount"] + "</b>" + "<br>" +
      house["Bedrooms"] + "bd" + "        "
      + house["Bathroom"] + "ba" + "        "
      + house["Lot Size (Sq.Ft.)"] + "sqft" + '<br>' +
      '<button type="button" class="btn btn-info btn-sm">Star</button>'
    )
    var cMarker = L.circleMarker(
      [Number(house.Latitude), Number(house.Longitude)],
      {
         stroke: "black",
         // color: "black",
         fillcolor : "#5577BB",
         className : "circle_plots",
         weight : 1,
         radius : 6,
         opacity : 0,
         fillOpacity : 0.6,
         dashArray: 5
      });
    cMarker.on("click", mouse_click_event)
    cMarker.on("mouseout", mouse_out_event)

    // map.on("zoomend", function(){
    //   if (map.getZoom() < 10) {
    //     cMarker.addTo(map).bindPopup(contents);
    //   } else {
    //     cMarker.addTo(map).bindPopup("something");
    //   }
    // })

    cMarker.addTo(map)
    .bindPopup(contents);
    //chain .openPopup() if want to show one tooltip at onboarding

    // bind data so later we can modify
    d3.selectAll('.circle_plots')
    .data(coords)
  })
}

function show_search_result(res){
  var plots = d3.selectAll('.circle_plots').data(res);
  plots.exit().remove();
  plots.transition()
  .duration(1000)
  .attr('fill-opacity', function(d){
    return d.show ? 0.9 : 0.4;
  })
  .attr('fill', function(d){
    return d.show ? 'blue' : 'grey';
  });
}

function filter_by_prices(data,high){
  data.forEach(function(d){
    d.show = Number(d['Rent Amount'])< high;
  });
  return data;
}

function filter_by_neighborhood(data, neighborhood) {
  let result = data.filter(function(d) {
    return d.Neighborhood === String(neighborhood);
  })
  return result;
}

function filter_by_home_type(data, home_type) {
  let result = data.filter(function(d) {
    return d["Property Type"] === String(home_type);
  })
  return result;
}

function filter_by_year_built(data, year_built) {
  let result = data.filter(function(d) {
    return d["Year Built"] === Number(year_built)
  })
}

let plot_hist = function(data) {
  var PADDING = 20;
  // show div
  document.getElementById('hist_price').style.display = "block";
  d3.select('.content').remove();

  var g = d3.select('.svg_price')
  .append('g')
  .attr('class', 'content')
  .attr('transform', 'translate('+PADDING+','+PADDING+')');


  g.append('rect')
  .attr('width', 250)
  .attr('height', 150)
  .attr('fill', 'none')
  .attr('stroke', 'black')
  .attr('opacity', 0.4);

  var price = data.map(d=>Number(d['Rent Amount']));

  var formatCount = d3.format(",.0f");

  var x = d3.scaleLinear()
    .domain(d3.extent(price))
    .rangeRound([0, 250]);

  var bins = d3.histogram()
      .domain(x.domain())
      .thresholds(x.ticks(20))
      (price);

  var y = d3.scaleLinear()
      .domain([0, d3.max(bins, function(d) { return d.length; })])
      .range([150, 0]);

  var bar = g.selectAll(".bar")
    .data(bins)
    .enter().append("g")
      .attr("class", "bar")
      .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });

  bar.append("rect")
      .attr("x", 1)
      .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
      .attr("height", function(d) {return 150-y(d.length); })
      .attr("fill", "steelblue");

  bar.append("text")
      .attr("dy", ".75em")
      .attr("y", 6)
      .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
      .attr("text-anchor", "middle")
      .attr("font", "sans-serif")
      .attr("font-size", "8px")
      .attr("fill", "#fff")
      .text(function(d) { return formatCount(d.length); });

  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + 150 + ")")
      .call(d3.axisBottom(x));

  d3.select('.axis').selectAll('.tick')
  .attr("font-size", "6px");

  g.append('text')
  .attr('x', 2*PADDING)
  .attr('y', 150-PADDING/2)
  .style('text-anchor', 'middle')
  .text('Close')
  .attr('font-size', '12px')
  .attr('fill', 'black')
  .on('mouseover', function(d){
    d3.select(this).transition().duration(300)
    .attr('font-size', '15px')
    .attr('fill', 'pink')
  })
  .on('mouseout', function(d){
    d3.select(this).style("cursor", "pointer")
    .transition().duration(300)
    .attr('font-size', '12px')
    .attr('fill', 'black')
  })
  .on('click', function(d){
    document.getElementById('hist_price').style.display = "none";
  });

  g.append('text')
  .attr('x', 250-2*PADDING)
  .attr('y', 150-PADDING/2)
  .style('text-anchor', 'middle')
  .text('Enter')
  .attr('font-size', '12px')
  .attr('fill', 'black')
  .on('mouseover', function(d){
    d3.select(this).style("cursor", "pointer")
    .transition().duration(300)
    .attr('font-size', '15px')
    .attr('fill', 'pink')
  })
  .on('mouseout', function(d){
    d3.select(this).transition().duration(300)
    .attr('font-size', '12px')
    .attr('fill', 'black')
  })
  .on('click', function(d){
    document.getElementById('hist_price').style.display = "none";
  });
}
