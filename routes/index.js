var express   = require('express');
var fs        = require('fs');
var path      = require('path');
var cps       = require('cps-api');
var resemble  = require('node-resemble');
var async     = require('async');
var SparkPost = require('sparkpost');

var imageProcess = require('../scripts/imageProcess')

var router = express.Router();

var _savefileToServer = function (imagedata, destPath, cb) {
    var buf = new Buffer(imagedata, 'base64');
    var filepath = destPath+ Date.now() + '_tempfile.jpg';

    // Temporary save the file
    fs.writeFile(filepath, buf, 'binary', function(err) {
        if (err) {
            console.log("Error saving file to server!");
            console.log(err);
            return cb(err, null);
        }

        console.log('File saved.');
        return cb(null, filepath);
    });
}

var _sendEmail = function (cb) {
    var client = new SparkPost(process.env.SPARKPOST_API);

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

    client.transmissions.send({transmissionBody: trans}, function(err, res) {
      if (err) {
        console.log(err);
      } else {
        console.log(res.body);
        console.log("Congrats you can use our SDK!");
      }
      cb();
    });
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Facetrax' });
});

/* GET home page. */
router.get('/result', function(req, res, next) {
    var imageId = req.query.image;

    console.log(req.query);
    console.log(req.body);

    _sendEmail(function(){
        res.render('success', { title: 'Facetrax',
                                imageName: imageId });
    })
});

var _returnDefault = function(res, result, userids){
    console.log("Userid: " + userids);
    return res.json({statusCode: 200, result: result, userids: userids});

    // return res.format({
    //         html: function() {
    //             res.render('index', { title: 'Express'});
    //         },
    //
    //         json: function() {
    //             res.status(200).send('OK');
    //         }
    //     });
}

var _getAllDocuments = function (cb) {
    var conn = new cps.Connection(process.env.CLUSTERPOINT_URL,
                                'facetrax',
                                process.env.DB_USERNAME,
                                process.env.DB_PASSWORD,
                                'document',
                                'document/id',
                                {account: 100322});

    var data = {
        "query": "*"
    }

    var search_req = new cps.SearchRequest(data);
    conn.sendRequest(search_req, function (err, search_resp) {
        if (err) {
            console.log(err);
            return cb(err, null);
        }

        //console.log(search_resp.results);
        var databaseImages = search_resp.results.document;

        if (!databaseImages) {
            return cb("Something wrong", null);
        }

        // Loop through all the results
        // for (var i = 0; i < databaseImages.length; i++) {
        //     console.log(databaseImages[i].imagePath);
        // }

        return cb(null, databaseImages);
    });
}

router.post('/imageUpload', function(req, res, next) {
    //console.log(req.body);

    var imageData = req.body.imageData;
    if (!imageData) {
        console.log("There is no image, yo!");

        return _returnDefault(res, false);
    }

    console.log("Image received!");

    var destinationFile = path.join(__dirname, '../photo/');
    _savefileToServer(imageData, destinationFile, function(err, imageFilepath) {
        if (err) {
            console.log("Error saving file!");
            return _returnDefault(res, false);
        }

        console.log("Save file succesfully");

        console.log(imageFilepath);

        // HARDCODED!
        //imageFilepath = path.join(__dirname, '../photo/rowan.png');

        // Start running the image detection and extraction
        imageProcess.extractGenerateFaceImages(imageFilepath, function(generatedFiles){
            if (!generatedFiles) {
                console.log("Unable to extract faces!");
                fs.unlinkSync(imageFilepath);
                return _returnDefault(res, false);
            }

            console.log("Extraction succesfully! " + generatedFiles);

            // Get list of all documents
            _getAllDocuments(function(err, documentList){
                if (err) {
                    for (var i = 0; i < generatedFiles.length; i++) {
                        fs.unlinkSync(path.join(__dirname, generatedFiles[i]));
                    }

                    fs.unlinkSync(imageFilepath);
                    return _returnDefault(res, false);
                }

                var imageList = [];
                var succesfulRegister = [];

                var comparisonList = [];
                for (var i = 0; i < documentList.length; i++) {
                    //imageList.push(documentList[i].imagePath);
                    var file1 = documentList[i];

                    for (var j = 0; j < generatedFiles.length; j++) {
                        var file2 = generatedFiles[j];

                        var compare = {};
                        compare.file1 = file1;
                        compare.file2 = file2;

                        comparisonList.push(compare);

                        //console.log("%s : %s", file1.imagePath, file2);
                    }
                }

                //console.log("Comparison list: " + comparisonList);

                async.eachSeries(comparisonList, function iterator(item, callback) {

                    async.setImmediate(function () {
                        var filepath1 = path.join(__dirname, item.file1.imagePath);
                        var filepath2 = path.join(__dirname, item.file2);

                        console.log("%s : %s", filepath1, filepath2);

                        resemble(filepath1).compareTo(filepath2).ignoreColors().onComplete(function(data){
                            console.log(data);

                            if (parseFloat(data.misMatchPercentage) < 25.0) {
                                succesfulRegister.push(item.file1);
                            }

                            /*
                            {
                              misMatchPercentage : 100, // %
                              isSameDimensions: true, // or false
                              dimensionDifference: { width: 0, height: -1 }, // defined if dimensions are not the same
                              getImageDataUrl: function(){}
                            }
                            */
                        });
                        callback(null, item);
                    });

                }, function done() {
                    // Remove the source and generated photos

                    // for (var i = 0; i < generatedFiles.length; i++) {
                    //     fs.unlinkSync(path.join(__dirname, generatedFiles[i]));
                    // }
                    // fs.unlinkSync(imageFilepath);

                    console.log(succesfulRegister);

                    if (succesfulRegister.length > 0) {
                        var userIds = [];
                        for (var i = 0; i < succesfulRegister.length; i++) {
                            userIds.push(succesfulRegister[i].id);
                        }

                        return _returnDefault(res, true, succesfulRegister[0].imagePath);
                    } else {
                        console.log(generatedFiles);
                        var chosenImage = generatedFiles[0];

                        var spliceIndex = chosenImage.lastIndexOf('/') + 1;
                        var outputFile  = "img/" + chosenImage.slice(spliceIndex, chosenImage.length);

                        return _returnDefault(res, true, outputFile);
                    }
                });
            });
        });
    });
});

module.exports = router;
