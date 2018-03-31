'use strict';

angular.module('takhshilaApp')
  .controller('AdminVideosCtrl', function ($rootScope, $scope, $http, $mdDialog) {
  	$scope.videos = [];
  	$scope.hasMoreData = false;

  	var currentPage = 0;
  	var dataPerPage = 20;
  	
  	$scope.getVideos = function(){
		return $http.get('/api/v1/videos/?page=' + currentPage + '&perPage=' + dataPerPage)
		.then(function(response){
			$rootScope.isLoading = false;
			$scope.videos = response.data;
		});
  	}

    $scope.showVideoModal = function(videoID){
		var videoData;
		for(var i = 0; i < $scope.videos.length; i++){
		  if($scope.videos[i]._id === videoID){
		    videoData = $scope.videos[i];
		    break;
		  }
		}
		var parentEl = angular.element(document.body);
		$mdDialog.show({
			templateUrl: 'components/videoPlayerModal/videoPlayerModal.html',
			controller: 'VideoPlayerModalCtrl',
			parent: parentEl,
			disableParentScroll: true,
			clickOutsideToClose: true,
			locals: {
				index: 0,
				videos: [videoData]
			}
		});
    }

    $scope.deleteVideo = function(videoID){
      $scope.deletingVideo = true;
      $http.delete('/api/v1/videos/delete/' + videoID)
      .then(function(){
        $scope.getVideos()
        .then(function(){
          $scope.deletingVideo = false;
        });
      }, function(err){
        console.log(err);
        $scope.deletingVideo = false;
      });
    }

    $scope.publishVideo = function(videoID){
      $scope.publishingVideo = true;
      $http.put('/api/v1/videos/publish/' + videoID)
      .then(function(){
        $scope.publishingVideo = false;
        for(var i = 0; i < $scope.videos.length; i++){
          if($scope.videos[i]._id === videoID){
            $scope.videos[i].active = true;
            $scope.videos[i].status = 'published';
            break;
          }
        }
      }, function(err){
        console.log(err);
        $scope.publishingVideo = false;
      });
    }

    $scope.unpublishVideo = function(videoID){
      $scope.unpublishingVideo = true;
      $http.put('/api/v1/videos/unpublish/' + videoID)
      .then(function(){
        $scope.unpublishingVideo = false;
        for(var i = 0; i < $scope.videos.length; i++){
          if($scope.videos[i]._id === videoID){
            $scope.videos[i].active = false;
            $scope.videos[i].status = 'unpublished';
            break;
          }
        }
      }, function(err){
        console.log(err);
        $scope.unpublishingVideo = false;
      });
    }

    $rootScope.$watch('loggedIn', function(status){
      if(status === true){
        $scope.getVideos();
      }
    });
  });
