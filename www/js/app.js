// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('PHR-UHS', ['ionic', 'ionic-material', 'PHR-UHS.controllers','PHR-UHS.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})
// List all the possible states of the application
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
	
  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
  })
	
	.state('app.tutorial', {
		cache: false,
		url: '/tutorial',
		views: {
			'menuContent': {
				templateUrl: 'templates/tutorial.html'
			}
		}
	})
	
  .state('app.personalinfo', {
    url: '/personalinfo',
    views: {
      'menuContent': {
        templateUrl: 'templates/personalinfo.html'
      }
    }
  })
	
	.state('app.personalinfoedit', {
		url: '/personalinfo-edit',
		views: {
			'menuContent': {
				templateUrl: 'templates/personalinfo-edit.html'
			}
		}
	})
  
  .state('app.medical', {
		cache: false,
    url: '/medical',
    views: {
      'menuContent': {
        templateUrl: 'templates/medical.html'
      }
    }
  })
  
  .state('app.med-record', {
		cache: false,
    url: '/medical/:recordId',
		views: {
			'menuContent': {
				templateUrl: 'templates/med-record.html'
			}
		}
  })
	
	.state('app.pics', {
		cache: false,
    url: '/medical/pics/:recordId/:updateId/:picsType',
		views: {
			'menuContent': {
				templateUrl: 'templates/pics.html'
			}
		}
  })
	
	.state('app.audio', {
		cache: false,
		url: '/medical/audio/:recordId/:updateId',
		views: {
			'menuContent': {
				templateUrl: 'templates/audio-record.html'
			}
		}
	})

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/medical');
});
