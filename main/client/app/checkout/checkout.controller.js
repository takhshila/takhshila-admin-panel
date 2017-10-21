'use strict';

angular.module('takhshilaApp')
  .controller('CheckoutCtrl', function ($rootScope, $scope, $state, $http, transactionFactory, cart) {
  	$scope.cartData = cart.getCart();
  	$scope.paymentData = {};
    $scope.paymentDetails = {
        totalCost: 0.00,
        walletBalance: 0.00,
        amountToPay: 0.00
    }

    $scope.processingCheckout = false;

    $scope.getWalletBalance = function(){
        $http.get('/api/v1/wallets/balance/')
        .then(function(response){
            $scope.paymentDetails.walletBalance = parseFloat(response.data.promoBalance + response.data.withdrawBalance);
            for(var i = 0; i < $scope.cartData.classData.length; i++){
                $scope.paymentDetails.totalCost += $scope.cartData.classData[i].cost;
            }
            if($scope.paymentDetails.walletBalance > $scope.paymentDetails.totalCost){
                $scope.paymentDetails.walletBalanceUsed = parseFloat($scope.paymentDetails.totalCost);
                $scope.paymentDetails.amountToPay = 0;
            }else{
                $scope.paymentDetails.walletBalanceUsed = parseFloat($scope.paymentDetails.walletBalance);
                $scope.paymentDetails.amountToPay = parseFloat($scope.paymentDetails.totalCost - $scope.paymentDetails.walletBalance);
            }
            $rootScope.isLoading = false;
        }, function(err){
            console.log(err);
        });
    }

    $scope.checkout = function(){
        $scope.processingCheckout = true;
        for(var i = 0; i < $scope.cartData.classData.length; i++){
            $scope.cartData.classData[i].start = moment($scope.cartData.classData[i].start, 'MMM DD, YYYY HH:mm').format();
            $scope.cartData.classData[i].end = moment($scope.cartData.classData[i].end, 'MMM DD, YYYY HH:mm').format();
        }
    	var transactionData = {
    		currency: $scope.cartData.currency,
    		teacherID: $scope.cartData.teacherID,
    		classData: $scope.cartData.classData
    	}
    	transactionFactory.initiatePayment(transactionData)
    	.success(function(response){
            if(response.paymentRequired){
        		$scope.paymentData = response.paymentData;
        		$rootScope.$broadcast('processFormSubmit', {formName: 'paymentRedirect'});
            }else{
                $state.go('profile');
            }
    		// var paymentForm = angular.element('#paymentRedirect');
    		// paymentForm.click();
    		// paymentForm.triggerHandler('submit');
    	})
    	.error(function(err){
            $scope.processingCheckout = false;
    		console.log("error");
    		console.log(err);
    	})
    }

    $rootScope.$watch('loggedIn', function(status){
      if(status === true){
        $rootScope.isLoading = false;
        $scope.getWalletBalance();
      }
    });    
  });
