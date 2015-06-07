require('dotenv').config({path: '../.env'});
var filesystem   = require('fs');
var cps          = require('cps-api');

var conn         = new cps.Connection(process.env.CLUSTERPOINT_URL, 'facetrax', process.env.DB_USERNAME, process.env.DB_PASSWORD, 'document', 'document/id', {account: 100322});

var PHOTO_DIRECTORY = "../photo";
var CLEAR_FLAG = false;

var _getAllFilesFromFolder = function(dir) {
    var results = [];

    filesystem.readdirSync(dir).forEach(function(file) {
        file = dir+'/'+file;
        var stat = filesystem.statSync(file);

        if (stat && stat.isDirectory()) {
            results = results.concat(_getAllFilesFromFolder(file))
        } else {
            results.push(file);
        }
    });

    return results;
};

var _addToDatabase = function(filelist, cb) {

    // Need to test if able to send multiple documents
    if (!filelist) {
        console.log("Eh there is no filelist!");
        return cb(null, false);
    }

    var documents = [];
    for(var i = 0; i < filelist.length; i++) {
        var data = {
            'id': (i+1),
            'username': 'name'+(i+1),
            'imagePath': filelist[i]
        };

        documents.push(data);
    }

    var insert_request = new cps.InsertRequest(documents);
    conn.sendRequest(insert_request, function(err, insert_response) {
       if (err) {
           console.error(err);
           return cb(err, false);
       }

       console.log('New user registered: ');
       console.log(insert_response);
       return cb(null, true);
    });
};

var _updateToDatabase = function () {
    // Read in the photo directory and add all to database
    var filelist = _getAllFilesFromFolder(PHOTO_DIRECTORY);

    // Filter out non jpg or png files
    var filteredList = [];
    for (var i = 0; i < filelist.length; i++) {
        var fileExtension = filelist[i].slice(-3);
        if (fileExtension == "jpg" || fileExtension == "png") {
            filteredList.push(filelist[i]);
        }
    }
    console.log(filteredList);

    //_sampleInsert();

    //return;

    _addToDatabase(filteredList, function(err, result){
        if (result) {
            console.log("Added to database!");
        }
    });
}

_sampleInsert = function() {
    var id    = 1,
        name  = "Username";

    var insert_request = new cps.InsertRequest('<document><id>'+id+'</id>'+cps.Term(name, "name")+'</document>');
    conn.sendRequest(insert_request, function(err, insert_response) {
        if (err) return console.error(err);
        console.log('New user registered: ' + insert_response.document.id);
    });
}

if (CLEAR_FLAG) {
    conn.sendRequest(new cps.Request('clear'), function (err, clear_resp) {
        if (err) {
            return console.log(err);
        }

        console.log("Database clear!");
        console.log(clear_resp);

        _updateToDatabase();
    }, 'json');
} else {
    _updateToDatabase();
}
