const logger = require('../service/logger');
var mongoose = require("mongoose");
var Counter = require('./counterSchema');
var Schema = mongoose.Schema;

var commReportSchema = new Schema({
    comm_rep_id: {type: Number},
    comm_id: {type : Number},
    user_id: {type : String},
    comm_rep_date: {type: String}
});

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

commReportSchema.statics.addCommentReport = function(user_id, comm_id, callback){
    let now = new Date()
    getNextId('Commreports',function(_seq){
        CommentReport.collection.insert({
            comm_rep_id: _seq,
            comm_id: Number(comm_id),
            user_id: user_id,
            comm_rep_date: now.getTime(),
        }, function (err, result) {
            if (err) logger.info(err);
            else {
                callback(null, 1);
            }
        })
    });
};

commReportSchema.statics.isCommReportExist = function(user_id, comm_id, callback){
    CommentReport.collection.find({
        user_id: user_id,
        comm_id: Number(comm_id)
    }, {projection: {"_id": 0, "comm_rep_id": 1, "user_id": 1, "comm_id": 1 }},
    function (err, comments) {
        if (err) logger.info(err);
        else {
            comments.toArray(function(err,docs){
                if(docs.length != 0){
                    callback(1);
                }else{
                    callback(0);
                }
            });
        }
    });
};

commReportSchema.statics.getCommentReports = function(per_page, page, callback){
    CommentReport.collection.find({
    }, {projection: {"_id": 0, "comm_rep_id": 1, "comm_id": 1,
                "user_id": 1, "comm_rep_date": 1 }},
    function (err, reps) {
        if (err) callback(err);
        else {
            if(per_page != -1 && page != -1)
                reps.sort({'comm_rep_date':1}).skip(page*per_page).limit(per_page).toArray(function(err,docs){callback(null, docs)});
            else
                reps.toArray(function(err,docs){callback(null, docs)});
        }
    });
};

commReportSchema.statics.removeCommentReport = function(comm_rep_id, callback){
    CommentReport.collection.findOneAndDelete({
        comm_rep_id: Number(comm_rep_id)
    },function(err, result){
        if(err) callback(err);
        else{
            callback(null, result);
        }
    });
};


var CommentReport = mongoose.model("Commreport", commReportSchema);

module.exports = CommentReport;