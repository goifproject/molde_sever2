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
            if(err) console.log(new Error(err));
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
            if (err) console.log(err);
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
        if (err) console.log(err);
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


var CommentReport = mongoose.model("Commreport", commReportSchema);

module.exports = CommentReport;