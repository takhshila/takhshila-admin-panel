'use strict';

angular.module('takhshilaApp')
.controller('BookingStatusCtrl', function ($rootScope, $scope, $http, $state, $stateParams, Auth, userFactory) {
	var transactionID = $stateParams.txnID;
	$scope.classBookStatus = $stateParams.status;
	$scope.classInfo = null;
	$scope.paymentStatus = null;
    $scope.paymentDetails = {
    	currency: 'INR',
        totalCost: 0.00,
        walletBalance: 0.00,
        amountPaid: 0.00
    }
	var getTransactionData = function(transactionID){
		$http.get('/api/v1/transactions/single/' + transactionID).then(function(response){
			var transactionData = response.data;
			if(transactionData.classInfo !== null){
				console.log(transactionData);
				$scope.paymentStatus = transactionData.status;
				$scope.classInfo = JSON.parse(transactionData.classInfo);
				for(var i = 0; i < $scope.classInfo.length; i++){
					$scope.paymentDetails.totalCost += parseFloat($scope.classInfo[i].amount.totalCost);
				}
				$scope.paymentDetails.currency = $scope.classInfo[0].amount.currency;
				$scope.paymentDetails.amountPaid = parseFloat(transactionData.transactionAmount);
				$scope.paymentDetails.walletBalance = parseFloat($scope.paymentDetails.totalCost - $scope.paymentDetails.amountPaid);
				console.log($scope.classInfo);
				userFactory.getUserDetails($scope.classInfo[0].teacherID)
				.success(function(response){
					$scope.teacherDetails = response;	
					$rootScope.isLoading = false;				
				})
				.error(function(err){

				});
			}else{
				$state.go('main');
			}
		})
		.catch(function(err){
			if(err.status === 404){

			}
			$rootScope.isLoading = false;
		});
	}
	$rootScope.$watch('loggedIn', function(status){
		if(status === true){
			getTransactionData(transactionID);
		}
	});
});
