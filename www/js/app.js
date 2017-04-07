// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ion-autocomplete', 'ngOpenFB', 'ngCordova', 'services', 'ion-gallery'])

.run(function($ionicPlatform, ngFB, $ionicPopup, $ionicModal, $ionicLoading) {
  ngFB.init({appId: '599219800249231'});
  $ionicPlatform.ready(function() {
    if(window.Connection) {
          if(navigator.connection.type == Connection.NONE) {

              $ionicModal.fromTemplateUrl('no-internet-modal.html', {
                //scope: $scope,
                animation: 'slide-in-up'
              }).then(function (modal) {
                //$scope.modal = modal;
                modal.show();
              });

              // $ionicPopup.confirm({
              //     title: "No Internet Connection",
              //     content: "Please enable your internet connection!"
              // })
              // .then(function(result) {
              //     if(!result) {
              //         ionic.Platform.exitApp();
              //     }
              // });
          }
      }
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


    // One Signal Push Notification Setup
    // Enable to debug issues.
    // window.plugins.OneSignal.setLogLevel({logLevel: 4, visualLevel: 4});
    var notificationOpenedCallback = function(jsonData) {
      console.log('didReceiveRemoteNotificationCallBack: ' + JSON.stringify(jsonData));
    };

    window.plugins.OneSignal
      .startInit("3b44f95e-1f74-49d6-b078-35d97b28fd6c")
      .handleNotificationOpened(notificationOpenedCallback)
      .endInit();

    window.plugins.OneSignal.getIds(function(ids) {
      //document.getElementById("OneSignalUserID").innerHTML = "UserID: " + ids.userId;
      //document.getElementById("OneSignalPushToken").innerHTML = "PushToken: " + ids.pushToken;
      localStorage.setItem("player_id", JSON.stringify(ids.userId));
    });

    // Show an alert box if a notification comes in when the user is in your app.
    window.plugins.OneSignal.enableInAppAlertNotification(true);

  });
})
/* $ionicPlatform.ready(function() {
            if(window.Connection) {
                if(navigator.connection.type == Connection.NONE) {
                    $ionicPopup.confirm({
                        title: "Internet Disconnected",
                        content: "The internet is disconnected on your device."
                    })
                    .then(function(result) {
                        if(!result) {
                            ionic.Platform.exitApp();
                        }
                    });
                }
            }
        });
        */
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.welcome', {
    url: '/welcome',
    views: {
        'menuContent': {
          templateUrl: 'templates/welcome.html'
        }
      }
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

    .state('app.my_bonus_points', {
      url: '/my_bonus_points',
      views: {
        'menuContent': {
          templateUrl: 'templates/my_bonus_points.html',
          controller: "MyBonusPointsCtrl"
        }
      }
    })

    .state('app.company_page', {
      url: '/company_page',
      views: {
        'menuContent': {
          templateUrl: 'templates/company_page.html',
          controller: "CompanyPageCtrl"
        }
      }
    })

    .state('app.products', {
      url: '/products',
      views: {
        'menuContent': {
          templateUrl: 'templates/products.html',
          controller: "ProductsCtrl"
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


;
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/welcome');
})

.config(function(ionGalleryConfigProvider) {
  ionGalleryConfigProvider.setGalleryConfig({
                          action_label: 'Close',
                          template_gallery: '../templates/gallery.html',
                          template_slider: '../templates/slider.html',
                          toggle: false,
                          row_size: 3,
                          fixed_row_size: false,
                          zoom_events: false
  });
});

;
