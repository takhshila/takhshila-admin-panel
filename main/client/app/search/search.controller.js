'use strict';

angular.module('takhshilaApp')
  .controller('SearchCtrl', function ($rootScope, $scope, $mdDialog, $state, $stateParams, searchFactory) {
    $rootScope.isLoading = false;
    if(!$stateParams.topic || !$stateParams.level){
    	$state.go('main');
    }

    $scope.searchResults = null;

    $scope.showVideoModal = function(userIndex, videoIndex){
		var parentEl = angular.element(document.body);
		$mdDialog.show({
			templateUrl: 'components/videoPlayerModal/videoPlayerModal.html',
			controller: 'VideoPlayerModalCtrl',
			parent: parentEl,
			disableParentScroll: true,
			clickOutsideToClose: true,
			locals: {
			  index: videoIndex,
			  videos: $scope.searchResults[userIndex].videos
			}
		});
    }

    var searchdata = {
    	topic: $stateParams.topic,
    	level: $stateParams.level
    }

    searchFactory.search(searchdata)
    .success(function(response){
    	if(response.length){
    		$scope.searchResults = response;
    	}
    })
    .error(function(err){
    	console.log(err);
    })
  });
