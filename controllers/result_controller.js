const logger = require('../service/logger');
let multer = require('multer');
let AWS = require("aws-sdk");
AWS.config.loadFromPath(__dirname + "/../config/awsconfig.json");
let s3 = new AWS.S3();
let multerS3 = require("multer-s3");
let path = require("path");
let bodyParser = require("body-parser");
let cookieParser = require("cookie-parser");
let expressSession = require("express-session");
let express = require("express");
let thumbnail = require("node-thumbnail").thumb;
const sharp = require("sharp");
let Result = require("../models/resultSchema");
let multiparty = require("multiparty");
let util = require("util");
let fs = require("fs");

let s3Upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "moldebucket/result_image",
        shouldTransform: function (req, file, cb) {
            cb(null, /^image/i.test(file.mimetype))
        },
        acl: 'public-read-write',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            cb(null, Date.now()+'_'+file.originalname);
        }
    })
});

module.exports = function (router) {
    router.use(bodyParser.urlencoded({extended: true}));
    router.use(cookieParser());
    router.use(expressSession({
        secret: 'moldi',
        resave: true,
        saveUninitialized: true
    }));

    // 신고 저장
    router.post("/result", s3Upload.array('resultImageList', 5), function (req, res, cb) {
        let rep_id = req.body.reportId;

        let img_filepath = [];
        let img_array = [];
        for (let elem in req.files) {
            img_filepath.push(req.files[elem].location);
        }

        for (var index = 0; index < img_filepath.length; index++) {
            let img_object = {};
            img_object.filepath = img_filepath[index];
            img_array.push(img_object);
        }

        Result.insertReportResultFunc(rep_id, img_array, function (err, report) {
            if (err){
                logger.info(err);
                res.status(200).send({result:0});
            }
            else {
                res.status(200).send({result: 1});
            }
        });
    });

    router.get("/result",function (req,res,next) {
        let rep_id = req.query.reportId;
        Result.showReportResult(rep_id,function (err,result) {
            if(err) {
                logger.info(err);
                res.status(200).send({result:0});
            }
            else{
                res.json({data : result});
            }
        })
    })
};