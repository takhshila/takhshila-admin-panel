'use strict';

angular.module('takhshilaApp')
  .controller('LiveclassCtrl', function ($rootScope, $stateParams, $q, $window, socket) {
	var classID = $stateParams.classID,
		peer = null,
		peerID = null,
		call = null;

	var getCurrentUserVideo = function(sourceId){
		var deferred = $q.defer();

		navigator.getUserMedia = ( navigator.getUserMedia ||
		                       navigator.webkitGetUserMedia ||
		                       navigator.mozGetUserMedia ||
		                       navigator.msGetUserMedia);
		var constraints = {
			audio: false,
			video: {
				mandatory: {
					chromeMediaSource: 'desktop',
					maxWidth: screen.width > 1920 ? screen.width : 1920,
					maxHeight: screen.height > 1080 ? screen.height : 1080,
					chromeMediaSourceId: sourceId
				},
				optional: [
					{ googTemporalLayeredScreencast: true }
				]
			}
		};

		// navigator.getUserMedia({audio: false, video: true}, function(stream){
		navigator.getUserMedia(constraints, function(stream){
			deferred.resolve(stream);
		}, function(err){ 
			deferred.reject(err);
		});

		return deferred.promise
	}

    var connectToClass = function(peerID){
    	var deferred = $q.defer();
		socket.socket.emit('joinClass', {classID: classID, peerID: peerID}, function(response){
			console.log(response);
			if(response.success){
				deferred.resolve();
			}else{
				deferred.reject(response.error);
			}
		});
		return deferred.promise;
    }

    var connectPeer = function(){
	    // peer = new Peer({key: 'lwjd5qra8257b9'});
	    peer = new Peer({
	    	host: '/',
	    	port: location.port,
	    	path: '/peerconnection',
			// config: { 
			// 	'iceServers': [
			// 		{ url: 'stun:stun01.sipphone.com' },
			// 		{ url: 'stun:stun.ekiga.net' },
			// 		{ url: 'stun:stunserver.org' },
			// 		{ url: 'stun:stun.softjoys.com' },
			// 		{ url: 'stun:stun.voiparound.com' },
			// 		{ url: 'stun:stun.voipbuster.com' },
			// 		{ url: 'stun:stun.voipstunt.com' },
			// 		{ url: 'stun:stun.voxgratia.org' },
			// 		{ url: 'stun:stun.xten.com' },
			// 		{
			// 			url: 'turn:192.158.29.39:3478?transport=udp',
			// 			credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
			// 			username: '28224511:1379330808'
			// 		},
			// 		{
			// 			url: 'turn:192.158.29.39:3478?transport=tcp',
			// 			credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
			// 			username: '28224511:1379330808'
			// 		}
			// 	]
			// },
			debug: 3
		});

	    peer.on('open', function(peerID){
	    	peerID = peerID;
			$('#my-id').text(peerID);
			$window.postMessage('requestScreenSourceId', '*' );
			// getCurrentUserVideo()
			// .then(function(stream){
			// 	window.localStream = stream;
			// 	connectToClass(peerID)
			// 	.then(function(response){
			// 		$('#my-video').prop('src', URL.createObjectURL(window.localStream));
			// 	}, function(err){
			// 		console.log(err.description);
			// 	})
			// }, function(err){
			// 	console.log("Strem Error: ", err);
			// });
	    });

	    peer.on('call', function(call){
	    	console.log("Incoming Call");
			call.answer(window.localStream);
			call.on('stream', function(stream) {
				console.log("Started receiving stream");
			  // `stream` is the MediaStream of the remote peer.
			  // Here you'd add it to an HTML video/canvas element.
			  $('#their-video').prop('src', URL.createObjectURL(stream));
			});			
			// step3(call);
	    });

	    peer.on('error', function(err){
			if(err.type === "unavailable-id"){
				console.log("You are already logged in from different browser");
			}
	    });
    }

    socket.socket.on('startClass', function(response){
    	if(response.caller.userID === $rootScope.currentUser._id){
    		console.log("Making Call to -> " + response.receiver.peerID);
    		call = peer.call(response.receiver.peerID, window.localStream);
			call.on('stream', function(stream) {
				console.log("Started receiving stream");
			  // `stream` is the MediaStream of the remote peer.
			  // Here you'd add it to an HTML video/canvas element.
			  $('#their-video').prop('src', URL.createObjectURL(stream));
			});			
    	}
    })

	$window.addEventListener("message", function(msg){
		console.log("Message Received");
		if( !msg.data ) {
			return;
		} else if ( msg.data.sourceId ) {
			getCurrentUserVideo(msg.data.sourceId)
			.then(function(stream){
				window.localStream = stream;
				connectToClass(peerID)
				.then(function(response){
					$('#my-video').prop('src', URL.createObjectURL(window.localStream));
				}, function(err){
					console.log(err.description);
				})
			}, function(err){
				console.log("Strem Error: ", err);
			});
		} else if( msg.data.addonInstalled ) {
			console.log("Plugin not installed");
		}
	}, false);


    $rootScope.$watch('loggedIn', function(status){
      if(status === true){
        $rootScope.isLoading = false;
        connectPeer();
      }
    });

  });