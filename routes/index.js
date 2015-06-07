var express = require('express');
var fs      = require('fs');
var path    = require('path');

var router = express.Router();

var _savefileToServer = function (imagedata, destPath, cb) {
    var buf = new Buffer(imagedata, 'base64');

    // Temporary save the file
    fs.writeFile(destPath+'tempfile.jpg', buf, 'binary', function(err) {
        if (err) {
            console.log("Error saving file to server!");
            console.log(err);
            return cb(err, null);
        }

        console.log('File saved.');
        return cb(null, destPath);
    });
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Facetrax' });
});

router.post('/imageUpload', function(req, res, next) {
    //console.log(req.body);

    // Check if there is image
    var imageData = req.body.imageData;
    if (!imageData) {
        console.log("There is no image, yo!");

        return res.format({
                html: function() {
                    res.render('index', { title: 'Express'});
                },

                json: function() {
                    res.status(200).send('OK');
                }
            });
    }

    console.log("Image received!");

    var destinationFile = path.join(__dirname, '../photo/');
    return _savefileToServer(imageData, destinationFile, function(err, imageFilepath) {
        if (err) {
            console.log("Error saving file!");
            return res.format({
                    html: function() {
                        res.render('index', { title: 'Express'});
                    },

                    json: function() {
                        res.status(200).send('OK');
                    }
                });
        }

        console.log("Save file succesfully");

        return res.format({
                html: function() {
                    res.render('index', { title: 'Express'});
                },

                json: function() {
                    res.status(200).send('OK');
                }
            });
    });
    // var tempImage = ''; // Save here
    //
    // // Start running the image detection and extraction
    // imageProcess.extractGenerateFaceImages(tempImage, function(result){
    //     if (!result) {
    //
    //     }
    // });

    // Save the image

    // Process the image

    // Check if there is any faces

    //res.render('index', { title: 'Facetrax' });
});

module.exports = router;
