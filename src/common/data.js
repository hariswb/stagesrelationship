import * as d3 from "d3"
import { range } from "lodash"
import edges from "../data/dolphin_edges.json"
import nodes from "../data/dolphin_nodes.json"


function getHierarchicalData(nodes,edges){
    const result = {}
    const arr = []
    for(let i of range(0,4)){
        const obj = {}
        obj.id = i
        obj.children = nodes.filter(d=>d.group==i)
                            .map(d=>{
                                const node ={}
                                node.id = d.name
                                node.group = d.group
                                node.targets = edges.filter(e=>e.source==d.name)
                                                    .map(e=>e.target)
                                return node
                            })
        arr.push(obj)
    }
    result.children = arr
    return result
}

const dataHierarchical = getHierarchicalData(nodes,edges)


export {dataHierarchical}