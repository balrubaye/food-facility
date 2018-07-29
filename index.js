const fetch= require('node-fetch');
const eol = require('os').EOL;
const readline = require('readline');
const padEnd = require('string.prototype.padend');

padEnd.shim();

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

//http://data.sfgov.org/resource/bbb8-hzi6.json
const today = new Date();
console.log(`${today.getDay()} -- ${today.getHours()} `)

let result=[];
let curPage=-10;
const page=10;

/**
 * Format the hour to be 24
 * @param {*} hourAMPM 
 * 
 */
const formatHour= (hourAMPM) => {
    let diff=0;

    if(hourAMPM.indexOf('PM') > -1){
        diff= 12;
    }
    return (parseInt(hourAMPM.replace(/(AM|PM)/,'' ))%12)+ diff;
}

/**
 * Fetch the food trucks data from the API
 * @param {*} day 
 * @param {*} hour
 * @returns {Promise} 
 */
const fetchFoodTrucks= (day, hour) => {
    return fetch('http://data.sfgov.org/resource/bbb8-hzi6.json')
    .then(res=> res.json())
    .then(json=> {
        return json.filter(truck => {
            return parseInt(truck.dayorder) === day && formatHour(truck.starttime) <= hour && formatHour(truck.endtime) >= hour});

    });
}


/**
 * Get the paged list of food trucks
 * @return {Promis}
 */
const getFoodTrucks = () => {
    if(result.length > 0){
        curPage +=10;
        return Promise.resolve(result.slice(curPage, curPage+page));
    }else {
        return fetchFoodTrucks(today.getDay(), today.getHours())
        .then(res=> result= res);
    }
}

getFoodTrucks();

console.log('Press any key to page through data.. Ctrl C to exit');
process.stdin.on('keypress', (str, key) => {
    if (key.ctrl && key.name === 'c') {
      process.exit();
    } else {
        if(curPage<0){
            console.log(`${'NAME'.padEnd(50)}\tLOCATION`)
        }
        getFoodTrucks()
        .then(res => {
            res.forEach(element => {
                console.log(`${element.applicant.padEnd(50)}\t${element.location}`);
            });
        });
      } 
  });