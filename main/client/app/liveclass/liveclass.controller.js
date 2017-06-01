'use strict';

angular.module('takhshilaApp')
  .controller('LiveclassCtrl', function ($rootScope) {
    $rootScope.isLoading = false;
    var peer = new Peer({key: 'lwjd5qra8257b9'});
    console.log(peer)

	// Get audio/video stream
	navigator.getUserMedia({audio: true, video: true}, function(stream){
		// Set your video displays
		$('#my-video').prop('src', URL.createObjectURL(stream));
		window.localStream = stream;
		step2();
	},function(){ 
		$('#step1-error').show(); 
	});
  });
