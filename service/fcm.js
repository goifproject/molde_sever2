const logger = require('../service/logger');
var FCM = require('fcm-push');
let fs = require("fs");
var admin = require("firebase-admin");
var serviceAccount = require("../config/molde-001-firebase-adminsdk-ftvzv-b1bb52e461.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://molde-001.firebaseio.com"
});

var db = admin.firestore();
const settings = {timestampsInSnapshots: true};
db.settings(settings); 

var users_collection = db.collection('users');
// var query =  users_collection.where('uId', '==', 'PdrAOLZ7s0cz7nX4utwjvynJm103');

// query.get().then(querySnapshot => {
//     querySnapshot.forEach(documentSnapshot => {
//         logger.info(documentSnapshot.data().token);
//     });
// });

let fcmConfig = fs.readFileSync("./config/fcmconfig.json");
let firebase = JSON.parse(fcmConfig);
var serverKey = firebase.serverKey;

var fcm = new FCM(serverKey);

exports.sendNewReportPush = function(uid, rep_id) {
   logger.info('(new push)push to '+uid);
    var query =  users_collection.where('uId', '==', uid);
    query.get().then(querySnapshot => {
        querySnapshot.forEach(documentSnapshot => {
            logger.info("token : " + documentSnapshot.data().token);
            var message = {
                to: documentSnapshot.data().token,
                // collapse_key: 'your_collapse_key', 
                data: {
                    type: 1,
                    feedId: rep_id
                },
                notification: {
                    title: '새 피드 등록',
                    body: '즐겨찾기 근처에 새 피드가 생성되었습니다.',
                    // sound: "default",
                    // click_action: "FCM_PLUGIN_ACTIVITY",
                    // icon: "fcm_push_icon"
                }
            };
        
            fcm.send(message, function(err, response){
                if (err) {
                    logger.info("Something has gone wrong!");
                } else {
                    logger.info("Successfully sent with response: ", response);
                }
            });
        }); 
    });
};

exports.sendStateChangePush = function(uid, rep_id) {
    logger.info('(state change)push to '+uid);
    var query =  users_collection.where('uId', '==', uid);
    query.get().then(querySnapshot => {
        querySnapshot.forEach(documentSnapshot => {
            logger.info("token : " + documentSnapshot.data().token);
            var message = {
                to: documentSnapshot.data().token,
                // collapse_key: 'your_collapse_key', 
                data: {
                    type: 1,
                    feedId: rep_id
                },
                notification: {
                    title: '피드 상태 변화',
                    body: '등록하신 피드의 상태가 변했습니다.',
                    // sound: "default",
                    // click_action: "FCM_PLUGIN_ACTIVITY",
                    // icon: "fcm_push_icon"
                }
            };
        
            fcm.send(message, function(err, response){
                if (err) {
                    logger.info("Something has gone wrong!");
                } else {
                    logger.info("Successfully sent with response: ", response);
                }
            });
        }); 
    });
};