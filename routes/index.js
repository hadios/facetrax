var express   = require('express');
var fs        = require('fs');
var path      = require('path');
var cps       = require('cps-api');
var resemble  = require('node-resemble');
var async     = require('async');

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

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Facetrax' });
});

// /* GET home page. */
// router.get('/result', function(req, res, next) {
//   res.render('result', { title: 'Facetrax' });
// });

var _returnDefault = function(res, result){
    return res.json({statusCode: 200, result: result});

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

                    for (var i = 0; i < generatedFiles.length; i++) {
                        fs.unlinkSync(path.join(__dirname, generatedFiles[i]));
                    }
                    fs.unlinkSync(imageFilepath);

                    console.log(succesfulRegister);
                    return _returnDefault(res, true);
                });
            });
        });
    });
});

module.exports = router;
