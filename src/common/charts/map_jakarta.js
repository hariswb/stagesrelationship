import * as d3 from "d3"
import {jalan,kelurahan,kecamatan,kabupaten,kepadatan} from "../data"




// const data = bulk
const map_jakarta = function (id){
    const width = 700;
    const height = 700;
    const map_size = {height:500,width:500}
    const margin = {top: 70, right: 20, bottom: 30, left: 40}
    
    const svg = d3.select("#".concat(id))
        .append("svg")
        .attr("viewBox", [0, 0, width, height])
        
    const layer_bg = svg.append("g")
    const layer_map = svg.append('g')
    const layer_street = svg.append('g')
    const layer_title = svg.append('g')

    const zoom = d3.zoom()
                    .scaleExtent([1, 3])
                    .on("zoom", zoomed);

    const projection = d3.geoMercator().fitSize([width-100, height-100], kecamatan)
    const geoPath = d3.geoPath().projection(projection);

    const kepadatan_values =[...kepadatan.values].sort((a,b)=>b-a)

    const z = d3.scaleSequential(d3.interpolateBlues)
                .domain([kepadatan_values[kepadatan_values.length-1],kepadatan_values[2]])

    svg.call(zoom);

    function zoomed(event) {
        const {transform} = event;
        svg.attr("transform", transform);
        svg.attr("stroke-width", 1 / transform.k);
    }

    layer_bg
        .append("rect")
        .style("fill", "cornsilk")
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", height)
        .attr("width", width);

    layer_map
        .attr("transform",`translate(${margin.left},${margin.top})`)
        .selectAll("path")
        .data(kelurahan.features)
        .enter()
        .append("path")
        .attr( "fill",d=>{
            const name = d.properties.KEL_NAME
            const val = kepadatan[name] !== undefined ?
                        kepadatan[name].kepadatan_jiwa : 0
            return z(val)
        })
        .attr( "stroke-opacity", 0.6 )
        .attr( "stroke", "#333")
        .attr( "d", geoPath);

    layer_title
        .append('text')
        .attr("transform",`translate(${margin.left},${margin.top/2})`)
        .attr('class','text-title')
        .style('font-size','1.3em')
        .text(`Kepadatan Penduduk DKI Jakarta Berdasarkan Kelurahan`)

    // layer_street
    //     .selectAll("path")
    //     .data(jalan.features)
    //     .enter()
    //     // .each(d=>{
    //     //     console.log(d.properties)
    //     // })
    //     .append("path")
    //     .attr( "fill","#ccc" )
    //     .attr( "fill-opacity", 0 )
    //     .attr( "stroke", d=>{
    //         console.log(d.properties.highway)
    //         return ["primary"].includes(d.properties.highway)?"red":"#333"
    //     })
    //     .attr( "d", geoPath);

}

export default map_jakarta