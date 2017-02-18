
var Country = "";
var City = "";
var Event_Place = "";
var CountryName = "";
var CityName = "";
var Event_PlaceName = "";
var searched_location = {};
var PastEvents = 0;

angular.module('starter.controllers', ['ngOpenFB', 'ngMaterial', 'ngCordova'])

  .factory('EventDetail', function () {

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

  .controller('AppCtrl', function ($scope, $ionicModal, $timeout, ngFB, $http, $state, $q, $ionicLoading, $ionicSideMenuDelegate) {
    $scope.logged = localStorage.getItem("logged");

    if ($scope.logged && $scope.logged > 0 && $state.current.name == 'app.welcome') {
      $state.go('app.home');
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
      console.log($state.current.name);
      // FOR BROWSER LOGIN

      localStorage.setItem("logged", 1);
      $scope.logged = localStorage.getItem("logged");
      if ($state.current.name != 'app.event_detail') {
        $state.go('app.home');
      }
      else {
        location.reload();
      }

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

                $http.get('http://www.wheee.eu/api/user/get_user_id.php?email=' + profileInfo.email +
                  '&first_name=' + profileInfo.first_name +
                  '&last_name=' + profileInfo.last_name +
                  '&gender=' + profileInfo.gender +
                  '&age=' + profileInfo.age_range.min +
                  '&link=' + profileInfo.link +
                  '&picture=http://graph.facebook.com/' + success.authResponse.userID + '/picture?type=large' +
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
      name: "My dashboard",
      link: "#/app/my_dashboard",
    };
    $scope.groupLI[2].items[1] = {
      name: "My applications",
      link: "#/app/my_applications",
    };
    $scope.groupLI[2].items[2] = {
      name: "My bookmarks",
      link: "#/app/my_bookmarks",
    };
    $scope.groupLI[2].items[3] = {
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
      var link2;
      var EventDetails = {};

      link2 = "http://www.wheee.eu/api/event_search/events.php?event_id=" + Event_Place;


      $http.get(link2)
        .success(function (response2) {
          EventDetails = response2.response[Object.keys(response2.response)[0]];
          EventDetail.setEvObject(EventDetails);
          City = "";
          Event_PlaceName = "";
          localStorage.setItem('last_searchedEventId', eventId);
          location.href = '#/app/event_detail';
        })

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
      var link2;
      var EventDetails = {};

      link2 = "http://www.wheee.eu/api/event_search/events.php?event_id=" + Event_Place;


      $http.get(link2)
        .success(function (response2) {
          EventDetails = response2.response[Object.keys(response2.response)[0]];
          EventDetail.setEvObject(EventDetails);
          City = "";
          Event_PlaceName = "";
          localStorage.setItem('last_searchedEventId', eventId);
          location.href = '#/app/event_detail';
        })
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
          if ($scope.companyData[0].premium_profile < 1) {
            $scope.companyData[0].premium_header = '';
          }
          $scope.companyDescription = $sce.trustAsHtml(response.response[0].description);
        })
    };
    $scope.getCompanyData();

  })

  // Company page

  //Profile
  .controller('ProfileCtrl', function ($scope, $http) {

    $scope.saveData = function (user) {

      $http.post('http://www.wheee.eu/api/user/save_profile_datas.php?user_id=' + localStorage.getItem("logged")
        + '&firstname=' + user.firstname.$modelValue
        + '&lastname=' + user.lastname.$modelValue
        + '&gender=' + user.gender.$modelValue
        + '&newsletter=' + user.newsletter.$viewValue)
        .success(function (response) {
          window.location.reload();
        });
    };

    $scope.signIn = function (form) {

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
            newsletter: response.response[0].newsletter
          });
        });
    };
    $scope.getUser();
  })


  .controller('TopEvents', function ($scope, $http, EventDetail) {

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

      var link2;
      var EventDetails = {};

      link2 = "http://www.wheee.eu/api/event_search/events.php?event_id=" + Event_Place;


      $http.get(link2)
        .success(function (response2) {
          EventDetails = response2.response[Object.keys(response2.response)[0]];
          EventDetail.setEvObject(EventDetails);
          City = "";
          Event_PlaceName = "";
          localStorage.setItem('last_searchedEventId', eventId);
          location.href = '#/app/event_detail';
        })



    }
  })

  .controller('autoCompleteControllerPast', function ($scope, $timeout, $log, $http, $q, EventDetail) {
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
              display: state.local_name
            }

          });
          var tmp2 = response.data.response.title.map(function (state) {
            return {
              id: state.id,
              value: state.title.toLowerCase(),
              display: state.title
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
      Event_Place = item.id;
      Event_PlaceName = item.value;
      localStorage.setItem("last_searchedPastEventId", Event_Place);
      // localStorage.setItem("last_searchedPastEventName", item.display);
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
      self.pastEvents = EventDetail.getEvObject();
      var EventDetails = {};
      var link = "";
      if (Event_PlaceName == "") {
        link = "http://www.wheee.eu/api/event_search/events.php?past_events=1&last_searched_location=" + City + "&current_page=1";
      } else {
        link = "http://www.wheee.eu/api/event_search/events.php?past_events=1&last_searched_location=" + City + "&searched_local_name=" + Event_PlaceName + "&current_page=1";

      }

      $http.get(link)
        .success(function (response) {
          if (response.response.length < 2) {
            $http.get("http://www.wheee.eu/api/event_search/events.php?past_events=1&event_id=" + Event_Place)
              .success(function (response2) {
                EventDetails = response2.response[Object.keys(response2.response)[0]];
                EventDetail.setEvObject(EventDetails);
                location.href = '#/app/event_detail';
              })
          } else {
            EventDetail.setEvObject(response.response);
            self.pastEvents = EventDetail.getEvObject();
            $log.info(self.pastEvents);
          }
        })
    };

    $scope.GoToDetails = function (eventId) {
      Event_Place = eventId;

      var link2;
      var EventDetails = {};

      link2 = "http://www.wheee.eu/api/event_search/events.php?event_id=" + Event_Place;


      $http.get(link2)
        .success(function (response2) {
          EventDetails = response2.response[Object.keys(response2.response)[0]];
          EventDetail.setEvObject(EventDetails);
          City = "";
          Event_PlaceName = "";
          localStorage.setItem('last_searchedPastEventId', eventId);
          localStorage.setItem('isPastSearch', 1);
          location.href = '#/app/event_detail';
        })

    }

    //filter function for search query
    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(state) {
        return (state.value.indexOf(lowercaseQuery) === 0);
      };
    }
  })

  .controller('autoCompleteController', function ($scope, $timeout, $log, $http, $q, EventDetail) {
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

    //http://www.wheee.eu/api/event_search/events.php?event_id=37

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
              display: state.local_name
            }

          });
          var tmp2 = response.data.response.title.map(function (state) {
            return {
              id: state.id,
              value: state.title.toLowerCase(),
              display: state.title
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
      Event_Place = item.id;
      Event_PlaceName = item.value;
      localStorage.setItem("last_searchedEventId", Event_Place);
      while (Event_PlaceName.indexOf(" ") != -1) {
        Event_PlaceName = Event_PlaceName.replaceAt(Event_PlaceName.indexOf(" "), "+");
      }
    }

    String.prototype.replaceAt = function (index, character) {
      return this.substr(0, index) + character + this.substr(index + character.length);
    }
    //////////////////// HA VÁROSRA KERESÜNK ÉS CSAK EGY TALÁLAT VAN, AKKOR A HELY NEVÉT EL KELL MENTENI Event_PlaceName-BE
    //When clicked on search button
    $scope.search = function () {
      PastEvents = 0;
      self.newEvents = EventDetail.getEvObject();
      var EventDetails = {};

      var link = "";
      if (Event_PlaceName == "") {
        link = "http://www.wheee.eu/api/event_search/events.php?last_searched_location=" + City + "&current_page=1";
      } else {
        link = "http://www.wheee.eu/api/event_search/events.php?last_searched_location=" + City + "&searched_local_name=" + Event_PlaceName + "&current_page=1";

      }

      $http.get(link)
        .success(function (response) {
          if (response.response.length == 0) {
            link2 = "http://www.wheee.eu/api/event_search/events.php?event_id=" + Event_Place;
            $http.get(link2)
              .success(function (response2) {
                EventDetails = response2.response[Object.keys(response2.response)[0]];
                EventDetail.setEvObject(EventDetails);
                //localStorage.setItem('last_searchedEventId', eventId);
                location.href = '#/app/event_detail';
              })

          } else {
            EventDetail.setEvObject(response.response);
            self.newEvents = EventDetail.getEvObject();
            $log.info(self.newEvents);
            location.href = '#/app/future_events';
          }
        })

    };

    self.newEvents = {};
    $scope.searchFuture = function () {
      PastEvents = 0;
      self.newEvents = EventDetail.getEvObject();
      var EventDetails = {};

      var link = "";
      if (Event_PlaceName == "") {
        link = "http://www.wheee.eu/api/event_search/events.php?last_searched_location=" + City + "&current_page=1";
      } else {
        link = "http://www.wheee.eu/api/event_search/events.php?last_searched_location=" + City + "&searched_local_name=" + Event_PlaceName + "&current_page=1";

      }

      $http.get(link)
        .success(function (response) {
          if (response.response.length == 0) {
            link2 = "http://www.wheee.eu/api/event_search/events.php?event_id=" + Event_Place;
            $http.get(link2)
              .success(function (response2) {
                EventDetails = response2.response[Object.keys(response2.response)[0]];
                EventDetail.setEvObject(EventDetails);
                //localStorage.setItem('last_searchedEventId', eventId);
                location.href = '#/app/event_detail';
              })

          } else {
            EventDetail.setEvObject(response.response);
            self.newEvents = EventDetail.getEvObject();

            $log.info(self.newEvents);
          }
        })
    };


    $scope.GoToDetails = function (eventId) {
      Event_Place = eventId;
      var link2;
      var EventDetails = {};

      link2 = "http://www.wheee.eu/api/event_search/events.php?event_id=" + Event_Place;


      $http.get(link2)
        .success(function (response2) {
          EventDetails = response2.response[Object.keys(response2.response)[0]];
          EventDetail.setEvObject(EventDetails);
          City = "";
          Event_PlaceName = "";
          localStorage.setItem('last_searchedEventId', eventId);
          location.href = '#/app/event_detail';
        })
    }



    //filter function for search query
    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(state) {
        return (state.value.indexOf(lowercaseQuery) === 0);
      };
    }
  })

  .controller('DetailPage', function ($scope, $ionicScrollDelegate, $location, $log, $http, $sce, $ionicModal, $state, EventDetail, $cordovaCamera, $cordovaFile, $cordovaFileTransfer, $cordovaDevice, $ionicLoading, $cordovaActionSheet, $ionicPlatform) {
    var EventDetails = EventDetail.getEvObject();

    $log.info(EventDetails);
    $ionicLoading.show({
      template: 'Loading...'
    });

    $ionicPlatform.ready(function () {
      $ionicLoading.hide();
    });

    $scope.isLogged = localStorage.getItem("logged");

    if (EventDetails.id) {
      var eventID = EventDetails.id;
    }
    else if (localStorage.getItem('last_searchedPastEventId') && localStorage.getItem('isPastSearch') == 1) {
      var eventID = localStorage.getItem('last_searchedPastEventId');
      localStorage.setItem('isPastSearch', 0);
    }
    else if (localStorage.getItem('last_searchedEventId')) {
      var eventID = localStorage.getItem('last_searchedEventId');
    }
    else {
      location.href = '#/app/future_events';
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
      var url = "http://www.wheee.eu/api/event_detail/save_image.php";

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
        template: 'Deleteing photo...'
      });
      $http.get('http://www.wheee.eu/api/event_detail/delete_image.php?image_id=' + photoId)
        .success(function (response) {
          location.reload();
        });
    }

    // IMAGE DELETE

    // IMAGE Gallery

    $scope.images = [];
    $http.get('http://www.wheee.eu/api/event_detail/get_images.php?event_id=' + eventID + '&image_limit=10')
      .success(function (response) {
        angular.forEach(response.response, function (image) {
          $scope.images.push(image);
        });
      });

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
      $scope.eventData = [];
      $http.get('http://www.wheee.eu/api/event_search/events.php?event_id=' + eventID)
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
            is_active: response.response[1].is_active
          });
          $scope.eventDescription = $sce.trustAsHtml(response.response[1].description);
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

    // $scope.shareViaFacebook = function() {
    //   var message = 'Test';
    //   var logo = 'test';
    //   var url = 'http://test.com'
    //     $cordovaSocialSharing.canShareVia("facebook", message, logo, url).then(function(result) {
    //         $cordovaSocialSharing.shareViaFacebook(message, logo, url);
    //     }, function(error) {
    //         alert(error)
    //     });
    // }

    $scope.openLoginModal = function () {
      $ionicModal.fromTemplateUrl('login-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    }

    $scope.closeLoginModal = function () {
      $scope.modal.hide();
    };
    // Cleanup the modal when we're done with it!
    // $scope.$on('$destroy', function() {
    //   $scope.modal.remove();
    // });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function () {
      // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
      // Execute action
    });


  })


  //------------***********--------------*********------------------------

  //$state.reload();


  .controller('SearchEvents', function ($scope, $log, EventDetail) {
    $log.info(EventDetail.getEvObject());
  })

  .controller('Events', function ($scope, $http, EventDetail, $log) {
    //$log.info(EventDetail.getEvObject());
    $scope.newEvents = EventDetail.getEvObject();
    //$log.info(EventDetail.getEvObject());
    //$log.info(showSearchedEvents);
  })

  .controller('NewEvents', function ($scope, $http, EventDetail) {
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
      var link2;
      var EventDetails = {};

      link2 = "http://www.wheee.eu/api/event_search/events.php?event_id=" + Event_Place;


      $http.get(link2)
        .success(function (response2) {
          EventDetails = response2.response[Object.keys(response2.response)[0]];
          EventDetail.setEvObject(EventDetails);
          City = "";
          Event_PlaceName = "";
          localStorage.setItem('last_searchedEventId', eventId);
          location.href = '#/app/event_detail';
        })
    }
  })


  ;




/**
http://www.wheee.eu/api/event_homepage/newest_events.php?location_id=37&limit=5

Default : http://www.wheee.eu/assets/images/headers/default.jpg

http://www.wheee.eu/api/event_homepage/slider.php?location_id=37 //home slider (ha nincs ebbe a locationbe akkor null ebben az esetben default header kell)

http://www.wheee.eu/api/event_search/events.php?last_searched_location=37&current_page=1
*/