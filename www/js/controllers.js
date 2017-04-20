
var Country = "";
var City = "";
var Event_Place = "";
var CountryName = "";
var CityName = "";
var Event_PlaceName = "";
var searched_location = {};
var PastEvents = 0;

angular.module('starter.controllers', ['ngOpenFB', 'ngMaterial', 'ngCordova'])

  .factory('EventDetailPast', function () {

    var eventdetail = {};
    //eventdetail.cityId = "";
    //eventdetail.placeName = "";
    //eventdetail.placeId = "";

    //return eventdetail;
    return {
      getEvObject: function () {
        return eventdetail;
      },
      setEvObject: function (evObject) {
        eventdetail = evObject;
      }
    };
  })

  .factory('EventDetailFuture', function () {

    var eventdetail = {};
    //eventdetail.cityId = "";
    //eventdetail.placeName = "";
    //eventdetail.placeId = "";

    //return eventdetail;
    return {
      getEvObject: function () {
        return eventdetail;
      },
      setEvObject: function (evObject) {
        eventdetail = evObject;
      }
    };
  })

  .controller('AppCtrl', function ($scope, $ionicModal, $timeout, ngFB, $http, $state, $q, $ionicLoading, $ionicSideMenuDelegate, $ionicPlatform) {


    $scope.logged = localStorage.getItem("logged");
    $scope.isSoundMuted = localStorage.getItem("isSoundMuted");

    $scope.changeSoundStatus = function () {
      $ionicLoading.show({
        template: 'Saving...'
      });

      if ($scope.isSoundMuted == 1) {
        localStorage.setItem('isSoundMuted', 0);
      }
      else {
        localStorage.setItem('isSoundMuted', 1);
      }

      $scope.isSoundMuted = localStorage.getItem("isSoundMuted");
      $ionicSideMenuDelegate.toggleRight();
      location.reload();
    }

    if ($scope.logged && $scope.logged > 0 && $state.current.name == 'app.welcome') {
      $state.go('app.home');
    }

    $scope.retryConnection = function () {
      location.reload();
    }

    $scope.cancelConnection = function () {
      ionic.Platform.exitApp();
    }

    $scope.populateMenuDatas = function () {
      $scope.menuProfileDatas = [];
      $http.get('http://www.wheee.eu/api/user/profile_datas.php?dashboard=1&id=' + $scope.logged)
        .success(function (response) {
          $scope.menuProfileDatas.push({
            email: response.response[0].email,
            firstname: response.response[0].firstname,
            lastname: response.response[0].lastname,
            fb_picture: response.response[0].fb_picture
          });
        })
    };

    $scope.populateMenuDatas();


    // login

    //This is the success callback from the login method
    var fbLoginSuccess = function (response) {
      if (!response.authResponse) {
        fbLoginError("Cannot find the authResponse");
        return;
      }

      var authResponse = response.authResponse;

      getFacebookProfileInfo(authResponse)
        .then(function (profileInfo) {
          //for the purpose of this example I will store user data on local storage

          $http.get('http://www.wheee.eu/api/user/get_user_id.php?email=' + profileInfo.email +
            '&first_name=' + profileInfo.first_name +
            '&last_name=' + profileInfo.last_name +
            '&gender=' + profileInfo.gender +
            '&age=' + profileInfo.age_range.min +
            '&link=' + profileInfo.link +
            '&picture=http://graph.facebook.com/' + authResponse.userID + '/picture?type=large' +
            '&player_id=' + localStorage.getItem("player_id") +
            '&updated=' + profileInfo.updated_time)
            .success(function (response) {
              angular.forEach(response.response, function (user) {

                $ionicLoading.show({
                  template: 'Logging in...'
                });

                localStorage.setItem("logged", user);
                $scope.logged = localStorage.getItem("logged");
                $scope.populateMenuDatas();

                $ionicLoading.hide();
                if ($state.current.name != 'app.event_detail') {
                  $state.go('app.home');
                }
                else {
                  location.reload();
                }
              });

              $scope.$broadcast('scroll.infiniteScrollComplete');
            }).error(function (err) {
              $scope.$broadcast('scroll.infiniteScrollComplete');
            });

          $ionicLoading.hide();
          if ($state.current.name != 'app.event_detail') {
            $state.go('app.home');
          }
          else {
            location.reload();
          }
        }, function (fail) {
          //fail get profile info
          console.log('profile info fail', fail);
        });
    };


    //This is the fail callback from the login method
    var fbLoginError = function (error) {
      console.log('fbLoginError', error);
      $ionicLoading.hide();
    };

    //this method is to get the user profile info from the facebook api
    var getFacebookProfileInfo = function (authResponse) {
      var info = $q.defer();

      facebookConnectPlugin.api('/me?fields=first_name,last_name,gender,locale,age_range,link,picture,updated_time,email&access_token=' + authResponse.accessToken, null,
        function (response) {
          console.log(response);
          info.resolve(response);
        },
        function (response) {
          console.log(response);
          info.reject(response);
        }
      );
      return info.promise;
    };

    //This method is executed when the user press the "Login with facebook" button
    $scope.facebookSignIn = function () {

      // FOR BROWSER LOGIN

      // localStorage.setItem("logged", 26);
      // $scope.logged = localStorage.getItem("logged");
      // if ($state.current.name != 'app.event_detail') {
      //   $state.go('app.home');
      // }
      // else {
      //   location.reload();
      // }

      // FOR BROWSER LOGIN

      facebookConnectPlugin.getLoginStatus(function (success) {
        if (success.status === 'connected') {
          // the user is logged in and has authenticated your app, and response.authResponse supplies
          // the user's ID, a valid access token, a signed request, and the time the access token
          // and signed request each expire
          console.log('getLoginStatus', success.status);

          //check if we have our user saved

          if (!$scope.logged || $scope.logged == 0) {
            getFacebookProfileInfo(success.authResponse)
              .then(function (profileInfo) {

                // ONE SIGNAL
                window.plugins.OneSignal.getIds(function(ids) {
                    //document.getElementById("OneSignalUserID").innerHTML = "UserID: " + ids.userId;
                    //document.getElementById("OneSignalPushToken").innerHTML = "PushToken: " + ids.pushToken;
                    localStorage.setItem("player_id", JSON.stringify(ids.userId));
                });
                // ONE SIGNAL

                $http.get('http://www.wheee.eu/api/user/get_user_id.php?email=' + profileInfo.email +
                  '&first_name=' + profileInfo.first_name +
                  '&last_name=' + profileInfo.last_name +
                  '&gender=' + profileInfo.gender +
                  '&age=' + profileInfo.age_range.min +
                  '&link=' + profileInfo.link +
                  '&picture=http://graph.facebook.com/' + success.authResponse.userID + '/picture?type=large' +
                  '&player_id=' + localStorage.getItem("player_id") +
                  '&updated=' + profileInfo.updated_time)
                  .success(function (response) {
                    angular.forEach(response.response, function (user) {

                      $ionicLoading.show({
                        template: 'Logging in...'
                      });

                      localStorage.setItem("logged", user);
                      $scope.logged = localStorage.getItem("logged");
                      $scope.populateMenuDatas();

                      $ionicLoading.hide();
                      if ($state.current.name != 'app.event_detail') {
                        $state.go('app.home');
                      }
                      else {
                        location.reload();
                      }
                    });

                    $scope.$broadcast('scroll.infiniteScrollComplete');
                  }).error(function (err) {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                  });

              }, function (fail) {
                //fail get profile info
                console.log('profile info fail', fail);
              });
          } else {
            if ($state.current.name != 'app.event_detail') {
              $state.go('app.home');
            }
            else {
              location.reload();
            }
          }

        } else {
          //if (success.status === 'not_authorized') the user is logged in to Facebook, but has not authenticated your app
          //else The person is not logged into Facebook, so we're not sure if they are logged into this app or not.
          console.log('getLoginStatus', success.status);

          $ionicLoading.show({
            template: 'Logging in...'
          });

          //ask the permissions you need. You can learn more about FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
          facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);
        }
      });
    };

    // login

    // Form data for the login modal
    $scope.loginData = {};
    $scope.navTitle = '<img class="title-image" src="http://www.wheee.eu/assets/images/logo-160x160-10.png" />';

    //Menüpontok kilépő állapotban
    $scope.groupLO = [];
    $scope.groupLO[0] = {
      name: "Home",
      items: [],
      link: "#/app/home",
      icon: 'ion-android-home'
    };

    $scope.groupLO[1] = {
      name: "Search",
      items: [],
      link: "",
      icon: 'ion-android-search'
    };

    $scope.groupLO[2] = {
      name: "Log In",
      items: [],
      link: "#/app/welcome",
      icon: 'ion-unlocked'
    };
    //Lenyilo menü a Search-nek
    $scope.groupLO[1].items[0] = {
      name: "Future Events",
      link: "#/app/future_events",
      icon: 'ion-android-search'
    };
    $scope.groupLO[1].items[1] = {
      name: "Past Events",
      link: "#/app/past_events",
      icon: 'ion-android-search'
    };
    // $scope.groupLO[1].items[2] = {
    //   name: "Companies",
    //   link: "#/app/companies",
    //   icon: 'ion-android-search'
    // };

    //Menüpontok belépő állapotban
    $scope.groupLI = [];
    $scope.groupLI[0] = {
      name: "Home",
      items: [],
      link: "#/app/home",
      icon: 'ion-android-home'
    };

    $scope.groupLI[1] = {
      name: "Search",
      items: [],
      link: "",
      icon: 'ion-android-search'
    };

    $scope.groupLI[2] = {
      name: "My Profile",
      items: [],
      link: "",
      icon: 'ion-android-person'
    };

    $scope.groupLI[3] = {
      name: "Log Out",
      items: [],
      link: "#/app/logout",
      icon: 'ion-locked'
    };
    //Lenyilo menü a Search-höz
    $scope.groupLI[1].items[0] = {
      name: "Future Events",
      link: "#/app/future_events"
    };
    $scope.groupLI[1].items[1] = {
      name: "Past Events",
      link: "#/app/past_events"
    };
    // $scope.groupLI[1].items[2] = {
    //   name: "Companies",
    //   link: "#/app/companies"
    // };
    //Lenyilo menü a My Profile-hoz
    $scope.groupLI[2].items[0] = {
      name: "My Dashboard",
      link: "#/app/my_dashboard",
    };
    $scope.groupLI[2].items[1] = {
      name: "My Applications",
      link: "#/app/my_applications",
    };
    $scope.groupLI[2].items[2] = {
      name: "My Bookmarks",
      link: "#/app/my_bookmarks",
    };
    $scope.groupLI[2].items[3] = {
      name: "My Bonus Points",
      link: "#/app/my_bonus_points",
    };
    $scope.groupLI[2].items[4] = {
      name: "Edit Profile",
      link: "#/app/edit_profile",
    };

    $scope.toggleGroup = function (group) {
      if (group.link != '#/app/logout') {
        if ($scope.isGroupShown(group)) {
          $scope.shownGroup = null;
        } else {
          $scope.shownGroup = group;
        }
      }
      else {
        localStorage.setItem("logged", 0);
        $scope.logged = localStorage.getItem("logged");
        $ionicSideMenuDelegate.toggleRight();
        $state.go('app.welcome');
      }
    };
    $scope.isGroupShown = function (group) {
      return $scope.shownGroup === group;
    };
  })

  //MyApplications

  .controller('MyApplicationsCtrl', function ($scope, $http) {

    $scope.getMyApplications = function () {

      $scope.myApplications = [];
      $http.get('http://www.wheee.eu/api/user/get_my_applications.php?user_id=' + localStorage.getItem("logged"))
        .success(function (response) {
          angular.forEach(response.response, function (event) {
            $scope.myApplications.push(event);
          });
        })
    };
    $scope.getMyApplications();

    $scope.GoToDetails = function (eventId) {
      Event_Place = eventId;

      City = "";
      Event_PlaceName = "";
      localStorage.setItem('last_searchedEventId', eventId);
      localStorage.setItem('userImagesLimit', 9);
      localStorage.setItem('photographerImagesLimit', 9);
      
      location.href = '#/app/event_detail';


    }

  })

  //MyBookmarks

  .controller('MyBookmarksCtrl', function ($scope, $http) {

    $scope.getMyBookmarks = function () {

      $scope.myBookmarks = [];
      $http.get('http://www.wheee.eu/api/user/get_my_bookmarks.php?user_id=' + localStorage.getItem("logged"))
        .success(function (response) {
          angular.forEach(response.response, function (event) {
            $scope.myBookmarks.push(event);
          });
        })
    };
    $scope.getMyBookmarks();

    $scope.GoToDetails = function (eventId) {
      Event_Place = eventId;

      City = "";
      Event_PlaceName = "";
      localStorage.setItem('last_searchedEventId', eventId);
      localStorage.setItem('userImagesLimit', 9);
      localStorage.setItem('photographerImagesLimit', 9);

      location.href = '#/app/event_detail';

    }

  })

  //MyDashboard

  .controller('MyDashboardCtrl', function ($scope, $http) {

    $scope.getMyDashboard = function () {

      $scope.myDashboard = [];
      $http.get('http://www.wheee.eu/api/user/profile_datas.php?dashboard=1&id=' + localStorage.getItem("logged"))
        .success(function (response) {
          $scope.myDashboard.push({
            email: response.response[0].email,
            firstname: response.response[0].firstname,
            lastname: response.response[0].lastname,
            fb_picture: response.response[0].fb_picture,
            country: response.response[0].country,
            county: response.response[0].county,
            location: response.response[0].location
          });
        })

      $scope.dashStat = [];
      $http.get('http://www.wheee.eu/api/user/get_account_statistics.php?user_id=' + localStorage.getItem("logged"))
        .success(function (response) {
          $scope.dashStat.push({
            comment_nr: response.response.comment_nr,
            image_nr: response.response.image_nr,
            joined_nr: response.response.joined_nr,
            bookmarked_nr: response.response.bookmark_nr,
            points_nr: response.response.points_nr
          });
        })
    };
    $scope.getMyDashboard();

  })

  // Company page

  .controller('CompanyPageCtrl', function ($scope, $http, $sce) {

    $scope.clientId = localStorage.getItem("lastSearchedCompanyId");

    $scope.getCompanyData = function () {

      $scope.companyData = [];
      $scope.companyOpenHours = [];
      $http.get('http://www.wheee.eu/api/event_company/get_company.php?client_id=' + $scope.clientId)
        .success(function (response) {
          $scope.companyData.push({
            email: response.response[0].email,
            company_name: response.response[0].company_name,
            pub_name: response.response[0].pub_name,
            telephone: response.response[0].telephone,
            homepage: response.response[0].homepage,
            country: response.response[0].country,
            county: response.response[0].county,
            location: response.response[0].location,
            logo: response.response[0].logo,
            address: response.response[0].address,
            zip_code: response.response[0].zip_code,
            premium_profile: response.response[0].premium_profile,
            premium_header: response.response[0].premium_header,
            promo_participant: response.response[0].promo_participant
          });
          if ($scope.companyData[0].premium_profile > 0) {
            if(!$scope.companyData[0].premium_header) {
              $scope.companyData[0].premium_header = 'default.jpg';
            }
          }
          else {
            $scope.companyData[0].premium_header = 'default.jpg';
          }
          $scope.companyDescription = $sce.trustAsHtml(response.response[0].description);

          angular.forEach(response.response[0].days, function (days) {
            $scope.companyOpenHours.push(days);
          });
        })
    };
    $scope.getCompanyData();

  })

  // Company page

  // Products

  .controller('ProductsCtrl', function ($scope, $http) {

    $scope.clientId = localStorage.getItem("lastSearchedCompanyIdForProduct");
    $scope.isLogged = localStorage.getItem("logged");

    $scope.getProducts = function () {

      $scope.companyData = [];
      $scope.companyProducts = [];
      $http.get('http://www.wheee.eu/api/event_company/get_products.php?client_id=' + $scope.clientId + '&user_id=' + $scope.isLogged)
        .success(function (response) {
          $scope.companyData.push({
            pub_name: response.response.company.pub_name,
            logo: response.response.company.logo,
            premium_profile: response.response.company.premium_profile,
            premium_header: response.response.company.premium_header,
            promo_participant: response.response.company.promo_participant,
            bonus_points: response.response.company.bonus_points,
            no_products_set: response.response.company.no_products_set
          });
          if ($scope.companyData[0].premium_profile < 1) {
            $scope.companyData[0].premium_header = '';
          }
          angular.forEach(response.response.products, function (product) {
            $scope.companyProducts.push(product);
          });
        })
    };
    $scope.getProducts();

  })

  // Products

  // My Bonus Points

  .controller('MyBonusPointsCtrl', function ($scope, $http) {

    $scope.isLogged = localStorage.getItem("logged");

    $scope.getBonusPoints = function () {

      $scope.userBonusPoints = [];
      $http.get('http://www.wheee.eu/api/user/get_bonus_points.php?user_id=' + $scope.isLogged)
        .success(function (response) {
          angular.forEach(response.response, function (points) {
            $scope.userBonusPoints.push(points);
          });
        })
    };
    $scope.getBonusPoints();

    $scope.GoToCompanyProducts = function (clientId) {
      localStorage.setItem("lastSearchedCompanyIdForProduct", clientId);
      location.href = '#/app/products';
    }

  })

  // My Bonus Points

  //Profile
  .controller('ProfileCtrl', function ($scope, $http, $ionicLoading) {

    $scope.saveNotification = function (notificationType, nextStatus) {
      
      $ionicLoading.show({
        template: 'Updating profile...'
      });
      $http.post('http://www.wheee.eu/api/user/save_profile_datas.php?user_id=' + localStorage.getItem("logged")
        + '&notification_type=' + notificationType
        + '&next_status=' + nextStatus)
        .success(function (response) {
          window.location.reload();
        });
    };


    $scope.userData = [];
    $scope.getUser = function () {
      $http.get('http://www.wheee.eu/api/user/profile_datas.php?id=' + localStorage.getItem("logged"))
        .success(function (response) {
          $scope.userData.push({
            id: response.response[0].id,
            email: response.response[0].email,
            firstname: response.response[0].firstname,
            lastname: response.response[0].lastname,
            gender: response.response[0].gender,
            fb_picture: response.response[0].fb_picture,
            newsletter: response.response[0].newsletter,
            push_weekly_general: response.response[0].push_weekly_general,
            push_daily_interesting: response.response[0].push_daily_interesting,
            push_daily_bookmarked: response.response[0].push_daily_bookmarked,
            push_daily_joined: response.response[0].push_daily_joined
          });
        });
    };
    $scope.getUser();
  })


  .controller('TopEvents', function ($scope, $http) {

    $scope.page = 0;
    $scope.total = 1;
    $scope.topEvents = [];
    $scope.getEvents = function () {
      $scope.page++;
      $http.get('http://www.wheee.eu/api/event_homepage/slider.php?location_id=37')
        .success(function (response) {
          angular.forEach(response.response, function (event) {
            $scope.topEvents.push(event);
          });
          if ($scope.topEvents.length == 0) {
            $scope.default = "http://www.wheee.eu/upload/headers/default.jpg";
          } else {
            $scope.default = "None";
          }
          //$scope.total = response.totalPages;
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }).error(function (err) {
          $scope.$broadcast('scroll.infiniteScrollComplete');
          console.log(err);
        });
    };
    $scope.getEvents();

    $scope.GoToDetails = function (eventId) {
      Event_Place = eventId;


      City = "";
      Event_PlaceName = "";
      localStorage.setItem('last_searchedEventId', eventId);
      localStorage.setItem('userImagesLimit', 9);
      localStorage.setItem('photographerImagesLimit', 9);

      location.href = '#/app/event_detail';




    }
  })

  .controller('autoCompleteControllerPast', function ($scope, $timeout, $log, $http, $q, EventDetailPast) {
    var self = this;
    self.selectedCountryValue = localStorage.getItem('last_searchedPastCountryName');
    Country = localStorage.getItem('last_searchedPastCountryId');
    if (self.selectedCountryValue) {
      self.showCity = true;
    }
    else {
      self.showCity = false;
    }
    self.selectedCityValue = localStorage.getItem('last_searchedPastCityName');
    City = localStorage.getItem('last_searchedPastCityId');
    if (self.selectedCityValue) {
      self.showEvent = true;
    }
    else {
      self.showEvent = false;
    }
    self.simulateQuery = true;
    self.isDisabled = false;

    //http://www.wheee.eu/api/event_search/events.php?event_id=37

    self.queryCountrySearch = function (query) {
      return $http.get("http://www.wheee.eu/api/event_autocomplete/countries.php?past_events=1")
        .then(function (response) {
          var tmp = response.data.response.map(function (state) {
            return {
              id: state.id,
              value: state.name.toLowerCase(),
              display: state.name
            }
          });
          return query ? tmp.filter(createFilterFor(query)) : tmp;
        })
    }

    self.queryCitySearch = function (query) {
      return $http.get("http://www.wheee.eu/api/event_autocomplete/cities.php?past_events=1&country_id=" + Country)
        .then(function (response) {
          var tmp = response.data.response.map(function (state) {
            return {
              id: state.id,
              value: state.name.toLowerCase(),
              display: state.name
            }
          });
          return query ? tmp.filter(createFilterFor(query)) : tmp;
        })
    }

    self.queryEventSearch = function (query) {
      return $http.get("http://www.wheee.eu/api/event_autocomplete/events_and_locals.php?past_events=1&location_id=" + City)
        .then(function (response) {


          var tmp1 = response.data.response.local_name.map(function (state) {
            return {
              id: state.client_id,
              value: state.local_name.toLowerCase(),
              display: state.local_name,
              class: state.class
            }

          });
          var tmp2 = response.data.response.title.map(function (state) {
            return {
              id: state.id,
              value: state.title.toLowerCase(),
              display: state.title,
              class: state.class
            }
          });
          var tmp = tmp1.concat(tmp2);
          return query ? tmp.filter(createFilterFor(query)) : tmp;
        })
    }

    self.searchTextChangeCountry = searchTextChangeCountry;

    self.searchTextChangeCity = searchTextChangeCity;
    self.countryChange = countryChange;
    self.cityChange = cityChange;
    self.eventChange = eventChange;



    function searchTextChangeCity(text) {

      self.showEvent = false;
    }
    function searchTextChangeCountry(text) {
      self.showCity = false;
      self.showEvent = false;
    }
    function countryChange(item) {
      $log.info('Item changed to ' + JSON.stringify(item));
      Country = item.id;
      CountryName = item.value;
      localStorage.setItem("last_searchedPastCountryId", Country);
      localStorage.setItem("last_searchedPastCountryName", item.display);
      self.showCity = true;
    }
    function cityChange(item) {
      $log.info('Item changed to ' + JSON.stringify(item));
      City = item.id;
      CityName = item.value;
      localStorage.setItem("last_searchedPastCityId", City);
      localStorage.setItem("last_searchedPastCityName", item.display);
      self.showEvent = true;
    }
    function eventChange(item) {
      $log.info('Item changed to ' + JSON.stringify(item));

      if (item && item.value != 'all locals' && item.value != 'all events') {
        Event_PlaceName = item.value;
        Event_Place = item.id;
      }
      else if(!item) {
        Event_PlaceName = '';
        Event_Place = '';
      }
      localStorage.setItem("last_searchedEventId", Event_Place);
      while (Event_PlaceName.indexOf(" ") != -1) {
        Event_PlaceName = Event_PlaceName.replaceAt(Event_PlaceName.indexOf(" "), "+");
      }
    }

    String.prototype.replaceAt = function (index, character) {
      return this.substr(0, index) + character + this.substr(index + character.length);
    }

    //When clicked on search button


    self.pastEvents = {};
    $scope.searchPast = function () {
      PastEvents = 1;
      //self.pastEvents = EventDetailPast.getEvObject();
      //var EventDetailPast = {};
      var link = "";
      if (Event_PlaceName == "") {
        link = "http://www.wheee.eu/api/event_search/events.php?past_events=1&last_searched_location=" + City + "&current_page=1";
      } else {
        link = "http://www.wheee.eu/api/event_search/events.php?past_events=1&last_searched_location=" + City + "&searched_local_name=" + Event_PlaceName + "&current_page=1";

      }

      $http.get(link)
        .success(function (response) {
          if (response.response.length == 0) {
            localStorage.setItem('SearchPage', 'past');
            localStorage.setItem('userImagesLimit', 9);
            localStorage.setItem('photographerImagesLimit', 9);

            location.href = '#/app/event_detail';

          } else {
            EventDetailPast.setEvObject(response.response);
            self.pastEvents = EventDetailPast.getEvObject();
            $log.info(self.pastEvents);
          }
        })
    };

    $scope.GoToDetails = function (eventId) {
      Event_Place = eventId;

      City = "";
      Event_PlaceName = "";
      localStorage.setItem('last_searchedEventId', eventId);
      localStorage.setItem('SearchPage', 'past');
      localStorage.setItem('userImagesLimit', 9);
      localStorage.setItem('photographerImagesLimit', 9);

      location.href = '#/app/event_detail';


    }

    //filter function for search query
    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(state) {
        return (state.value.indexOf(lowercaseQuery) === 0);
      };
    }
  })

  .controller('autoCompleteController', function ($scope, $timeout, $log, $http, $q, EventDetailFuture) {
    var self = this;
    self.selectedCountryValue = localStorage.getItem('last_searchedCountryName');
    Country = localStorage.getItem('last_searchedCountryId');
    if (self.selectedCountryValue) {
      self.showCity = true;
    }
    else {
      self.showCity = false;
    }
    self.selectedCityValue = localStorage.getItem('last_searchedCityName');
    City = localStorage.getItem('last_searchedCityId');
    if (self.selectedCityValue) {
      self.showEvent = true;
    }
    else {
      self.showEvent = false;
    }
    self.simulateQuery = true;
    self.isDisabled = false;


    self.queryCountrySearch = function (query) {
      return $http.get("http://www.wheee.eu/api/event_autocomplete/countries.php")
        .then(function (response) {
          var tmp = response.data.response.map(function (state) {
            return {
              id: state.id,
              value: state.name.toLowerCase(),
              display: state.name
            }
          });
          return query ? tmp.filter(createFilterFor(query)) : tmp;
        })
    }

    self.queryCitySearch = function (query) {
      return $http.get("http://www.wheee.eu/api/event_autocomplete/cities.php?country_id=" + Country)
        .then(function (response) {
          var tmp = response.data.response.map(function (state) {
            return {
              id: state.id,
              value: state.name.toLowerCase(),
              display: state.name
            }
          });
          return query ? tmp.filter(createFilterFor(query)) : tmp;
        })
    }

    self.queryEventSearch = function (query) {
      return $http.get("http://www.wheee.eu/api/event_autocomplete/events_and_locals.php?location_id=" + City)
        .then(function (response) {

          var tmp1 = response.data.response.local_name.map(function (state) {
            return {
              id: state.client_id,
              value: state.local_name.toLowerCase(),
              display: state.local_name,
              class: state.class
            }

          });
          var tmp2 = response.data.response.title.map(function (state) {
            return {
              id: state.id,
              value: state.title.toLowerCase(),
              display: state.title,
              class: state.class
            }
          });
          var tmp = tmp1.concat(tmp2);
          return query ? tmp.filter(createFilterFor(query)) : tmp;
        })
    }

    self.searchTextChangeCountry = searchTextChangeCountry;

    self.searchTextChangeCity = searchTextChangeCity;
    self.countryChange = countryChange;
    self.cityChange = cityChange;
    self.eventChange = eventChange;



    function searchTextChangeCity(text) {

      self.showEvent = false;
    }
    function searchTextChangeCountry(text) {
      self.showCity = false;
      self.showEvent = false;
    }
    function countryChange(item) {
      $log.info('Item changed to ' + JSON.stringify(item));
      Country = item.id;
      CountryName = item.value;
      localStorage.setItem("last_searchedCountryId", Country);
      localStorage.setItem("last_searchedCountryName", item.display);
      self.showCity = true;
    }

    function cityChange(item) {
      $log.info('Item changed to ' + JSON.stringify(item));
      City = item.id;
      CityName = item.value;
      localStorage.setItem("last_searchedCityId", City);
      localStorage.setItem("last_searchedCityName", item.display);
      self.showEvent = true;
    }
    function eventChange(item) {
      $log.info('Item changed to ' + JSON.stringify(item));
      if (item && item.value != 'all locals' && item.value != 'all events') {
        Event_PlaceName = item.value;
        Event_Place = item.id;
      }
      else if(!item) {
        Event_PlaceName = '';
        Event_Place = '';
      }
      localStorage.setItem("last_searchedEventId", Event_Place);
      while (Event_PlaceName.indexOf(" ") != -1) {
        Event_PlaceName = Event_PlaceName.replaceAt(Event_PlaceName.indexOf(" "), "+");
      }
    }
    self.showEvents = 0;
    String.prototype.replaceAt = function (index, character) {
      return this.substr(0, index) + character + this.substr(index + character.length);
    }
    //////////////////// HA VÁROSRA KERESÜNK ÉS CSAK EGY TALÁLAT VAN, AKKOR A HELY NEVÉT EL KELL MENTENI Event_PlaceName-BE
    //When clicked on search button
    $scope.search = function () {
      PastEvents = 0;
      //self.newEvents = EventDetailFuture.getEvObject();
      //var EventDetailFuture = {};
      self.showEvents = 0;
      var link = "";
      console.log(Event_PlaceName);
      if (Event_PlaceName == "all+locals" || Event_PlaceName == "all+events") {
        location.href = '#/app/future_events';
      }
      else {
        if (Event_PlaceName == "") {
          link = "http://www.wheee.eu/api/event_search/events.php?last_searched_location=" + City + "&current_page=1";
        } else {
          link = "http://www.wheee.eu/api/event_search/events.php?last_searched_location=" + City + "&searched_local_name=" + Event_PlaceName + "&current_page=1";
        }

        $http.get(link)
          .success(function (response) {
            if (response.response.length == 0) {
              localStorage.setItem('SearchPage', 'future');
              localStorage.setItem('userImagesLimit', 9);
              localStorage.setItem('photographerImagesLimit', 9);

              location.href = '#/app/event_detail';
            } else {

              EventDetailFuture.setEvObject(response.response);
              self.newEvents = EventDetailFuture.getEvObject();
              $log.info(self.newEvents);
              location.href = '#/app/future_events';
            }
          })
      }
    };


    self.newEvents = {};
    $scope.searchFuture = function () {
      PastEvents = 0;
      //self.newEvents = EventDetailFuture.getEvObject();
      //var EventDetailFuture = {};
      self.showEvents = 1;

      var link = "";
      if (Event_PlaceName == "") {
        link = "http://www.wheee.eu/api/event_search/events.php?last_searched_location=" + City + "&current_page=1";
      } else {
        link = "http://www.wheee.eu/api/event_search/events.php?last_searched_location=" + City + "&searched_local_name=" + Event_PlaceName + "&current_page=1";

      }

      $http.get(link)
        .success(function (response) {
          if (response.response.length == 0) {
            //localStorage.setItem('last_searchedEventId', eventId);
            //$log.info(response.response);
            localStorage.setItem('SearchPage', 'future');
            localStorage.setItem('userImagesLimit', 9);
            localStorage.setItem('photographerImagesLimit', 9);

            location.href = '#/app/event_detail';
          } else {
            EventDetailFuture.setEvObject(response.response);
            self.newEvents = EventDetailFuture.getEvObject();

            $log.info(self.newEvents);
          }
        })
    };


    $scope.GoToDetails = function (eventId) {
      Event_Place = eventId;

      City = "";
      Event_PlaceName = "";
      localStorage.setItem('last_searchedEventId', eventId);
      localStorage.setItem('SearchPage', 'future');
      localStorage.setItem('userImagesLimit', 9);
      localStorage.setItem('photographerImagesLimit', 9);

      location.href = '#/app/event_detail';

    }



    //filter function for search query
    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(state) {
        return (state.value.indexOf(lowercaseQuery) === 0);
      };
    }
  })

  /*.controller('SoundController', function ($ionicPlatform, $timeout, $cordovaNativeAudio) {

    var audioWheee = new Audio('sound/wheee.wav');
    this.playWheee = function () {
      audioWheee.play();
    };

    var vm = this;
  
    $ionicPlatform.ready(function () {
  
      // all calls to $cordovaNativeAudio return promises
  
      $cordovaNativeAudio.preloadSimple('snare', 'audio/snare.mp3');
      $cordovaNativeAudio.preloadSimple('hi-hat', 'audio/highhat.mp3');
      $cordovaNativeAudio.preloadSimple('bass', 'audio/bass.mp3');
      $cordovaNativeAudio.preloadSimple('bongo', 'audio/bongo.mp3');
    });
  
    vm.play = function (sound) {
      audio.play();
    };
  
    return vm;

  })*/

  .controller('DetailPage', function ($scope, $ionicScrollDelegate, $location, $log, $http, $sce, $ionicModal,
    $state, $cordovaCamera, $cordovaFile, $cordovaFileTransfer,
    $cordovaDevice, $ionicLoading, $cordovaActionSheet, $cordovaSocialSharing,
    $ionicPlatform, $timeout, $cordovaNativeAudio, $ionicPopup) {

    localStorage.setItem('isVisualizationAdded', 0);

    //var EventDetails = EventDetail.getEvObject();

    //$log.info(EventDetails);

    $scope.isLogged = localStorage.getItem("logged");

    /*if (EventDetails.id) {
      var eventID = EventDetails.id;
    }
    else*/ if (localStorage.getItem('last_searchedEventId')) {
      var eventID = localStorage.getItem('last_searchedEventId');
    }
    else {
      if (localStorage.getItem('SearchPage') == 'future') {
        location.href = '#/app/future_events';
      } else if (localStorage.getItem('SearchPage') == 'past') {
        location.href = '#/app/past_events';
      }
    }

    // IMAGE upload

    $scope.image = null;

    $scope.showAlert = function (title, msg) {
      var alertPopup = $ionicPopup.alert({
        title: title,
        template: msg
      });
    };

    // Present Actionsheet for switch beteen Camera / Library
    $scope.loadImage = function () {

      if (!$scope.isImageUploaded) {

        var options = {
          title: 'Select Image Source',
          buttonLabels: ['Select Photo from Gallery', 'Take a Photo'],
          addCancelButtonWithLabel: 'Cancel',
          androidEnableCancelButton: true,
        };
        $cordovaActionSheet.show(options).then(function (btnIndex) {
          var type = null;
          if (btnIndex === 1) {
            type = Camera.PictureSourceType.PHOTOLIBRARY;
          } else if (btnIndex === 2) {
            type = Camera.PictureSourceType.CAMERA;
          }
          if (type !== null) {
            $scope.selectPicture(type);
          }
        });
      }
    };


    // Take image with the camera or from library and store it inside the app folder
    // Image will not be saved to users Library.
    $scope.selectPicture = function (sourceType) {

      $scope.isImageUploaded = 1;

      var options = {
        quality: 100,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: sourceType,
        saveToPhotoAlbum: false
      };

      $cordovaCamera.getPicture(options).then(function (imagePath) {
        // Grab the file name of the photo in the temporary directory
        var currentName = imagePath.replace(/^.*[\\\/]/, '');

        //Create a new name for the photo
        var d = new Date(),
          n = d.getTime(),
          newFileName = n + ".jpg";

        // If you are trying to load image from the gallery on Android we need special treatment!
        if ($cordovaDevice.getPlatform() == 'Android' && sourceType === Camera.PictureSourceType.PHOTOLIBRARY) {

          $ionicLoading.show({
            template: 'Uploading...'
          });

          window.FilePath.resolveNativePath(imagePath, function (entry) {
            window.resolveLocalFileSystemURL(entry, success, fail);
            function fail(e) {
              console.error('Error: ', e);
            }

            function success(fileEntry) {
              var namePath = fileEntry.nativeURL.substr(0, fileEntry.nativeURL.lastIndexOf('/') + 1);
              // Only copy because of access rights
              $cordovaFile.copyFile(namePath, fileEntry.name, cordova.file.dataDirectory, newFileName).then(function (success) {
                $scope.image = newFileName;

                $scope.sendImageToServer();
              }, function (error) {
                $scope.showAlert('Error', error.exception);
              });
            };
          }
          );


        } else {

          $ionicLoading.show({
            template: 'Uploading...'
          });

          var namePath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
          //Move the file to permanent storage
          $cordovaFile.moveFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(function (success) {
            $scope.image = newFileName;
            $scope.sendImageToServer();
          }, function (error) {
            $scope.showAlert('Error', error.exception);
          });

        }
      },
        function (err) {
          // Not always an error, maybe cancel was pressed...
        })
    };

    // Returns the local path inside the app for an image
    $scope.pathForImage = function (image) {
      if (image === null) {
        return '';
      } else {
        return cordova.file.dataDirectory + image;
      }
    };

    $scope.sendImageToServer = function () {
      // Destination URL
      var url = "http://www.wheee.eu/api/event_detail/save_image.php?event_id=" + eventID + "&user_id=" + $scope.isLogged;

      // File for Upload
      var targetPath = $scope.pathForImage($scope.image);

      // File name only
      var filename = $scope.image;

      var options = {
        fileKey: "file",
        fileName: filename,
        chunkedMode: false,
        mimeType: "multipart/form-data",
        params: { 'fileName': filename }
      };

      $cordovaFileTransfer.upload(url, targetPath, options).then(function (result) {
        location.reload();
        $ionicLoading.hide();
      });
    }

    // IMAGE upload

    // IMAGE DELETE

    $scope.deleteImage = function (photoId) {
      $ionicLoading.show({
        template: 'Deleting photo...'
      });
      $http.get('http://www.wheee.eu/api/event_detail/delete_image.php?image_id=' + photoId)
        .success(function (response) {
          location.reload();
        });
    }

    // IMAGE DELETE

    // IMAGE DOWNLOAD

    $scope.downloadImage = function (image_src, justImageName) {
      $ionicLoading.show({
        template: 'Downloading image...'
      });

        var url = image_src;
        var targetPath = cordova.file.externalRootDirectory + "/DCIM/Wheee/" + justImageName;
        var trustHosts = true;
        var options = {};

        $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
          .then(function(result) {
            // Success!
            $ionicLoading.hide();

            $ionicPopup.alert({
                title: "Success!",
                content: "Image downloaded!"
            })
            .then(function(result) {
                // Action
            });
          }, function(err) {
            // Error
            $ionicPopup.alert({
                title: "Error!",
                content: "Unfortunatelly this image cannot be downloaded!"
            })
            .then(function(result) {
                // Action
            });
          }, function (progress) {
            $timeout(function () {
              $scope.downloadProgress = (progress.loaded / progress.total) * 100;
            });
          });

    }

    // IMAGE DOWNLOAD

    // IMAGE Gallery

    $scope.images = [];
    $http.get('http://www.wheee.eu/api/event_detail/get_images.php?event_id=' + eventID + '&image_limit=' + localStorage.getItem('userImagesLimit'))
      .success(function (response) {
        $scope.user_images_nr = response.total_images;
        $scope.user_image_limit = localStorage.getItem('userImagesLimit');
        angular.forEach(response.response, function (image) {
          $scope.images.push(image);
        });
      });

    $scope.photographer_images = [];
    $http.get('http://www.wheee.eu/api/event_detail/get_images.php?event_id=' + eventID + '&photographer_images=1&image_limit=' + localStorage.getItem('photographerImagesLimit'))
      .success(function (response) {
        $scope.photographer_images_nr = response.total_images;
        $scope.photographer_image_limit = localStorage.getItem('photographerImagesLimit');
        angular.forEach(response.response, function (image) {
          $scope.photographer_images.push(image);
        });
      });

    $scope.loadMoreUserImages = function() {
      $ionicLoading.show({
        template: 'Loading more images...'
      });

      new_limit = 18 + localStorage.getItem('userImagesLimit');

      localStorage.setItem('userImagesLimit', new_limit);
      location.reload();
    }

    $scope.loadMorePhotographerImages = function() {
      $ionicLoading.show({
        template: 'Loading more images...'
      });

      new_ph_limit = 18 + localStorage.getItem('photographerImagesLimit');

      localStorage.setItem('photographerImagesLimit', new_ph_limit);
      location.reload();
    }

    // IMAGE gallery

    $scope.scrollTo = function (target) {
      $location.hash(target);   //set the location hash
      var handle = $ionicScrollDelegate.$getByHandle('EventDetail');
      handle.anchorScroll(true);  // 'true' for animation
    };


    // DETELE comment

    $scope.deleteComment = function (commentID) {
      $ionicLoading.show({
        template: 'Deleteing comment...'
      });
      $http.get('http://www.wheee.eu/api/event_detail/delete_comment.php?comment_id=' + commentID)
        .success(function (response) {
          location.reload();
          $ionicLoading.hide();
        });
    }

    // DELETE COMMENT

    // GO TO Company page

    $scope.GoToCompanyPage = function (clientId) {
      localStorage.setItem("lastSearchedCompanyId", clientId);
      location.href = '#/app/company_page';
    }

    $scope.GoToCompanyProducts = function (clientId) {
      localStorage.setItem("lastSearchedCompanyIdForProduct", clientId);
      location.href = '#/app/products';
    }

    // GO TO Company page



    $scope.isLogged = localStorage.getItem("logged");

    $scope.saveComment = function (commentForm) {

      if (!$scope.isMessageAdded && commentForm.$$success.parse[0].$modelValue) {
        $ionicLoading.show({
          template: 'Adding comment...'
        });

        var message = commentForm.$$success.parse[0].$modelValue;
        $http.get('http://www.wheee.eu/api/event_detail/save_comment.php?event_id=' + eventID + '&user_id=' + $scope.isLogged + '&message=' + message)
          .success(function (response) {
            window.location.reload();
          });
        $scope.isMessageAdded = 1;
      }
    }

    $scope.getEvent = function () {

      if (localStorage.getItem("logged") > 0) {
        userID = localStorage.getItem("logged");
      }
      else {
        userID = 0;
      }

      $scope.eventData = [];
      $http.get('http://www.wheee.eu/api/event_search/events.php?event_id=' + eventID + '&user_id=' + userID)
        .success(function (response) {
          $scope.eventData.push({
            client_id: response.response[1].client_id,
            event_title: response.response[1].event_title,
            event_start_date: response.response[1].event_start_date,
            event_start_hour: response.response[1].event_start_hour,
            local_name: response.response[1].local_name,
            location: response.response[1].location,
            county: response.response[1].county,
            header_image: 'http://www.wheee.eu/upload/headers/' + response.response[1].header_image,
            is_active: response.response[1].is_active,
            is_past_event: response.response[1].is_past_event,
            bonus_points: response.response[1].bonus_points,
            total_visualizations: response.response[1].total_visualizations,
            new_visualizations: response.response[1].new_visualizations
          });
          if ($scope.eventData[0].is_past_event == 1) {
            $scope.backLink = '#/app/past_events';
            $scope.isPastEvent = 1;
          }
          else {
            $scope.backLink = '#/app/future_events';
          }
          $scope.eventDescription = $sce.trustAsHtml(response.response[1].description);

          $scope.totals = [];
          $http.get('http://www.wheee.eu/api/event_detail/get_applicants.php?event_id=' + eventID + '&type=count')
            .success(function (response) {
              $scope.totals.push({
                joined: response.response.total_joined,
                bookmarked: response.response.total_bookmark
              });        
            });

          $scope.applicantList = [];
          $http.get('http://www.wheee.eu/api/event_detail/get_applicants.php?event_id=' + eventID + '&type=limited')
            .success(function (response) {
              angular.forEach(response.response, function (applicants) {
                $scope.applicantList.push(applicants);
              });
            });

          $scope.applicantListNoLimit = [];
          $http.get('http://www.wheee.eu/api/event_detail/get_applicants.php?event_id=' + eventID + '&type=unlimited')
            .success(function (response) {
              angular.forEach(response.response, function (applicants) {
                $scope.applicantListNoLimit.push(applicants);
              });
            });

          if (!localStorage.getItem('isVisualizationAdded') || localStorage.getItem('isVisualizationAdded') == 0) {
            $http.get('http://www.wheee.eu/api/event_search/increase_visualization.php?event_id=' + eventID + '&new_visualizations=' + $scope.eventData[0].new_visualizations);
            localStorage.setItem('isVisualizationAdded', 1);
          }
        });

      $scope.comments = [];
      $http.get('http://www.wheee.eu/api/event_detail/get_comments.php?event_id=' + eventID + '&comment_limit=10')
        .success(function (response) {
          angular.forEach(response.response, function (comment) {
            $scope.comments.push(comment);
          });
        });

    };
    $scope.getEvent();



    if ($scope.isLogged) {
      $scope.eventStatus = [];
      $http.get('http://www.wheee.eu/api/event_search/get_event_status.php?event_id=' + eventID + '&user_id=' + $scope.isLogged)
        .success(function (response) {
          $scope.eventStatus.push({
            is_joined: response.response.is_joined,
            is_bookmarked: response.response.is_bookmarked
          });
        });
    }
    function sleep(milliseconds) {
      var start = new Date().getTime();
      for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
          break;
        }
      }
    }

    if(localStorage.getItem('isSoundMuted') == 0 || !localStorage.getItem('isSoundMuted')) {

      var audioWheee = new Audio('sound/wheee.wav');
      var audioOooh = new Audio('sound/oooh.wav');
      var audioDelete = new Audio('sound/delete.wav');
      var audioSave = new Audio('sound/save.wav');
    }

    $scope.playWheee = function () {

      if(localStorage.getItem('isSoundMuted') == 0 || !localStorage.getItem('isSoundMuted')) { 
        audioWheee.play();
        sleep(2000);
      }
      $scope.changeJoinedStatus();
    };

    $scope.playOooh = function () {

      if(localStorage.getItem('isSoundMuted') == 0 || !localStorage.getItem('isSoundMuted')) {
        audioOooh.play();
        sleep(3000);
      }
      $scope.changeJoinedStatus();
    };

    $scope.playSave = function () {

      if(localStorage.getItem('isSoundMuted') == 0 || !localStorage.getItem('isSoundMuted')) {
        audioSave.play();
        sleep(1000);
      }
      $scope.changeBookmarkedStatus();
    };

    $scope.playDelete = function () {
      if(localStorage.getItem('isSoundMuted') == 0 || !localStorage.getItem('isSoundMuted')) {
        audioDelete.play();
        sleep(1000);
      }
      $scope.changeBookmarkedStatus();
    };

    $scope.changeJoinedStatus = function () {

      if ($scope.isLogged > 0) {
        $ionicLoading.show({
          template: 'Saving...'
        });
        $http.post('http://www.wheee.eu/api/event_search/save_event_status.php?joined=1&event_id=' + eventID + '&user_id=' + localStorage.getItem("logged"))
          .success(function (response) {
            window.location.reload();
          });
      }
      else {
        $scope.openLoginModal();
      }
    }

    $scope.changeBookmarkedStatus = function () {

      if ($scope.isLogged > 0) {
        $ionicLoading.show({
          template: 'Saving...'
        });
        $http.post('http://www.wheee.eu/api/event_search/save_event_status.php?bookmark=1&event_id=' + eventID + '&user_id=' + localStorage.getItem("logged"))
          .success(function (response) {
            window.location.reload();
          });
      }
      else {
        $scope.openLoginModal();
      }
    }

    // SOCIAL SHARING

    $scope.prepareVariables = function () {
      message = "Wheee! Check out this event! It looks awesome!";
      subject = "Wheee! Look at this: " + $scope.eventData[0].event_title;
      image = $scope.eventData[0].header_image;
      link = 'http://www.wheee.eu/event.php?event_id=' + eventID;
    }


    $scope.shareViaExternalOptions = function () {
      $scope.prepareVariables();
      $cordovaSocialSharing.share(message, subject, image, link);
    }

    $scope.shareViaFacebook = function () {
      $scope.prepareVariables();
      $cordovaSocialSharing.canShareVia("facebook", message, image, link).then(function (result) {
        $cordovaSocialSharing.shareViaFacebook(message, image, link);
      }, function (error) {
        alert("Cannot share on Facebook, because there is no account attached to this device!");
      });
    }

    $scope.shareViaTwitter = function () {
      $scope.prepareVariables();
      $cordovaSocialSharing.canShareVia("twitter", message, image, link).then(function (result) {
        $cordovaSocialSharing.shareViaTwitter(message, image, link);
      }, function (error) {
        alert("Cannot share on Twitter, because there is no account attached to this device!");
      });
    }

    $scope.shareViaWhatsApp = function () {
      $scope.prepareVariables();
      $cordovaSocialSharing.canShareVia("whatsapp", message, image, link).then(function (result) {
        $cordovaSocialSharing.shareViaWhatsApp(message, image, link);
      }, function (error) {
        alert("Cannot share on WhatsApp, because there is no account attached to this device!");
      });
    }

    $scope.imageShareViaFacebook = function (isPhotographerImage, orderInGallery, image) {

      message = "Wheee!";
      subject = "Wheee!";
      
      if(isPhotographerImage == 1) {
        if($scope.images == '') {
          link = 'http://www.wheee.eu/event.php?event_id=' + eventID + '#&gid=1&pid=' + orderInGallery;
        }
        else {
          link = 'http://www.wheee.eu/event.php?event_id=' + eventID + '#&gid=2&pid=' + orderInGallery;
        }
      }
      else {
        link = 'http://www.wheee.eu/event.php?event_id=' + eventID + '#&gid=1&pid=' + orderInGallery;
      }

      $cordovaSocialSharing.canShareVia("facebook", message, image, link).then(function (result) {
        $cordovaSocialSharing.shareViaFacebook(message, image, link);
      }, function (error) {
        alert("Cannot share on Facebook, because there is no account attached to this device!");
      });
    }

    // SOCIAL SHARING

    $scope.openLoginModal = function () {
      $ionicModal.fromTemplateUrl('login-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    }

    $scope.closeModal = function () {
      $scope.modal.hide();
    };

    $scope.openShareModal = function () {
      $ionicModal.fromTemplateUrl('share-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    }

    $scope.openApplicantsModal = function () {
      $ionicModal.fromTemplateUrl('applicants-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    }

    $scope.openImageSettings = function (image_src, photoId, uploadedById, isPhotographerImage, orderInGallery, justImageName) {
      $scope.image_src = image_src;
      $scope.photoId = photoId;
      $scope.uploadedById = uploadedById;
      $scope.isPhotographerImage = isPhotographerImage;
      $scope.orderInGallery = orderInGallery;
      $scope.justImageName = justImageName;
      $ionicModal.fromTemplateUrl('image-settings-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    }

  })


  //------------***********--------------*********------------------------



  .controller('SearchEvents', function ($scope, $log) {
    //$log.info(EventDetail.getEvObject());
  })

  .controller('Events', function ($scope, $http, EventDetailFuture, $log) {
    //$log.info(EventDetail.getEvObject());
    $scope.newEvents = EventDetailFuture.getEvObject();
    //$log.info(EventDetail.getEvObject());
    //$log.info(showSearchedEvents);
  })

  .controller('NewEvents', function ($scope, $http, EventDetailFuture) {
    $scope.page = 0;
    $scope.total = 1;
    $scope.newEvents = [];
    $scope.getEvents = function () {
      $scope.page++;
      $http.get('http://www.wheee.eu/api/event_homepage/newest_events.php?location_id=37&limit=10')
        .success(function (response) {
          $scope.newNr = 310 * response.new_nr + 20 + 'px';
          angular.forEach(response.response, function (event) {
            $scope.newEvents.push(event);
          });
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }).error(function (err) {
          $scope.$broadcast('scroll.infiniteScrollComplete');
          console.log(err);
        });

    };
    $scope.getEvents();
    $scope.GoToDetails = function (eventId) {
      Event_Place = eventId;

      City = "";
      Event_PlaceName = "";
      localStorage.setItem('last_searchedEventId', eventId);

      localStorage.setItem('userImagesLimit', 9);
      localStorage.setItem('photographerImagesLimit', 9);

      location.href = '#/app/event_detail';

    }
  })


  ;
