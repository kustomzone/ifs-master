app.directive('itemView', [
	function() {

		var controller = function($scope,$element) {

			// init item view
			$scope.initItemView = function(){
				$scope.item_type = window.location.href.split('&')[0].split('type=')[1].split('-')[0];
				$scope.item_id_name = $scope.item_type + '_id';
			};

		};

		return {
			restrict: 'AE',
			replace:false,
			controller: controller,
		}

	}
]);