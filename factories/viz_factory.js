(function() {
    var viz = d3.charts.viz();

    var rand = function() {
      return Math.floor((Math.random() * 10) + 1)
    };

    var data = function() {
//      return [1,2,3].map(function(d,i) {
//        var cost = rand();
//        var sales = rand();
//
//        return {
//          category: 'category-'+i,
//          cost: cost,
//          sales: cost + sales
//        };
//      });

      return {
        data:[
          {
            "name":"Current Market (2014)",
            "vendor direct":10,
            "alliance direct":35,
            "1-tier drc":30,
            "1-tier disti":15,
            "2-tier disti/var":10
          },
          {
            "name":"Future Market (2019)",
            "vendor direct":20,
            "alliance direct":30,
            "1-tier drc":25,
            "1-tier disti":10,
            "2-tier disti/var":15
          }
        ]
      }
    };

    d3.select("#chart").datum(data()).call(viz.draw);

//    var id = setInterval(function() {
//      d3.select("#chart").datum(data()).call(viz.draw);
//    }, 2000);
//
//    setTimeout(function() {
//      clearInterval(id);
//    }, 10000);

})();