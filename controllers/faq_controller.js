const logger = require('../service/logger');
let Faq = require("../models/faqSchema");

module.exports = function (router) {
    router.post("/faq", function (req, res, next) {
        let user_id = req.body.userId;
        let user_name = req.body.userName;
        let contents = req.body.faqContent;
        let email = req.body.userEmail;

        Faq.insertFaqData(user_id, user_name, contents, email, function (error, faq) {
            if (error) {
                logger.info(err);
                res.status(200).send({result:0});
            } else {
                res.status(200).send({result:1});
            }
        })
    })

    router.get("/faq", function (req, res, next) {
        let page = req.query.page != undefined ? Number(req.query.page) : -1;
        let per_page = req.query.perPage != undefined ? Number(req.query.perPage) : -1;

        Faq.getFaqs(per_page, page, function (err, comments) {
            if (err) {
                logger.info(err);
                res.status(200).send({result:0});
            }
            else {
                res.json({data:comments});
            }
        })
    });
};