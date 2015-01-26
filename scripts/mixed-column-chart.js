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
      x = d3.scale.ordinal().rangeRoundBands([0, my.w()], .85, .4),
      yGrid = d3.scale.ordinal().rangeRoundBands([my.h(), 0]),
      y = d3.scale.linear().range([0, my.h()]),
      z = d3.scale.ordinal().range(my.colors()),
      keys = _.chain(data[0]).keys().uniq().without('name').value(),
      xAxis = d3.svg.axis(),
      yAxis = d3.svg.axis();

    // Transpose the data into layers by cause.
    var series = d3.layout.stack()(keys.map(function(category) {
      return data.map(function(d) {
        return {x: d.name, y: +d[category]};
      });
    }));

    // Compute the x-domain (by date) and y-domain (by top).
    x.domain(_.chain(data).pluck(my.category()).uniq().value());
    y.domain([0, d3.max(series[series.length - 1], function(d) { return d.y0 + d.y; })]);
    yGrid.domain(["20%", "40%", "50%", "60%", "80%", "100%"]);

    xAxis.scale(x)
      .tickPadding(3)
      .outerTickSize([0])
      .orient('bottom');

    chart.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0, ' + my.h() +')')
      .call(xAxis);

    yAxis.scale(yGrid)
      .tickSize(-my.w())
      .tickPadding(-15)
      .orient('left')
      // .tickFormat(format)
      .outerTickSize([0]);

    chart.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(0, ' + -yGrid.rangeBand()/2 + ')')
      .call(yAxis);

    // Add y-axis rules.
    // var rule = chart.selectAll("g.rule")
    //   .data(y.ticks(5))
    //   .enter().append("svg:g")
    //   .attr("class", "rule")
    //   .attr("transform", function(d) { return "translate(0," + -y(d) + ")"; });

    // rule.append("svg:line")
    //   .attr("x2", my.w())
    //   .style("stroke", function(d) { return d ? "#ececec" : "#d4d4d5"; });

    // Add a group for each cause.
    var column = chart.selectAll("g.column")
      .data(series)
      .enter().append("svg:g")
      .attr("class", "column")
      .style("fill", function(d, i) { return z(i); });

    // Add a rect for each series.
    var rect = column.selectAll("rect")
      .data(Object)
      .enter().append("svg:rect")
      .attr("x", function(d) { return x(d.x) ; })
      .attr("y", function(d) { return y(d.y0); })
      .attr("height", function(d) { return y(d.y); })
      .attr("width", x.rangeBand());

    // Add a label per date.
    // var label = chart.selectAll("text")
    //   .data(x.domain())
    //   .enter().append("svg:text")
    //   .attr("x", function(d) { return x(d) + x.rangeBand() / 2; })
    //   .attr("y", 6)
    //   .attr("text-anchor", "middle")
    //   .attr("dy", ".71em")
    //   .style("stroke", function() { return "#b6b8b9"; })
    //   .text(function(d){ return d;});

    var dataLabel = column.selectAll('.dataLabel')
      .data(Object)
      .enter().append("svg:text")
      .attr("x", function(d) { return x(d.x) + (x.rangeBand()/2); })
      .attr("y", function(d) { return y(d.y0) + y(d.y)/2; })
      .attr("text-anchor", "middle")
      .attr("dy", ".71em")
      .style("stroke", function() { return "#fff"; })
      .text(function(d){ return d.y+'%';});

    // rule.append("svg:text")
    //   .attr("x", 0)
    //   .attr("y", 15)
    //   .attr("dy", ".35em")
    //   .style("stroke", function() { return "#b6b8b9"; })
    //   .text(function(d){ return d+'%' });

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

    //Add paths
    var paths = chart.selectAll('.deltaPaths')
       .data(series)
       .enter().append("path")
       .style("fill", function(d, i) { return z(i); })
       .style("fill-opacity", 0.5)
       .attr("d", function(d){ return lineFunction(getPathPosition(d)); });

    var calculateDelta = function(series){
      var l = series[0],
        r = series[1];
      return r.y - l.y;
    };

    var getDeltaPosition = function(series){
      var l = series[0],
        r = series[1];
      return (r.y0+ (r.y/2) + l.y0 + (l.y/2))/2;
    };

    //Add paths
    var deltaLabels = chart.selectAll('.deltaLabels')
      .data(series)
      .enter().append("svg:text")
      .attr("x", function(d) { return my.w()/2; })
      .attr("y", function(d) { return y(getDeltaPosition(d)); })
      .attr("text-anchor", "middle")
      .attr("dy", ".71em")
      .style("stroke", function() { return "#fff"; })
      .text(function(d){ return calculateDelta(d);});
  };
  return my;
};
