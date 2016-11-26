'use strict';

angular.module('takhshilaApp')
  .controller('ProfileCtrl', function ($rootScope, $scope, $timeout, Cropper, Upload, Auth) {
    if(Cropper.currentFile === undefined){
      Cropper.currentFile = null;
    }
  	if(Upload.currentVideo === undefined){
  		Upload.currentVideo = null;
  	}
    
    $scope.uploadProfilePic = function(){
      angular.element('#uploadProfilePic').trigger('click');
    }  	
  	$scope.uploadVideo = function(){
  		angular.element('#uploadVideo').trigger('click');
  	}

    $scope.onFile = function(blob) {
      Cropper.currentFile = blob;
      $rootScope.showProfilePicModal();
    };
  	$scope.onVideoSelect = function(videoFile) {
      Upload.currentVideo = videoFile;
  		$rootScope.showVideoUploadModal();
  	};
  });
