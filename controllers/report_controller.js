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
let Report = require("../models/reportSchema");
let multiparty = require("multiparty");
let util = require("util");
let fs = require("fs");

let s3Upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "moldebucket/report_image",
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
    router.post("/pin", s3Upload.array('reportImageList', 5), function (req, res, cb) {
        // let rep_contents = req.body.reportContent;
        // let rep_lat = req.body.reportLat;
        // let rep_lon = req.body.reportLng;
        // let rep_addr = req.body.reportAddress;
        // let rep_detail_addr = req.body.reportDetailAddress;
        // let user_id = req.body.userId;
        // let user_name = req.body.userName;
        // let user_email = req.body.userEmail;
        // let rep_date = req.body.reportDate;
        // let rep_state = req.body.reportState;

        let rep_contents = req.body.reportContent.replace('"', '').replace('"', '');
        let rep_lat = req.body.reportLat.replace('"', '').replace('"', '');
        let rep_lon = req.body.reportLng.replace('"', '').replace('"', '');
        let rep_addr = req.body.reportAddress.replace('"', '').replace('"', '');
        let rep_detail_addr = req.body.reportDetailAddress.replace('"', '').replace('"', '');
        let user_id = req.body.userId.replace('"', '').replace('"', '');
        let user_name = req.body.userName.replace('"', '').replace('"', '');
        let user_email = req.body.userEmail.replace('"', '').replace('"', '');
        let rep_state = req.body.reportState.replace('"', '').replace('"', '');

        let img_filename = [];
        let img_filepath = [];
        let img_filesize = [];
        let img_array = [];
        for (let elem in req.files) {
            console.log(req.files[elem].location);
            img_filename.push(req.files[elem].originalname);
            img_filepath.push(req.files[elem].location);
            img_filesize.push(req.files[elem].size + 'kb');
        }

        for (var index = 0; index < img_filepath.length; index++) {
            let img_object = {};
            img_object.filename = img_filename[index];
            img_object.filepath = img_filepath[index];
            img_object.filesize = img_filesize[index];
            img_array.push(img_object);
        }

        Report.insertReportFunc(user_name, user_email, rep_contents, rep_lat, rep_lon, rep_addr, rep_detail_addr, rep_state, user_id, img_array, function (err, report) {
            if (err){
                console.log(err);
                res.status(200).send({result:0});
            }
            else {
                res.status(200).send({result: 1});
            }
        });
    });

    // 피드 상태 수정 (관리자)
    router.put("/pin", function (req, res, next) {
        let rep_id = req.body.reportId;
        let rep_state = req.body.reportState;

        Report.updateRptMarker(rep_id, rep_state, function (err, result) {
            if (err){
                console.log(err);
                res.status(200).send({result:0});
            }
            else {
                res.status(200).send({result:1});
            }
        });
    });

    // 피드 삭제
    router.delete("/pin", function (req, res, next) {
        let user_id = req.body.userId;
        let rep_id = req.body.reportId;
        Report.removeReport(user_id, rep_id, function (err, result) {
            if (err) {
                console.log(err);
                res.status(200).send({result:0});
            } else {
                res.status(200).send({result: 1});
            }
        })
    });

    // 특정 위치에 대해서 신고내역 보내주기
    router.get("/pin",function (req,res,next) {
        let rep_lat = req.query.reportLat;
        let rep_lon = req.query.reportLng;
        Report.showRptSpot(rep_lat,rep_lon,function (err,report) {
            if(err) {
                console.log(err);
                res.status(200).send({result:0});
            }
            else{
                res.json({data : report});
            }
        })
    })

    // 사용자 아이디로 피드 검색
    router.get("/pin2",function (req,res,next) {
        let page = req.query.page != undefined ? Number(req.query.page) : -1;
        let per_page = req.query.perPage != undefined ? Number(req.query.perPage) : -1;
        let user_id = req.query.userId;
        Report.showRptSpotByUserID(per_page, page, user_id,function (err,report) {
            if(err) {
                console.log(err);
                res.status(200).send({result:0});
            }
            else{
                res.json({data : report});
            }
        })
    })

    // 모든 피드 검색 페이징 (최신순)
    router.get("/pin3",function (req,res,next) {
        let page = req.query.page != undefined ? Number(req.query.page) : -1;
        let per_page = req.query.perPage != undefined ? Number(req.query.perPage) : -1;
        Report.showAllRptSpotByRecent(per_page, page, function (err,report) {
            if(err) {
                console.log(err);
                res.status(200).send({result:0});
            }
            else{
                res.json({data : report});
            }
        })
    })

    // 모든 피드 검색 페이징 (거리순)
    router.get("/pin4",function (req,res,next) {
        let rep_lat = Number(req.query.reportLat);
        let rep_lon = Number(req.query.reportLng);
        let page = req.query.page != undefined ? Number(req.query.page) : -1;
        let per_page = req.query.perPage != undefined ? Number(req.query.perPage) : -1;
        Report.showAllRptSpotByDistance(rep_lat, rep_lon, per_page, page, function (err,report) {
            if(err) {
                console.log(err);
                res.status(200).send({result:0});
            }
            else{
                res.json({data : report});
            }
        })
    })

    // 모든 피드 검색 페이징 (거리순)
    router.get("/pin5",function (req,res,next) {
        let rep_id = Number(req.query.reportId);
        Report.showRptSpotByReportID(rep_id, function (err,report) {
            if(err) {
                console.log(err);
                res.status(200).send({result:0});
            }
            else{
                res.json({data : report});
            }
        })
    })
};