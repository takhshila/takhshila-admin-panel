'use strict';

angular.module('takhshilaApp')
  .controller('AdminPaymentsCtrl', function ($rootScope, $scope, $http) {
    $scope.payments = [];
  	$scope.initiatingWithdraw = [];
    $scope.errorMessage = null;
  	$scope.hasMoreData = false;

  	var currentPage = 0;
  	var dataPerPage = 20;
  	
  	$scope.getPaymentWallet = function(){
  		$http.get('/api/v1/wallets/?page=' + currentPage + '&perPage=' + dataPerPage)
  		.then(function(response){
  			$rootScope.isLoading = false;
  			$scope.payments = response.data;
  		});
  	}

    $scope.initiateWithdraw = function(userID){
      $scope.errorMessage = null;
      $scope.initiatingWithdraw[userID] = true;
      $http.post('/api/v1/transactions/withdraw/initiate/' + userID)
      .then(function(response){
        $scope.initiatingWithdraw[userID] = false;
        for(var i = 0; i < $scope.payments.length; i++){
          if($scope.payments[i].userID._id === userID){
            $scope.payments[i].withdrawlRefrence = response;
            break;
          }
        }
      })
      .catch(function(err){
        $scope.initiatingWithdraw[userID] = false;
        $scope.errorMessage = err.data;
        console.log(err);
      })
    }

    $rootScope.$watch('loggedIn', function(status){
      if(status === true){
        $scope.getPaymentWallet();
      }
    });
  });
