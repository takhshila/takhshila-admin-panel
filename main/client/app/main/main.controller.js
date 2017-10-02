'use strict';

angular.module('takhshilaApp')
  .controller('MainCtrl', function ($rootScope, $scope, $state, $http) {
    $rootScope.isLoading = false;
    $rootScope.search = {
    	topic: null,
    	level: 'Basic'
    }
    $scope.loadingResults = false;
    $rootScope.processSearch = function(evt){
    	evt.preventDefault();
    	evt.stopPropagation();
    	if($rootScope.search.topic !== null && $rootScope.search.level !== null){
    		$state.go('search', $rootScope.search);
    	}
    }

    $scope.getTopicList = function(searchTerm) {
      $scope.loadingResults = true;
      return $http.get('/api/v1/topics/search/'+searchTerm).then(function(response){
        $scope.loadingResults = false;
        return response.data.map(function(item){
          return item.topicName;
        });
      });
    };

  });
