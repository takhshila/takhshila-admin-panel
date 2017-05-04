'use strict';

angular.module('takhshilaApp')
  .directive('videoSlider', function () {
    return {
      templateUrl: 'components/videoSlider/videoSlider.html',
      restrict: 'E',
      replace: true,
      scope: {
      	slides: '='
      },
      link: function (scope, element, attrs) {
      	var calculateEndSlide = function(startItem){
      		return Math.min(currentSlide + slidesPerPage, totalSlides);
      	}
      	var slideWidth = 220;
      	var videoSliderContaierWidth = element.innerWidth() - 45;
      	var totalSlides = scope.slides.length;
      	var slidesPerPage = parseInt(videoSliderContaierWidth / slideWidth);

      	var startSlide = 0;
      	var currentSlide = 0;
      	var endSlide = calculateEndSlide(currentSlide);

      	$('#video-slides-container').css('left', '0px');

      	scope.next = function(){
      		if(totalSlides > endSlide){
      			currentSlide++;
      			endSlide = calculateEndSlide(currentSlide);
      			var left = -(currentSlide * slideWidth) + 'px';
      			console.log(left);
      			$('#video-slides-container').css('left', left);
      		}
      	}
      	scope.prev = function(){
      		if(currentSlide !== 0){
      			currentSlide--;
      			endSlide = calculateEndSlide(currentSlide);
      			var left = -(currentSlide * slideWidth) + 'px';
      			$('#video-slides-container').css('left', left);
      		}
      	}

      }
    };
  });