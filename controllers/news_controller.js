let News = require("../models/newsSchema");

module.exports = function (router) {
    router.get("/news", function (req, res, next) {
        let page = req.query.page != undefined ? Number(req.query.page) : -1;
        let per_page = req.query.perPage != undefined ? Number(req.query.perPage) : -1;
        News.getCardNews(per_page, page, function (err, news) {
            if (err) console.error(new Error(err));
            else {
                res.json({data: news});
            }
        })
    });

    router.get("/newsid", function (req, res, next) {
        let news_id = req.query.cardNewsId;
        News.getCardNewsByID(news_id, function (err, news) {
            if (err) console.error(new Error(err));
            else {
                res.json({data: news});
            }
        })
    });
};