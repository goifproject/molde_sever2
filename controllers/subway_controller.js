let Subway = require("../models/subwaySchema");

module.exports = function (router) {
    router.get("/subway", function (req, res, next) {
        let user_lat = Number(req.query.userLat);
        let user_lon = Number(req.query.userLng);

        let page = req.query.page != undefined ? Number(req.query.page) : -1;
        let per_page = req.query.perPage != undefined ? Number(req.query.perPage) : -1;

        Subway.getSubwayInfo(user_lat, user_lon, per_page, page, function (err, data) {
            if (err) {
                console.log(err);
                res.status(200).send({result:0});
            }
            else {
                res.json({data: data});
            }
        })
    });
};