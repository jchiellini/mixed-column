"use strict";

if (d3.charts === null || typeof(d3.charts) !== 'object') { d3.charts = {}; }
d3.charts.viz = function () {
  // Functional inheritance of common areas
  var my = d3.ext.base();

  // Define getter/setter style accessors..
  // defaults assigned
  my.accessor('columnWidth', 50);
  my.accessor('categories', ['Series 1','Series 2']);
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

  var difference = function(array1,array2){
    var pack = [];
    for(var i=0;i<array1.length;i++){
      pack[i] = Math.round(array2[i]) - Math.round(array1[i]);
    }
    return pack;
  };

  var processDeltas = function(data){
    var dp = {};
    _.each(data,function(d,i){
      dp[i] = _.chain(d).omit('name').values().value();
    });

    var deltas = [];
    _.each(dp,function(series,i){
      deltas.push(series);
    });
    return difference(dp[0],dp[1]);
  };

  // main method for drawing the viz
  my.chart = function(chartData) {

    var
      data = chartData.data,
      x = d3.scale.ordinal().rangeRoundBands([0, my.w()], 0.85, 0.4),
      x2 = d3.scale.ordinal().rangeRoundBands([0, my.w()], 0.85, 0.4),

      yGrid = d3.scale.ordinal().rangeRoundBands([my.h(), 0]),
      y = d3.scale.linear().range([0, my.h()]),
      z = d3.scale.ordinal().range(my.colors()),
      keys = _.chain(data[0]).keys().uniq().without('name').value(),
      xAxis = d3.svg.axis(),
      xAxis2 = d3.svg.axis(),
      yAxis = d3.svg.axis(),
      deltas = processDeltas(chartData.data);

    var addNames = function(data){
      _.each(data,function(d,i){
        var categories = my.categories();
        data[i].name = categories[i];
      });
    };

    addNames(data);

    if(_.isUndefined(chartData.totals)){ chartData.totals = []; }

    // Transpose the data into layers by cause.
    var series = d3.layout.stack()(keys.map(function(category) {
      return data.map(function(d) {
        return {x: d.name, y: +d[category]};
      });
    }));


    x.domain(my.categories());
    x2.domain(chartData.totals);
    y.domain([0, d3.max(series[series.length - 1], function(d) { return d.y0 + d.y; })]);
    yGrid.domain(["20%", "40%", "50%", "60%", "80%", "100%"]);

    xAxis.scale(x)
      .tickPadding(10)
      .outerTickSize([0])
      .tickSize(0)
      .orient('bottom');

    chart.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0, ' + my.h() +')')
      .call(xAxis);

    xAxis2.scale(x2)
      .tickPadding(27)
      .outerTickSize([0])
      .tickSize(0)
      .orient('bottom');

    chart.append('g')
      .attr('class', 'x2 axis')
      .attr('transform', 'translate(0, ' + my.h() +')')
      .call(xAxis2);

    yAxis.scale(yGrid)
      .tickSize(-my.w())
      .tickPadding(-25)
      .orient('left')
      .outerTickSize([0]);

    var yLabels = chart.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(0, ' + -yGrid.rangeBand()/2 + ')')
      .call(yAxis);

    yLabels.selectAll("text")
      .attr("dy", 15);

    // Add a group for each series.
    var column = chart.selectAll("g.column")
      .data(series)
      .enter().append("svg:g")
      .attr("class", "column")
      .style("fill", function(d, i) { return z(i); });

    var columnText = chart.selectAll("g.column-text")
      .data(series)
      .enter().append("svg:g")
      .attr("class", "column-text");

    // Add a rect for each series.
//    var rect =
    column.selectAll("rect")
      .data(Object)
      .enter().append("svg:rect")
      .attr("x", function(d) { return x(d.x) ; })
      .attr("y", function(d) { return y(d.y0); })
      .attr("height", function(d) { return y(d.y); })
      .attr("width", x.rangeBand());

    var getPathPosition = function(series){
      var l = series[0],
        r = series[1];

      return [
        { "x": x(l.x) + x.rangeBand(),   "y": y(l.y0) },
        { "x": x(l.x) + x.rangeBand(),  "y": y(l.y0) + y(l.y) },
        { "x": x(r.x),  "y": y(r.y0) + y(r.y) },
        { "x": x(r.x),  "y": y(r.y0)  },
        { "x": x(l.x) + x.rangeBand(),   "y": y(l.y0) }
      ];
    };

    var lineFunction = d3.svg.line()
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; })
      .interpolate("linear");

    //Add delta paths
    var paths =
      chart.selectAll('.deltaPaths')
        .data(series)
        .enter().append("path")
        .style("fill", function(d, i) { return z(i); })
        .style("fill-opacity", 0.5);

    paths.attr("d", function(d){ return lineFunction(getPathPosition(d)); });

    var getDeltaPosition = function(series){
      var l = series[0],
        r = series[1];
      return (r.y0+ (r.y/2) + l.y0 + (l.y/2))/2;
    };

    var dataLabel =
      columnText.selectAll('.dataLabel')
        .data(Object)
        .enter().append("svg:text")
        .attr('class','dataLabel')
        .attr("x", function(d) { return x(d.x) + (x.rangeBand()/2); })
        .attr("y", function(d) { return (y(d.y0) + y(d.y)/2)-4; })
        .attr("text-anchor", "middle")
        .attr("dy", ".71em")
        .style("fill", function() { return "#fff"; });

    dataLabel.text(function(d){ return Math.round(d.y)+'%';});

    //Add delta labels
    var deltaLabels =
      chart.selectAll('.deltaLabels')
        .data(series)
        .enter().append("svg:text")
        .attr("x", function() { return my.w()/2; })
        .attr("y", function(d) { return y(getDeltaPosition(d))-4; })
        .attr("text-anchor", "middle")
        .attr("dy", ".71em")
        .style("fill", function() { return "#fff"; });

    deltaLabels.text(function(d,index){
      var delta = Math.round(deltas[index]);
      if(delta > 0){
        delta = "+"+delta;
      }
      return delta;
    });


  };
  return my;
};
