const logger = require('../service/logger');
var mongoose = require("mongoose");
var Counter = require('./counterSchema');
var Favorite = require('./favSchema');
var FCM = require('../service/fcm');
var Schema = mongoose.Schema;

var photoSchema = new Schema([{
    filename: {type: String, default: null},
    filepath: {type: String, default: null},
    size: {type: String, default: null}
}]);

var reportSchema = new Schema({
    rep_id: {type: Number},
    rep_contents: {type: String},
    rep_lat: {type: String},
    rep_lon: {type: String},
    rep_addr: {type: String},
    rep_detail_addr: {type: String},
    user_id: {type: String},
    user_name: {type: String},
    user_email: {type: String},
    rep_state: {type: Number}, // 0. 접수중 - 빨간색 / 1. 접수완료 (탐지완료) : 빨간색 / 2. 접수완료 (제거)  - 파란색 /  3. 접수완료(미발견 또는 허위신고) 흰색
    rep_date: {type: String},
    rep_img: [[photoSchema]]
});

function getNextId(name,cb){
    Counter.findOneAndUpdate(
        {_id: name },
        {$inc: {seq: 1}},
        {projection: {"_id": 0, "seq": 1 }},
        function(err, result){
            if(err) logger.info(new Error(err));
            else{
                cb(result.seq);
            }
        }
     );
}

reportSchema.statics.uploadPin = function (rep_id, rep_nm, rep_contents, img_object, callback) {
    Report.collection.insert({
            rep_id: rep_id,
            rep_nm: rep_nm,
            rep_contents: rep_contents,
            rep_img: img_object
        }, function (error, report) {
            if (error) callback(error);
            else {
                callback(null, report);
        }
    });
};
// 신고 내역 추가
reportSchema.statics.insertReportFunc = function (user_name, user_email, rep_contents, rep_lat, rep_lon, rep_addr, rep_detail_addr, rep_state, user_id, img_object, callback) {
    let now = new Date;
    getNextId('Reports',function(_seq){
        Report.collection.insert({
            rep_id: _seq,
            user_name: user_name,
            user_email: user_email,
            user_id: user_id,
            rep_contents: rep_contents,
            rep_lat: Number(rep_lat),
            rep_lon: Number(rep_lon),
            rep_addr: rep_addr,
            rep_detail_addr: rep_detail_addr,
            rep_date: now.getTime(),
            rep_img: img_object,
            rep_state: Number(rep_state)
        }, function (err, result) {
            if (err) callback(err);
            else {
                // 푸시 메시지
                logger.info("reportSchema : before fav find");
                Favorite.collection.find({
                    fav_lat: {$gte : Number(rep_lat)-0.013, $lte : Number(rep_lat)+0.013},
                    fav_lon: {$gte : Number(rep_lon)-0.016, $lte : Number(rep_lon)+0.016},
                }, {projection: {_id: 0, user_id: 1 }}, 
                function (error, favs) {
                        if (error) callback(error);
                        else {
                            logger.info("reportSchema : in fav find");
                            logger.info("favs : " + favs);
                            var list = [];
                            favs.forEach(fav => {
                                if(!list.includes(fav)){
                                    logger.info("fav : " + fav);
                                    logger.info("fav.value : " + fav.value);
                                    logger.info("fav.value.user_id : " + fav.value.user_id);
                                    list.push(fav);
                                    FCM.sendNewReportPush(fav.value.user_id, _seq);
                                }
                            });
                            logger.info("reportScema : end fav find");
                        }
                    }
                );
                callback(null, result);
            }   
        })
    })
};

// 관리자 >> marker 색 변경
// 0:접수중(빨)  1:접수완료(빨)  2:제거(파)  3:미발견(하)
reportSchema.statics.updateRptMarker = function (rep_id, rep_state, callback) {
    logger.info("In update Marker");
    logger.info(rep_id + ", " + rep_state)
    Report.collection.findOneAndUpdate( // find & update 로 변경
        { rep_id: Number(rep_id) }, 
        { $set: {rep_state: Number(rep_state)} }, 
        {projection: {"_id": 0, "rep_id": 1, "user_id": 1}}, 
        function(err, result){
            if(err) callback(err);
            else{
                logger.info("update success => user_id :" + result.value.user_id);
                FCM.sendStateChangePush(result.value.user_id, rep_id);
                callback(null, result);
            }
        }
    );
};

reportSchema.statics.removeReport = function(user_id, rep_id, callback){
    Report.collection.findOneAndDelete({
        user_id: user_id,
        rep_id: Number(rep_id)
    },function(err, result){
        if(err) callback(err);
        else{
            callback(null, result);
        }
    });
};

// 위도,경도를 가지고 근처 1.5km 찾기
// 위도 1.5km => 약 0.013
// 경도 1.5km => 약 0.016
reportSchema.statics.showRptSpot = function (rep_lat, rep_lon, callback) {
    Report.collection.find({
        rep_lat: {$gte : Number(rep_lat)-0.013, $lte : Number(rep_lat)+0.013},
        rep_lon: {$gte : Number(rep_lon)-0.016, $lte : Number(rep_lon)+0.016},
    }, {projection: {"_id": 0, "rep_id": 1, "rep_contents": 1,
    "rep_lat": 1, "rep_lon": 1, "rep_addr": 1, "rep_detail_addr": 1,
    "user_id": 1, "user_name": 1, "user_email": 1, "rep_state": 1,
    "rep_date": 1, "rep_img": 1 }},
    function (error, reports) {
            if (error) callback(error);
            else {
                reports.toArray(function(err,report){callback(null, report)});
            }
        }
    );
}

// 사용자 ID 로 피드 검색
reportSchema.statics.showRptSpotByUserID = function (per_page, page, user_id, callback) {
    Report.collection.find({
        user_id: user_id
    }, {projection: {"_id": 0, "rep_id": 1, "rep_contents": 1,
    "rep_lat": 1, "rep_lon": 1, "rep_addr": 1, "rep_detail_addr": 1,
    "user_id": 1, "user_name": 1, "user_email": 1, "rep_state": 1,
    "rep_date": 1, "rep_img": 1 }},
    function (error, reports) {
            if (error) callback(error);
            else {
                if(per_page != -1 && page != -1)
                    reports.sort({'rep_date':-1}).skip(page*per_page).limit(per_page).toArray(function(err,docs){callback(null, docs)});
                else
                    reports.sort({'rep_date':-1}).toArray(function(err,docs){callback(null, docs)});
            }
        }
    );
}

// 피드 ID 로 피드 검색
reportSchema.statics.showRptSpotByReportID = function (rep_id, callback) {
    Report.collection.find({
        rep_id: rep_id
    }, {projection: {"_id": 0, "rep_id": 1, "rep_contents": 1,
    "rep_lat": 1, "rep_lon": 1, "rep_addr": 1, "rep_detail_addr": 1,
    "user_id": 1, "user_name": 1, "user_email": 1, "rep_state": 1,
    "rep_date": 1, "rep_img": 1 }},
    function (error, reports) {
            if (error) callback(error);
            else {
                reports.sort({'rep_date':-1}).toArray(function(err,docs){callback(null, docs)});
            }
        }
    );
}

// 모든 피드 불러오기 (최신순)
reportSchema.statics.showAllRptSpotByRecent = function (per_page, page, callback) {
    Report.collection.find({
    }, {projection: {"_id": 0, "rep_id": 1, "rep_contents": 1,
    "rep_lat": 1, "rep_lon": 1, "rep_addr": 1, "rep_detail_addr": 1,
    "user_id": 1, "user_name": 1, "user_email": 1, "rep_state": 1,
    "rep_date": 1, "rep_img": 1 }},
    function (error, reports) {
            if (error) callback(error);
            else {
                if(per_page != -1 && page != -1)
                    reports.sort({'rep_date':-1}).skip(page*per_page).limit(per_page).toArray(function(err,docs){callback(null, docs)});
                else
                    reports.sort({'rep_date':-1}).toArray(function(err,docs){callback(null, docs)});
            }
        }
    );
}

// 모든 피드 불러오기 (거리순)
// 1km = lat 0.009 세로
// 1km = lon 0.011 가로

//Latitude (1도) 1Km = 1 / 109.958489129649955
//Longitude (1도) 1Km = 1 / 88.74

// reportSchema.statics.showAllRptSpotByDistance = function (rep_lat, rep_lon, per_page, page, callback) {
//     Report.collection.find({
//     }, {projection: {"_id": 0, "rep_id": 1, "rep_contents": 1,
//     "rep_lat": 1, "rep_lon": 1, "rep_addr": 1, "rep_detail_addr": 1,
//     "user_id": 1, "user_name": 1, "user_email": 1, "rep_state": 1,
//     "rep_date": 1, "rep_img": 1,
//     "test": "$rep_id",
//     // "distance": {$sqrt: {$pow: [{$divide:[{$subtract: [rep_lat, "$rep_lat"]},0.009]},2]} 
//     //                 + {$pow: [{$divide:[{$subtract: [rep_lon, "$rep_lon"]},0.011]},2]}
//             //   }                
//             }
//         },
//     function (error, reports) {
//             if (error) callback(error);
//             else {
//                 if(per_page != -1 && page != -1)
//                     reports.sort({'distance':1}).skip(page*per_page).limit(per_page).toArray(function(err,docs){callback(null, docs)});
//                 else{
//                     // reports.sort({'distance':1}).toArray(function(err,docs){callback(null, docs)});
//                     reports.sort({'rep_id':-1}).toArray(function(err,docs){callback(null, docs)});
//                 }
//             }
//         }
//     );
// }

reportSchema.statics.showAllRptSpotByDistance = function (rep_lat, rep_lon, per_page, page, callback) {
    Report.collection.aggregate(
    [{$project: {_id: 0, rep_id: 1, rep_contents: 1,
    rep_lat: 1, rep_lon: 1, rep_addr: 1, rep_detail_addr: 1,
    user_id: 1, user_name: 1, user_email: 1, rep_state: 1,
    rep_date: 1, rep_img: 1,
    distance:
              {$sqrt: {$add: [{$pow: [{$divide: [{$subtract: [rep_lat, "$rep_lat"]}, 0.009]}, 2]},
                              {$pow: [{$divide: [{$subtract: [rep_lon, "$rep_lon"]}, 0.011]}, 2]}]
              }}
    }}],{},
    function (error, reports) {
            if (error) callback(error);
            else {
                if(per_page != -1 && page != -1)
                    reports.sort({'distance':1}).skip(page*per_page).limit(per_page).toArray(function(err,docs){callback(null, docs)});
                else{
                    reports.sort({'distance':1}).toArray(function(err,docs){callback(null, docs)});
                }
            }
        }
    );
}

var Report = mongoose.model("Report", reportSchema);

module.exports = Report;