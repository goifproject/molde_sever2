let express = require("express");
let router = express.Router();
let SafehouseController = require("../controllers/safehouse_controller");

// 여성안심지킴이집 관리
SafehouseController(router);

module.exports = router;