'use strict';

angular.module('takhshilaApp')
  .controller('AdminUsersCtrl', function ($rootScope, $scope, $http, Auth, User) {
  	$scope.users = [];
  	$scope.hasMoreData = false;

  	var currentPage = 0;
  	var dataPerPage = 20;
  	
  	$scope.getUsers = function(){
		$http.get('/api/v1/users/?page=' + currentPage + '&perPage=' + dataPerPage)
		.then(function(response){
			$rootScope.isLoading = false;
			$scope.users = response.data;
		});
  	}

    $rootScope.$watch('loggedIn', function(status){
      if(status === true){
        $scope.getUsers();
      }
    });
  });
