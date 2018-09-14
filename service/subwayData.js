var csv = require('node-csv').createParser();
var mongoose = require("mongoose");
var Counter = require('../models/counterSchema');
var Schema = mongoose.Schema;

function getNextId(name,cb){
    Counter.findOneAndUpdate(
        {_id: name },
        {$inc: {seq: 1}},
        {projection: {"_id": 0, "seq": 1 }},
        function(err, result){
            if(err) console.log(new Error(err));
            else{
                cb(result.seq);
            }
        }
     );
}

var subwaySchema = new Schema({
    subway_id: {type : Number},
    subway_station: {type : String},
    in_2017: {type : Number},
    in_2018: {type : Number},
    subway_lat: {type : Number},
    subway_lon: {type : Number},
});

exports.addToDatabase = function(){
    csv.parseFile('./subway.csv', function(err, data) {
        data.forEach(function (item, index, array) {
            getNextId('Subways',function(_seq){
                Subway.collection.insert({
                    subway_id: _seq,
                    subway_station: item[0],
                    in_2017: Number(item[1]),
                    in_2018: Number(item[2]),
                    subway_lat: Number(item[3]),
                    subway_lon: Number(item[4]),
                },function(err, result){
                    if(err) console.log(err);
                    else console.log(index, item[0], "done");
                })
            })
        });
    }); 
}

var Subway = mongoose.model("Subway",subwaySchema);