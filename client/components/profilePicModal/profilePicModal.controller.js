'use strict';

angular.module('takhshilaApp')
  .controller('ProfilePicModalCtrl', function ($mdDialog, $scope, $rootScope, $state, $timeout, Cropper, Auth, userFactory) {
  	var file, data;
  	$scope.uploading = false;
  	$scope.$watch(function(){
  		return Cropper.currentFile;
  	}, function(data){
  		if(data !== undefined && data !== null){
		    Cropper.encode((file = data))
		    .then(function(dataUrl) {
		      $scope.dataUrl = dataUrl;
		      $timeout(showCropper);  // wait for $digest to set image's src
		    });
  		}
  	});

    $scope.closeDialog = function() {
      $mdDialog.hide();
      angular.element('#uploadProfilePicForm')[0].reset();
      Cropper.currentFile = null;
    };

	  /**
	   * Method is called every time file input's value changes.
	   * Because of Angular has not ng-change for file inputs a hack is needed -
	   * call `angular.element(this).scope().onFile(this.files[0])`
	   * when input's event is fired.
	   */
	  $scope.onFile = function(blob) {
	    Cropper.encode((file = blob)).then(function(dataUrl) {
	      $scope.dataUrl = dataUrl;
	      $timeout(showCropper);  // wait for $digest to set image's src
	    });
	  };

	  /**
	   * Croppers container object should be created in controller's scope
	   * for updates by directive via prototypal inheritance.
	   * Pass a full proxy name to the `ng-cropper-proxy` directive attribute to
	   * enable proxing.
	   */
	  $scope.cropper = {};
	  $scope.cropperProxy = 'cropper.first';

	  /**
	   * When there is a cropped image to show encode it to base64 string and
	   * use as a source for an image element.
	   */
	  $scope.preview = function() {
	    if (!file || !data) return;
	    Cropper.crop(file, data).then(Cropper.encode).then(function(dataUrl) {
	      ($scope.preview || ($scope.preview = {})).dataUrl = dataUrl;
	    });
	  };

	  /**
	   * Use cropper function proxy to call methods of the plugin.
	   * See https://github.com/fengyuanchen/cropper#methods
	   */
	  $scope.clear = function(degrees) {
	    if (!$scope.cropper.first) return;
	    $scope.cropper.first('clear');
	  };

	  $scope.scale = function(width) {
	  	$scope.uploading = true;
	    Cropper.crop(file, data)
	      .then(function(blob) {
	        return Cropper.scale(blob, {width: width});
	      })
	      .then(Cropper.encode).then(function(dataUrl) {
		    ($scope.preview || ($scope.preview = {})).dataUrl = dataUrl;
	        userFactory.updateProfilePhoto({profilePhoto: dataUrl})
	        .success(function(response){
	        	$scope.uploading = false;
		        $rootScope.currentUser.profilePhoto.dataURI = dataUrl;
		        $scope.closeDialog();
	        })
	        .catch(function(err){
	        	console.log(err);
	        })
	      });
	  }

	  /**
	   * Object is used to pass options to initalize a cropper.
	   * More on options - https://github.com/fengyuanchen/cropper#options
	   */
	  $scope.options = {
	    maximize: false,
	    aspectRatio: 1 / 1,
	    viewMode: 2,
      	responsive: false,
	    crop: function(dataNew) {
	      data = dataNew;
	    }
	  };

	  /**
	   * Showing (initializing) and hiding (destroying) of a cropper are started by
	   * events. The scope of the `ng-cropper` directive is derived from the scope of
	   * the controller. When initializing the `ng-cropper` directive adds two handlers
	   * listening to events passed by `ng-cropper-show` & `ng-cropper-hide` attributes.
	   * To show or hide a cropper `$broadcast` a proper event.
	   */
	  $scope.showEvent = 'show';
	  $scope.hideEvent = 'hide';

	  function showCropper() { $scope.$broadcast($scope.showEvent); }
	  function hideCropper() { $scope.$broadcast($scope.hideEvent); }
  });
