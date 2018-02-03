'use strict';

angular.module('takhshilaApp')
  .controller('SearchCtrl', function ($rootScope, $scope, $mdDialog, $state, $stateParams, searchFactory) {
    $rootScope.isLoading = false;
    if(!$stateParams.topic || !$stateParams.level){
    	$state.go('main');
    }

    $scope.searchResults = null;

    $scope.slider_draggable_range = {
        minValue: 0,
        maxValue: 1000,
        options: {
            ceil: 1000,
            floor: 0,
            minRange: 50,
            draggableRange: true,
            translate: function (value) {
                return '' + value;
            }
        }
    };

    $scope.$watch(function(){ return $scope.slider_draggable_range.maxValue; }, function(val){
        console.log(val);
        // $scope.processSearch();
    });
    
    $scope.searchTerm;

    $scope.clearSearchTerm = function() {
        $scope.searchTerm = '';
    };

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

    $scope.processSearch = function(){
        if($scope.slider_draggable_range.maxValue){
            searchdata.maxPrice = $scope.slider_draggable_range.maxValue;
        }
        if($scope.slider_draggable_range.minValue){
            searchdata.minPrice = $scope.slider_draggable_range.minValue;
        }
        searchFactory.search(searchdata)
        .success(function(response){
            if(response.length){
                $scope.searchResults = response;
            }
        })
        .error(function(err){
            console.log(err);
        });
    }

    $scope.processSearch();

    $rootScope.populateCountries();

  });
