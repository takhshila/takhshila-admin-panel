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
	    	console.log("Incoming Call");
			call.answer(window.localStream);
			call.on('stream', function(stream) {
				console.log("Started receiving stream");
			  // `stream` is the MediaStream of the remote peer.
			  // Here you'd add it to an HTML video/canvas element.
			  $('#peer-video').prop('src', URL.createObjectURL(stream));
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
    		receiverPeerID = response.receiver.peerID;
    		call = peer.call(receiverPeerID, window.localStream);
			if(receiverPeerID){
				screenCall = peer.call(response.receiver.peerID, stream);
			}
			call.on('stream', function(stream) {
			  // `stream` is the MediaStream of the remote peer.
			  // Here you'd add it to an HTML video/canvas element.
			  $('#peer-video').prop('src', URL.createObjectURL(stream));
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
		console.log("Message received: ", msg);
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
				$('#peer-screen-video').prop('src', URL.createObjectURL(stream));
				if(receiverPeerID){
					screenCall = peer.call(response.receiver.peerID, stream);
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
      	console.log("Checking if extension is installed");
      	$window.postMessage('check-addon-installed', '*' );
        $rootScope.isLoading = false;
        connectPeer();
      }
    });

  });