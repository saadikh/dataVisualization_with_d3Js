moment.locale("fr");

const margin = {
  top: 40,
  right: 20,
  bottom: 30,
  left: 40
};
const width = 960 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const formatPercent = d3.format(".0%");

const x = d3.scale.ordinal()
  .rangeRoundBands([0, width], .1);

const y = d3.scale.linear()
  .range([height, 0]);

const xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom");

const yAxis = d3.svg.axis()
  .scale(y)
  .orient("left")
  .tickFormat(formatPercent);

const tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(nb => `
    <span style='color:red'>${nb}</span>
    <strong>sujet${nb > 1 ? 's' : ''} traité${nb > 1 ? 's' : ''}</strong>
  `)

const svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.call(tip);

d3.json("dataElyseeReduite.json", function (data) {
  const dataset = data.items.item;
  // Formatge de la date au format YYY/MM/DD + Trie de la date par odre croissant
  const ordoredDataSetByDate = dataset.map(item => {
    const parts = item.date.split("/");
    return Object.assign(item, { date: `${parts[2]}/${parts[1]}/${parts[0]}` })
  }).sort((a, b) => new Date(a.date) - new Date(b.date))

  // On compte le nombre de sujet traité par date
  let mappedData = {/**
    Objet de la forme :
      {
        "date": nombreDeSujet
      }
  */};
  ordoredDataSetByDate.forEach(item => {
    let nombreDeReference = 0;
    if (Array.isArray(item.items.item)) {
      item.items.item.forEach(i => {
        nombreDeReference += i.reference ? 1 : 0;
      })
    } else {
      nombreDeReference += item.items.item.reference ? 1 : 0;
    }
    mappedData[item.date] = nombreDeReference;
  });
  const dataX = Object.keys(mappedData).map(date => moment(date).format("ll"));
  const dataY = Object.values(mappedData);


  // affichage data
  x.domain(dataX);
  y.domain([0, d3.max(dataY, d => d)]);

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

  svg.selectAll(".bar")
    .data(dataY)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d, i) => x(dataX[i]))
    .attr("width", x.rangeBand())
    .attr("y", d => y(d))
    .attr("height", d => height - y(d))
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)
});