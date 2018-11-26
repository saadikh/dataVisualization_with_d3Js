var margin = { top: 40, right: 20, bottom: 30, left: 40 },
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

var formatPercent = d3.format(".0%");

var x = d3.scale.ordinal()
  .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
  .range([height, 0]);

var xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom");

var yAxis = d3.svg.axis()
  .scale(y)
  .orient("left")
  .tickFormat(formatPercent);

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function (d) {
    return "<strong>Sujet(s) traités:</strong> <span style='color:red'>" + (d * 10) + "</span>";
  })

var svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.call(tip);

d3.json("dataElyseeReduite.json", function (data) {
  var dataset = data.items["item"];

  var cles = [];
  var nombreSujet = [];
  var nbrSujet = []; //version 2
  var titres = [];

  for (var i = 0; i < dataset.length; i++) {
    // la date de l'evenement
    cles.push(dataset[i]["date"])
    //nombreSujet.push(data.items["item"][i]["items"].item);
    nombreSujet.push(dataset[i]["items"].item);
  }

  var jours = [];

  for (var k = 0; k < cles.length; k++) {
    // on recupere juste le jour qui change, vu que c'est tous du 10/2018)
    jours.push(cles[k].split("/")[0])
  }

  //differents sujets
  for (var i = 0; i < 8; i++) {
    if (i == 6) {
      nbrSujet.push(1);
    }
    else {
      nbrSujet.push(nombreSujet[i].length);

    }

  }


  for (var k = 8; k < 13; k++) {
    nbrSujet.push(1);
  }

  // pour trier

  function sortNumber(a, b) {
    return a - b;
  }


  // parseInt sur nbrSujet[]
  var temp = [];
  tempo = jours.map(function (item) {
    return parseInt(item, 10);
  });
  // sort jours
  tempo.sort(sortNumber);

  var result = [tempo, nbrSujet];

  var result = [tempo, nbrSujet];
  var res = tempo.map(function (d) { return d; });

  var res2 = { "jour": tempo, "nombreSujet": nbrSujet };

  dataY = nbrSujet.map(function (d) { return d / 10; })
  console.log(dataY);


  // affichage data
  x.domain(tempo.map(function (d) { return d; }));
  y.domain([0, d3.max(dataY, function (d) { return d; })]);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Nombre de sujet");

  svg.selectAll(".bar") //************************
    .data(dataY) // recuperation des datas
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function (d, i) { return x(tempo[i]); })
    .attr("width", x.rangeBand())
    .attr("y", function (d) { return y(d); })
    .attr("height", function (d) {
      return height - y(d);
    })
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)
});