if (d3.charts === null || typeof(d3.charts) !== 'object') { d3.charts = {}; }
d3.charts.viz = function () {
  // Functional inheritance of common areas
  var my = d3.ext.base();

  // Define getter/setter style accessors..
  // defaults assigned
  my.accessor('columnWidth', 50);
  my.accessor('category', 'name');
  my.accessor('colors', ['#5ca998','#93a55d','#eabe4d','#cc5352','#56375c']);

  // Data for Global Scope
  var svg = void 0,
    chart = void 0;

  // main interface to the vizualization code
  my.draw = function(selection) {
    selection.each(function(data) {
      // code in base/scripts.js
      // resuable way of dealing with margins
      svg = my.setupSVG(this);
      chart = my.setupChart(svg);

      // Create the visualization
      my.chart(data);
    });
  };

  // main method for drawing the viz
  my.chart = function(chartData) {

    var
      data = chartData.data,
      x = d3.scale.ordinal().rangeRoundBands([0, my.w()]),
      y = d3.scale.linear().range([0, my.h()]),
      z = d3.scale.ordinal().range(my.colors()),
      keys = _.chain(data[0]).keys().uniq().without('name').value();

//    var svg = chart.append("svg:svg")
//      .attr("width", my.w())
//      .attr("height", my.h())
//      .append("svg:g");
//      .attr("transform", "translate(" + p[3] + "," + (my.h() - p[2]) + ")");

    // Transpose the data into layers by cause.
    var series = d3.layout.stack()(keys.map(function(category) {
      return data.map(function(d) {
        return {x: d.name, y: +d[category]};
      });
    }));

    // Compute the x-domain (by date) and y-domain (by top).
    x.domain(_.chain(data).pluck(my.category()).uniq().value());
    y.domain([0, d3.max(series[series.length - 1], function(d) { return d.y0 + d.y; })]);

    // Add y-axis rules.
    var rule = chart.selectAll("g.rule")
      .data(y.ticks(5))
      .enter().append("svg:g")
      .attr("class", "rule")
      .attr("transform", function(d) { return "translate(0," + -y(d) + ")"; });

    rule.append("svg:line")
      .attr("x2", my.w())
      .style("stroke", function(d) { return d ? "#ececec" : "#d4d4d5"; });

    // Add a group for each cause.
    var column = chart.selectAll("g.column")
      .data(series)
      .enter().append("svg:g")
      .attr("class", "column")
      .style("fill", function(d, i) { return z(i); });
//      .style("stroke", function(d, i) { return d3.rgb(z(i)).darker(); });

    // Add a rect for each date.
    var rect = column.selectAll("rect")
      .data(Object)
      .enter().append("svg:rect")
      .attr("x", function(d) { return x(d.x) + 50; })
      .attr("y", function(d) { return -y(d.y0) - y(d.y); })
      .attr("height", function(d) { return y(d.y); })
      .attr("width", my.columnWidth());

    // Add a label per date.
    var label = chart.selectAll("text")
      .data(x.domain())
      .enter().append("svg:text")
      .attr("x", function(d) { return x(d) + x.rangeBand() / 2; })
      .attr("y", 6)
      .attr("text-anchor", "middle")
      .attr("dy", ".71em")
      .style("stroke", function() { return "#b6b8b9"; })
      .text(function(d){ return d;});

    var dataLabel = column.selectAll('.dataLabel')
      .data(Object)
      .enter().append("svg:text")
      .attr("x", function(d) { return x(d.x) + 50 + (my.columnWidth()/2); })
      .attr("y", function(d) { return -y(d.y0) - y(d.y) + (y(d.y)/2) - 4; })
      .attr("text-anchor", "middle")
      .attr("dy", ".71em")
      .style("stroke", function() { return "#fff"; })
      .text(function(d){ return d.y+'%';});

    rule.append("svg:text")
      .attr("x", 0)
      .attr("y", 15)
      .attr("dy", ".35em")
      .style("stroke", function() { return "#b6b8b9"; })
      .text(function(d){ return d+'%' });

    var getPathPosition = function(series){

      var l = series[0],
          r = series[1];

      return [
        { "x": x(l.x)+ (my.columnWidth()*2),   "y": -y(l.y0) - y(l.y) },
        { "x": x(l.x)+ (my.columnWidth()*2),  "y": -y(l.y0) },
        { "x": x(r.x)+ my.columnWidth(),  "y": -y(r.y0) },
        { "x": x(r.x)+ my.columnWidth(),  "y": -y(r.y0) - y(r.y)},
        { "x": x(l.x)+ (my.columnWidth()*2),   "y": -y(l.y0) - y(l.y) }
      ];
    };

    var lineFunction = d3.svg.line()
          .x(function(d) { return d.x; })
          .y(function(d) { return d.y; })
          .interpolate("linear");

    //Add paths
    var paths = chart.selectAll('.deltaPaths')
      .data(series)
      .enter().append("path")
      .style("fill", function(d, i) { return z(i); })
      .style("fill-opacity", 0.5)
      .attr("d", function(d){ return lineFunction(getPathPosition(d)); });

    var calculateDelta = function(series){
      console.log(series)
      var l = series[0],
        r = series[1];
      return r.y - l.y;
    };

    //Add paths
    var deltaLabels = chart.selectAll('.deltaLabels')
      .data(series)
      .enter().append("svg:text")
      .attr("x", function(d) { return x(d.x) + 50 + (my.columnWidth()/2); })
      .attr("y", function(d) { return -y(d.y0) - y(d.y) + (y(d.y)/2) - 4; })
      .attr("text-anchor", "middle")
      .attr("dy", ".71em")
      .style("stroke", function() { return "#fff"; })
      .text(function(d){ return calculateDelta(d);});




//    var chartData = my.profit(data);
//
//    x.domain([0, my.profitMax(chartData)])
//        .range([0,my.w()]);
//    y.domain(my.categories(chartData))
//        .rangeRoundBands([0, my.h()], 0.2);
//
//    var boxes = chart.selectAll('.box').data(chartData);
//
//    // Enter
//    boxes.enter().append('rect')
//        .attr('class', 'box')
//        .attr('fill', 'steelblue');
//
//    // Update
//    boxes.transition().duration(1000)
//        .attr('x', 0)
//        .attr('y', function(d) { return y(d.category) })
//        .attr('width', function(d) {  return x(d.profit) })
//        .attr('height', y.rangeBand())
//
//    // Exit
//    boxes.exit().remove();
  };

  // Example function to create profit.
//  my.profit = function(data) {
//    return data.map(function(d) {
//      d.profit = parseFloat(d.sales) - parseFloat(d.cost);
//      return d;
//    });
//  };
//
//  my.categories = function(data) {
//    return data.map(function(d) {
//      return d.category;
//    });
//  };
//
//  my.profitMax = function(data) {
//    return d3.max(data, function(d) { return d.profit; });
//  };

  return my;
};
