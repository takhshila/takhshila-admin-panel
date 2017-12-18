'use strict';

angular.module('takhshilaApp')
  .controller('AdminTopicsCtrl', function ($rootScope, $scope, $http) {
  	$scope.topics = [];
  	$scope.hasMoreData = false;

  	var currentPage = 0;
  	var dataPerPage = 20;
  	
  	$scope.getTopics = function(){
		$http.get('/api/v1/topics/?page=' + currentPage + '&perPage=' + dataPerPage)
		.then(function(response){
			$rootScope.isLoading = false;
			$scope.topics = response.data;
		});
  	}

    $rootScope.$watch('loggedIn', function(status){
      if(status === true){
        $scope.getTopics();
      }
    });
  });
