let mongoose = require("mongoose");
let Schema = mongoose.Schema;

var subwaySchema = new Schema({
    subway_id: {type : Number},
    subway_station: {type : String},
    in_2017: {type : Number},
    in_2018: {type : Number},
    subway_lat: {type : Number},
    subway_lon: {type : Number},
});

subwaySchema.statics.getSubwayInfo = function(user_lat, user_lon, per_page, page, callback){
    Subway.collection.aggregate(
        [{$project: {_id: 0, subway_id: 1, subway_station: 1,
            in_2017: 1, in_2018: 1, subway_lat: 1, subway_lon: 1,
        distance: 
                  {$sqrt: {$add: [{$pow: [{$divide: [{$subtract: [user_lat, "$subway_lat"]}, 0.009]}, 2]},
                                  {$pow: [{$divide: [{$subtract: [user_lon, "$subway_lon"]}, 0.011]}, 2]}]
                  }}               
        }}],{},
        function (error, subs) {
                if (error) callback(error);
                else {
                    if(per_page != -1 && page != -1)
                        subs.sort({'distance':1}).skip(page*per_page).limit(per_page).toArray(function(err,docs){callback(null, docs)});
                    else{
                        // reports.sort({'distance':1}).toArray(function(err,docs){callback(null, docs)});
                        subs.sort({'distance':1}).toArray(function(err,docs){callback(null, docs)});
                    }
                }
            }
        );
};

var Subway = mongoose.model("Subway",subwaySchema);

module.exports = Subway;