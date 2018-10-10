const logger = require('../service/logger');
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
            if(err) logger.info(new Error(err));
            else{
                cb(result.seq);
            }
        }
     );
}

var safehouseSchema = new Schema({
    safe_id: {type : Number},
    safe_address: {type : String},
    safe_name: {type : String},
    safe_phone: {type : String},
    safe_lat: {type : Number},
    safe_lon: {type : Number},
});

exports.addToDatabase = function(){
    csv.parseFile('./read_file/safehouse.csv', function(err, data) {
        data.forEach(function (item, index, array) {
            getNextId('Safehouses',function(_seq){
                Safehouse.collection.insert({
                    safe_id: _seq,
                    safe_name: item[1],
                    safe_address: item[2],
                    safe_phone: item[3],
                    safe_lat: Number(item[4]),
                    safe_lon: Number(item[5]),
                },function(err, result){
                    logger.info(err);
                })
            })
        });
    }); 
}

var Safehouse = mongoose.model("Safehouse",safehouseSchema);