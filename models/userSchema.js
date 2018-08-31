var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userSchema = new Schema({
    user_id: {type: String},
    user_name: {type: String},
    user_token: {type: String},
    push_chk: {type: Number}
});

userSchema.statics.addUser = function (user_id, user_name, user_token, callback) {
    User.collection.insert({
        user_id: user_id, 
        user_name: user_name, 
        user_token: user_token,
        push_chk: 1,
    }, function (error, users) {
        if (error) callback(error);
        else {
            callback(null, users);
        }
    })
}

var User = mongoose.model("User", userSchema);

module.exports = User;