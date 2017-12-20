'use strict';

angular.module('takhshilaApp')
  .controller('VideoPlayerModalCtrl', function ($scope, $state, $mdDialog, $sce, index, videos) {
  	$scope.video = videos[index];
	$scope.config = {
		autoPlay: true,
		autoHide: false,
		sources: [],
		// tracks: [{
		// 	src: "http://www.videogular.com/assets/subs/pale-blue-dot.vtt",
		// 	kind: "subtitles",
		// 	srclang: "en",
		// 	label: "English",
		// 	default: ""
		// }],
		// theme: "bower_components/videogular-themes-default/videogular.css",
		plugins: {
			poster: "http://www.videogular.com/assets/images/videogular.png"
		}
	};

	$scope.config.sources.push({
		src: $sce.trustAsResourceUrl('videos/' + videos[index].videoFile),
		type: "video/mp4"
	})

	$scope.onPlayerReady = function(API) {
		$scope.API = API;
	    // if($scope.API.currentState != 'play'){
	    //     //Force play if autoplay doesn't work
	    //     $scope.API.play();
	    //     $scope.API.currentState = 'play';
	    //  }
	};

	$scope.closeDialog = function() {
		$mdDialog.hide();
	};

	$scope.gotoUser = function(userId) {
		$mdDialog.hide();
		$state.go('user', {ID: userId});
	};
  });
