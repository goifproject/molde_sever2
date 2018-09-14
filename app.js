var express = require('express');
var mongoose = require("mongoose");
let fs = require("fs");
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require("http");

// var Safehouse = require("./service/csvToDatabase");
// var Subway = require('./service/subwayData');
var Facebook = require("./service/facebook");
var FCM = require("./service/fcm");

/* Router */
var index = require('./routes/index');
var users = require("./routes/user_router");
var result_router = require("./routes/result_router");
var comment_report_router = require("./routes/comment_report_router");
var pin_upload = require("./routes/pin_router");
var report_router = require("./routes/report_router");
var faq_router = require("./routes/faq_router");
var comment_router = require("./routes/comment_router");
var favorite_router = require("./routes/favorite_router");
var subway_router = require("./routes/subway_router");
var scrap_router = require("./routes/scrap_router");
var news_router = require("./routes/news_router");
var safehosue_router = require("./routes/safehouse_router");

var app = express();
var port = process.env.PORT || 7019;

// db 연결
var db = mongoose.connection;
let dbFile = fs.readFileSync("./db_config/db.json");
let dbConfig = JSON.parse(dbFile);
var dbUrl = dbConfig.dbUrl;

var MongoClient = require("mongodb").MongoClient;
var promise = mongoose.connect(dbUrl, {
    }, function (mongoError) {
        if (mongoError) console.log(new Error("DB연결 에러"));
        else {
            console.log("DB 연결 성공");
        }
    }
);

// Subway.addToDatabase();
// Safehouse.addToDatabase();

setInterval(function(){Facebook.getFacebookPosts()}, 86400000);
// setInterval(function(){Facebook.getFacebookPosts()}, 180000);
// Facebook.getFacebookPosts()

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', port);
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/v1',users);
app.use('/v1',result_router);
app.use('/v1',pin_upload);
app.use('/v1',report_router);
app.use('/v1',faq_router);
app.use('/v1',comment_router);
app.use('/v1',favorite_router);
app.use('/v1',scrap_router);
app.use('/v1',news_router);
app.use('/v1',safehosue_router);
app.use('/v1',comment_report_router);
app.use('/v1',subway_router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

var server = http.createServer(app);
server.listen(app.get('port'), function () {
    console.log("서버 연동 완료");
});

module.exports = app;