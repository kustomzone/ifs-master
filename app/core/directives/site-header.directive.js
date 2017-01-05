app.directive('siteHeader', ['$mdDialog', '$mdMedia',
	function($mdDialog,$mdMedia) {		

	
		// dialog controller
		var DialogController= function($scope, $mdDialog,items) {
			// items
			$scope.items = items;			
			$scope.hide = function() {
				$mdDialog.hide();
			};
			$scope.cancel = function() {
				$mdDialog.cancel();
			};
			$scope.answer = function(answer) {
				$mdDialog.hide(answer);
			};
		};

		// header directive controller
		var controller = function($scope,$element) {

			$scope.toggleMenu = function(ev)
			{
				ev.preventDefault();
			    $("#wrapper").toggleClass("toggled");			   
			    if($("#navbar-fixed-top").position().left==0){
			    		$("#navbar-fixed-top").css({left:250});
			    	}
			    else{
			    	$("#navbar-fixed-top").css({left:0});
			    };			    
			}

			
		    // show info modal
			$scope.showInfoModal = function(ev) {
				// dialog vars
				$scope.status = '';
				$scope.customFullscreen = $mdMedia('xs') || $mdMedia('sm');
			    var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
			    // dialog template
			    var dialogTemplate = 
			    	'<md-dialog class="fullscreen-dialog" aria-label="Mango (Fruit)">' +
					    '<md-toolbar>' +
					    	'<div class="md-toolbar-tools">' +
					    	  '<md-button class="md-icon-button" ng-click="hide()">'+
					            '<span class="glyphicon glyphicon-remove"></span>'+
					          '</md-button>'+
						        '<h2>How to upload?</h2>' +
						        '<span flex></span>' +
						        '<md-button class="md-icon-button" ng-click="hide()">' +
						            '<md-icon md-svg-src="img/icons/ic_close_24px.svg" aria-label="Close dialog"></md-icon>' +
						        '</md-button>' +
					    	'</div>' +
					    '</md-toolbar>' +
					    '<md-dialog-content >' +
							'<ol style="padding: 8px 24px;"><li>Go to Filehub site: <a href="/1FHtDQ8i5NFFeuo7Fux6TeLpwmmeUGvdc8">1FHtDQ8i5NFFeuo7Fux6TeLpwmmeUGvdc8</a></li>' +
							'<li>Clone that site</li>' +
							'<li>Add stuff</li>' +
							'<li>Register site</li></ol>'+
					    '</md-dialog-content>' +
					'</md-dialog>';
				// show dialog
			    $mdDialog.show({
					controller: DialogController,
					template: dialogTemplate,
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose:true,
					fullscreen: true,
					locals:{
						items:{}
					}		

			    });
			};
			
			// open site config dialog
			$scope.openSiteConfigDialog = function(ev){
				console.log($scope.config);
				// dialog vars
				$scope.status = '';
				$scope.customFullscreen = $mdMedia('xs') || $mdMedia('sm');
			    var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
			    // dialog template
			    var dialogTemplate = 
			    	'<md-dialog aria-label="Configuration">' +
					    '<md-toolbar>' +
					    	'<div class="md-toolbar-tools">' +
						        '<h2>Configuration</h2>' +
						        '<span flex></span>' +
						        '<md-button class="md-icon-button" ng-click="cancel()">' +
						            '<md-icon md-svg-src="img/icons/ic_close_24px.svg" aria-label="Close dialog"></md-icon>' +
						        '</md-button>' +
					    	'</div>' +
					    '</md-toolbar>' +
					    '<md-dialog-content site-config ng-init="initSiteConfig(items.config)" layout-padding style="width:400px" layout="column">' +
			    			'<label style="margin: 0;padding: 0 8px;">media type</label>' +
							'<md-input-container style="margin:0;" flex>' +
								'<md-checkbox ng-repeat="mediaType in mediaTypes" ng-model="config[mediaType]" aria-label="{{mediaType}}" ng-click="updateMediaTypes(config,mediaType)">{{mediaType}}</md-checkbox>' +
			    			'</md-input-container>' +
				            '<md-button flex="100" class="md-primary md-raised edgePadding pull-right" ng-click="updateConfig(config)">' +
				            	'<label>Update Configuration</label>' +
				            '</md-button>' +
					    '</md-dialog-content>' +				    
					'</md-dialog>';
				// show dialog
			    $mdDialog.show({
					controller: DialogController,
					template: dialogTemplate,
					parent: angular.element(document.body),
					target:ev,
					clickOutsideToClose:true,
					fullscreen: useFullScreen,
					locals:{
						items:{
							config:$scope.config
						}
					}					
			    });
			}

		};




		var template ='<nav class="navbar navbar-default navbar-fixed-top" id="navbar-fixed-top">'+
  						'<div class="container-fluid" style="background-color:#041b2c">'+
  						'<div class="navbar-header"><span class="glyphicon glyphicon-menu-hamburger navbar-brand" id="menu-toggle" ng-click="toggleMenu($event)"></span> <a class="navbar-brand" href="/{{site_address}}">IFS - Intergalactic File Server</a></div>'+
  						'<div class="container"><form class="navbar-form navbar-left" >'+
        					'<div class="form-group">'+
          					'<input type="text" class="form-control" placeholder="Search" ng-model="ppFilter.title">'+
          					'<input type="text" class="form-control" ng-model="ppFilter.channel.address"  id="filterChannel" style="display:none">'+
          					'<input type="text" class="form-control" ng-model="ppFilter.media_type"  id="filterMediaType" style="display:none">'+
        					'</div>'+        					
      					'</form>'+
  						'<ul class="nav navbar-nav navbar-right"> <li><a ng-click="showInfoModal(ev)" >FAQ</a></li>'+  
						'<li><a href="register.html">REGISTER</button></a></li>'+  												
						'</ul>'+    					
  						'</div></div>'+
					'</nav>';
		
		return {
			restrict: 'AE',
			replace:false,
			controller: controller,
			template:template
		}

	}
]);