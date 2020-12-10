import * as d3 from "d3"
import jalan from "../data/jalan_raya_dki_jakarta.json"
import kelurahan from "../data/kelurahan_2.json"
import kecamatan from "../data/kecamatan.json"
import kabupaten from "../data/kabupaten.json"
import kepadatan_dki from "../data/luas-wilayah-dan-kepadatan-provinsi-dki-jakarta-tahun-2015.csv"

function compare(kepadatan,kelurahan){
    const li_kepadatan = kepadatan.map(d=>d.nama_kelurahan)
    const li_kelurahan = kelurahan.features.map(d=>d.properties.KEL_NAME)
    // console.log(li_kepadatan)
    // console.log(li_kelurahan)
    const falses = []
    li_kelurahan.forEach(d => {
        const val = li_kepadatan.includes(d)
        if(!val){
            falses.push(d)
        }
    });
    console.log(falses)
    console.log(li_kepadatan.sort())
}
// compare(kepadatan,kelurahan)

function get_kepadatan(kepadatan){
    const result = {}
    kepadatan.forEach(d=>{
        let obj = {}
        obj.kepadatan_jiwa = d["kepadatan_(jiwa/km2)"]
        result[d.nama_kelurahan] = obj
    })
    console.log()
    result.values = kepadatan.map(d=>d["kepadatan_(jiwa/km2)"])
    return result
}

const kepadatan = get_kepadatan(kepadatan_dki)

// console.log(d3.max(kepadatan.values))

export {kelurahan,jalan, kecamatan,kabupaten, kepadatan}