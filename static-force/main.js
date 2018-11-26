
d3.json("dataElyseeReduite.json", function (jsonObject) {
  const dataset = jsonObject.items.item;
  // Formatge de la date au format YYY/MM/DD + Trie de la date par odre croissant
  const ordoredDataSetByDate = dataset.map(item => {
    const parts = item.date.split("/");
    return Object.assign(item, { date: `${parts[2]}/${parts[1]}/${parts[0]}` })
  }).sort((a, b) => new Date(a.date) - new Date(b.date))

  let data = ordoredDataSetByDate.map(item => {
    let nombreDeReference = 0;
    if (Array.isArray(item.items.item)) {
      item.items.item.forEach(i => {
        nombreDeReference += i.reference ? 1 : 0;
      })
    } else {
      nombreDeReference += item.items.item.reference ? 1 : 0;
    }

    return {
      value: item.date,
      size: nombreDeReference
    };
  });


  var margin = { top: 50, right: 50, bottom: 50, left: 50 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    // padding between nodes
    padding = 2,
    maxRadius = 1000,
    numberOfNodes = 50;

  // Create random node data.
  // data = d3.range(numberOfNodes).map(function () {
  //   var value = Math.floor(Math.random() * 50) / 10,
  //     size = Math.floor(Math.sqrt((value + 1) / numberOfNodes * -Math.log(Math.random())) * maxRadius * 10),
  //     datum = { value: value, size: size };
  //   return datum;
  // });

  console.log(Array.isArray(data), data);

  const dataX = data.map(item => new Date(item.value).getDate());

  var x = d3.scale.linear()
    .domain([0, d3.max(dataX, d => d)])
    .range([margin.left, width + margin.right]);

  // Map the basic node data to d3-friendly format.
  var nodes = data.map(function (node, index) {
    return {
      idealradius: node.size,
      radius: 0,
      // Give each node a random color.
      color: '#ff7f0e',
      // Set the node's gravitational centerpoint.
      idealcx: x(new Date(node.value).getDate()),
      idealcy: height / 2,
      x: x(new Date(node.value).getDate()),
      // Add some randomization to the placement;
      // nodes stacked on the same point can produce NaN errors.
      y: height / 2 + Math.random()
    };
  });

  var force = d3.layout.force()
    .nodes(nodes)
    .size([width, height])
    .gravity(0)
    .charge(0)
    .on("tick", tick)
    .start();

  var xAxis = d3.svg.axis()
    .scale(x);

  var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  var loading = svg.append("text")
    .attr("x", (width + margin.left + margin.right) / 2)
    .attr("y", (height + margin.top + margin.bottom) / 2)
    .attr("dy", ".35em")
    .style("text-anchor", "middle")
    .text("Simulating. One moment please…");

  /**
   * On a tick, apply custom gravity, collision detection, and node placement.
   */
  function tick(e) {
    for (i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      /*
       * Animate the radius via the tick.
       *
       * Typically this would be performed as a transition on the SVG element itself,
       * but since this is a static force layout, we must perform it on the node.
       */
      node.radius = node.idealradius - node.idealradius * e.alpha * 10;
      node = gravity(.2 * e.alpha)(node);
      node = collide(.5)(node);
      node.cx = node.x;
      node.cy = node.y;
    }
  }

  /**
   * On a tick, move the node towards its desired position,
   * with a preference for accuracy of the node's x-axis placement
   * over smoothness of the clustering, which would produce inaccurate data presentation.
   */
  function gravity(alpha) {
    return function (d) {
      d.y += (d.idealcy - d.y) * alpha;
      d.x += (d.idealcx - d.x) * alpha * 3;
      return d;
    };
  }

  /**
   * On a tick, resolve collisions between nodes.
   */
  function collide(alpha) {
    var quadtree = d3.geom.quadtree(nodes);
    return function (d) {
      var r = d.radius + maxRadius + padding,
        nx1 = d.x - r,
        nx2 = d.x + r,
        ny1 = d.y - r,
        ny2 = d.y + r;
      quadtree.visit(function (quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== d)) {
          var x = d.x - quad.point.x,
            y = d.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            r = d.radius + quad.point.radius + padding;
          if (l < r) {
            l = (l - r) / l * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
      return d;
    };
  }

  /**
   * Run the force layout to compute where each node should be placed,
   * then replace the loading text with the graph.
   */
  function renderGraph() {
    // Run the layout a fixed number of times.
    // The ideal number of times scales with graph complexity.
    // Of course, don't run too long—you'll hang the page!
    force.start();
    for (var i = 100; i > 0; --i) force.tick();
    force.stop();

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (margin.top + (height * 3 / 4)) + ")")
      .call(xAxis);

    var circle = svg.selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .style("fill", function (d) { return d.color; })
      .attr("cx", function (d) { return d.x })
      .attr("cy", function (d) { return d.y })
      .attr("r", function (d) { return d.radius });

    loading.remove();
  }
  // Use a timeout to allow the rest of the page to load first.
  setTimeout(renderGraph, 10);

});
