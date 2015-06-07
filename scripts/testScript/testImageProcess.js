require('dotenv').config({path: '../../.env'});
var easyimg = require('easyimage');
var request = require('request');
var needle  = require('needle');

var imageIndex  = 2;
var imageLocals = ['../../photo/babysanta1.jpg',
                   '../../photo/rowan.png',
                   '../../photo/testImage.jpg'];

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

    //console.log(imageSource + ' -> ' + imageDestination);
    return cb(null);
}

var getFaceDetection = function(image, cb) {
    if (!image) {
        console.log("Hey there is no image!");
        return cb("No image!", null);
    }

    console.log("Face detection time!");
    console.log(image);

    var data = {
        'apikey': process.env.HPINDEMAND_API_KEY,
        'file': {
            'file': image,
            'content_type': 'multipart/form-data'
        },
        'additional': true,
    };

    try {
        needle.post(process.env.HP_DETECTFACE_URL,
                    data,
                    { multipart: true },
                function (error, response, body) {
                    console.log(body);

                    if (error) {
                        console.log("Error: " + error);
                        return cb(err, null);
                    }

                    switch (response.statusCode) {
                        case 200:
                            return cb(null, body.face);

                        default:
                            var message = "Error in consulting face detection API" + response.statusCode;
                            console.log(message);
                            return cb(message, null);
                    }
                }
        );
    } catch(err) {
        console.log(err);
    }

    return null;
}

module.exports.extractGenerateFaceImages = function (source, cb) {
    console.log("Preparing to crop image...");

    // Read in the source image
    if (!source) {
        console.log("No image found!");
        return cb(false);
    }

    getFaceDetection(source, function(err, facesDetails) {
        var numFaces = facesDetails.length;
        if (numFaces == 0) {
            console.log("C'mon put a face in there!");
            return cb(null);
        } else {
            console.log("Found " + numFaces + " faces!");
        }

        // Create output path and file name
        var outputPath = "../../photo/";

        // Remove directory path
        var spliceIndex = source.lastIndexOf('/') + 1;
        var outputFile  = source.slice(spliceIndex, source.length);

        var generatedFiles = [];

        // Extract all the faces from the photo
        for (var i = 0; i < facesDetails.length; i++) {
            var destPath = outputPath + (i+1) + "_" + outputFile;

            cropImage(facesDetails[i], source, destPath, function(err) {
                if (err) {
                    console.log("[ERROR]: Failed cropping...");
                    return cb(null);
                }

                //console.log("Image cropped!");
                generatedFiles.push(destPath);
            });
        }
        return cb(generatedFiles);
    });
}

var source = imageLocals[imageIndex];
this.extractGenerateFaceImages(source, function(result) {
    if (!result) {
        console.log("Nothing to return");
        return;
    }

    console.log("Succesfully crop image!");
    console.log("Result: " + result);
});
