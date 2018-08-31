var mongoose = require("mongoose");
var Counter = require('./counterSchema');
var News = require('./newsSchema');
var Schema = mongoose.Schema;

var scrapSchema = new Schema({
    scrap_id: {type : Number},
    user_id: {type : String},
    news_id: {type : Number}
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

scrapSchema.statics.addScrap = function(user_id, news_id, callback){
    getNextId('Scraps',function(_seq){
        Scrap.collection.insert({
            scrap_id: _seq,
            user_id: user_id,
            news_id: Number(news_id)
        }, function (err, result) {
            if (err) callback(err);
            else {
                callback(null, result);
            }
        })
    });
};

scrapSchema.statics.removeScrap = function(user_id, scrap_id, callback){
    Scrap.collection.findOneAndDelete({
        user_id: user_id,
        scrap_id: Number(scrap_id)
    },function(err, result){
        if(err) callback(err);
        else{
            callback(null, result);
        }
    });
};

scrapSchema.statics.getScraps = function(user_id, per_page, page, callback){
    Scrap.collection.find({
        user_id: user_id
    }, {projection: {"_id": 0, "user_id": 1, "scrap_id": 1, "news_id": 1 }},
    function (err, scraps) {
        if (err) callback(err);
        else {
            if(per_page != -1 && page != -1)
                scraps.sort({'scrap_id':1}).skip(page*per_page).limit(per_page).toArray(function(err,docs){callback(null, docs)});
            else
                scraps.toArray(function(err,docs){callback(null, docs)});
        }
    });
};

scrapSchema.statics.isScrapExist = function(user_id, news_id, callback){
    Scrap.collection.find({
        user_id: user_id,
        news_id: news_id,
    }, {projection: {"_id": 0, "user_id": 1, "scrap_id": 1, "news_id": 1 }},
    function (err, scraps) {
        if (err) callback(err);
        else {
            scraps.toArray(function(err,docs){callback(null,docs)});
        }
    });
};

var Scrap = mongoose.model("Scrap",scrapSchema);

module.exports = Scrap;