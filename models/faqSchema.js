let mongoose = require("mongoose");
var Counter = require('./counterSchema');
let Schema = mongoose.Schema;

let faqSchema = new Schema({
    faq_id: {type: Number},
    user_id: {type: String},
    user_name: {type: String},
    faq_contents: {type: String},
    faq_email: {type: String}
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

faqSchema.statics.insertFaqData = function (user_id, user_name, faq_contents, faq_email, callback) {
    getNextId('FAQS',function(_seq){
        FaQ.collection.insert({
            faq_id: _seq,
            user_id: user_id,
            user_name: user_name,
            faq_contents: faq_contents,
            faq_email: faq_email
        }, function (error, result) {
            if (error) callback(new Error(error));
            else {
               callback(null, result);
            }
        });
    });
};

faqSchema.statics.getFaqs = function(per_page, page, callback){
    FaQ.collection.find({
    }, {projection: {"_id": 0, "faq_id": 1, "user_id": 1,
        "user_name": 1, "faq_contents": 1, "faq_email": 1 }},
    function (err, faqs) {
        if (err) callback(err);
        else {
            if(per_page != -1 && page != -1)
                faqs.sort({'faq_id':1}).skip(page*per_page).limit(per_page).toArray(function(err,docs){callback(null, docs)});
            else
                faqs.toArray(function(err,docs){callback(null, docs)});
        }
    });
};

let FaQ = mongoose.model("FaQ", faqSchema);

module.exports = FaQ;