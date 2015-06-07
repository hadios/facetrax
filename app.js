require('dotenv').load();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var twitterAPI = require('node-twitter-api');
var fs = require('fs');
var twitter = new twitterAPI({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    oauth_callback: 'http://localhost:3000/twitter-callback'
});

// console.log(twitter);
var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

var SparkPost = require('sparkpost');
var client = new SparkPost(process.env.SPARKPOST_API);

var cps = require('./node_modules/cps-api');
var conn = new cps.Connection('tcp://cloud-us-0.clusterpoint.com:9007', 'facetrax', process.env.DB_USERNAME, process.env.DB_PASSWORD, 'document', 'document/id', {account: 100322});
conn.debug = true;
// Get a list of domains that the Metrics API contains data on.
// var options = {
//   uri: 'metrics/domains'
// };

// var id = 3,
//    name = "Username";
// var insert_request = new cps.InsertRequest('<document><id>'+id+'</id>'+cps.Term(name, "name")+'</document>');
// conn.sendRequest(insert_request, function(err, insert_response) {
//    if (err) return console.error(err);
//    console.log('New user registered: ' + insert_response.document.id);
// });

// twitter.getRequestToken(function(error, requestToken, requestTokenSecret, results){
//     if (error) {
//         console.log("Error getting OAuth request token : " + error);
//         console.log(results);
//     } else {
//         //store token and tokenSecret somewhere, you'll need them later; redirect user
//         console.log(requestToken + ", " + requestTokenSecret);
//     }
// });

// twitter.statuses("update", {
//         status: "Hello world!"
//     },
//     process.env.TWITTER_ACCESS_TOKEN,
//     process.env.TWITTER_ACCESS_TOKEN_SECRET,
//     function(error, data, response) {
//         if (error) {
//             // something went wrong
//         } else {
//             // data contains the data sent by twitter
//         }
//     }
// );

function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

// twitter.uploadMedia({
//     media: base64_encode("photo/family.jpg"),
//     isBase64: true
// }, process.env.TWITTER_ACCESS_TOKEN, process.env.TWITTER_ACCESS_TOKEN_SECRET, function(err, data, res) {
//     console.log(data.media_id);
//     twitter.statuses("update", {
//         status: "Test",
//         media_ids: data.media_id_string
//     }, process.env.TWITTER_ACCESS_TOKEN, process.env.TWITTER_ACCESS_TOKEN_SECRET, function(err, data, res) {
//         // console.log(err);
//         console.log(data);
//         // console.log(res);
//         // setTimeout(function() {
//         //     twitter.statuses("destroy", {
//         //         id: data.id
//         //     }, process.env.TWITTER_ACCESS_TOKEN, process.env.TWITTER_ACCESS_TOKEN_SECRET, function(err, data, res) {
//         //         console.log(err);
//         //         console.log(data);
//         //         console.log(res);
//         //     });
//         // }, 10000);
//     });
// });



// twitter.getRequestToken(function(error, requestToken, requestTokenSecret, results){
//     if (error) {
//         console.log(error);
//     } else {
//         //store token and tokenSecret somewhere, you'll need them later; redirect user
// 		console.log("https://twitter.com/oauth/authenticate?oauth_token=" + requestToken);
// 		console.log(requestToken);
// 		console.log(requestTokenSecret);
//     }
// });

// twitter.getTimeline("user", {
//   screen_name:"grandnexus"
//     },
//     process.env.TWITTER_ACCESS_TOKEN,
//     process.env.TWITTER_ACCESS_TOKEN_SECRET,
//     function(error, data, response) {
//         if (error) {
//             // something went wrong
//             console.log(error);
//         } else {
//             // data contains the data sent by twitter
//             console.log(data[0].user.profile_image_url);
//         }
//     }
// );

var trans = {
  options: {
    open_tracking: true,
    click_tracking: true
  },
  campaign_id: "christmas_campaign",
  return_path: "facetrax@chooyansheng.me",
  metadata: {
    user_type: "students"
  },
  substitution_data: {
    sender: "Big Store Team"
  },
  recipients: [
    {
      return_path: "facetrax@chooyansheng.me",
      address: {
        email: "cys009@gmail.com",
        name: "Ai Meili"
      },
      tags: [
        "greeting",
        "prehistoric",
        "fred",
        "flintstone"
      ],
      metadata: {
        place: "Bedrock"
      },
      substitution_data: {
        customer_type: "Platinum"
      }
    }
  ],
  content: {
    from: {
      name: "Facetrax",
      email: "facetrax@chooyansheng.me"
    },
    subject: "Big Christmas savings!",
    reply_to: "Christmas Sales <facetrax@chooyansheng.me>",
    headers: {
      "X-Customer-Campaign-ID": "christmas_campaign"
    },
    text: "Hi {{address.name}} \nSave big this Christmas in your area {{place}}! \nClick http://www.mysite.com and get huge discount\n Hurry, this offer is only to {{user_type}}\n {{sender}}",
    html: "<p>Hi {{address.name}} \nSave big this Christmas in your area {{place}}! \nClick http://www.mysite.com and get huge discount\n</p><p>Hurry, this offer is only to {{user_type}}\n</p><p>{{sender}}</p>"
  }
};

// client.transmissions.send({transmissionBody: trans}, function(err, res) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(res.body);
//     console.log("Congrats you can use our SDK!");
//   }
// });

// client.sendingDomains.all(function(err, res) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(res.body);
//     console.log('Congrats you can use our SDK!');
//   }
// });
//
// client.get(options, function(err, data) {
//   if(err) {
//     console.log(err);
//     return;
//   }
//
//   console.log(data.body);
// });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
