let Comment = require("../models/commSchema");
let bodyParser = require("body-parser");

module.exports = function (router) {
    router.use(bodyParser.urlencoded({extended: true}));

    // 댓글 달기
    router.post("/comment", function (req, res, next) {
        let user_id = req.body.userId;
        let user_name = req.body.userName;
        let news_id = req.body.cardNewsId;
        let content = req.body.commentContent;
        Comment.addComment(user_id, user_name, news_id, content, function (err, result) {
            if (err) {
                console.log(err);
                res.status(200).send({result:0});
            } else {
                res.status(200).send({result:1});
            }
        })
    });

    // 댓글 삭제
    router.delete("/comment", function (req, res, next) {
        let user_id = req.body.commentUserId;
        let comm_id = req.body.commentId;
        Comment.removeComment(user_id, comm_id, function (err, comments) {
            if (err) {
                console.log(err);
                res.status(200).send({result:0});
            } else {
                res.status(200).send({result:1});
            }
        })
    });

    // 댓글 신고
    router.put("/comment", function (req, res, next) {
        let user_id = req.body.commentUserId;
        let comm_id = req.body.commentId;
        Comment.reportComment(user_id, comm_id, function (err, result) {
            if (err) {
                console.log(err);
                res.status(200).send({result:0});
            } else {
                if(result == 1){
                    res.status(200).send({result:1});
                }else if(result == 2){
                    res.status(200).send({result:2});
                }
            }
        })
    });
    
    // 댓글 가져오기 by news_id
    router.get("/commentn", function (req, res, next) {
        let news_id = req.query.cardNewsId;
        let page = req.query.page != undefined ? Number(req.query.page) : -1;
        let per_page = req.query.perPage != undefined ? Number(req.query.perPage) : -1;
        Comment.getCommentsNews(news_id, per_page, page, function (err, comments) {
            if (err){
                console.log(err);
                res.status(200).send({result:0});
            }
            else {
                res.json({data:comments});
            }
        })
    });

    // 댓글 가져오기 by user_id
    router.get("/commentu", function (req, res, next) {
        let user_id = req.query.commentUserId;
        let page = req.query.page != undefined ? Number(req.query.page) : -1;
        let per_page = req.query.perPage != undefined ? Number(req.query.perPage) : -1;
        Comment.getCommentsUser(user_id, per_page, page, function (err, comments) {
            if (err){
                console.log(err);
                res.status(200).send({result:0});
            }
            else {
                res.json({data:comments});
            }
        })
    });
};