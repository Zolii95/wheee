
var Country = "";
var City = "";
var Event_Place = "";
var CountryName = "";
var CityName = "";
var Event_PlaceName = "";
var searced_location;

angular.module('starter.controllers', ['ngOpenFB', 'ngMaterial'])


  .controller('AppCtrl', function ($scope, $ionicModal, $timeout, ngFB, $http) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});
    $scope.fbLogin = function () {
      ngFB.login({ scope: 'email' }).then(
        function (response) {
          if (response.status === 'connected') {

            $http.get('http://www.wheee.eu/api/user/get_user_id.php?email=tamas.bajnok@yahoo.co.uk')
              .success(function (response) {
                angular.forEach(response.response, function (user) {
                  localStorage.setItem("logged", user);
                });

                $scope.$broadcast('scroll.infiniteScrollComplete');
              }).error(function (err) {
                $scope.$broadcast('scroll.infiniteScrollComplete');
              });


          } else {
            alert('Facebook login failed');
          }
        });
    };
    // Form data for the login modal
    $scope.loginData = {};
    $scope.navTitle = '<img class="title-image" src="http://www.wheee.eu/assets/images/logo-160x160-10.png" />';

    //Menüpontok kilépő állapotban
    $scope.groupLO = [];
    $scope.groupLO[0] = {
      name: "Home",
      items: [],
      link: "#/app/home"
    };

    $scope.groupLO[1] = {
      name: "Search",
      items: [],
      link: ""
    };

    $scope.groupLO[2] = {
      name: "LogIn",
      items: [],
      link: "#/app/login"
    };
    //Lenyilo menü a Search-nek
    $scope.groupLO[1].items[0] = {
      name: "Future Events",
      link: "#/app/future_events"
    };
    $scope.groupLO[1].items[1] = {
      name: "Past Events",
      link: "#/app/past_events"
    };
    $scope.groupLO[1].items[2] = {
      name: "Companies",
      link: "#/app/companies"
    };

    //Menüpontok belépő állapotban
    $scope.groupLI = [];
    $scope.groupLI[0] = {
      name: "Home",
      items: [],
      link: "#/app/home"
    };

    $scope.groupLI[1] = {
      name: "Search",
      items: [],
      link: ""
    };

    $scope.groupLI[2] = {
      name: "My Profile",
      items: [],
      link: ""
    };

    $scope.groupLI[3] = {
      name: "Log Out",
      items: [],
      link: "logout()"
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
    $scope.groupLI[1].items[2] = {
      name: "Companies",
      link: "#/app/companies"
    };
    //Lenyilo menü a My Profile-hoz
    $scope.groupLI[2].items[0] = {
      name: "My dashboard",
      link: "#/app/my_dashboard"
    };
    $scope.groupLI[2].items[1] = {
      name: "Edit Profile",
      link: "#/app/edit_profile"
    };
    $scope.groupLI[2].items[2] = {
      name: "My applications",
      link: "#/app/my_applications"
    };
    $scope.groupLI[2].items[3] = {
      name: "My bookmarks",
      link: "#/app/my_bookmarks"
    };


    $scope.toggleGroup = function (group) {
      if ($scope.isGroupShown(group)) {
        $scope.shownGroup = null;
      } else {
        $scope.shownGroup = group;
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

  })

  //MyDashboard

  .controller('MyDashboardCtrl', function ($scope, $http) {

    $scope.getMyDashboard = function () {

      $scope.myDashboard = [];
      $http.get('http://www.wheee.eu/api/user/profile_datas.php?dashboard=1&id=' + localStorage.getItem("logged"))
        .success(function (response) {
          $scope.myDashboard.push({
            id: response.response[0].id,
            email: response.response[0].email,
            firstname: response.response[0].firstname,
            lastname: response.response[0].lastname,
            gender: response.response[0].gender,
            fb_picture: response.response[0].fb_picture,
            birth_year: response.response[0].birth_year,
            country: response.response[0].country,
            county: response.response[0].county,
            location: response.response[0].location,
            created_at: response.response[0].created_at,
            updated_at: response.response[0].updated_at,
          });
        })
    };
    $scope.getMyDashboard();

  })

  //Profile
  .controller('ProfileCtrl', function ($scope, $http) {

    $scope.saveData = function (user) {

      $http.post('http://www.wheee.eu/api/user/save_profile_datas.php?user_id=' + localStorage.getItem("logged")
        + '&firstname=' + user.firstname.$modelValue
        + '&lastname=' + user.lastname.$modelValue
        + '&gender=' + user.gender.$modelValue
        + '&newsletter=' + user.newsletter.$viewValue)
        .success(function (response) {
          console.log(user.newsletter.$viewValue);
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
  })

  .controller('autoCompleteController', function ($scope, $timeout, $log, $http, $q) {
    var self = this;
    self.showCity = false;
    self.showEvent = false;
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
      localStorage.setItem("last_searchedCountryName", CountryName);
      self.showCity = true;
    }
    function cityChange(item) {
      $log.info('Item changed to ' + JSON.stringify(item));
      City = item.id;
      CityName = item.value;
      localStorage.setItem("last_searchedCityId", City);
      localStorage.setItem("last_searchedCityName", CityName);
      self.showEvent = true;
    }
    function eventChange(item) {
      $log.info('Item changed to ' + JSON.stringify(item));
      Event_Place = item.id;
      Event_PlaceName = item.value;
    }

    String.prototype.replaceAt = function (index, character) {
      return this.substr(0, index) + character + this.substr(index + character.length);
    }

    //When clicked on search button
    $scope.search = function () {
      //$log.info('Search city: ' + City + ' Event pl: ' + Event_PlaceName + ' Country: ' + Country);
      $scope.searchedLocation = [];
      while (Event_PlaceName.indexOf(" ") != -1) {
        Event_PlaceName = Event_PlaceName.replaceAt(Event_PlaceName.indexOf(" "), "+");
      }

      $scope.getSearch = function () {
        $http.get("http://www.wheee.eu/api/event_search/events.php?last_searched_location=" + City + "&searched_local_name=" + Event_PlaceName + "&current_page=1")
          .success(function (response) {
            $log.info(response.response);
            if (response.response.length == 0) {
              $http.get("http://www.wheee.eu/api/event_search/events.php?event_id=" + Event_Place)
                .success(function (response2) {

                  searced_location = response2.response[Object.keys(response2.response)[0]];
                  $log.info(searced_location.county);
                  
                });
            }
            /*angular.forEach(response.response, function (event) {
              $scope.topEvents.push(event);*/
          });
        location.href = '#/app/event_detail';
      };

      $scope.getSearch();
      /*starter.controllers.factory('EventService', function () {
                    return {
                      name: searced_location.name
                    };
                  });*/
    };



    //filter function for search query
    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(state) {
        return (state.value.indexOf(lowercaseQuery) === 0);
      };
    }
  })

  .controller('DetailPage', function($scope, $log){
    $log.info("ServiceTest: " + searced_location);
  })

  .controller('NewEvents', function ($scope, $http) {
    $scope.page = 0;
    $scope.total = 1;
    $scope.newEvents = [];
    $scope.getEvents = function () {
      $scope.page++;
      $http.get('http://www.wheee.eu/api/event_homepage/newest_events.php?location_id=37&limit=5')
        .success(function (response) {
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
  });

/**
http://www.wheee.eu/api/event_homepage/newest_events.php?location_id=37&limit=5

Default : http://www.wheee.eu/assets/images/headers/default.jpg

http://www.wheee.eu/api/event_homepage/slider.php?location_id=37 //home slider (ha nincs ebbe a locationbe akkor null ebben az esetben default header kell)

http://www.wheee.eu/api/event_search/events.php?last_searched_location=37&current_page=1
*/