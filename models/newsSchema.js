var mongoose = require("mongoose");
var Counter = require('./counterSchema');
var Schema = mongoose.Schema;

var photoSchema = new Schema({
    page_num: {type: Number, default: -1},
    url: {type: String, default: null}
});

var newsSchema = new Schema({
    news_id: {type: Number},
    post_id: {type: String},
    description: {type: String},
    date: {type: String},
    add_date: {type: String},
    news_img: [[photoSchema]],
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

newsSchema.statics.updateNewsFromFB = function(news){
    let now = new Date;
    getNextId('News',function(_seq){
        News.collection.insert({
            news_id: _seq,
            post_id: news.post_id,
            description: news.description,
            date: news.date,
            add_date: now.getTime(),
            news_img: news.news_img
        }, function (err, result) {
            if (err) {
                console.log(err);
            }
            else {
                // console.log(result);
            }
        })
    });
};

newsSchema.statics.getCardNews = function(per_page, page, callback){
    News.collection.find({
    }, {projection: {"_id": 0, "news_id": 1, "post_id": 1,
        "description": 1, "date": 1, "news_img": 1}},
    function (err, news) {
        if (err) callback(error);
            else {
                if(per_page != -1 && page != -1)
                    news.sort({'news_id':1}).skip(page*per_page).limit(per_page).toArray(function(err,docs){callback(null, docs)});
                else
                    news.toArray(function(err,docs){callback(null, docs)});
            }
    });
};

newsSchema.statics.getCardNewsByID = function(news_id, callback){
    News.collection.find({ 
        news_id : Number(news_id)
    }, {projection: {"_id": 0, "news_id": 1, "post_id": 1,
        "description": 1, "date": 1, "news_img": 1}},
    function (err, news) {
        if (err) callback(err);
        else {
            news.toArray(function(err,docs){callback(null, docs)});
        }
    });
};

var News = mongoose.model("News", newsSchema);

module.exports = News;