import * as d3 from "d3"
import bulk from "../data/indonesian_indies.csv"
import uniqBy from "lodash/uniqBy"
import countBy from "lodash/countBy"
import sum from "lodash/sum"

function get_correlation(data){
    const features_name =  ['danceability','energy','speechiness','acousticness',
               'instrumentalness','liveness','valence']
    const length = data.length
    const features = {}
    features_name.forEach(f=>{
        const values =  data.map(d=>d[f])
        features[f] = values
        features[f].mean = features[f].reduce((a,b) => a + b)/length
    })
    const result = []
    for(let x of features_name){
        for(let y of features_name){
            let obj = {}
            obj.x = x
            obj.y = y
            obj.r = pearson(features[x],features[y],features[x].mean,features[y].mean)
            result.push(obj)
        }
    }
    function pearson(x_arr, y_arr, x_mean, y_mean){
        const A = sum(x_arr.map((d,i)=>(x_arr[i]-x_mean)*(y_arr[i]-y_mean)))
        const Bx = sum(x_arr.map((d,i)=>(x_arr[i]-x_mean)**2))
        const By = sum(x_arr.map((d,i)=>(y_arr[i]-y_mean)**2))
        return A/Math.sqrt(Bx*By)
    }    
    result.features = features_name
    return result
}

function get_features(data){
    const features =  ['danceability','energy','speechiness','acousticness',
               'instrumentalness','liveness','valence']
    const result = []
    for(let feature of features){
        const obj = {}
        obj.key = feature
        const values = data.map(d=>d[feature])
        values.sort((a, b) => a - b);
        const min = values[0];
        const max = values[values.length - 1];
        const q1 = d3.quantile(values, 0.25);
        const q2 = d3.quantile(values, 0.50);
        const q3 = d3.quantile(values, 0.75);
        const iqr = q3 - q1; // interquartile range
        const r0 = Math.max(min, q1 - iqr * 1.5);
        const r1 = Math.min(max, q3 + iqr * 1.5);
        values.quartiles = [q1, q2, q3];
        values.range = [r0, r1];
        values.outliers = values.filter(v => v < r0 || v > r1);
        obj.value = values  
        result.push(obj)
    }
    return result 
}

function get_yearly(data){
    let years = uniqBy(data,d=>d.release_year).map(d=>d.release_year)
    let result = []
    for (let year of years){
        let array = data.filter(d=>d.release_year===year)
        array = uniqBy(array, d=>d.artist)
        let count = countBy(array, d=>d.release_year)
        let obj = {}
        obj.key = year
        obj.value = count[year]
        result.push(obj)
    }
    return result.sort((a,b)=>a.key-b.key)
}

const yearly_artists_num = get_yearly(bulk)
const features_data = get_features(bulk)
const correlation_data = get_correlation(bulk)

export {bulk, yearly_artists_num,correlation_data,features_data}