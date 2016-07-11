var cassandraVis = angular.module('cassandraVis', ['cassandraVis.services', 'ui.bootstrap.datetimepicker', 'ui.dateTimeInput', 'ngRoute']);
var services = angular.module('cassandraVis.services', []);
services.factory('dataService', ["$http", function ($http) {
    function DataService() {

        // Data Initialisation
        var data = [];
        var apartmentsIDs = [];
        var numDataPoints = 60;
        var maxNumber = 200;

        //Random Number Generator
        function randomNumber() {
            return Math.floor((Math.random() * maxNumber) + 1);
        }


        //TODO:RUSTAM write 
        function sendRequest(outParams, callback) {
            $http.get('/api/getcassandradata/' + outParams).success(function (cassandradata) {
                for (var row = 0; row < cassandradata.rows.length; row++) {
                    //                                console.log("pushing new data: " + cassandradata.rows[row].ts + " " + cassandradata.rows[row].value);
                    data.push({
                        "x": new Date(cassandradata.rows[row].ts),
                        "data1": cassandradata.rows[row].value
                    });
                }
                callback(data);
            }).error(function (cassandradata) {
                console.log('Error: ' + data);
            });
        }

        // Function used to fetch data from cassandra. Data is stored in data service so that it can be easilly access later from different controllers.
        this.getDataCassandra = function (params, callback) {
            data = [];
            //split the request sting on ',' in order to know if we need to fetch one or two apartments.
            var inParams = params.split(',');
            var numApartments = inParams[0];

            // Baed on the number of apartments chosen to show we act differently.
            // In case there is only one apartment chosen, just send request to node once. 
            switch (numApartments) {
                case "1":
                    var outParams = inParams[1] + ',' + inParams[2] + ',' + inParams[3] + "," + inParams[4];
                    sendRequest(outParams, callback);

                    break;
                case "2":
                    // In case if 2 apartments are chosen, we have to first fetch the data, create dataset. On completion second request need to be sent and the data returned should be appended to the previosly created dataset. PS this a very bad (in terms of code beauty and scalability) way of doing this. However, this was my "quick fix" since the javascript performs function calls asynchroniously. Apparently, external library is requited to control the flow of the program.
                    // TODO: Fix this part of code to be more easily etendable for greater number of apartmets.
                    var outParams = inParams[1] + ',' + inParams[3] + ',' + inParams[4] + "," + inParams[5];
                    //                     console.log("Out parameters " + outParams);
                    $http.get('/api/getcassandradata/' + outParams).success(function (cassandradata) {

                        // from the elemetns received from the server, create a dataset which is usable by chart system.
                        for (var row = 0; row < cassandradata.rows.length; row++) {
                            data.push({
                                "x": new Date(cassandradata.rows[row].ts),
                                "data1": cassandradata.rows[row].value
                            });
                        }

                        var outParams = inParams[2] + ',' + inParams[3] + ',' + inParams[4] + "," + inParams[5];
                        // Make another http request to get get second apartments' data. And then push it into the existing dataset.
                        $http.get('/api/getcassandradata/' + outParams).success(function (cassandradata) {
                            //
                            for (var row = 0; row < cassandradata.rows.length; row++) {
                                data[row]["data2"] = cassandradata.rows[row].value;
                            }
                            callback(data);
                        }).error(function (cassandradata) {
                            console.log('Error: ' + data);
                        });

                    }).error(function (cassandradata) {
                        console.log('Error: ' + data);
                    });
                    break;
                default:
            }
        }

        // Gets IDs of apartments available in database and puts them into the container. 
        this.getApartmentsIDs = function (callback) {
            $http.get('/api/getapartmentsids').success(function (apartments) {
                for (var row = 0; row < apartments.rows.length; row++) {
                    apartmentsIDs.push(apartments.rows[row].id);
                }
                callback(apartmentsIDs);
            });

        }

    }


    return new DataService();
}]);


function mainController($scope, $http) {

}

function ntos(n) {
    return n > 9 ? "" + n : "0" + n;
}

cassandraVis.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'partials/home.html'
        })
        .when('/login', {
            templateUrl: 'partials/login.html',
            controller: 'loginController'
        })
        .when('/logout', {
            controller: 'logoutController'
        })
        .when('/register', {
            templateUrl: 'partials/register.html',
            controller: 'registerController'
        })
        .when('/one', {
            template: '<h1>This is page one!</h1>'
        })
        .when('/two', {
            template: '<h1>This is page two!</h1>'
        })
        .otherwise({
            redirectTo: '/'
        });
});


cassandraVis.controller('MainController', ['$scope', '$interval', '$http', '$timeout', 'dataService', function ($scope, $interval, $http, $timeout, dataService) {

    //String declarations used in all the html pages. Makes it easier to modify all the data at once

    $scope.COMPANYNAME = "Power2U";
    $scope.USERNAME = "Rustam";
    $scope.VIEW1 = "Consumption";
    $scope.VIEW2 = "PV Production";
    $scope.VIEW3 = "EV";
    $scope.VIEW4 = "Coins";
    $scope.GRAPHTYPE = $scope.VIEW1;



    //Set the default (initial) dates for the calendar
    $scope.data = {};
    $scope.data.dateDropDownInputFrom = new Date("December 30, 2014 11:13:00");
    $scope.data.dateDropDownInputTo = new Date("December 30, 2015 11:13:00");
    // Configuring C3 Chart defaults. For further infor -> C3 Manual



    $scope.chart = null;
    $scope.config = {};

    $scope.config.data = []

    $scope.numApartmentOptions = [1, 2]; // Controls what Apartments choices we may have. Fixed on 2 in order to avoid occlusion of lines 
    $scope.numApartments = 1; // default value
    $scope.viewModeOptions = ["monthly", "weekly", "daily"]; // choice of the view modes for the graph. Currently implemented Monthly and Daily. Weekly database is not yet created. 
    $scope.viewMode = "monthly"; // default value
    $scope.typeOptions = ["line", "bar", "spline", "step", "area", "area-step", "area-spline"]; //Choice of graph view. Currently fixed on on 'spline' and the functioanality is hidden in order to not overwhelm users with configurations.

    $scope.config.type1 = "spline"; //default value for data 1
    $scope.config.type2 = "spline"; //default value for data 2

    $scope.config.keys = {
        "x": "x",
        "value": ["data1", "data2"]
    };

    $scope.keepLoading = true;


    // Fetching apartments from database.  
    dataService.getApartmentsIDs(function (apartmentsIDs) {
        $scope.apartmentOptions = apartmentsIDs;
        $scope.apartmentChoice1 = $scope.apartmentOptions[0]; // Default aparment to be displayed when apartments are fetched for view 1
        $scope.apartmentChoice2 = $scope.apartmentOptions[1]; // Default aparment to be displayed when apartments are fetched for view 2
    });

    //Calendar function. Required to set default value. Before CALENDAR Render
    $scope.beforeRender = function ($view, $dates, $leftDate, $upDate, $rightDate) {
        var index = Math.floor(Math.random() * $dates.length);
        $dates[index].selectable = false;
        $scope.data = {};
        $scope.data.dateDropDownInputFrom = new Date("December 30, 2014 11:13:00");
        $scope.data.dateDropDownInputTo = new Date("December 30, 2015 11:13:00");
    }


    //Funciton to dislay graph using C3 library.
    $scope.showGraph = function () {

        var config = {};
        config.bindto = '#chart'; //defines to which DOM element to bind to
        config.data = {};
        config.data.keys = $scope.config.keys;
        config.data.json = $scope.config.data;

        //Effect to focus on one of the data elements on the graph.
        config.data.onmouseover = function (d) {
            chart.focus(d);
        }

        // Configure the X axis based on view mode which is selected. In our case we use TimeSeries.
        config.axis = {};
        switch ($scope.viewMode) {

            case "monthly":
                config.axis.x = {
                    "type": "timeseries",
                    "tick": {
                        count: 12, // maximum number of ticks is known - 12
                        format: '%Y-%m' // YYYY-MM
                    }
                };
                break;

            case "daily":
                config.axis.x = {
                    "type": "timeseries",
                    "tick": {
                        culling: {},
                        format: '%Y-%m-%d' //YYYY-MM-DD
                    }
                };
                break;
            default:
        }


        //Configure Y-axis 
        config.axis.y = {
            "label": {
                "text": "KW/h",
                "position": "outer-middle"
            }
        };

        // Disabled for the moment. Leaving here to if required could easitly be anabled from HTML
        config.data.types = {
            "data1": $scope.config.type1,
            "data2": $scope.config.type2
        }; // Type of graph used for dataset

        config.zoom = {
            enabled: "true", // Enable zoom
            rescale: "false" //Do not rescale Y axis while zooming.
        };


        config.subchart = {
            show: "false"
        }
        config.color = {
                pattern: ['#ff7f0e', '#1f77b4', '#2ca02c']
            } // color patters for each data element in graph. Same order as in keys.values

        // call to initiate C3 instance
        $scope.chart = c3.generate(config);
    }


    $scope.startLoading = function () {
        $scope.keepLoading = true; // will be used in the future for real time graph fetching.

        //Get The input from DateTimePicker - calendar
        $scope.dateFrom = $scope.data.dateDropDownInputFrom.getFullYear() + "-" + ntos($scope.data.dateDropDownInputFrom.getMonth()) + "-" + ntos($scope.data.dateDropDownInputFrom.getDate());
        $scope.dateTo = $scope.data.dateDropDownInputTo.getFullYear() + "-" + ntos($scope.data.dateDropDownInputTo.getMonth()) + "-" + ntos($scope.data.dateDropDownInputTo.getDate());

        // call to data loader
        $scope.loadNewDataC();


    }

    $scope.stopLoading = function () {
        $scope.keepLoading = false;

    }

    $scope.selectNumApartments = function (num) {

        $scope.numApartments = num;
        console.log($scope.numApartments);
    }
    $scope.selectViewMode = function (mode) {
        if (mode != "weekly") {
            $scope.viewMode = mode;
            $scope.loadNewDataC();
        } else {
            console.log("Weekly is not working yet");
        }
    }

    $scope.loadNewDataC = function () {

        //TODO: Make sure you dont need this
        //$scope.showGraph();

        // Chose what HTTP request will be sent to Node.js. Request is encoded into the url. It is laer parsed and split into parameters on ',' symbol. Number of Apartments to show + Aparatment IDs + View Mode (Monthly, weekly, daily...) + From Date + To Date
        switch ($scope.numApartments) {
            case 1:
                var params = $scope.numApartments + "," + $scope.apartmentChoice1 + ",";
                break;
            case 2:
                var params = $scope.numApartments + "," + $scope.apartmentChoice1 + "," + $scope.apartmentChoice2 + ",";
                break;
            default:
                console.log("Choose correct number of apartments");
        }

        params += $scope.viewMode + "," + $scope.dateFrom + "," + $scope.dateTo;


        dataService.getDataCassandra(params, function (newData) {
            var data = {};
            data.keys = $scope.config.keys;
            data.json = newData;
            //                    data.types = {};
            //data.types[$scope.apartmentChoice1] = $scope.config.type1;
            //data.types[$scope.apartmentChoice2] = $scope.config.type2;
            data.types = {
                "data1": $scope.config.type1,
                "data2": $scope.config.type2
            };
            $scope.chart.load(data);
        });

        $scope.stopLoading();
    }

    //    $scope.selectTimeInterval = function () {
    //        //console.log("Date: " + $scope.data.dateDropDownInputFrom);
    //        //var res = $scope.data.dateDropDownInputFrom.split(" ");
    //        console.log("Date to: " + $scope.dateTo);
    //    }

    // Function to replicate setInterval using $timeout service.
    $scope.intervalFunction = function () {
        $timeout(function () {
            // $scope.getData();
            $scope.intervalFunction();
        }, 3000);
    };

    $scope.sleep = function (miliseconds) {
            var currentTime = new Date().getTime();
            while (currentTime + miliseconds >= new Date().getTime()) {}
        }
        //used to pause the thread for 3 seconds. should be used when loading graph in real time.
    $scope.intervalFunction();




    //drawChart($scope.temperatureData);
}]);







//$interval(function() {
//       var hour = $scope.temperatureData.length + 1;
//        var temperature = Math.round(Math.random() * 100);
//       $scope.temperatureData.push({
//           hour: hour,
//            temperature: temperature
//        });
//      
//        /* ---------- This is approxmatealy how the data will be fetched from the server ---------
//	if (counter > 99) counter = 0;
//	$http.get('/api/temperatures')
//		.success(function(data) {
//			console.log(data[counter]);
//			$scope.temperatureData.push({hour:data[counter].hour, temperature:data[counter].value});
//		})
//		.error(function(data) {
//			console.log('Error: ' + data);
//		});
//	*/
//    }, 200, 10);

//    $interval(function() {
//         $scope.drawChart();
//    }, 3000, 10);
