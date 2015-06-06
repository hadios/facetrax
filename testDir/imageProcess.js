var easyimg = require('easyimage');
var request = require('request');
var needle  = require('needle');

var apiKeys = require('../api');

var imageIndex  = 1;
var imageLocals = ['babysanta1.jpg',
                   'family.jpg'];

// GLOBAL VARIABLES
var CROPURL = "https://api.idolondemand.com/1/api/sync/detectfaces/v1";

var cropImage = function (cropDetails, imageSource, imageDestination, cb) {
    easyimg.crop(
        {
            src: imageSource, dst:imageDestination,
            cropwidth:cropDetails.width, cropheight:cropDetails.height,
            gravity:'NorthWest',
            x:cropDetails.left, y:cropDetails.top
        }, function(err, stdout, stderr) {
            if (err || stdout || stderr) {
                console.log("Crop error! Error: " + err);
                return cb(err, null);
            }
        }
    );

    console.log('Cropped');
    return cb(null);
}

var cropThisImage = function (source, cb) {
    console.log("Preparing to crop image...");

    // Read in the source image
    if (!source) {
        console.log("No image found!");
        return null;
    }

    var data = {
        'apikey': apiKeys.HP_API_KEY,
        'file': {
            'file': source,
            'content_type': 'multipart/form-data'
        },
        'additional': true,
    };

    needle.post(CROPURL,
                data,
                { multipart: true },
                function (error, response, body) {

                if (error) {
                    console.log("Error: " + error);
                    return;
                }

                switch (response.statusCode) {
                    case 200:
                        console.log(body);

                        var faces       = body.face;
                        var numFaces    = faces.length;

                        if (numFaces == 0) {
                            console.log("C'mon put a face in there!");
                            return false;
                        } else {
                            console.log("Extracting " + numFaces + "!");
                        }

                        // Extract all the faces from the photo
                        for (var i = 0; i < faces.length; i++) {
                            cropImage(faces[i], source, (i+1) + "_" + source, function(err){
                                if (err) {
                                    console.log("[ERROR]: Failed cropping...");
                                    return false;
                                }

                                console.log("Image cropped!");
                            });
                        }
                        break;

                    default:
                        console.log("Error in face detection. " + body);
                        break;
                }
            }
    );

    return false;
}

var source = imageLocals[imageIndex];

cropThisImage(source, function(croppedImage) {
    if (!croppedImage) {
        console.log("Nothing to return");
        return;
    }

    console.log("Succesfully crop image!");
});
