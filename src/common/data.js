import bulk from "../data/indonesian_indies.csv"
import uniqBy from "lodash/uniqBy"
import countBy from "lodash/countBy"


function yearly(data){
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

const yearly_artists_num = yearly(bulk)

export {bulk, yearly_artists_num}