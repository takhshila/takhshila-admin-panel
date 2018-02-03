'use strict';

angular.module('takhshilaApp')
  .controller('WalletCtrl', function ($rootScope, $scope, $http) {
  	$scope.transactionHistory = [];
  	$scope.page = 0;
  	$scope.hasMoreData = false;

  	$scope.getWalletBalance = function(){
  		$http.get('/api/v1/wallets/balance/')
  		.then(function(response){
  			$scope.wallet = response.data;
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
			}else{
        $scope.hasMoreData = false;
      }
			$scope.page++;
			$scope.transactionHistory = response.data;
		}, function(err){
			console.log(err);
		});
  	}

  	$scope.loadTransactionHistory = function(){
  		$scope.page = 0;
  		$scope.getTransactionHistory();
  	}

    $rootScope.$watch('loggedIn', function(status){
      if(status === true){
      	$rootScope.isLoading = false;
        $scope.getWalletBalance();
      }
    });

  });
