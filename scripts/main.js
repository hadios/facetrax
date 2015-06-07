var compareImages = require('compareImages');

module.exports.registerFace = function (imageFile) {
    // Extract the file out of it
    compareImages.extractGenerateFaceImages(imageFile, function (result) {
        if (!result) {
            console.log("Please try taking photo again!");
        }

        // Get whole database list

        // Compare the image against all the image databases
    });
}
