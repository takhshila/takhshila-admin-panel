'use strict';

angular.module('takhshilaApp')
  .controller('LiveclassCtrl', function ($rootScope, $scope, $stateParams, $q, $window, socket) {
	var classID = $stateParams.classID,
		peer = null,
		peerID = null,
		receiverPeerID = null,
		call = null,
		screenCall = null,
		extensionInstalled = false,
		screenSourceID = null;

	var getCurrentUserVideo = function(sourceId){
		var deferred = $q.defer();

		navigator.getUserMedia = ( navigator.getUserMedia ||
		                       navigator.webkitGetUserMedia ||
		                       navigator.mozGetUserMedia ||
		                       navigator.msGetUserMedia);

		navigator.getUserMedia({audio: true, video: true}, function(stream){
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
			getCurrentUserVideo()
			.then(function(stream){
				window.localStream = stream;
				connectToClass(peerID)
				.then(function(response){
					$('#self-video').prop('src', URL.createObjectURL(window.localStream));
				}, function(err){
					console.log(err.description);
				})
			}, function(err){
				console.log("Strem Error: ", err);
			});
	    });

	    peer.on('call', function(call){
	    	console.log("Incoming call for " + call.metadata.streamType);
	    	if(call.metadata.streamType === 'video'){
				call.answer(window.localStream);
	    	}else if(call.metadata.streamType === 'screen'){
	    		call.answer();
	    	}
			call.on('stream', function(stream) {
				if(call.metadata.streamType === 'video'){
					$('#peer-video').prop('src', URL.createObjectURL(stream));
				}else if(call.metadata.streamType === 'screen'){
					$('#peer-screen-video').prop('src', URL.createObjectURL(stream));
				}
			});
			// if(receiverPeerID && window.screenStream){
			// 	screenCall = peer.call(receiverPeerID, window.screenStream, {metadata: {streamType: "screen"}});
			// 	screenCall.on('stream', function(stream){
			// 		if(stream){
			// 			$('#peer-screen-video').prop('src', URL.createObjectURL(stream));
			// 		}
			// 	});
			// }
	    });

	    peer.on('error', function(err){
			if(err.type === "unavailable-id"){
				console.log("You are already logged in from different browser");
			}
	    });
    }

    socket.socket.on('startClass', function(response){
    	console.log("Start class request received");
    	receiverPeerID = response.receiver.peerID;
    	if(response.caller.userID === $rootScope.currentUser._id){
    		call = peer.call(receiverPeerID, window.localStream, {metadata: {streamType: "video"}});
			call.on('stream', function(stream) {
				$('#peer-video').prop('src', URL.createObjectURL(stream));
			});
    	}
		if(receiverPeerID && window.screenStream){
			screenCall = peer.call(receiverPeerID, window.screenStream, {metadata: {streamType: "screen"}});
			screenCall.on('stream', function(stream){
				if(stream){
					$('#peer-screen-video').prop('src', URL.createObjectURL(stream));
				}
			});
		}
    })

    $scope.shareScreen = function(){
    	if(extensionInstalled){
    		$window.postMessage('requestScreenSourceId', '*' );
    	}else{
    		alert("Extension is not installed");
    	}
    }

	$window.addEventListener("message", function(msg){
		if( !msg.data ) {
			return;
		} else if ( msg.data.sourceId ) {
			screenSourceID = msg.data.sourceId;
			var constraints = {
				audio: false,
				video: {
					mandatory: {
						chromeMediaSource: 'desktop',
						maxWidth: screen.width > 1920 ? screen.width : 1920,
						maxHeight: screen.height > 1080 ? screen.height : 1080,
						chromeMediaSourceId: screenSourceID
					},
					optional: [
						{ googTemporalLayeredScreencast: true }
					]
				}
			};

			navigator.getUserMedia(constraints, function(stream){
				window.screenStream = stream;
				$('#peer-screen-video').prop('src', URL.createObjectURL(window.screenStream));
				if(receiverPeerID && window.screenStream){
					screenCall = peer.call(receiverPeerID, window.screenStream, {metadata: {streamType: "screen"}});
				}
			}, function(err){ 
				console.log("Stremm error: ", err);
			});
		} else if( msg.data === 'addon-installed' ) {
			extensionInstalled = true;
		}
	}, false);


    $rootScope.$watch('loggedIn', function(status){
      if(status === true){
      	$window.postMessage('check-addon-installed', '*' );
        $rootScope.isLoading = false;
        connectPeer();
      }
    });

  });