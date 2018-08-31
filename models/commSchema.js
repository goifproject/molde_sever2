var mongoose = require("mongoose");
var Counter = require('./counterSchema');
var CommReport = require('./commReportSchema');
var Schema = mongoose.Schema;

var commSchema = new Schema({
    comm_id: {type : Number},
    user_id: {type : String},
    user_name: {type : String},
    news_id: {type : Number},
    comment: {type : String},
    comm_date: {type : String},
    comm_rep: {type : Number} // 댓글 신고 : 숫자가 높아질수록 신고 수 높아져서 아웃
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

commSchema.statics.addComment = function(user_id, user_name, news_id, content, callback){
    let now = new Date()
    getNextId('Comments',function(_seq){
        Comment.collection.insert({
            comm_id: _seq,
            user_id: user_id,
            user_name: user_name,
            news_id: Number(news_id),
            comment: content,
            comm_date: now.getTime(),
            comm_rep: 0
        }, function (err, result) {
            if (err) callback(err);
            else {
                callback(null, result);
            }
        })
    });
};

commSchema.statics.removeComment = function(user_id, comm_id, callback){
    Comment.collection.findOneAndDelete({
        user_id: user_id,
        comm_id: Number(comm_id)
    },function(err, result){
        if(err) callback(err);
        else{
            callback(null, result);
        }
    });
};

commSchema.statics.reportComment = function(user_id, comm_id, callback){
    CommReport.isCommReportExist(user_id, comm_id, function(exist){
        if(exist == 1){
            callback(null, 2);
        }else{
            Comment.collection.findOneAndUpdate(
                {comm_id: Number(comm_id)},
                {$inc: {comm_rep: 1}},
                {projection: {"_id": 0, "comm_id": 1, "comm_rep": 1}},
                function(err, result){
                    if(err) console.log(new Error(err));
                    else{
                        CommReport.addCommentReport(user_id, comm_id, callback);
                    }
                }
            );
        }
    })
};

commSchema.statics.getCommentsNews = function(news_id, per_page, page, callback){
    Comment.collection.find({
        news_id: Number(news_id)
    }, {projection: {"_id": 0, "comm_id": 1, "user_id": 1,
        "user_name": 1, "news_id": 1, "comment": 1, "comm_date": 1 }},
    function (err, comments) {
        if (err) callback(err);
        else {
            if(per_page != -1 && page != -1)
                comments.sort({'comm_id':1}).skip(page*per_page).limit(per_page).toArray(function(err,docs){callback(null, docs)});
            else
                comments.toArray(function(err,docs){callback(null, docs)});
        }
    });
};
 
commSchema.statics.getCommentsUser = function(user_id, per_page, page, callback){
    Comment.collection.find({
        user_id: user_id
    }, {projection: {"_id": 0, "comm_id": 1, "user_id": 1,
        "user_name": 1, "news_id": 1, "comment": 1, "comm_date": 1 }},
    function (err, comments) {
        if (err) callback(err);
        else {
            if(per_page != -1 && page != -1)
                comments.sort({'comm_id':1}).skip(page*per_page).limit(per_page).toArray(function(err,docs){callback(null, docs)});
            else
                comments.toArray(function(err,docs){callback(null, docs)});
        }
    });
};

var Comment = mongoose.model("Comment",commSchema);

module.exports = Comment;