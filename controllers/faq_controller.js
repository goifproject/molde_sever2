let Faq = require("../models/faqSchema");

module.exports = function (router) {
    router.post("/faq", function (req, res, next) {
        let user_id = req.body.userId;
        let user_name = req.body.userName;
        let contents = req.body.faqContent;
        let email = req.body.userEmail;

        Faq.insertFaqData(user_id, user_name, contents, email, function (error, faq) {
            if (error) {
                console.log(err);
                res.status(200).send({result:0});
            } else {
                res.status(200).send({result:1});
            }
        })
    })

    router.get("/faq", function (req, res, next) {
        Faq.getFaqs(function (err, comments) {
            if (err) {
                console.log(err);
                res.status(200).send({result:0});
            }
            else {
                res.json({data:comments});
            }
        })
    });
};