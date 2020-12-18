import * as d3 from "d3"
import { bindAll } from "lodash";
import {dataHierarchical,edges,nodes} from "../data"

const edgeBundling = function (id){
    const width = 700;
    const height = 700;
    const map_size = {height:500,width:500}
    const margin = {top: 70, right: 20, bottom: 30, left: 40}
    
    const svg = d3.select("#".concat(id))
        .append("svg")
        .attr("viewBox", [0, 0, width, height])
        
    const layerBg = svg.append("g")
    const layerNodes = svg.append("g")
    const layerLinks = svg.append("g")
    const layerTitle = svg.append("g")

    const radius = width/2

    const tree = d3.cluster()
                    .size([2 * Math.PI, radius - 100])

    const root = tree(bilink(d3.hierarchy(dataHierarchical)));

    const line = d3.lineRadial()
                    .curve(d3.curveBundle.beta(0.85))
                    .radius(d => d.y)
                    .angle(d => d.x)

    layerBg
        .append("rect")
        .attr("fill","ghostwhite")
        .attr("x",0)
        .attr("y",0)
        .attr("height",height)
        .attr("width",width)
    
    layerNodes
        .attr("transform",`translate(${width/2},${height/2+margin.top/2})`)
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .selectAll("g")
        .data(root.leaves())
        .join("g")
        .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
        .append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d.x < Math.PI ? 6 : -6)
        .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
        .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
        .text(d => d.data.id)
    
    layerLinks
        .attr("transform",`translate(${width/2},${height/2+margin.top/2})`)
        .attr("stroke", "DarkSlateGrey")
        .attr("stroke-opacity", 0.7)
        .attr("stroke-width", 1.3)
        .attr("fill", "none")
        .selectAll("path")
        .data(root.leaves().flatMap(leaf => leaf.outgoing))
        .join("path")
        .style("mix-blend-mode", "multiply")
        .attr("d", ([i, o]) => line(i.path(o)))
        .each(function(d) { d.path = this; });

    layerTitle
        .append("text")
        .attr("transform",`translate(${margin.left+70},${margin.top/2})`)
        .style("font-size","1.5rem")
        .style("font-family","arial")
        .style("font-weight","bold")
        .text("Dolphin Relationship Of Doubtful Sound")
}
function bilink(root) {
    const map = new Map(root.leaves().map(d => [d.data.id, d]));
    for (const d of root.leaves()) d.incoming = [], d.outgoing = d.data.targets.map(i => [d, map.get(i)]);
    for (const d of root.leaves()) for (const o of d.outgoing) o[1].incoming.push(o);
    return root;
  }
export default edgeBundling