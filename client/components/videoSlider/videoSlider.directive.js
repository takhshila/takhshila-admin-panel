'use strict';

angular.module('takhshilaApp')
  .directive('videoSlider', function () {
    return {
      templateUrl: 'components/videoSlider/videoSlider.html',
      restrict: 'E',
      replace: true,
      scope: {
      	slides: '=',
            width: '=',
            canEdit: '=',
            canDelete: '=',
            clickHandle: '&clickHandle',
            editHandle: '&editHandle',
      	deleteHandle: '&deleteHandle',
      },
      link: function (scope, element, attrs) {
      	var calculateEndSlide = function(startItem){
      		return Math.min(currentSlide + slidesPerPage, totalSlides);
      	}
            if(!scope.width){
                  scope.slideWidth = 220;
            }else{
                  scope.slideWidth = scope.width;
            }
      	var videoSliderContaierWidth = element.innerWidth() - 45;
      	var totalSlides = scope.slides.length;
      	var slidesPerPage = parseInt(videoSliderContaierWidth / scope.slideWidth);

      	var startSlide = 0;
      	var currentSlide = 0;
      	var endSlide = calculateEndSlide(currentSlide);

      	$('#video-slides-container').css('left', '0px');

            scope.onVideoClick = function(evt, index){
                  evt.preventDefault();
                  evt.stopPropagation();
                  scope.clickHandle({index: index});
            }
            scope.onVideoEdit = function(evt, index){
                  evt.preventDefault();
                  evt.stopPropagation();
                  scope.editHandle({index: index});
            }
      	scope.onVideoDelete = function(evt, index){
                  evt.preventDefault();
                  evt.stopPropagation();
      		scope.deleteHandle({index: index});
      	}
      	scope.next = function(evt){
                  evt.preventDefault();
                  evt.stopPropagation();
      		if(totalSlides > endSlide){
      			currentSlide++;
      			endSlide = calculateEndSlide(currentSlide);
      			var left = -(currentSlide * (scope.slideWidth+5)) + 'px';
      			$('#video-slides-container').css('left', left);
      		}
      	}
      	scope.prev = function(evt){
                  evt.preventDefault();
                  evt.stopPropagation();
      		if(currentSlide !== 0){
      			currentSlide--;
      			endSlide = calculateEndSlide(currentSlide);
      			var left = -(currentSlide * (scope.slideWidth +5)) + 'px';
      			$('#video-slides-container').css('left', left);
      		}
      	}

      }
    };
  });