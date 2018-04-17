function mouse_over_event(d){
  // d.target.setRadius(15);
  d3.selectAll('.circle_plots')
  .transition()
  .duration(1000)
  .attr('fill', 'blue')
  .attr('stroke-opacity', 0);

  // d3.selectAll('.circle_plots')
  // .enter()
  // .attr('fill', function(d){
  //   console.log(d)
  // });
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

// let results = []; //store all results from zillowData

// function to open sidebar and more content when clicking button in popup
// var thisResult;
// function openSidebar(ID) {
//   // TODO: need to change this as we want to stack results?
//   if ($("#sidebar-text").text().length > 0) {
//     $("#sidebar-text").removeText();
//   }
//
//   zillowData.forEach(function(d) {
//     if (d.ZPID === parseInt(ID)) {
//       thisResult = d;
//     }
//   })
//   sidebar.open("home");
//
//   let divToAddContent = document.getElementById("home");
//   divToAddContent.innerHTML =
//     "Price:</br>" +
//     thisResult["Rent Amount"];
// }
//
// function show_houses(coords, map){
//
//
//   // add markers and tooltips
//   coords.forEach(function(d) {
//     d.show = true;
//
//     let cMarker = L.circleMarker([Number(d.Latitude), Number(d.Longitude)], //latlng
//       {
//         radius: 8,
//         fillColor: "#ff7800",
//         color: "#000",
//         weight: 1,
//         opacity: 1,
//         fillOpacity: 0.8
//     }); //style
//
//     cMarker.on("click", mouse_click_event)
//     cMarker.on("mouseout", mouse_out_event)
//
//     cMarker.addTo(map)
//     .bindPopup(
//       '<strong>$'+ d["Rent Amount"] + '</strong>'+
//       '<br/><button type="button" class="btn btn-primary sidebar-open-button" data="' +
//       d.ZPID +
//       '"' +
//       ">Add to Cart</button>"
//     );
//     // results.push(coords);
//     // return cMarker;
//   })
//
//   // bind data so later we can modify
//   d3.selectAll('.circle_plots')
//   .data(coords)
// }





function show_search_result(res){
  var plots = d3.selectAll('.circle_plots').data(res);
  plots.exit().remove();
  plots.transition()
  .duration(500)
  .attr('fill-opacity', function(d){
    return d.show ? 0.9 : 0.4;
  })
  .attr('fill', function(d){
    return d.show ? '#ff7800' : 'grey';
  });
}

function filter_by_prices(data,low,high){

  data.forEach(function(d){
    d.show = (Number(d['Rent Amount'])<= high && Number(d['Rent Amount']) >= low);
    return d;
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

function filter_by_year_built(data,low,high){
  data.forEach(function(d){
    d.show = (Number(d['Year Built'])<= high && Number(d['Year Built']) >= low);
    return d;
  });
  return data;
}

let plot_hist = function(data, map) {
  var PADDING = 20;
  var height = 150;
  var width = 350;
  // show div
  document.getElementById('hist_price').style.display = "block";
  d3.select('#hist_price').select('.content').remove();

  var g = d3.select('.svg_price')
  .append('g')
  .attr('class', 'content')
  .attr('transform', 'translate('+PADDING+','+PADDING+')');

  g.append('text')
  .attr('transform', 'translate('+(width/2)+','+(PADDING/2)+')')
  .attr('text-anchor', 'middle')
  .attr('class', 'price_range')

  var price = data.map(d=>Number(d['Rent Amount']));

  var formatCount = d3.format(",.0f");

  var x = d3.scaleLinear()
    .domain(d3.extent(price))
    .rangeRound([PADDING, width-2*PADDING]);

  var fixed_x = d3.scaleLinear()
    .domain(d3.extent(price))
    .rangeRound([PADDING, width-2*PADDING]);

  var bins = d3.histogram()
      .domain(x.domain())
      .thresholds(x.ticks(15))
      (price);

  var y = d3.scaleLinear()
      .domain([0, d3.max(bins, function(d) { return d.length; })])
      .range([height-PADDING, PADDING]);

  var bar = g.selectAll(".bar")
    .data(bins)
    .enter().append("g")
      .attr("class", "bar")
      .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });

  bar.append("rect")
      .attr("x", 1)
      .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
      .attr("height", function(d) {return height-PADDING-y(d.length); })
      .attr("fill", "steelblue");

    var brush = d3.brushX()
        .extent([[PADDING, PADDING], [width-PADDING, height-PADDING]])
        .on("brush end", brushed);

    function brushed() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
      var s = d3.event.selection || x.range();
      x.domain(s.map(x.invert, x));

      var low = parseInt(fixed_x.invert(s[0]));
      var high = parseInt(fixed_x.invert(s[1]));

      var res = filter_by_prices(data, low, high);
      show_search_result(res);

      g.select('.price_range')
      .text('$'+low + ' - $' + high)
    }

    g.append("g")
       .attr("class", "brush")
       .call(brush)
       .call(brush.move, x.range());

  bar.append("text")
      .attr("dy", ".75em")
      .attr("y", 6)
      .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
      .attr("text-anchor", "middle")
      .attr("font", "sans-serif")
      .attr("font-size", "8px")
      .attr("fill", "#fff")
      .text(function(d) {
        if ((d.length) > 20){
          return formatCount(d.length);
        }
      });

  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + (height-PADDING) + ")")
      .call(d3.axisBottom(x));

  d3.select('.axis').selectAll('.tick')
  .attr("font-size", "6px");

  g.append('text')
  .attr('x', width-2*PADDING)
  .attr('y', height+PADDING*.8)
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

  // g.append('text')
  // .attr('x', width-2*PADDING)
  // .attr('y', height+PADDING*.8)
  // .style('text-anchor', 'middle')
  // .text('Enter')
  // .attr('font-size', '12px')
  // .attr('fill', 'black')
  // .on('mouseover', function(d){
  //   d3.select(this).style("cursor", "pointer")
  //   .transition().duration(300)
  //   .attr('font-size', '15px')
  //   .attr('fill', 'pink')
  // })
  // .on('mouseout', function(d){
  //   d3.select(this).transition().duration(300)
  //   .attr('font-size', '12px')
  //   .attr('fill', 'black')
  // })
  // .on('click', function(d){
  //   document.getElementById('hist_price').style.display = "none";
  // });
}

let plot_hist_year = function(data, map) {
  var PADDING = 20;
  var height = 150;
  var width = 350;
  // show div
  document.getElementById('hist_year').style.display = "block";
  d3.select('.svg_year').select('.content').remove();

  var g = d3.select('.svg_year')
  .append('g')
  .attr('class', 'content')
  .attr('transform', 'translate('+PADDING+','+PADDING+')');

  g.append('text')
  .attr('transform', 'translate('+(width/2)+','+(PADDING/2)+')')
  .attr('text-anchor', 'middle')
  .attr('class', 'price_range')

  var year = data.map(d=>Number(d['Year Built']));

  var formatCount = d3.format(",.0f");

  var x = d3.scaleLinear()
    .domain(d3.extent(year))
    .rangeRound([PADDING, width-2*PADDING]);

  var fixed_x = d3.scaleLinear()
    .domain(d3.extent(year))
    .rangeRound([PADDING, width-2*PADDING]);

  var bins = d3.histogram()
      .domain(x.domain())
      .thresholds(x.ticks(10))
      (year);

  var y = d3.scaleLinear()
      .domain([0, d3.max(bins, function(d) { return d.length; })])
      .range([height-PADDING, PADDING]);

  var bar = g.selectAll(".bar")
    .data(bins)
    .enter().append("g")
      .attr("class", "bar")
      .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });

  bar.append("rect")
      .attr("x", 1)
      .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
      .attr("height", function(d) {return height-PADDING-y(d.length); })
      .attr("fill", "steelblue");

    var brush = d3.brushX()
        .extent([[PADDING, PADDING], [width-PADDING, height-PADDING]])
        .on("brush end", brushed);

    function brushed() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
      var s = d3.event.selection || x.range();
      x.domain(s.map(x.invert, x));

      var low = parseInt(fixed_x.invert(s[0]));
      var high = parseInt(fixed_x.invert(s[1]));

      var res = filter_by_year_built(data, low, high);
      show_search_result(res);

      g.select('.price_range')
      .text(''+low + ' - ' + high)
    }

    g.append("g")
       .attr("class", "brush")
       .call(brush)
       .call(brush.move, x.range());

  bar.append("text")
      .attr("dy", ".75em")
      .attr("y", 6)
      .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
      .attr("text-anchor", "middle")
      .attr("font", "sans-serif")
      .attr("font-size", "8px")
      .attr("fill", "#fff")
      .text(function(d) {
        if ((d.length) > 20){
          return formatCount(d.length);
        }
      });

  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + (height-PADDING) + ")")
      .call(d3.axisBottom(x));

  d3.select('.axis').selectAll('.tick')
  .attr("font-size", "6px");

  g.append('text')
  .attr('x', width-2*PADDING)
  .attr('y', height+PADDING*.8)
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
    document.getElementById('hist_year').style.display = "none";
  });

  // g.append('text')
  // .attr('x', width-2*PADDING)
  // .attr('y', height+PADDING*.8)
  // .style('text-anchor', 'middle')
  // .text('Enter')
  // .attr('font-size', '12px')
  // .attr('fill', 'black')
  // .on('mouseover', function(d){
  //   d3.select(this).style("cursor", "pointer")
  //   .transition().duration(300)
  //   .attr('font-size', '15px')
  //   .attr('fill', 'pink')
  // })
  // .on('mouseout', function(d){
  //   d3.select(this).transition().duration(300)
  //   .attr('font-size', '12px')
  //   .attr('fill', 'black')
  // })
  // .on('click', function(d){
  //   document.getElementById('hist_price').style.display = "none";
  // });
}
