'use strict';

angular.module('takhshilaApp')
  .controller('UserCtrl', function ($rootScope, $scope, $stateParams, $timeout, $compile, uiCalendarConfig, userFactory) {
    $rootScope.isLoading = true;

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

    $scope.events = [];

    $scope.eventSources = [$scope.events];

    userFactory.getUserDetails($stateParams.ID)
    .success(function(response){
      $rootScope.isLoading = false;
      $scope.user = response;
      console.log($scope.user);
      availability = response.availability;
      $timeout(function(){
        $scope.renderView();
        $scope.uiConfig = {
          calendar:{
            height: 450,
            editable: false,
            header:{
              left: '',
              center: 'title',
              right: 'today prev,next'
              // right: ''
            },
            defaultView: 'agendaWeek',
            eventClick: $scope.alertEventOnClick,
            eventRender: $scope.eventRender,
            viewRender: $scope.renderView
          }
        };
      }, 0)
    })
    .error(function(err){
      $rootScope.isLoading = false;
      console.log(err);
    });

    $scope.eventRender = function( event, element, view ) {
        // element.attr({'tooltip': event.title, 'tooltip-append-to-body': true});
        element.attr({'uib-popover': '"I have a title!"', 'popover-title': '"The title."', 'popover-trigger': "'mouseenter'"});
        // element.append('<md-tooltip md-autohide="false">Play Music</md-tooltip>');
        $compile(element)($scope);
    };

    $scope.alertEventOnClick = function(event, element, view){
      if(angular.element(element.currentTarget).hasClass("active")){
        angular.element(element.currentTarget).removeClass("active");
      }else {
        angular.element(element.currentTarget).addClass("active");
      }
    }

    $scope.renderView = function(view){
      for(var dayIndex = 0; dayIndex < weekDays.length; dayIndex++){
        availability[weekDays[dayIndex]].sort(function(a, b){
          return a.startHour - b.startHour;
        });
      }
      $scope.disconnectTime();
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
            title: 'Book Class Now',
            start: new Date(y, m, d+dayIndex, availability[weekDays[dayIndex]][i].startHour, availability[weekDays[dayIndex]][i].startMinute),
            end: new Date(y, m, d+dayIndex, availability[weekDays[dayIndex]][i].endHour, availability[weekDays[dayIndex]][i].endMinute),
            allDay: false,
            dayIndex: dayIndex,
            availabilityIndex: i,
            color: '#CFF1C2'
          });
        }
      }
      if(uiCalendarConfig.calendars["availabilityCalendar"]){
        uiCalendarConfig.calendars["availabilityCalendar"].fullCalendar('refetchEvents');
      }
    }

    $scope.checkConnectedTime = function(){
      // This function will be used to check if two times are alternative meaning has matching end and start time
      for(var dayIndex = 0; dayIndex < weekDays.length; dayIndex++){
        for(var i = availability[weekDays[dayIndex]].length - 1; i >= 0 ; i--){
          if(availability[weekDays[dayIndex]][i-1] != undefined){
            if(availability[weekDays[dayIndex]][i-1].endHour == availability[weekDays[dayIndex]][i].startHour){
              availability[weekDays[dayIndex]][i-1].endHour = availability[weekDays[dayIndex]][i].endHour;
              availability[weekDays[dayIndex]][i-1].endMinute = availability[weekDays[dayIndex]][i].endMinute;
              availability[weekDays[dayIndex]].splice(i, 1);
            }
          }
        }
      }
    }

    $scope.disconnectTime = function(){
      var _availability = {};
      var _view = uiCalendarConfig.calendars["availabilityCalendar"].fullCalendar('getView');
      var _date = new Date(_view.start._d);
      var _d = _date.getDate();
      var _m = _date.getMonth();
      var _y = _date.getFullYear();
      for(var dayIndex = 0; dayIndex < weekDays.length; dayIndex++){
        _availability[weekDays[dayIndex]] = [];
        for(var i = 0; i < availability[weekDays[dayIndex]].length ; i++){
          var _startTime = new Date(_y, _m, _d+dayIndex, availability[weekDays[dayIndex]][i].startHour, availability[weekDays[dayIndex]][i].startMinute).getTime();
          var _endTime = new Date(_y, _m, _d+dayIndex, availability[weekDays[dayIndex]][i].endHour, availability[weekDays[dayIndex]][i].endMinute).getTime();
          var _difference = Math.round((_endTime - _startTime) / 60000);
          if(_difference > 30){
            do {
              _availability[weekDays[dayIndex]].push({
                startHour: new Date(_startTime).getHours(),
                startMinute: new Date(_startTime).getMinutes(),
                endHour: new Date(_startTime + (30*60000)).getHours(),
                endMinute: new Date(_startTime + (30*60000)).getMinutes()
              });
              _startTime = _startTime + (30*60000);
              _difference = Math.round((_endTime - _startTime) / 60000);
            } while (_difference > 30);
          }else{
            _availability[weekDays[dayIndex]].push(availability[weekDays[dayIndex]][i]);
          }
        }
      }
      for(var day in _availability){
        availability[day] = _availability[day];
      }
    }

  });
