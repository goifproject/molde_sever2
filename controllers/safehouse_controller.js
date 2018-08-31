let Safehouse = require("../models/safehouseSchema");

module.exports = function (router) {
    router.get("/safehouse", function (req, res, next) {
        let safe_lat = Number(req.query.safeLat);
        let safe_lon = Number(req.query.safeLng);

        let page = req.query.page != undefined ? Number(req.query.page) : -1;
        let per_page = req.query.perPage != undefined ? Number(req.query.perPage) : -1;

        console.log(page, per_page);

        Safehouse.getSafehouse(safe_lat, safe_lon, per_page, page, function (err, data) {
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