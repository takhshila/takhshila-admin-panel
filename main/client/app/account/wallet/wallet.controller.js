'use strict';

angular.module('takhshilaApp')
  .controller('WalletCtrl', function ($rootScope, $scope, $http) {
  	$scope.transactionHistory = [];
  	$scope.page = 0;
  	$scope.hasMoreData = true;

  	$scope.getWalletBalance = function(){
		$http.get('/api/v1/wallets/balance/')
		.then(function(response){
			$scope.wallet = response;
			$scope.getTransactionHistory();
		}, function(err){
			console.log(err);
		});
  	}

  	$scope.getTransactionHistory = function(){
		$http.get('/api/v1/transactions/')
		.then(function(response){
			if(response.data.length < 10){
				$scope.hasMoreData = false;
			}
			$scope.page++;
			$scope.transactionHistory = response.data;
      console.log($scope.transactionHistory);
		}, function(err){
			console.log(err);
		});
  	}

  	$scope.loadTransactionHistory = function(){
  		$scope.page = 0;
  		$scope.hasMoreData = true;
  		$scope.getTransactionHistory();
  	}

    $rootScope.$watch('loggedIn', function(status){
      if(status === true){
      	$rootScope.isLoading = false;
        $scope.getWalletBalance();
      }
    });

  });
