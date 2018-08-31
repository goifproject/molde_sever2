var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Counter = mongoose.model('counters', new Schema({_id: String, seq: Number}));

module.exports = Counter;