'use strict';

angular.module('takhshilaApp')
  .controller('LiveclassCtrl', function ($rootScope, $stateParams, $q, socket) {
	var classID = $stateParams.classID,
		peer = null,
		call = null;

	var getCurrentUserVideo = function(){
		var deferred = $q.defer();

		navigator.getUserMedia = ( navigator.getUserMedia ||
		                       navigator.webkitGetUserMedia ||
		                       navigator.mozGetUserMedia ||
		                       navigator.msGetUserMedia);
		navigator.getUserMedia({audio: false, video: true}, function(stream){
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
	    peer = new Peer({key: 'lwjd5qra8257b9'});

	    peer.on('open', function(peerID){
			$('#my-id').text(peerID);
			getCurrentUserVideo()
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
	    });

	    peer.on('call', function(call){
	    	console.log("Incoming Call");
			call.answer(window.localStream);
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
    		console.log("Making Call");
    		call = peer.call(response.receiver.peerID, window.localStream);
    	}
    })


    $rootScope.$watch('loggedIn', function(status){
      if(status === true){
        $rootScope.isLoading = false;
        connectPeer();
      }
    });

  });