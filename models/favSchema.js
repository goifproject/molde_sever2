var mongoose = require("mongoose");
var Counter = require('./counterSchema');
var Schema = mongoose.Schema;

var favSchema = new Schema({
    user_id: {type : String},
    fav_id: {type: Number},
    fav_name: {type: String},
    fav_addr: {type: String},
    fav_lat: {type: Number}, // 위도
    fav_lon: {type: Number}// 경도
});

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

favSchema.statics.addFavorite = function(user_id, fav_name, fav_addr, fav_lat, fav_lon, callback){
    getNextId('Favorites',function(_seq){
        Favorite.collection.insert({
            fav_id: _seq,
            user_id: user_id,
            fav_name: fav_name,
            fav_addr: fav_addr,
            fav_lat: Number(fav_lat),
            fav_lon: Number(fav_lon)
        }, function (err, result) {
            if (err) callback(err);
            else {
                callback(null, result);
            }
        })
    });
};

favSchema.statics.removeFavorite = function(user_id, fav_id, callback){
    Favorite.collection.findOneAndDelete({
        user_id: user_id,
        fav_id: Number(fav_id)
    },function(err, result){
        if(err) callback(err);
        else{
            callback(null, result);
        }
    });
};

favSchema.statics.getFavorites = function(user_id, per_page, page, callback){
    Favorite.collection.find({
        user_id: user_id
    }, {projection: {"_id": 0, "user_id": 1, "fav_id": 1, "fav_name": 1,
        "fav_addr": 1, "fav_lat": 1, "fav_lon": 1}},
    function (err, favs) {
        if (err) callback(err);
        else {
            if(per_page != -1 && page != -1)
                    favs.sort({'fav_id':1}).skip(page*per_page).limit(per_page).toArray(function(err,docs){callback(null, docs)});
                else
                    favs.toArray(function(err,docs){callback(null, docs)});
        }
    });
};

var Favorite = mongoose.model("Favorite",favSchema);

module.exports = Favorite;