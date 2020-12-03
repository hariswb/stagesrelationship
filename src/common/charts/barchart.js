import * as d3 from "d3"

const ChartOne = function (id){
    console.log("#".concat(id))
    const width = 500;
    const height = 500;
    const svg = d3.select("#".concat(id))
        .append("svg")
        .attr("viewBox", [0, 0, width, height])
    const layer_1 = svg.append("g")
    layer_1.append("rect")
        .style("fill", "steelblue")
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", height)
        .attr("width", width);
}

export default ChartOne