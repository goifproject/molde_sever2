let Scrap = require("../models/scrapSchema");
let bodyParser = require("body-parser");

module.exports = function (router) {
    router.use(bodyParser.urlencoded({extended: true}));

    // 스크랩 추가
    router.post("/scrap", function (req, res, next) {
        let user_id = req.body.userId;
        let news_id = req.body.cardNewsId;
        Scrap.addScrap(user_id, news_id, function (err, result) {
            if (err) {
                console.log(err);
                res.status(200).send({result:0});
            } else {
                res.status(200).send({result: 1});
            }
        })
    });

    // 스크랩 삭제
    router.delete("/scrap", function (req, res, next) {
        let user_id = req.body.userId;
        let scrap_id = req.body.cardNewsScrapId;
        Scrap.removeScrap(user_id, scrap_id, function (err, result) {
            if (err) {
                console.log(err);
                res.status(200).send({result:0});
            } else {
                res.status(200).send({result: 1});
            }
        })
    });
    
    // 스크랩 가져오기 by user_id
    router.get("/scrap", function (req, res, next) {
        let user_id = req.query.userId;
        let page = req.query.page != undefined ? Number(req.query.page) : -1;
        let per_page = req.query.perPage != undefined ? Number(req.query.perPage) : -1;
        Scrap.getScraps(user_id, per_page, page, function (err, scraps) {
            if (err) {
                console.log(err);
                res.status(200).send({result:0});
            }
            else {
                res.json({data : scraps});
            }
        })
    });

    // 이미 스크랩했는지 확인
    router.get("/scrap2", function (req, res, next) {
        let user_id = req.query.userId;
        let news_id = Number(req.query.cardNewsId);
        Scrap.isScrapExist(user_id, news_id, function (err, scraps) {
            if (err) {
                console.log(err);
                //res.status(200).send({result:0});
            }
            else {
                if(scraps.length != 0)
                    res.json({result : 1});
                else
                    res.json({result : 0});
            }
        })
    });
};