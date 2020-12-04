import * as d3 from "d3"
import {yearly_artists_num} from "../data"

const data = yearly_artists_num

const ChartOne = function (id){
    const width = 700;
    const height = 500;
    const margin = {top: 100, right: 20, bottom: 30, left: 40}
    const years = data.map(d=>d.key)
    const svg = d3.select("#".concat(id))
        .append("svg")
        .attr("viewBox", [0, 0, width, height])
    const layer_1 = svg.append("g")
    const layer_2 = svg.append("g")
    const layer_3 = svg.append("g")
    const layer_4 = svg.append("g")
    const layer_5 = svg.append("g")
    const layer_6 = svg.append("g")

    const x = d3.scaleBand()
                .domain(years)
                .range([margin.left, width - margin.right])
                .padding(0.3)
    
    const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.value)]).nice()
                .range([height - margin.bottom, margin.top])
    
    layer_1
        .append("rect")
        .style("fill", "papayawhip")
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", height)
        .attr("width", width);
    
    layer_5
        .attr('transform', `translate(${margin.left}, ${height * 0.1})`)
        .append('text')
        .attr('class', 'text-title')
        .text("Yearly Number Of Artists");

    layer_6
        .attr("fill", "indianred")
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", (d, i) => x(d.key))
        .attr("y", d => y(d.value))
        .attr("height", d => y(0) - y(d.value))
        .attr("width", x.bandwidth())

    layer_3
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width / 80 ).tickSizeOuter(0))
        .call(g => g.append("text")
        .attr("x", width - margin.right)
        .attr("y", -4)
        .attr("fill", "currentColor")
        .attr("font-weight", "bold")
        .attr("text-anchor", "end")
        .text(data.x))

    layer_4
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(height / 40))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
        .attr("x", 4)
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text(data.y))

    layer_2
        .attr("stroke", "tomato")
        .attr("stroke-opacity", 0.3)
        .call(g => g.append("g")
        .selectAll("line")
        .data(y.ticks())
        .join("line")
        .attr("y1", d => 0.5 + y(d))
        .attr("y2", d => 0.5 + y(d))
        .attr("x1", margin.left)
        .attr("x2", width - margin.right));
}

export default ChartOne