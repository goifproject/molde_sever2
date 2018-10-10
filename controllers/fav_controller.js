const logger = require('../service/logger');
let Favorite = require("../models/favSchema");
let bodyParser = require("body-parser");

module.exports = function (router) {
    router.use(bodyParser.urlencoded({extended: true}));

    // 즐겨찾기 추가
    router.post("/favorite", function (req, res, next) {
        let user_id = req.body.userId;
        let fav_name = req.body.favoriteName;
        let fav_addr = req.body.favoriteAddress;
        let fav_lat = req.body.favoriteLat;
        let fav_lon = req.body.favoriteLng;
        Favorite.addFavorite(user_id, fav_name, fav_addr, fav_lat, fav_lon, function (err, result) {
            if (err) {
                logger.info(err);
                res.status(200).send({result:0});
            } else {
                res.status(200).send({result: 1});
            }
        })
    });

    // 즐겨찾기 삭제
    router.delete("/favorite", function (req, res, next) {
        let user_id = req.body.userId;
        let fav_id = req.body.favoriteId;
        Favorite.removeFavorite(user_id, fav_id, function (err, result) {
            if (err) {
                logger.info(err);
                res.status(200).send({result:0});
            } else {
                res.status(200).send({result: 1});
            }
        })
    });
    
    // 즐겨찾기 가져오기 by user_id
    router.get("/favorite", function (req, res, next) {
        let user_id = req.query.userId;
        let page = req.query.page != undefined ? Number(req.query.page) : -1;
        let per_page = req.query.perPage != undefined ? Number(req.query.perPage) : -1;
        Favorite.getFavorites(user_id, per_page, page, function (err, favs) {
            if (err){
                logger.info(err);
                res.status(200).send({result:0});
            }
            else {
                res.json({data: favs});
            }
        })
    });

    // 즐겨찾기 가져오기 by distance
    router.get("/favorite2", function (req, res, next) {
        let user_id = req.query.userId;
        let fav_lat = req.query.favoriteLat;
        let fav_lon = req.query.favoriteLng;
        Favorite.getFavoritesByDistance(user_id, fav_lat, fav_lon, function (err, favs) {
            if (err){
                logger.info(err);
                res.status(200).send({result:0});
            }
            else {
                res.json({data: favs});
            }
        })
    });
};