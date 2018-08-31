let User = require("../models/userSchema");
let bodyParser = require("body-parser");

module.exports = function (router) {
    router.use(bodyParser.urlencoded({extended: true}));

    router.post("/user", function (req, res, next) {
        let user_id = req.body.userId;
        let user_name = req.body.userName;
        let user_token = req.body.userToken;
        User.addUser(user_id, user_name, user_token, function (err, result) {
            if (err) {
                console.log(err);
                res.status(200).send({result:0});
            } else {
                res.status(200).send({result:1});
            }
        })
    });
};