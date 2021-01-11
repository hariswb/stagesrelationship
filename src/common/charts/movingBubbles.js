import * as d3 from "d3";
import { caseIds, activities, timeLine, trCode, timeframe } from "../data";

const MovingBubbles = function (id) {
  const margin = { top: 16, right: 0, bottom: 0, left: 0 },
    width = 700 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom,
    node_radius = 2.3,
    padding = 1, // separation between same-color nodes
    cluster_padding = 1.5, // separation between different-color nodes
    cluster_num = Object.keys(trCode).length,
    maxRadius = 12,
    num_nodes = caseIds.length;

  const color = d3.scale.category10().domain(d3.range(cluster_num));

  function getFoci() {
    const foci = {};
    Object.keys(trCode).map(function (key, i) {
      const x =
        Math.sin(((i + 1) / (cluster_num - 1)) * 2 * Math.PI) *
          (width / 2 - 100) +
        width / 2;
      const y =
        Math.cos(((i + 1) / (cluster_num - 1)) * 2 * Math.PI) *
          (width / 2 - 100) +
        width / 2;
      const xField =
        Math.sin(((i + 1) / (cluster_num - 1)) * 2 * Math.PI) *
          (width / 2 - 50) +
        width / 2;
      const yField =
        Math.cos(((i + 1) / (cluster_num - 1)) * 2 * Math.PI) *
          (width / 2 - 50) +
        width / 2;
      if (i == 0) {
        foci[key] = {
          name: trCode[key],
          x: width / 2,
          y: width / 2,
          xField: width / 2,
          yField: width / 2,
          color: color(i),
        };
      } else {
        foci[key] = {
          name: trCode[key],
          x: x,
          y: y,
          xField: xField,
          yField: yField,
          color: color(i),
        };
      }
    });
    return foci;
  }

  const foci = getFoci();

  const nodeDefault = (caseId) => {
    return {
      id: caseId,
      x: foci[1].x + Math.random(),
      y: foci[1].y + Math.random(),
      radius: node_radius,
      choice: 1,
    };
  };

  let nodes = caseIds.map(function (caseId, i) {
    const obj = timeframe["04:00:00"].filter((a) => a.TUCASEID == caseId)[0];
    if (obj) {
      return {
        id: caseId,
        x: foci[obj ? obj.TRCODE_str : 1].x + Math.random(),
        y: foci[obj ? obj.TRCODE_str : 1].y + Math.random(),
        radius: node_radius,
        choice: obj ? obj.TRCODE_str : 1,
      };
    } else {
      return nodeDefault(caseId);
    }
  });

  console.log(nodes.length);

  const svg = d3
    .select("#".concat(id))
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const layerBg = svg.append("g");
  const layerBubbles = svg.append("g");
  const layerField = svg.append("g");
  const layerPercentage = svg.append("g");

  layerBg
    .append("rect")
    .attr("fill", "ghostwhite")
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", height)
    .attr("width", width);

  layerField
    .selectAll("text")
    .data(Object.keys(foci))
    .enter()
    .append("text")
    .attr("transform", function (d) {
      return `translate(${foci[d].xField - 40}, ${foci[d].yField})`;
    })
    .style("font-family", "Arial")
    .text(function (d) {
      return foci[d].name;
    });

  layerPercentage
    .selectAll("text")
    .data(Object.keys(foci))
    .enter()
    .append("text")
    .attr("class", "text-percentage")
    .attr("transform", function (d) {
      return `translate(${foci[d].xField - 40}, ${foci[d].yField + 20})`;
    })
    .style("font-family", "Arial")
    .text(function (d) {
      const percentage = nodes.filter((node) => node.choice == d).length;
      const text = `${((percentage / num_nodes) * 100).toFixed(1)} %`;
      return text;
    });

  var force = d3.layout
    .force()
    .nodes(nodes)
    .size([width, height])
    .gravity(0)
    .charge(0)
    .friction(0.9)
    .on("tick", tick)
    .start();

  var circle = layerBubbles
    .selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
    .style("fill", function (d) {
      return foci[d.choice].color;
    });

  circle
    .transition()
    .duration(900)
    .delay(function (d, i) {
      return i * 5;
    })
    .attrTween("r", function (d) {
      var i = d3.interpolate(0, d.radius);
      return function (t) {
        return (d.radius = i(t));
      };
    });

  //

  let timeout;
  let i = 1;
  let speed = 100;

  function timer() {
    if (timeframe[timeLine[i]]) {
      for (let obj of timeframe[timeLine[i]]) {
        nodes[obj.case_index].cx = foci[obj.TRCODE_str].x;
        nodes[obj.case_index].cy = foci[obj.TRCODE_str].y;
        nodes[obj.case_index].choice = obj.TRCODE_str;
      }
    }

    console.log(timeLine[i])

    force.resume();

    layerPercentage.selectAll(".text-percentage").remove();
    layerPercentage
      .selectAll("text")
      .data(Object.keys(foci))
      .enter()
      .append("text")
      .attr("class", "text-percentage")
      .attr("transform", function (d) {
        return `translate(${foci[d].xField - 40}, ${foci[d].yField + 20})`;
      })
      .style("font-family", "Arial")
      .text(function (d) {
        const percentage = nodes.filter((node) => node.choice == d).length;
        const text = `${(percentage/num_nodes*100).toFixed(1)} %`;
        return text;
      });

    if (i <= 1440) {
      i++;
    } else {
      i = 0;
    }

    setTimeout(timer, speed);
  }

  timeout = setTimeout(timer, speed);

  //

  function tick(e) {
    circle
      .each(gravity(0.051 * e.alpha))
      .each(collide(0.2))
      .style("fill", function (d) {
        return foci[d.choice].color;
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
      d.y += (foci[d.choice].y - d.y) * alpha;
      d.x += (foci[d.choice].x - d.x) * alpha;
    };
  }

  // Move d to be adjacent to the cluster node.
  function cluster(alpha) {
    return function (d) {
      var cluster = clusters[d.cluster];
      if (cluster === d) return;
      var x = d.x - cluster.x,
        y = d.y - cluster.y,
        l = Math.sqrt(x * x + y * y),
        r = d.radius + cluster.radius;
      if (l != r) {
        l = ((l - r) / l) * alpha;
        d.x -= x *= l;
        d.y -= y *= l;
        cluster.x += x;
        cluster.y += y;
      }
    };
  }

  // Resolve collisions between nodes.
  function collide(alpha) {
    var quadtree = d3.geom.quadtree(nodes);
    return function (d) {
      var r = d.radius + node_radius + Math.max(padding, cluster_padding),
        nx1 = d.x - r,
        nx2 = d.x + r,
        ny1 = d.y - r,
        ny2 = d.y + r;
      quadtree.visit(function (quad, x1, y1, x2, y2) {
        if (quad.point && quad.point !== d) {
          var x = d.x - quad.point.x,
            y = d.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            r =
              d.radius +
              quad.point.radius +
              (d.choice === quad.point.choice ? padding : cluster_padding);
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
};

export default MovingBubbles;
