import "./index.css";
import {getUsers} from "./common/usersAPI"
console.log("oioi");

const fancyFunc=()=>{
    return [1,2];
};

const [a,b]=fancyFunc();
getUsers().then(json=>console.log(json));