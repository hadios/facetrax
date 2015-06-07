// Put event listeners into place

window.addEventListener("DOMContentLoaded", function() {
	// Grab elements, create settings, etc.
	var canvas = document.getElementById("canvas"),
		context = canvas.getContext("2d"),
		video = document.getElementById("video"),
		videoObj = { "video": true },
		localMediaStream = null,
		errBack = function(error) {
			console.log("Video capture error: ", error.code);
		};

	// Put video listeners into place
	if(navigator.getUserMedia) { // Standard
		navigator.getUserMedia(videoObj, function(stream) {
			video.src = stream;
			video.play();
			localMediaStream = stream;
		}, errBack);
	} else if(navigator.webkitGetUserMedia) { // WebKit-prefixed
		navigator.webkitGetUserMedia(videoObj, function(stream){
			video.src = window.webkitURL.createObjectURL(stream);
			video.play();
			localMediaStream = stream;
		}, errBack);
	}
	else if(navigator.mozGetUserMedia) { // Firefox-prefixed
		navigator.mozGetUserMedia(videoObj, function(stream){
			video.src = window.URL.createObjectURL(stream);
			video.play();
		}, errBack);
	}

  // Trigger photo take
  document.getElementById("snap").addEventListener("click", function() {
		context.drawImage(video, 0, 0, 640, 480);

		video.pause();
		// video.src="";
		localMediaStream.stop();
		var imgData = canvas.toDataURL("img/png");
		imgData = imgData.replace('data:image/png;base64,','');
		var postData = JSON.stringify({imageData: imgData});
		console.log(postData);

		$.ajax({
			url: '/imageUpload',
			type: 'POST',
			data: postData,
			contentType: 'application/json',
			success: function(data) {
				console.log(data);
				$( "#loading" ).show();

				if (data.result) {
					console.log("Refreshing!");

					// Add in userid for his own page
					window.location.href = "/result?image="+data.userids;
				} else {
					console.log("Refreshing!");
					//window.location.href = "/";
					var canvas = document.getElementById("canvas"),
						context = canvas.getContext("2d"),
						video = document.getElementById("video"),
						videoObj = { "video": true },
						localMediaStream = null,
						errBack = function(error) {
							console.log("Video capture error: ", error.code);
						};

					// Put video listeners into place
					if(navigator.getUserMedia) { // Standard
						navigator.getUserMedia(videoObj, function(stream) {
							video.src = stream;
							video.play();
							localMediaStream = stream;
						}, errBack);
					} else if(navigator.webkitGetUserMedia) { // WebKit-prefixed
						navigator.webkitGetUserMedia(videoObj, function(stream){
							video.src = window.webkitURL.createObjectURL(stream);
							video.play();
							localMediaStream = stream;
						}, errBack);
					}
					else if(navigator.mozGetUserMedia) { // Firefox-prefixed
						navigator.mozGetUserMedia(videoObj, function(stream){
							video.src = window.URL.createObjectURL(stream);
							video.play();
						}, errBack);
					}
				}
			}
		});
  });
}, false);
