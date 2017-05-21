'use strict';

angular.module('takhshilaApp')
  .controller('CheckoutCtrl', function ($rootScope, $scope, transactionFactory, cart) {
  	$rootScope.isLoading = false;
  	$scope.cartData = cart.getCart();
  	$scope.paymentData = {};

    console.log($scope.cartData);

    $scope.checkout = function(){
    	var transactionData = {
    		currency: $scope.cartData.currency,
    		teacherID: $scope.cartData.teacherID,
    		classData: $scope.cartData.classData
    	}
    	transactionFactory.initiate(transactionData)
    	.success(function(response){
    		console.log("Success");
    		console.log(response);
    		$scope.paymentData = response;
    		$rootScope.$broadcast('processFormSubmit', {formName: 'paymentRedirect'})
    		// var paymentForm = angular.element('#paymentRedirect');
    		// paymentForm.click();
    		// paymentForm.triggerHandler('submit');
    	})
    	.error(function(err){
    		console.log("error");
    		console.log(err);
    	})
    }
  });
