var easyimg = require('easyimage');
var request = require('request');

var apiKeys = require('../api');

// GLOBAL VARIABLES
var CROPURL = "https://api.idolondemand.com/1/api/sync/detectfaces/v1";

var cropImage = function (cropDetails, imageSource, imageDestination) {
    easyimg.crop(
        {
            src:'beach.jpg', dst:'beach-cropped.png',
            cropwidth:128, cropheight:128,
            gravity:'North',
            x:30, y:50
        }, function(err, stdout, stderr) {
            if (err) throw err;
            console.log('Cropped');
        }
    );
}


var cropThisImage = function (source, cb) {
    console.log("Cropping image!");

    if (!source) {
        console.log("No image found!");
        return null;
    }

    var data = {
        'form' : {
            'apikey': apiKeys.HP_API_KEY,
            'url': source,
            'additional': true
        }
    };

    request.post(
        CROPURL,
        data,
        function (error, response, body) {
            if (error) {
                console.log("Error: " + error);
                return;
            }

            console.log(body);
            //
            // if (!error && response.statusCode == 200) {
            //     console.log(body)
            // }
        }
    );

    // Read in the source image

    // Send to api for crop details



    // Check if there is any faces
        // Too many or no faces detected
        // Return false;

        // Prepare to crop image
        // Crop image

        // return cropped image link

    return;
}

var source = 'https://www.idolondemand.com/sample-content/images/babysanta1.jpg';
//source = './babysanta1.jpg';
cropThisImage(source, function(croppedImage) {
    if (!croppedImage) {
        console.log("Nothing to return");
        return;
    }
});
