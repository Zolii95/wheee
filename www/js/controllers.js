
var Country = "";
var City = "";
var Event_Place = "";

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
    // Create the login modal that we will use later
    /*$ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
      $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function () {
      $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
      console.log('Doing login', $scope.loginData);

      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $timeout(function () {
        $scope.closeLogin();
      }, 1000);
    };*/

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


  //Profile
  .controller('ProfileCtrl', function ($scope, $http) {

    $scope.signIn = function (form) {
      
    };
    $scope.userData = [];
    $scope.getUser = function () {
      $http.get('http://www.wheee.eu/api/user/profile_datas.php?id=' + localStorage.getItem("logged"))
        .success(function (response) {
          // angular.forEach(response.response, function (user) {
          //   $scope.userData.push(user);
          //   console.log(user);
          // });
          $scope.userData.push({
            id: response.response[0].id,
            email: response.response[0].email,
            firstname: response.response[0].firstname,
            lastname: response.response[0].lastname,
            gender: response.response[0].gender,
            fb_picture: response.response[0].fb_picture,
            newsletter: response.response[0].newsletter
          });
          //console.log(response.response[0].id);
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

  .controller('autoCompleteController', function ($timeout, $log, $http, $q) {
    var self = this;
    self.showCity = false;
    self.showEvent = false;
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
      self.showCity = true;
    }
    function cityChange(item) {
      $log.info('Item changed to ' + JSON.stringify(item));
      City = item.id;
      self.showEvent = true;
    }
    function eventChange(item) {
      $log.info('Item changed to ' + JSON.stringify(item));
      Event_Place = item.id;
    }

    //build list of states as map of key-value pairs

    //filter function for search query
    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(state) {
        return (state.value.indexOf(lowercaseQuery) === 0);
      };
    }
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