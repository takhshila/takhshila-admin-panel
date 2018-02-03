'use strict';

angular.module('takhshilaApp')
  .directive('classReview', function ($mdDialog) {
    return {
      restrict: 'EA',
      link: function (scope, element, attrs) {
      		var parentEl = angular.element(document.body);
      		scope.rating = 1;
			$mdDialog.show({
				templateUrl: 'components/classReview/classReview.html',
				parent: parentEl,
				controller: function($rootScope, $scope, $http, modalOptions, modalData){
					$scope.ratingProcessing = false;
					$scope.modalData = modalData;
					$scope.modalOptions = modalOptions;
					$scope.className = modalOptions.modalType;
					$scope.reviewDialogData = $rootScope.reviewDialogData;
					$scope.currentUser = $rootScope.currentUser;
					$scope.rateUser = function(){
						if($rootScope.reviewDialogData.ratingValue){
							$scope.ratingProcessing = true;
							$http.post('/api/v1/reviews/' + $rootScope.reviewDialogData._id, {
								rating: $rootScope.reviewDialogData.ratingValue,
								review: $rootScope.reviewDialogData.review
							}).then(function(response){
								$rootScope.reviewDialogData = {};
								$rootScope.showReviewDialog = false;
								$mdDialog.hide();
							}, function(err){
								$rootScope.reviewDialogData = {};
								$rootScope.showReviewDialog = false;
								$mdDialog.hide();
							})
						}else{
							$scope.error = "Please select rating!"
						}
					}
				},
				disableParentScroll: true,
		        locals: {          
		          // modalData: videoData,
		          modalData: {},
		          modalOptions: {
		            headerText: 'Rate your class experience',
		            contentTitle: '',
		            modalType: 'deleteVideo',
		            confirmText: 'Delete',
		            confirmClass: 'red',
		            cancelClass: '',
		            cancelText: 'Cancel',
		            // processConfirm: $scope.deleteVideo
		          }
		        }
			});
      }
    };
  });