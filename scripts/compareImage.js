var fs = require('fs');
var resemble = require('node-resemble');

var file1 = "photo/11_family.jpg";
var file2 = "photo/1_family.jpg";

var api = resemble(file1).onComplete(function(data){
console.log(data);
  return data;
  /* { red: 255, green: 255, blue: 255, brightness: 255 } */
});

var diff = resemble(file1).compareTo(file2).ignoreColors().onComplete(function(data){
    console.log(data);
    /*
    {
      misMatchPercentage : 100, // %
      isSameDimensions: true, // or false
      dimensionDifference: { width: 0, height: -1 }, // defined if dimensions are not the same
      getImageDataUrl: function(){}
    }
    */
});

module.exports.compareImages = function (firstImage, secondImage) {
    var diff = resemble(file1).compareTo(file2).ignoreColors().onComplete(function(data){
        console.log(data);
        /*
        {
          misMatchPercentage : 100, // %
          isSameDimensions: true, // or false
          dimensionDifference: { width: 0, height: -1 }, // defined if dimensions are not the same
          getImageDataUrl: function(){}
        }
        */
    });

    return diff;
}
