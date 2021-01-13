import * as d3 from "d3"
import { range } from "lodash"
import d3Array from "d3-array"
import caseIds from "../data/tucaseid.json"
import timeframeJson from "../data/timeframe.json"
import timeStoryJson from "../data/timeStory.json"


const timeframe = timeframeJson.json_data
const timeStory = timeStoryJson.json_data
const trCode = {
    0: "Traveling",
    1: "Sleeping",
    2: "Personal Care",
    3: "Work",
    4: "Education",
    5: "Eating & Drinking",
    6: "Housework",
    7: "Household Care",
    8: "Non-Household Care",
    9: "Shopping",
    10: "Pro. Care Services",
    11: "Leisure",
    12: "Sports",
    13: "Religion",
    14: "Volunteering",
    15: "Phone Calls",
    16: "Misc",
  };

const timeLine = getTimeLine() 
function getTimeLine(){
    const offset = new Date().getTimezoneOffset();

    const fourAm = new Date(`1995-12-17T${4 - offset / 60}:00:00`);
    const fourAmOne = new Date(`1995-12-17T${4 - offset / 60}:01:00`);
    const oneMinute = fourAmOne.getTime() - fourAm.getTime();

    let timeline = [];

    for (let i = 0; i < 1440; i++) {
      let moment = fourAm.getTime() + i * oneMinute;
      moment = new Date(moment);
      moment = moment.toISOString().match(/\d*:\d*:\d*/g)[0];
      timeline.push(moment);
    }
    return timeline;
  }

export {caseIds, timeLine,timeframe, trCode, timeStory}