'use strict';

angular.module('takhshilaApp')
  .controller('LiveclassCtrl', function ($rootScope, $stateParams, $q, socket) {
	var classID = $stateParams.classID,
		peer = null;

	var getCurrentUserVideo = function(){
		var deferred = $q.defer();

		navigator.getUserMedia({audio: false, video: true}, function(stream){
			deferred.resolve(stream);
		}, function(err){ 
			deferred.reject(err);
		});

		return deferred.promise
	}

    var connectToClass = function(){
    	var deferred = $q.defer();
		socket.socket.emit('joinClass', {classID: classID}, function(response){
			if(response.success){
				deferred.resolve();
			}else{
				deferred.reject(response.error);
			}
		});
		return deferred.promise;
    }

    var classConnected = function(response){
		console.log("You have successfuly joined the class");
		getCurrentUserVideo()
		.then(function(stream){
			$('#my-video').prop('src', URL.createObjectURL(stream));
			window.localStream = stream;
		}, function(err){
			$('#step1-error').show();
		});
    }

    var connectPeer = function(){
	    peer = new Peer($rootScope.currentUser._id, {key: 'lwjd5qra8257b9'});
	    peer.on('open', function(response){
			$('#my-id').text(peer.id);
			connectToClass()
			.then(classConnected, function(err){
				console.log(err.description);
			});
	    });
	    peer.on('error', function(err){
			if(err.type === "unavailable-id"){
				console.log("You are already logged in from different browser");
			}
	    });
    }


    $rootScope.$watch('loggedIn', function(status){
      if(status === true){
        $rootScope.isLoading = false;
        connectPeer();
      }
    });

  });