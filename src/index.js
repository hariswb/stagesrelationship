import "./index.css";
import bar_chart from "./common/charts/barchart" 
import box_plot from "./common/charts/boxplot"
import {bulk} from "./common/data"

console.log()
console.log(bulk[0])
bar_chart("chartOne")
box_plot("chartTwo")