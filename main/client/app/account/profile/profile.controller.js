'use strict';

angular.module('takhshilaApp')
  .controller('ProfileCtrl', function ($rootScope, $scope, $timeout, Cropper, uiCalendarConfig, Upload, Auth) {
    if(Cropper.currentFile === undefined){
      Cropper.currentFile = null;
    }
  	if(Upload.currentVideo === undefined){
  		Upload.currentVideo = null;
  	}

    var weekDays = ['sunday', 'monday', 'tuesday', 'wednessday', 'thursday', 'friday', 'saturday'];

    var availability = {
      repeat: true,
      sunday: [],
      monday: [],
      tuesday: [],
      wednessday: [],
      thursday: [],
      friday: [],
      saturday: []
    }

    $scope.events = [];

    $scope.eventSources = [$scope.events];

    $scope.renderView = function(view){
      $scope.events.length = 0;
      if(view === undefined){
        view = uiCalendarConfig.calendars["availabilityCalendar"].fullCalendar('getView');
      }
      var date = new Date(view.start._d);
      var d = date.getDate();
      var m = date.getMonth();
      var y = date.getFullYear();
      for(var dayIndex = 0; dayIndex < weekDays.length; dayIndex++){
        for(var i = 0; i < availability[weekDays[dayIndex]].length; i++){
          $scope.events.push({
            title: 'Available',
            start: new Date(y, m, d+dayIndex, availability[weekDays[dayIndex]][i].startHour, availability[weekDays[dayIndex]][i].startMinute),
            end: new Date(y, m, d+dayIndex, availability[weekDays[dayIndex]][i].endHour, availability[weekDays[dayIndex]][i].endMinute),
            allDay: false,
            dayIndex: dayIndex,
            availabilityIndex: i,
            color: '#5cb85c'
          });
        }
      }
      if(uiCalendarConfig.calendars["availabilityCalendar"]){
        uiCalendarConfig.calendars["availabilityCalendar"].fullCalendar('refetchEvents');
      }
    }

    $scope.eventResize = function(event){
      var dayIndex = event.dayIndex;
      var i = event.availabilityIndex;
      availability[weekDays[dayIndex]][i].endHour = event.end.get('hour');
      availability[weekDays[dayIndex]][i].endMinute = event.end.get('minute');
    }

    $scope.eventDrop = function(event){
      var startDay = new Date(event.start._i).getDay();
      var endDay = new Date(event.start._d).getDay();

      if(startDay == endDay){
        var i = event.availabilityIndex;
        availability[weekDays[startDay]][i].startHour = event.start.get('hour');
        availability[weekDays[startDay]][i].startMinute = event.start.get('minute');
        availability[weekDays[startDay]][i].endHour = event.end.get('hour');
        availability[weekDays[startDay]][i].endMinute = event.end.get('minute');
      }else{
        var dayIndex = event.dayIndex;
        var i = event.availabilityIndex;

        var startHour = event.start.get('hour');
        var startMinute = event.start.get('minute');
        var endHour = event.end.get('hour');
        var endMinute = event.end.get('minute');

        var removedEvent = availability[weekDays[dayIndex]].splice(i, 1);

        availability[weekDays[endDay]].push({
          startHour: startHour,
          startMinute: startMinute,
          endHour: endHour,
          endMinute: endMinute
        });
      }
      $scope.renderView();
    }

    $scope.dayClicked = function(datetime){
      var day = datetime.day();
      var startHour = datetime.get('hour');
      var startMinute = datetime.get('minute');
      datetime.add(30, 'minutes');
      var endHour = datetime.get('hour');
      var endMinute = datetime.get('minute');

      availability[weekDays[day]].push({
        startHour: startHour,
        startMinute: startMinute,
        endHour: endHour,
        endMinute: endMinute
      });
      $scope.renderView();
    }

    $scope.checkConnectedTime = function(day = null){
      // This function will be used to check if two times are alternative meaning has matching end and start time
    }

    $scope.uiConfig = {
      calendar:{
        height: 450,
        editable: true,
        header:{
          left: '',
          center: 'title',
          right: 'today prev,next'
        },
        defaultView: 'agendaWeek',
        eventOverlap: false,
        // eventStartEditable: false,
        eventClick: $scope.alertEventOnClick,
        dayClick: $scope.dayClicked,
        eventResize: $scope.eventResize,
        eventDrop: $scope.eventDrop,
        viewRender: $scope.renderView
      }
    };

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
