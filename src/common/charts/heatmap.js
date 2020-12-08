import * as d3 from "d3"
import {correlation_data} from "../data"
import range from "lodash/range"

const data = correlation_data

const heatmap = function (id){
    const width = 500
    const height = 500
    const margin = {top: 100, right: 20, bottom: 100, left: 100}
    const svg = d3.select("#".concat(id))
        .append("svg")
        .attr("viewBox", [0, 0, width+200, height])
    
    const layer_bg = svg.append("g")
    const layer_x_axis = svg.append("g")
    const layer_y_axis = svg.append("g")
    const layer_cards = svg.append("g")
    const layer_legend = svg.append("g")
    const layer_Title = svg.append("g")

    const x = d3.scaleBand()
        .range([margin.left, width-margin.left])
        .domain(data.features)
        .paddingInner(1)
        .paddingOuter(.5)

    const y = d3.scaleBand()
        .range([height-margin.top, margin.top])
        .domain(data.features)
        .paddingInner(1)
        .paddingOuter(.5)

    const z = d3.scaleSequential(d3.interpolateRdBu)
                .domain([-1, 1])
    
    const bandwidth = y(data.features[0])-y(data.features[1])

    layer_bg
        .append("rect")
        .style("fill", "ivory")
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", height)
        .attr("width", width);

    layer_x_axis
        .attr("transform", `translate(0,${height-margin.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .selectAll("text")
        .attr("y", 0)
        .attr("x", -9)
        .attr("dy", ".35em")
        .attr("transform", "rotate(270)")
        .style("text-anchor", "end")


    layer_y_axis
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).tickSizeOuter(0))
    layer_cards
        .selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("transform", d => `translate(0,${y(d.y)-bandwidth/2})`)
        .append("rect")
        .attr("fill"  , d=>z(d.r))
        .attr("x"     , d=>x(d.x)-bandwidth/2)
        .attr("y"     ,0)
        .attr("height", bandwidth)
        .attr("width" , bandwidth)
        // .on('mouseover', tip.show)
        // .on('mouseout' , tip.hide);

    const axis_legend = d3.scaleLinear()
        .range([margin.top+height/4,margin.top])
        .domain([-1,1])
                        
    layer_legend
        .append("g")
        .attr("transform", `translate(${width-margin.left/2},0)`)
        .call(d3.axisRight(axis_legend).ticks(5))
    
    layer_legend
        .append("g")
        .selectAll("rect")
        .data(range(-50,50+1).map(x=>x/50))
        .enter()
        .append("rect")
        .attr("transform", `translate(${width-margin.left/2-17},${-height/4/50/4})`)
        .attr("fill",d=>z(d))
        .attr("width",7)
        .attr("height",height/4/50)
        .attr("x",10)
        .attr("y",d=>axis_legend(d))
    
    layer_legend
        .append("g")
        .append('text')
        .attr('transform', `translate(${width-margin.left/2-5},${margin.top+height/4+17})`)
        .text(`r`)

    layer_Title
    .append("g")
    .append('text')
    .attr('transform', `translate(10,30)`)
    .attr('class','text-title')
    .style('font-size','1.2em')
    .text(`Features Correlation Matrix`)

    
}

export default heatmap