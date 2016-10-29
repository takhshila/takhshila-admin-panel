'use strict';

angular.module('takhshilaApp')
  .controller('ProfileCtrl', function ($rootScope, $scope, $timeout, Cropper, Auth) {
  	if(Cropper.currentFile === undefined){
  		Cropper.currentFile = null;
  	}
  	
  	$scope.uploadProfilePic = function(){
  		angular.element('#uploadProfilePic').trigger('click');
  	}

	$scope.onFile = function(blob) {
		Cropper.currentFile = blob;
		$rootScope.showProfilePicModal();
	};
  });
