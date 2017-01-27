// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ion-autocomplete', 'ngOpenFB', 'ngCordova'])

.run(function($ionicPlatform,ngFB) {
  ngFB.init({appId: '599219800249231'});
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

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.home', {
      url: '/home',
      views: {
        'menuContent': {
          templateUrl: 'templates/home.html',
          //controller: 'TopEvents',
          //controller: 'NewEvents'
        }
      }
    })

    .state('app.event_detail', {
      url: '/event_detail',
      views: {
        'menuContent': {
          templateUrl: 'templates/event_detail.html',
          controller: "DetailPage"
        }
      }
    })

    .state('app.profile', {
    url: "/edit_profile",
    views: {
        'menuContent': {
            templateUrl: "templates/edit_profile.html",
            controller: "ProfileCtrl"
        }
    }
})

    .state('app.companies', {
      url: '/companies',
      views: {
        'menuContent': {
          templateUrl: 'templates/companies.html'
        }
      }
    })
    .state('app.edit_profile', {
      url: '/edit_profile',
      views: {
        'menuContent': {
          templateUrl: 'templates/edit_profile.html'
        }
      }
    })
    .state('app.contacts', {
      url: '/contacts',
      views: {
        'menuContent': {
          templateUrl: 'templates/contacts.html'
        }
      }
    })
    .state('app.future_events', {
      url: '/future_events',
      views: {
        'menuContent': {
          templateUrl: 'templates/future_events.html'
        }
      }
    })
    .state('app.my_applications', {
      url: '/my_applications',
      views: {
        'menuContent': {
          templateUrl: 'templates/my_applications.html',
          controller: "MyApplicationsCtrl"
        }
      }
    })
    .state('app.my_bookmarks', {
      url: '/my_bookmarks',
      views: {
        'menuContent': {
          templateUrl: 'templates/my_bookmarks.html',
          controller: "MyBookmarksCtrl"
        }
      }
    })
    .state('app.my_dashboard', {
      url: '/my_dashboard',
      views: {
        'menuContent': {
          templateUrl: 'templates/my_dashboard.html',
          controller: "MyDashboardCtrl"
        }
      }
    })
   
    .state('app.past_events', {
      url: '/past_events',
      views: {
        'menuContent': {
          templateUrl: 'templates/past_events.html'
        }
      }
    })

    .state('app.login', {
      url: '/login',
      views: {
        'menuContent': {
          templateUrl: 'templates/login.html'
        }
      }
    })

    .state('app.logout', {
      url: '/logout',
      views: {
        'menuContent': {
          templateUrl: 'templates/logout.html',
          controller: "Logout"
        }
      }
    })


;
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});
