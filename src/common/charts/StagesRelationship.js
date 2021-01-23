import * as d3 from "d3";
import { caseids, timeline } from "../data";
const StagesRelationship = function (id) {
  const margin = { top: 0, right: 0, bottom: 0, left: 0 },
    width = 900 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom,
    chart_width = 600,
    chart_height = 600,
    node_radius = 3.5,
    padding = 2, // separation between same-color nodes
    cluster_padding = 2.5, // separation between different-color nodes
    maxRadius = 12;
  let i = 0;
  let INIT = true;
  let SPEED = "slow";
  const speed_slow = 400;
  const speed_fast =20;
  const DECADES = ["1970s", "2010s"];
  const COLOR = {
    0: "#ffe227",
    1: "#00af91",
    2: "#007965",
    3: "#1a508b",
  };
  const STAGES_RELATIONSHIP = {
    0: "First Met",
    1: "Romantic",
    2: "Live Together",
    3: "Married",
  };

  const foci = getFoci();
  function getFoci() {
    const result = {};
    for (let decade of DECADES) {
      const x =
        decade == "1970s" ? (1 / 4) * chart_width : (3 / 4) * chart_width;
      for (let stage of Object.keys(STAGES_RELATIONSHIP)) {
        const y = chart_height * (1 - ((parseInt(stage) + 1) * 1) / 4);
        result[decade + stage] = {
          x: x + 200,
          y: y + 150,
          color: COLOR[stage],
        };
      }
    }
    return result;
  }

  let nodes = initialNodes();

  function initialNodes() {
    return caseids.map(function (id, i) {
      const obj = timeline[0].filter((c) => c.CaseID == id)[0];
      return {
        CaseID: obj.CaseID,
        decade: obj.married_year,
        stage: obj.stage,
        radius: node_radius,
        time: obj.time,
        x: foci[obj.married_year + obj.stage].x + Math.random(),
        y: foci[obj.married_year + obj.stage].y + Math.random(),
        pos: obj.married_year + obj.stage,
        color: foci[obj.married_year + obj.stage].color,
      };
    });
  }

  // SVG

  const svg = d3
    .select("#".concat(id))
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //Background
  const layerBg = svg.append("g");
  layerBg
    .append("rect")
    .attr("fill", "white")
    .attr("opacity", 1)
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", height)
    .attr("width", width);

  layerBg
    .append("line")
    .style("stroke", "lightgrey")
    .style("stroke-width", 2)
    .attr("x1", 200+chart_width/2)
    .attr("y1", 50)
    .attr("x2", 200+chart_width/2)
    .attr("y2", 50+chart_height); 



  // // STAGES RELATIONSHIP CHART
  const layerChart = svg.append("g");

  //  CHART
  const layerBubbles = layerChart.append("g");

  let force = d3.layout
    .force()
    .nodes(nodes)
    .size([width, height])
    .gravity(0)
    .charge(0)
    .friction(0.9)
    .on("tick", tick)
    .start();

  let circle = layerBubbles
    .selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
    .style("fill", function (d) {
      return d.color;
    });

  circle
    .transition()
    .duration(900)
    .delay(function (d, i) {
      return i * 5;
    })
    .attrTween("r", function (d) {
      let i = d3.interpolate(0, d.radius);
      return function (t) {
        return (d.radius = i(t));
      };
    });

  // FIELD
  const layerField = layerChart.append("g");

  layerField
    .append("g")
    .selectAll("text")
    .data(Object.keys(STAGES_RELATIONSHIP))
    .enter()
    .append("text")
    .attr("class", "text-field")
    .text(function (d) {
      return STAGES_RELATIONSHIP[d];
    })
    .attr("transform", function (d) {
      const textWidth = this.getComputedTextLength();
      return `translate(${foci["1970s" + d].x - 300}, ${foci["1970s" + d].y})`;
    });

  layerField
    .append("g")
    .selectAll("text")
    .data(DECADES)
    .enter()
    .append("text")
    .attr("class", "text-field")
    .text(function (d) {
      return d;
    })
    .attr("transform", function (d) {
      const textWidth = this.getComputedTextLength();
      return `translate(${
        foci[d + "0"].x - textWidth / 2
      }, ${height - chart_height - 50})`;
    });

  // Interface

  // Current Time
  d3.select("#current_time").html(currentTime(i))

  // Control

  d3.selectAll("#speed .togglebutton").on("click", function () {
    SPEED = d3.select(this).attr("data-val");
    d3.select("#speed .current").classed("current", false);
    d3.select(this).classed("current", true);
  });

  d3.select("#resetbutton").on("click", function () {
    for (let obj of timeline[0]) {
      nodes[obj.case_index].cx = foci[obj.married_year + obj.stage].x;
      nodes[obj.case_index].cy = foci[obj.married_year + obj.stage].y;
      nodes[obj.case_index].pos = obj.married_year + obj.stage;
      nodes[obj.case_index].decade = obj.married_year;
      nodes[obj.case_index].stage = obj.stage;
      nodes[obj.case_index].color = COLOR[obj.stage];
    }
    i = 0;
    SPEED = "slow";
    d3.select("#speed .current").classed("current", false);
    d3.select(".slow").classed("current", true);
  });

  // Re-Run simulation
  let timeout;
  function timer() {
    if (SPEED == "pause" || i > timeline.length-1) {
      setTimeout(timer, 100);
    } else {
      for (let obj of timeline[i]) {
        nodes[obj.case_index].cx = foci[obj.married_year + obj.stage].x;
        nodes[obj.case_index].cy = foci[obj.married_year + obj.stage].y;
        nodes[obj.case_index].pos = obj.married_year + obj.stage;
        nodes[obj.case_index].decade = obj.married_year;
        nodes[obj.case_index].stage = obj.stage;
        nodes[obj.case_index].color = COLOR[obj.stage];
      }
      d3.select("#current_time").html(currentTime(i))

      force.resume();
      setTimeout(timer, i == 0 ? 1800 : SPEED == "slow" ? speed_slow : speed_fast);
      i += 1;
    }
  }

  timeout = setTimeout(timer, i == 0 ? 1800 : SPEED == "slow" ? speed_slow : speed_fast);

  // Simulation Functions

  function tick(e) {
    circle
      .each(gravity(0.051 * e.alpha))
      .each(collide(0.2))
      .style("fill", function (d) {
        return d.color;
      })
      .attr("cx", function (d) {
        return d.x;
      })
      .attr("cy", function (d) {
        return d.y;
      });
  }

  // Move nodes toward cluster focus.
  function gravity(alpha) {
    return function (d) {
      d.y += (foci[d.decade + d.stage].y - d.y) * alpha;
      d.x += (foci[d.decade + d.stage].x - d.x) * alpha;
    };
  }

  // Resolve collisions between nodes.
  function collide(alpha) {
    let quadtree = d3.geom.quadtree(nodes);
    return function (d) {
      let r = d.radius + node_radius + Math.max(padding, cluster_padding),
        nx1 = d.x - r,
        nx2 = d.x + r,
        ny1 = d.y - r,
        ny2 = d.y + r;
      quadtree.visit(function (quad, x1, y1, x2, y2) {
        if (quad.point && quad.point !== d) {
          let x = d.x - quad.point.x,
            y = d.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            r =
              d.radius +
              quad.point.radius +
              (d.pos === quad.point.pos ? padding : cluster_padding);
          if (l < r) {
            l = ((l - r) / l) * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    };
  }

  //  Get Current Time By Timeline

  function currentTime(i){
    const num_months = Math.floor(i/4)
    const m = num_months%12
    const y = Math.floor(num_months/12)
    return `${y} years, ${m} months`
  }
};

export default StagesRelationship;
