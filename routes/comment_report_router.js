let express = require("express");
let router = express.Router();
let CommentReportController = require("../controllers/comm_report_controller");

CommentReportController(router);

module.exports = router;