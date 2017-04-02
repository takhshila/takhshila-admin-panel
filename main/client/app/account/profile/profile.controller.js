'use strict';

angular.module('takhshilaApp')
  .controller('ProfileCtrl', function ($rootScope, $scope, $timeout, Cropper, uiCalendarConfig, Upload, Auth, userFactory) {
    $rootScope.isLoading = false;
    if(Cropper.currentFile === undefined){
      Cropper.currentFile = null;
    }
  	if(Upload.currentVideo === undefined){
  		Upload.currentVideo = null;
  	}

    $scope.edit = {
      basicInfo: {
        editing: false,
        progress: false,
        data: null,
      },
      specialization: {
        editing: false,
        progress: false,
        data: null,
      }
    }

    var weekDays = ['sunday', 'monday', 'tuesday', 'wednessday', 'thursday', 'friday', 'saturday'];

    var availability = {
      sunday: [],
      monday: [],
      tuesday: [],
      wednessday: [],
      thursday: [],
      friday: [],
      saturday: []
    }


    $scope.getEvents = function(start, end, callback){
      userFactory.getCurrentUserAvailability()
      .success(function(response){
        $scope.events.length = 0;
        for(var day in response){
          for(var i = 0; i < response[day].length; i++){
            var _weekDayCount = weekDays.indexOf(day);
            var _startTime = moment(response[day][i].start, 'HH:mm').format('HH:mm');
            var _endTime = moment(response[day][i].end, 'HH:mm').format('HH:mm');

            var _startDate = moment(start, 'ddd MMM DD YYYY').add(_weekDayCount, 'days').format('MMM DD, YYYY');
            if(_endTime == "00:00"){
              var _endDate = moment(start, 'ddd MMM DD YYYY').add(_weekDayCount+1, 'days').format('MMM DD, YYYY');
            }else{
              var _endDate = moment(start, 'ddd MMM DD YYYY').add(_weekDayCount, 'days').format('MMM DD, YYYY');
            }
            $scope.events.push({
              start: moment(_startDate + _startTime, 'MMM DD, YYYY HH:mm'),
              end: moment(_endDate + _endTime, 'MMM DD, YYYY HH:mm')
            });
          }
        }
        checkConnectedTime();
        console.log($scope.events);
        uiCalendarConfig.calendars["availabilityCalendar"].fullCalendar('rerenderEvents');
      })
      .error(function(err){
        console.log(err);
      });
    }

    $scope.events = [];
    $scope.eventSources = [$scope.events, $scope.getEvents];

    var checkConnectedTime = function(){
      $scope.events.sort(function(a, b){
        return a.start.valueOf() - b.start.valueOf();
      });
      for(var i = $scope.events.length - 1; i >= 0; i--){
        if($scope.events[i-1] !== undefined){
          if($scope.events[i].start.valueOf() == $scope.events[i-1].end.valueOf()){
            $scope.events[i-1].end = $scope.events[i].end;
            var _removedEvent = $scope.events.splice(i, 1);
          }
        }
      }
    }

    var eventResize = function(event){
      var _index = $scope.events.map(function(obj) { return obj._id; }).indexOf(event._id);
      $scope.events[_index].start = event.start;
      $scope.events[_index].end = event.end;
      checkConnectedTime();
    }

    var alertEventOnClick = function(event){
      var _index = $scope.events.map(function(obj) { return obj._id; }).indexOf(event._id);
      $scope.events.splice(_index, 1);
    }

    var eventDrop = function(event, dayDelta, minuteDelta){
      var _index = $scope.events.map(function(obj) { return obj._id; }).indexOf(event._id);
      if(_index > -1){
        $scope.events[_index].start = moment(event.start, 'MMM DD, YYYY HH:mm');
        $scope.events[_index].end = moment(event.end, 'MMM DD, YYYY HH:mm');
        $timeout(function(){
          checkConnectedTime();
        },200);
      }
    }

    var dayClicked = function(datetime){
      var _start = moment(datetime, 'MMM DD, YYYY HH:mm');
      var _end = moment(datetime.add(30, 'minutes'), 'MMM DD, YYYY HH:mm');
      $scope.events.push({
        description: "",
        className: "",
        icon: "",
        allDay: false,
        start: _start,
        end: _end
      });
      checkConnectedTime();
      $('#availabilityCalendar').fullCalendar('rerenderEvents');
    }

    $scope.uiConfig = {
      calendar:{
        height: 750,
        editable: true,
        header:{
          left: '',
          center: 'title',
          right: 'today prev,next'
          // right: ''
        },
        defaultView: 'agendaWeek',
        eventOverlap: false,
        eventStartEditable: true,
        eventClick: alertEventOnClick,
        dayClick: dayClicked,
        eventResize: eventResize,
        eventDrop: eventDrop
      }
    }

    $scope.updateAvailability = function(){
      for(var i = 0; i < $scope.events.length; i++){
        console.log($scope.events[i].start);
        $scope.events[i].start = moment($scope.events[i].start, 'MMM DD, YYYY HH:mm').format();
        $scope.events[i].end = moment($scope.events[i].end, 'MMM DD, YYYY HH:mm').format();
      }
      console.log($scope.events);
      userFactory.updateAvailability({availability: $scope.events})
      .success(function(response){
        // $scope.getEvents();
        console.log(response);
      })
      .error(function(err){
        console.log(err);
      });
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
    }
  	$scope.onVideoSelect = function(videoFile) {
      Upload.currentVideo = videoFile;
  		$rootScope.showVideoUploadModal();
  	}

    $scope.editBasicInfo = function(evt){
      angular.element(evt.currentTarget).addClass('ng-hide');
      $scope.edit.basicInfo.editing = true;
      $scope.edit.basicInfo.data = $scope.currentUser.basicInfo;
    }
    $scope.saveBasicInfo = function(){
      if($scope.edit.basicInfo.data !== $scope.currentUser.basicInfo && $scope.edit.basicInfo.data !== null){
        $scope.edit.basicInfo.progress = true;
        userFactory.updateBasicInfo({basicInfo: $scope.edit.basicInfo.data})
        .success(function(response){
          $scope.edit.basicInfo.progress = false;
          $scope.currentUser.basicInfo = response.basicInfo;
          console.log(response);
          $scope.edit.basicInfo.editing = false;
        })
        .error(function(err){
          $scope.edit.basicInfo.progress = false;
          console.log(err);
        });
      }
    }
    $scope.cancelEditBasicInfo = function(){
      $scope.edit.basicInfo.editing = false;
      $scope.edit.basicInfo.data = null;
    }

    $scope.editSpecialization = function(evt){
      angular.element(evt.currentTarget).addClass('ng-hide');
      $scope.edit.specialization.editing = true;
      console.log($scope.edit);
      $scope.edit.specialization.data = [{
        topic: '',
        topicName: '',
        level: '',
        status: {
          searchResultsOpen: true,
          levelOpen: false
        }
      }];
    }
    $scope.saveSpecialization = function(){
      if($scope.edit.basicInfo.data !== $scope.currentUser.basicInfo && $scope.edit.basicInfo.data !== null){
        $scope.edit.basicInfo.progress = true;
        userFactory.updateBasicInfo({basicInfo: $scope.edit.basicInfo.data})
        .success(function(response){
          $scope.edit.basicInfo.progress = false;
          $scope.currentUser.basicInfo = response.basicInfo;
          console.log(response);
          $scope.edit.basicInfo.editing = false;
        })
        .error(function(err){
          $scope.edit.basicInfo.progress = false;
          console.log(err);
        });
      }
    }
    $scope.cancelEditSpecialization = function(){
      $scope.edit.specialization.editing = false;
      $scope.edit.specialization.data = null;
    }
    $scope.addSpecialization = function(){
      $scope.edit.specialization.data.push({
        topic: '',
        topicName: '',
        level: ''
      });
    }
    $scope.removeSpecialization = function(){
      $scope.edit.specialization.data.pop();
    }

  });
