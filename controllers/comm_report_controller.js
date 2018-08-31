// let Comment = require("../models/commSchema");
// let bodyParser = require("body-parser");

// module.exports = function (router) {
//     router.use(bodyParser.urlencoded({extended: true}));

//     // 댓글 가져오기 by user_id
//     router.get("/repcomment", function (req, res, next) {
//         let user_id = req.query.commentUserId;
//         let page = req.query.page != undefined ? Number(req.query.page) : -1;
//         let per_page = req.query.perPage != undefined ? Number(req.query.perPage) : -1;
//         Comment.getCommentsUser(user_id, per_page, page, function (err, comments) {
//             if (err) console.error(new Error(err));
//             else {
//                 res.json({data:comments});
//             }
//         })
//     });
// };