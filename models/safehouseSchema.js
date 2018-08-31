let mongoose = require("mongoose");
let Schema = mongoose.Schema;

var safehouseSchema = new Schema({
    safe_id: {type : Number},
    safe_address: {type : String},
    safe_name: {type : String},
    safe_phone: {type : String},
    safe_lat: {type : Number},
    safe_lon: {type : Number},
});

safehouseSchema.statics.getSafehouse = function(safe_lat, safe_lon, per_page, page, callback){
    Safehouse.collection.aggregate(
        [{$project: {_id: 0, safe_id: 1, safe_address: 1,
        safe_name: 1, safe_phone: 1, safe_lat: 1, safe_lon: 1,
        distance: 
                  {$sqrt: {$add: [{$pow: [{$divide: [{$subtract: [safe_lat, "$safe_lat"]}, 0.009]}, 2]},
                                  {$pow: [{$divide: [{$subtract: [safe_lon, "$safe_lon"]}, 0.011]}, 2]}]
                  }}               
        }}],{},
        function (error, safes) {
                if (error) callback(error);
                else {
                    if(per_page != -1 && page != -1)
                        safes.sort({'distance':1}).skip(page*per_page).limit(per_page).toArray(function(err,docs){callback(null, docs)});
                    else{
                        // reports.sort({'distance':1}).toArray(function(err,docs){callback(null, docs)});
                        safes.sort({'distance':1}).toArray(function(err,docs){callback(null, docs)});
                    }
                }
            }
        );
};

var Safehouse = mongoose.model("Safehouse",safehouseSchema);

module.exports = Safehouse;