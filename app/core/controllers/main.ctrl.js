app.controller('MainCtrl', ['$scope','$location','$mdDialog', '$mdMedia',
	function($scope,$location,$mdDialog,$mdMedia) {

		/* CONFIG */
			// move config merger_name to content.json			
		/* /CONFIG */

		/* INIT SITE */

			// init
			$scope.init = function(){
				// loading
				$scope.showLoadingMessage('Loading');
				// update site
				//Page.cmd('siteUpdate',{"address":$scope.site_address})

				// get site info
				Page.cmd("siteInfo", {}, function(site_info) {					
					
					$scope.site_address = site_info.address;
					$scope.channel_master_address = site_info.address;	
					$scope.merger_name = site_info.content.merger_name;
					// apply site info to Page obj
					Page.site_info = site_info;
					// owner					
					$scope.owner = site_info.settings.own;

					// update site
					Page.cmd('siteUpdate',{"address":$scope.site_address})

					// apply auth address to scope
					if (Page.site_info.cert_user_id) { $scope.user = Page.site_info.cert_user_id; } 
					else { $scope.user = Page.site_info.auth_address; }
					// merger site permission
					$scope.getConfig();
		    	});
			};

			// get config json
			$scope.getConfig = function(){
				/*var inner_path = "data/config.json";			
				Page.cmd("fileGet", { "inner_path": inner_path, "required": false },function(data) {
					if (!data && $scope.owner){
						$scope.generateConfig();
					} else {*/
						$scope.config = {
							media_types:[
								'all',
								'games',
								'videos'
							]
						}
						$scope.getMergerPermission();
					/*}
				});*/
			};

			// generate config
			$scope.generateConfig = function(){
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
					    '<md-dialog-content site-config ng-init="initSiteConfig()" layout-padding style="width:400px" layout="column">' +
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
					clickOutsideToClose:true,
					fullscreen: useFullScreen
			    });
			};

			// get merger site permission
			$scope.getMergerPermission = function(){
				// if user allready has permission for merger type
		    	if (Page.site_info.settings.permissions.indexOf("Merger:"+$scope.merger_name) > -1){
		    		$scope.$apply(function(){
		    			// get merged sites
		    			$scope.getMergedSites();
		    		});
		    	} else {
		    		// if not, ask user for permission
					Page.cmd("wrapperPermissionAdd", "Merger:"+$scope.merger_name, function() {
						$scope.$apply(function(){
			    			// get merged sites
			    			$scope.getMergedSites();
						});
					});
		    	}
			};  

		    // get merged sites
		    $scope.getMergedSites = function(){		    	
		    	// loading
				$scope.showLoadingMessage('Listing merged sites');
				// merged sites array		    	
		    	$scope.sites = [];
				Page.cmd("mergerSiteList", {query_site_info: true}, function(sites) {					
					// for every site in sites obj
					for (var site in sites) {
					    if (!sites.hasOwnProperty(site)) continue;
					    var site = sites[site];
					    // push site to sites array
					    $scope.sites.push(site);
					}
					//console.log($scope.sites);
					$scope.$apply(function(){
						// get channels
						$scope.getChannels();
					});
				});
		    };		    

			// get channels
			$scope.getChannels = function(){				
				// loading
				$scope.showLoadingMessage('Loading Channels');				
				// get channels				
				var query = ["SELECT * FROM channel where hide = 0 ORDER BY date_added"];
				Page.cmd("dbQuery", query, function(channels) {	
								
					if (channels.length > 0){
						$scope.channels = channels;
						// render channels
						$scope.renderChannels();
					} else {
						$scope.$apply(function(){
							$scope.finishedLoading();
						});
					}
				});
			};

			// render channels
			$scope.renderChannels = function(){
				// items array, named ny media type var
				$scope[$scope.media_type] = [];
				// for each channel
				$scope.channels.forEach(function(channel,cIndex){

		 				// check if site exists
						var siteExists = false;
						// loop through sites array
						$scope.sites.forEach(function(site,sIndex){
							// if channel's id exists in merged sites array
							if (site.address === channel.channel_address){
								siteExists = true;
								channel = site;
							}
						});
						// if site exists get channel, if not add merged site
						if (siteExists === true){
							// get channel
							$scope.getChannel(channel,cIndex);
						} else {						
							console.log('site ' + channel.channel_address + ' doesnt exists! adding site...');
							// add merger site
							$scope.addSite(channel,cIndex);
						}


				});
			};

			
			// add merger site
			$scope.addSite = function(channel,cIndex){
				
				Page.cmd("mergerSiteAdd",{"addresses":channel.channel_address},function(data){
					// list merger sites
					Page.cmd("mergerSiteList", {query_site_info: true}, function(sites) {
						// for each site in merger site list
						for (var site in sites) {
						    var site = sites[site];
						    var siteFound = false;
							// if channel's id exists in merged sites array
						    if (site.address === channel.channel_address){
				
						    	siteFound = true;
						    	// info prompt
								Page.cmd("wrapperNotification", ["info", "Refresh this page to view new content", 10000]);
						    	// push site to sites array
								$scope.sites.push(site);
								// get channel
								$scope.getChannel(site,cIndex);
						    }
						}
						// if no matching site found in merger site list after adding
						if (siteFound === false){
						// finish loading		    	
						    $scope.finishLoadingChannels(cIndex);								
						}
					});
				});
			};

			// get channel
			$scope.getChannel = function(channel,cIndex){
				// get channel.json
				var inner_path = 'merged-'+$scope.merger_name+'/'+channel.address+'/data/channel.json';			
				Page.cmd("fileGet",{"inner_path":inner_path},function(data){
					// assign games
					data = JSON.parse(data);					
					// if channel has data
					if (data){
						// get channel items
						$scope.addChannelItems(data,channel,cIndex);
					} else {
						// finish loading
						$scope.finishLoadingChannels(cIndex);
					}
				});
			};

			// get channels items
			$scope.addChannelItems = function(data,channel,cIndex){				


				Page.cmd("optionalFileList", {
				        address: channel.address,
				        limit:2000
				      },function(site_files){				      						      						      	
				      		for (var media_type in data){
				      			if (Object.prototype.toString.call(data[media_type]) === '[object Array]'){
				      				if ($scope.config.media_types.indexOf(media_type) > -1){
				      					// loop through items in data
				      					data[media_type].forEach(function(item,itemIndex){

				      						// create item if in cache
				      						item.x_is_load = false;
				      						item.x_peer = 0;
				      						var path = item.path;
				      						for (var i = 0, len = site_files.length; i < len; i++) {
				      						  var inner_path = site_files[i].inner_path;
				      						  if(path==inner_path)
				      							{
				      								item.x_is_load=true;
				      								item.x_peer=site_files[i].peer;
				      								break;
				      							}
				      						}		

				      						// assign channel obj
				      						item.channel = channel;
				      						// genereate unique item id
				      						item.uid = item.channel.address + item.date_added;															
				      						// render item's img url
				      						if(item.imgPath)
				      						{
				      							item.img = '/'+$scope.site_address+'/merged-'+$scope.merger_name+'/'+item.channel.address+'/'+item.imgPath;
				      						}else
				      						{
				      							item.img = '/'+$scope.site_address+'/assets/img/logo.png';
				      						}

				      						// apply to scope items array						
				      						if (!$scope[media_type]) $scope[media_type] = [];
				      						$scope[media_type].push(item);
				      						// if last item in channels items array
				      						if ((itemIndex + 1) === data[media_type].length){
				      							// finish loading
				      							$scope.finishLoadingChannels(cIndex);
				      						}
				      						
				      					});
				      				}
				      			}
				      		}

				      });	

				
			};

			// finish loading channels
			$scope.finishLoadingChannels = function(cIndex){
				// if channel index + 1 equals number of channels
				if ((cIndex + 1) === $scope.channels.length){
					// finished loading & apply to scope
					$scope.$apply(function(){
						$scope.finishedLoading();
					});
				}
			};

		/* /INIT SITE */
		
		/* Explore filter*/
			$scope.filterMediaType = function(type)
			{
				$('#filterMediaType').val(type);
				$('#filterMediaType').trigger('input');				
			}
			$scope.filerMediaTypeRemove = function()
			{
				$('#filterMediaType').val('');
				$('#filterMediaType').trigger('input');	
			}
			

			$scope.filerChannel = function(channel)
			{

				$('#filterChannel').val(channel.channel_address);
				$('#filterChannel').trigger('input');
				var imgSrc = '/'+$scope.channel_master_address+'/merged-'+$scope.merger_name+'/'+channel.channel_address+'/uploads/images/'+channel.logo;
				if(channel.logo)
 				{                
					$('#channelInfo').html('<div class="description"><span><img src='+imgSrc+' class="imgFilehubLogo imgFilehubLogoBig"></img></span><span class="">'+channel.games.length+' games '+ channel.videos.length+' videos </span></div>');
				}else
				{
					$('#channelInfo').html('<div class="description"><img src="assets/img/x-avatar.png" class="imgFilehubLogo imgFilehubLogoBig"/><span class="">'+channel.games.length+' games '+ channel.videos.length+' videos </span></div>');
					          
				}
				
			}
			$scope.filerChannelRemove = function()
			{
				$('#filterChannel').val('');
				$('#filterChannel').trigger('input');				
				$('#channelInfo').html('');			
			}
			


		/* UI */

			// show loading msg
			$scope.showLoadingMessage = function(msg) {
		    	$scope.loading = true;
		    	$scope.msg = msg;
			};

			// finished loading 
			$scope.finishedLoading = function(){
				$scope.loading = false;
				$scope.msg = '';
			};

		    // select user
		    $scope.selectUser = function(){
		    	Page.cmd("certSelect", [["zeroid.bit"]]);
		    };

	    /* /UI */
	}
]);

// dialog controller
var DialogController = function($scope, $mdDialog) {
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