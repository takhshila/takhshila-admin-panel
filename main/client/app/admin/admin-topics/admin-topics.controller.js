'use strict';

angular.module('takhshilaApp')
  .controller('AdminTopicsCtrl', function ($rootScope, $scope, $http) {
  	$scope.topics = [];
  	$scope.hasMoreData = false;
  	$scope.addTopicFormData = {
  		topicName: ''
  	}

  	var currentPage = 0;
  	var dataPerPage = 20;
  	
  	$scope.getTopics = function(){
		$http.get('/api/v1/topics/?page=' + currentPage + '&perPage=' + dataPerPage)
		.then(function(response){
			$rootScope.isLoading = false;
			$scope.topics = response.data;
		});
  	}

    $scope.addFieldValue = function(item){
      $scope.addTopicFormData.topicName = '';
    }

    $scope.searchTopics = function(index, searcTerm) {
      return $http.get('/api/v1/topics/search/'+searcTerm)
        .then(function(response){
          return response.data.map(function(item){
            return item;
          });
      });
    };

    $scope.addTopic = function(addTopicForm) {
      $scope.addTopicError = false;

      if(addTopicForm.$invalid){
        var el = angular.element("[name='" + addTopicForm.$name + "']").find('.ng-invalid:visible:first');
        var elName = el[0].name;
        addTopicForm[elName].$dirty = true;
        addTopicForm[elName].$pristine = false;
        angular.element("[name='" + addTopicForm.$name + "']").find('.ng-invalid:visible:first').focus();
        return false;
      }else{
        $scope.addingTopic = true;
        $http.post('/api/v1/topics/', {
        	"topicName": $scope.addTopicFormData.topicName
        })
        .then(function(data){
			$scope.addingTopic = false;
			if(data.status === 201){
				$scope.addTopicFormData.topicName = null;
			}else{
				$scope.addTopicError = true;
				$scope.addTopicErrorMessage = data.error;
			}
        }, function(err){
        	console.log(err);
			$scope.addingTopic = false;
			for(var error in err.errors){
				addTopicForm[error].$valid = false;
				addTopicForm[error].$invalid = true;
				addTopicForm[error].$error.serverError = true;
				addTopicForm[error].$error.errorMessage = err.data.errors[error].message;
				angular.element("[name='" + addTopicForm.$name + "'] [name='" + error + "']").focus();
			}
        })
      }
    };

    $rootScope.$watch('loggedIn', function(status){
      if(status === true){
        $scope.getTopics();
      }
    });
  });
