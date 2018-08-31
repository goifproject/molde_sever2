var FB = require('fb');
var moment = require('moment');
let News = require('../models/newsSchema');

let FacebookConfig = fs.readFileSync("./config/fbconfig.json");
let Facebook = JSON.parse(FacebookConfig);
var pageToken = Facebook.pageToken;

FB.setAccessToken(pageToken);

exports.getFacebookPosts = function(){
    FB.api('2000008220011384/posts?fields=attachments,created_time', function (res) {
        if(!res || res.error) {
            console.log(!res ? 'error occurred' : res.error);
            return;
        }

        var i,j;
        for (i = 0; i < res.data.length; i++){
            var news = {description: "", news_img: [], date: "", post_id: ""}

            if(res.data[i].created_time){
                news.date = moment(res.data[i].created_time).format();
                if(moment(res.data[i].created_time).isBefore(moment().subtract(1, 'days')))
                    continue;
                // if(moment(res.data[i].created_time).isBefore(moment().subtract(3, 'minutes')))
                //     continue;
            }

            if(res.data[i].id)
                news.post_id = res.data[i].id;

            if(res.data[i].attachments.data[0].subattachments){
                if(res.data[i].attachments.data[0].description)
                    news.description = res.data[i].attachments.data[0].description;

                for(j = 0; j < res.data[i].attachments.data[0].subattachments.data.length; j++){
                    let image = {};
                    image.page_num = j;
                    image.url = res.data[i].attachments.data[0].subattachments.data[j].url;
                    news.news_img.push(image);
                }
            }

            News.updateNewsFromFB(news);
        }
    })
}