// async function fetch_data(){
//   const result = {} 
//   // GEt JSON FILE
//   const response = await fetch(ENDPOINT);
//   const json = await response.json()
//   // Process data
//   result["metrics"]=metrics
//   result["bulk"] = await json.data
//   result["averages"] = await averages(metrics,result["bulk"])
//   return result
// }

// module.exports.get_playlist = ()=>fetch_data()