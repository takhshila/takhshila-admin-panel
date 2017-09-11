'use strict';

angular.module('takhshilaApp')
  .controller('ClassCtrl', function ($rootScope, $scope, $mdDialog, User, userClassFactory, Auth) {
  	$scope.classList = [];
  	$scope.page = 0;
  	$scope.loading = false;

  	$scope.getClasses = function(type){
  		$scope.loading = true;
  		var params = {
  			page: $scope.page
  		}
  		if(type) { params.classType = type; }

  		userClassFactory.getClasses(params)
		.success(function(response){
			$scope.loading = false;
			if(response.length < 10){
				$scope.hasMoreData = false;
			}else{
        $scope.hasMoreData = true;
      }
			$scope.page++;
			$scope.classList = response;
		})
		.error(function(err){
			$scope.loading = false;
			console.log(err);
		})
  	}

  	$scope.loadClasses = function(type){
  		$scope.page = 0;
  		$scope.getClasses(type);
  	}
    $rootScope.$watch('loggedIn', function(status){
      if(status === true){
        $rootScope.isLoading = false;
        $scope.getClasses();
      }
    });
  });
