'use strict';

angular.module('takhshilaApp')
.directive('lxTextField', ['$timeout', function($timeout){
	return {
		restrict: 'E',
		scope: {
			label: '@',
			disabled: '&',
			error: '&',
			valid: '&',
			fixedLabel: '&',
			icon: '@',
			theme: '@'
		},
		templateUrl: 'components/lxTextField/lxTextField.html',
		replace: true,
		transclude: true,
		link: function(scope, element, attrs, ctrl, transclude)
		{
			if (angular.isUndefined(scope.theme))
			{
				scope.theme = 'light';
			}

			var modelController,
			$field;

			scope.data = {
				focused: false,
				model: undefined
			};

			function focusUpdate()
			{
				scope.data.focused = true;
				if(!scope.$$phase && !scope.$root.$$phase){
					scope.$apply();
				}
			}

			function blurUpdate()
			{
				scope.data.focused = false;
				if(!scope.$$phase && !scope.$root.$$phase){
				  scope.$apply();
				}
			}

			function modelUpdate()
			{
				scope.data.model = modelController.$modelValue || $field.val();
			}

			function valueUpdate()
			{
				modelUpdate();
				if(!scope.$$phase && !scope.$root.$$phase){
				  scope.$apply();
				}
			}

			function updateTextareaHeight()
			{
				$timeout(function()
				{
					var tmpTextArea = angular.element('<textarea class="text-field__input" style="width: ' + $field.width() + 'px;">' + $field.val() + '</textarea>');
					tmpTextArea.appendTo('body');

					$field.css({ height: tmpTextArea[0].scrollHeight + 'px' });

					tmpTextArea.remove();
				});
			}

			transclude(function()
			{
				$field = element.find('textarea');

				if ($field[0])
				{
					updateTextareaHeight();

					$field.on('cut paste drop keydown', function()
					{
						updateTextareaHeight();
					});
				}
				else
				{
					$field = element.find('input');
				}

				$field.addClass('text-field__input');
				$field.on('focus', focusUpdate);
				$field.on('blur', blurUpdate);
				$field.on('propertychange change click keyup input paste', valueUpdate);

				modelController = $field.data('$ngModelController');

				scope.$watch(function()
				{
					return modelController.$modelValue;
				}, modelUpdate);
			});
		}
	};
}]);
