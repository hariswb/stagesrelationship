import * as d3 from "d3";
import { selection } from "d3";
import { caseIds, timeLine, trCode, timeframe, timeStory } from "../data";

const MovingBubbles = function (id) {
  const margin = { top: 0, right: 0, bottom: 0, left: 0 },
    width = 750 - margin.left - margin.right,
    height = 750 - margin.top - margin.bottom,
    chart_radius = 750,
    chart_padding_left = 295,
    node_radius = 2.7,
    padding = 1, // separation between same-color nodes
    cluster_padding = 1.5, // separation between different-color nodes
    cluster_num = Object.keys(trCode).length,
    maxRadius = 12,
    num_nodes = caseIds.length;

  const palette = [
    "#a4b787",
    "#b0cac7", //traveling
    "#f88f01", //sleeping
    "#5eaaa8", //personal care
    "#c70039", //work
    "#111d5e", //ed
    "#81b214", //eat
    "#f05454", //housework
    "#6a492b", //household
    "#007965", //non household
    "#f58634", //shopping
    "#e5707e", //procare
    "#f6c065", //leisure
    "#1a508b", //sport
    "#af0069", //religion
    "#09015f", //volunteering
    "#8f384d", //phonecalls
    "#86aba1", //misc
  ];

  const color = d3.scale
    .threshold()
    .domain(d3.range(cluster_num))
    .range(palette);

  const foci = getFoci();

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
    .attr("opacity",1)
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", height)
    .attr("width", width);
  // INTERFACE
  const interfaceChart = svg.append("g");
  // CLOCK
  const layerClock = interfaceChart.append("g").attr("class", "clock");
  d3.select(".clock").call(clock, "04:00");

  // CONTROL BUTTON
  let buttons = [
    { name: "SLOW", speed: 300, chosen: true },
    { name: "MEDIUM", speed: 100, chosen: false },
    { name: "FAST", speed: 5, chosen: false },
  ];

  const layerButtons = interfaceChart
    .append("g")
    .selectAll("g")
    .data(buttons)
    .enter()
    .append("g");

  layerButtons.call(buttonBg);
  layerButtons.call(buttonText);

  // NARRATIVE
  const layerNarrative = interfaceChart.append("g").attr("class", "narrative");

  d3.select(".narrative").call(textNarrative, timeStory["04:00:00"].text);

  function textNarrative(selection, text) {
    selection
      .append("text")
      .attr("class", "text text-narrative")
      .text(text)
      .attr("opacity", 0)
      .call(wrap, chart_padding_left - 20)
      .attr("transform", () => `translate(${0}, ${550})`)
      .transition()
      .ease("quad-in-out") // control the speed of the transition
      .duration(1000) // apply it over 2000 milliseconds
      .attr("transform", () => `translate(${0}, ${150})`)
      .attr("opacity", 1);
  }

  // Border line

  const layerBorder = interfaceChart.append("g")

  layerBorder
    .append("rect")
    .attr("x",chart_padding_left - 20)
    .attr("y",0)
    .attr("width",.5)
    .attr("height",height)
    .attr("fill","lightgrey")


  // MOVING BUBBLES CHART
  const layerChart = svg
    .append("g")
    .attr("transform", "translate(" + chart_padding_left + "," + 0 + ")");

  const layerBubbles = layerChart.append("g");
  const layerField = layerChart.append("g");
  const layerPercentage = layerChart.append("g").attr("class", "percentage");

  layerField
    .selectAll("text")
    .data(Object.keys(foci))
    .enter()
    .append("text")
    .attr("class", "text")
    .text(function (d) {
      return foci[d].name;
    })
    .attr("transform", function (d) {
      const textWidth = this.getComputedTextLength();
      return `translate(${
        foci[d].xField - textWidth / 2
      }, ${foci[d].yField + 5})`;
    });

  d3.select(".percentage").call(textPercentage);

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
      return foci[d.choice].color;
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

  // Re-Run simulation

  let timeout;
  let i = 1;

  function toggleSpeed() {
    return buttons.filter((button) => button.chosen == true)[0].speed;
  }

  function timer() {
    if (timeframe[timeLine[i]]) {
      for (let obj of timeframe[timeLine[i]]) {
        nodes[obj.case_index].cx = foci[obj.TRCODE_str].x;
        nodes[obj.case_index].cy = foci[obj.TRCODE_str].y;
        nodes[obj.case_index].choice = obj.TRCODE_str;
      }
    }

    layerPercentage.selectAll(".text-percentage").remove();
    d3.select(".percentage").call(textPercentage);

    layerClock.select(".text-clock").remove();

    d3.select(".clock").call(clock, timeLine[i].slice(0, 5));

    if (timeStory[timeLine[i]]) {
      if (timeStory[timeLine[i]].status === "out") {
        layerNarrative
          .select(".text-narrative")
          .attr("transform", () => `translate(${0}, ${150})`)
          .transition()
          .ease("quad-in-out") // control the speed of the transition
          .duration(500) // apply it over 2000 milliseconds
          .attr("opacity", 0)
          .attr("transform", () => `translate(${0}, ${550})`)
          .remove();
      } else if (timeStory[timeLine[i]].status === "in") {
        d3.select(".narrative").call(
          textNarrative,
          timeStory[timeLine[i]].text
        );
      }
    }

    force.resume();
    if (i < 1439) {
      i++;
    } else {
      i = 0;
    }

    setTimeout(timer, toggleSpeed());
  }

  timeout = setTimeout(timer, toggleSpeed());

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
      let cluster = clusters[d.cluster];
      if (cluster === d) return;
      let x = d.x - cluster.x,
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

  function getFoci() {
    const foci = {};
    Object.keys(trCode).map(function (key, i) {
      const x =
        Math.sin(((i + 1) / (cluster_num - 1)) * 2 * Math.PI) *
          (chart_radius / 2 - 100) +
        chart_radius / 2;
      const y =
        Math.cos(((i + 1) / (cluster_num - 1)) * 2 * Math.PI) *
          (chart_radius / 2 - 100) +
        chart_radius / 2;
      const xField =
        Math.sin(((i + 1) / (cluster_num - 1)) * 2 * Math.PI) *
          (chart_radius / 2 - 50) +
        chart_radius / 2;
      const yField =
        Math.cos(((i + 1) / (cluster_num - 1)) * 2 * Math.PI) *
          (chart_radius / 2 - 50) +
        chart_radius / 2;
      foci[key] = {
        name: trCode[key],
        x: i == 0 ? chart_radius / 2 : x,
        y: i == 0 ? chart_radius / 2 : y,
        xField: i == 0 ? chart_radius / 2 - 40 : xField,
        yField: i == 0 ? chart_radius / 2 - 20 : yField,
        color: color(i),
      };
    });
    return foci;
  }
  function textPercentage(selection) {
    selection
      .selectAll("text")
      .data(Object.keys(foci))
      .enter()
      .append("text")
      .attr("class", "text text-percentage")
      .text(function (d) {
        const percentage = nodes.filter((node) => node.choice == d).length;
        const text = `${((percentage / num_nodes) * 100).toFixed(1)} %`;
        return text;
      })
      .attr("transform", function (d) {
        const textWidth = this.getComputedTextLength();
        return `translate(${
          foci[d].xField - textWidth / 2
        }, ${foci[d].yField + 20})`;
      });
  }

  function clock(selection, text) {
    selection
      .append("text")
      .attr("class", "text text-clock")
      .attr("transform", function (d) {
        return `translate(${margin.left}, ${70})`;
      })
      .text(text);
  }

  function buttonBg(selection) {
    selection
      .append("rect")
      .attr("class", "buttonBg")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 70)
      .attr("height", 25)
      .attr("stroke", "lightgrey")
      .attr("fill", (d) => (d.chosen ? "lightgrey" : "white"))
      .attr("transform", function (d, i) {
        return "translate(" + 70 * i + "," + 82 + ")";
      })
      .on("click", (d, i) => {
        const arr = [0, 1, 2];
        for (let j of arr) {
          buttons[j].chosen = i === j ? true : false;
        }
        layerButtons.selectAll(".buttonBg").remove();
        layerButtons.call(buttonBg);

        layerButtons.selectAll(".text-button").remove();
        layerButtons.call(buttonText);
      });
  }

  function buttonText(selection) {
    selection
      .append("text")
      .attr("class", "text text-button")
      .style("background-color", "blue")
      .text(function (d) {
        return d.name;
      })
      .attr("y", 100)
      .attr("x", function (d, i) {
        const textWidth = this.getComputedTextLength();
        return i * 70 + (70 - textWidth) / 2;
      });
  }

  function nodeDefault(caseId) {
    return {
      id: caseId,
      x: foci[1].x + Math.random(),
      y: foci[1].y + Math.random(),
      radius: node_radius,
      choice: 1,
    };
  }
  function wrap(text, width) {
    text.each(function () {
      var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        x = text.attr("x"),
        y = text.attr("y"),
        dy = 0, //parseFloat(text.attr("dy")),
        tspan = text
          .text(null)
          .append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", dy + "em");
      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text
            .append("tspan")
            .attr("x", 0)
            .attr("y", y)
            .attr("dy", lineHeight + dy + "em")
            .text(word);
        }
      }
    });
  }
};

export default MovingBubbles;
