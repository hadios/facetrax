require('dotenv').load();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

var SparkPost = require('sparkpost');
var client = new SparkPost(process.env.SPARKPOST_API);

var cps = require('./node_modules/cps-api');
var conn = new cps.Connection('tcp://cloud-us-0.clusterpoint.com:9007', 'facetrax', process.env.DB_USERNAME, process.env.DB_PASSWORD, 'document', 'document/id', {account: 100322});
// conn.debug = true;
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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
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
