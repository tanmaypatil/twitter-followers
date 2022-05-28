var add = require('date-fns/add');
var format = require('date-fns/format');
var parse = require('date-fns/parse');

function getTodaysDate() {
    console.log(`getTodaysDate in`);
    let d = new Date();
    str = format(d, 'yyyyMMdd');
    console.log(str);
    console.log(`getTodaysDate out : ${str}`);
    return str;
}

module.exports = {
    getTodaysDate : getTodaysDate
}
