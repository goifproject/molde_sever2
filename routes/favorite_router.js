let express = require("express");
let router = express.Router();
let FavController = require("../controllers/fav_controller");

// Favorite 관리
FavController(router);

module.exports = router;