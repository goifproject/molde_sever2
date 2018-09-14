let express = require("express");
let router = express.Router();
let SubwayController = require("../controllers/subway_controller");

SubwayController(router);

module.exports = router;