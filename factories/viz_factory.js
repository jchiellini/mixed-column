(function() {
    var viz = d3.charts.viz();


    var data = function() {

      return {
        data:[
          {
            "name":"Current Market (2014)",
            "vendor direct":45,
            "alliance direct":3,
            "1-tier drc":26,
            "1-tier disti":3,
            "2-tier disti/var":23
          },
          {
            "name":"Future Market (2018)",
            "vendor direct":47,
            "alliance direct":3,
            "1-tier drc":26,
            "1-tier disti":2,
            "2-tier disti/var":22
          }
        ],
        delta:[7,4,5,3,3],
        totals:['$46,324,2234','$49,466,341']
      }
    };

    var data2 = function() {

    return {
      data:[
        {
          "name":"Current Market (2014)",
          "vendor direct":50,
          "alliance direct":3,
          "1-tier drc":21,
          "1-tier disti":3,
          "2-tier disti/var":23
        },
        {
          "name":"Future Market (2018)",
          "vendor direct":40,
          "alliance direct":3,
          "1-tier drc":26,
          "1-tier disti":2,
          "2-tier disti/var":29
        }
      ],
      delta:[7,4,5,3,3],
      totals:['$46,324,2234','$49,466,341']
    }
  };

  setTimeout(function() {
    d3.select("#chart").datum(data2()).call(viz.draw);
  }, 3000);

    viz.margin({top: 10, right: 10, bottom: 40, left: 10});

    d3.select("#chart").datum(data()).call(viz.draw);

})();