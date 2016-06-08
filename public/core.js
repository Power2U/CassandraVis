var cassandraVis = angular.module('cassandraVis', ['cassandraVis.services']);
var services = angular.module('cassandraVis.services', []);
services.factory('dataService', ["$http", function($http) {
    function DataService() {
        var data = [];
        var apartmentsIDs = [];
        var numDataPoints = 60;
        var maxNumber = 200;
      
        this.loadData = function(callback) {
            if (data.length > numDataPoints) {
                data.shift();
            }
            data.push({"x":new Date(),"data1":randomNumber(),"data2":randomNumber()});
            callback(data);
        };
        
 
        function randomNumber() {
            return Math.floor((Math.random() * maxNumber) + 1);
        }
        
        
        this.getDataCassandra = function (params, callback) {
            data = [];
            var inParams = params.split(',');
            var numApartments = inParams[0];
   
            
            
            //console.log(params);
        
            var outParams = inParams[1];
            for(var i = 2; i < inParams.length; i++){
                outParams += "," + inParams[i];
            }
            
   
            //console.log("Number of apartments: " + numApartments);
            switch(numApartments){
                case "1":
                    outParams = inParams[1] + ',' + inParams[2];
                    //console.log("Out parameters " + outParams);
                      $http.get('/api/getcassandradata/' + outParams).success(function(cassandradata) {
                            for(var row = 0; row < cassandradata.rows.length; row++ ){
//                                console.log("pushing new data: " + cassandradata.rows[row].ts + " " + cassandradata.rows[row].value);
                                data.push({"x":new Date(cassandradata.rows[row].ts),"data1":cassandradata.rows[row].value});
                            }
                            callback(data);
                        }).error(function(cassandradata) {
                            console.log('Error: ' + data);
                        });
                    break;
                case "2":
//                    console.log("Working with 2 apartments");
                    outParams = inParams[1] + ',' + inParams[3];
//                     console.log("Out parameters " + outParams);
                      $http.get('/api/getcassandradata/' + outParams).success(function(cassandradata) {
                            for(var row = 0; row < cassandradata.rows.length; row++ ){
//                                console.log("pushing new data: " + cassandradata.rows[row].ts + " " + cassandradata.rows[row].value);
                                data.push({"x":new Date(cassandradata.rows[row].ts),"data1":cassandradata.rows[row].value});
                            }
                          
                          outParams = inParams[2] + ',' + inParams[3];
                            $http.get('/api/getcassandradata/' + outParams).success(function(cassandradata) {
                                    for(var row = 0; row < cassandradata.rows.length; row++ ){
        //                                console.log("pushing new data: " + cassandradata.rows[row].ts + " " + cassandradata.rows[row].value);
                                        data[row]["data2"] = cassandradata.rows[row].value;
                                    }
                                    callback(data);
                                }).error(function(cassandradata) {
                                    console.log('Error: ' + data);
                                });
                          
                        }).error(function(cassandradata) {
                            console.log('Error: ' + data);
                        });
                    break;
                default:
            }
            
          
    }
        
        this.getApartmentsIDs = function (callback) {
            
           // console.log("we are here. so its okay")
         $http.get('/api/getapartmentsids').success(function(apartments) {
                for(var row = 0; row < apartments.rows.length; row++ ){
                    apartmentsIDs.push(apartments.rows[row].id);  
                }
             callback(apartmentsIDs);
         });
       
    }
        
    }
    
 
    return new DataService();
}]);


function mainController($scope, $http) {
    $scope.formData = {};
    // when landing on the page, get all todos and show them
    $http.get('/api/todos')
        .success(function(data) {
            $scope.todos = data;
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });

    // when submitting the add form, send the text to the node API
    $scope.createTodo = function() {
        $http.post('/api/todos', $scope.formData)
            .success(function(data) {
                $scope.formData = {}; // clear the form so our user is ready to enter another
                $scope.todos = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

    // delete a todo after checking it
    $scope.deleteTodo = function(id) {
        $http.delete('/api/todos/' + id)
            .success(function(data) {
                $scope.todos = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

}

cassandraVis.controller('TemperatureController', ['$scope', '$interval', '$http', '$timeout','dataService', function($scope, $interval, $http, $timeout, dataService) {
    
    //String declarations
    
    $scope.COMPANYNAME = "Power2U";
    $scope.USERNAME = "Rustam";
    $scope.VIEW1 = "Consumption";
    $scope.VIEW2 = "PV Production";
    $scope.VIEW3 = "EV";
    $scope.VIEW4 = "Coins";
    $scope.GRAPHTYPE = $scope.VIEW1;
    
    
    $scope.chart = null;
    $scope.config={};
 

    $scope.config.data=[]
    
    $scope.numApartmentOptions = [1,2];
    $scope.numApartments = 1; // default value
    $scope.viewModeOptions = ["monthly", "weekly", "daily"];
    $scope.viewMode = "monthly";
    $scope.typeOptions=["line","bar","spline","step","area","area-step","area-spline"];
                        
    $scope.config.type1="area-spline";
    $scope.config.type2="area-spline";
    $scope.config.keys={"x":"x","value":["data1","data2"]};
 
    $scope.keepLoading = true;
    
    dataService.getApartmentsIDs(function(apartmentsIDs){
        $scope.apartmentOptions = apartmentsIDs;
        $scope.apartmentChoice1 = $scope.apartmentOptions[0];
        $scope.apartmentChoice2 = $scope.apartmentOptions[0];
    });
    $scope.showGraph = function() {
        console.log("WE ARE WORKING!");
        var config = {};
        config.bindto = '#chart';
        config.data = {};
        config.data.keys = $scope.config.keys;
        config.data.json = $scope.config.data;
        
        config.data.onmouseover = function (d) {
            chart.focus(d);
        }
        config.axis = {};
        config.axis.x = {
            "type":"timeseries",
            "tick":{
                 format: '%Y-%m-%d'
            }
        };
        
           switch($scope.viewMode){
            case "monthly":
                  config.axis.x = {
            "type":"timeseries",
            "tick":{
                count : 12,
                 format: '%Y-%m'
            }
        };
                break;
            case "daily":
                   
                  config.axis.x = {
            "type":"timeseries",
            "tick":{
                culling: {
                },
                 format: '%Y-%m-%d'
            }
        };
                break;
            default:
        }
       
        
        config.axis.y = {"label":{"text":"KW/h","position":"outer-middle"}};
        
        config.data.types={"data1":$scope.config.type1,"data2":$scope.config.type2}; // Type of graph used for dataset
        
        config.zoom = {
            enabled: "true", // Enable zoom
            rescale: "false" //Do not rescale Y axis while zooming.
        };
        config.subchart = {
            show : "true"
        }
        config.color = {
            pattern : ['#ff7f0e', '#1f77b4', '#2ca02c' ]
        }
        
        $scope.chart = c3.generate(config);     
    }
    
    
    $scope.startLoading = function() {
        $scope.keepLoading = true;
        $scope.loadNewDataC();
    }
 
    $scope.stopLoading = function() {
        $scope.keepLoading = false;
    }
    
    $scope.selectNumApartments = function (num) {
        
        $scope.numApartments = num;
        console.log($scope.numApartments);
    }
    $scope.selectViewMode = function (mode) {
        if (mode != "weekly"){
            $scope.viewMode = mode;
            $scope.loadNewDataC();
        }
        else {
            console.log("Weekly is not working yet");
        }
    }
    
     $scope.loadNewDataC = function() {
         console.log("function is called");
         console.log($scope.numApartments);
         
     
        $scope.showGraph();
         switch($scope.numApartments){
             case 1:
                 var params = $scope.numApartments + "," + $scope.apartmentChoice1 + "," + $scope.viewMode;
                    dataService.getDataCassandra(params, function(newData) {
                        var data = {};
//                        console.log("Correct function")
//                        console.log(newData);
                        data.keys = $scope.config.keys;
                        data.json = newData;
                        data.types = {"data1":$scope.config.type1,"data2":$scope.config.type2};
                        data.names = {data1: $scope.apartmentChoice1};
                        //data.types = {"data1":$scope.config.type1};
                        $scope.chart.load(data);
                    });
                 break;
             case 2:
                 var params = $scope.numApartments + "," + $scope.apartmentChoice1 + "," + $scope.apartmentChoice2 + "," + $scope.viewMode;
                    dataService.getDataCassandra(params, function(newData) {
                    var data = {};
//                    console.log("Correct function")
//                    console.log(newData);
                    data.keys = $scope.config.keys;
                    data.json = newData;
//                    data.types = {};
                    //data.types[$scope.apartmentChoice1] = $scope.config.type1;
                    //data.types[$scope.apartmentChoice2] = $scope.config.type2;
                    data.types = {"data1":$scope.config.type1,"data2":$scope.config.type2};
                    $scope.chart.load(data);                    
                    });
                 break;
             default:
                 console.log("Choose correct number of apartments");
         }
         $scope.stopLoading();
    }
    
// 
//    $scope.loadNewData = function() {
//        dataService.loadData(function(newData) {
//            var data = {};
//            console.log(newData);
//            data.keys = $scope.config.keys;
//            data.json = newData;
//            data.types = {"data1":$scope.config.type1,"data2":$scope.config.type2};
//            $scope.chart.load(data);
//            $timeout(function(){
//                if ($scope.keepLoading) {
//                    $scope.loadNewData()                
//                }
//            },1000);            
//        });
//    }
//         
     
     
//    $scope.getData = function() {
//
//        $http.get('/api/temperatures')
//            .success(function(data) {
//                for (var dataIndex = 0; dataIndex < data.length; ++dataIndex) {
//                    var hasMatch = false;
//                    for (var index = 0; index < $scope.temperatureData.length; ++index) {
//                        if ($scope.temperatureData[index].hour === data[dataIndex].hour) {
//                            hasMatch = true;
//                            break;
//                        }
//                    }
//                    
//                         if (!hasMatch) {
//                            $scope.temperatureData.push({
//                                hour: data[dataIndex].hour,
//                                temperature: data[dataIndex].value
//                            });
//                              console.log("new data added! " + $scope.temperatureData[$scope.temperatureData.length-1].hour);
//                        }
//
//                }
//            
//            console.log("Size of Temperature: " + $scope.temperatureData.length);
//
//            })
//            .error(function(data) {
//                console.log('Error: ' + data);
//            });
//
//    }
    // Function to replicate setInterval using $timeout service.
    $scope.intervalFunction = function() {
        $timeout(function() {
           // $scope.getData();
            $scope.intervalFunction();
        }, 3000);
    };
    
    $scope.sleep = function (miliseconds) {
       var currentTime = new Date().getTime();
       while (currentTime + miliseconds >= new Date().getTime()) {
       }
    }
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



//cassandraVis.directive('linearChart', function($parse, $window){
//    
//    
//    // constants
//  var margin = {},
//    width  = $window.innerWidth,
//    height = width * 0.7,
//    color = d3.interpolateRgb("#f77", "#77f");
//    
//   return{
//      restrict:'EA',
//      //template:"<svg width='850' min-width='200' height='200'></svg>",
//       link: function(scope, elem, attrs){
//           
//           // set up initial svg object
//  
//           console.log("Inner width: " + $window.innerWidth)
//           updateDimensions($window.innerWidth, $window.innerHeight);
//           
//           var exp = $parse(attrs.chartData);
//
//           var temperatureDataToPlot=exp(scope);
//           var padding = 20;
//           var pathClass="path";
//           var xScale, yScale, xAxisGen, yAxisGen, lineFun;
//
//           var d3 = $window.d3;
//          
//          // var svg = d3.select(rawSvg[0]);
//
//        var svg = d3.select(elem[0])
//        .append("svg")
//          .attr("width", width)
//          .attr("height", height + margin + 100);
//           
//           console.log(elem[0]);
//           
//            var rawSvg=elem.find('svg');
//           console.log(rawSvg.attr("width"));
//           scope.$watchCollection(exp, function(newVal, oldVal){
//               temperatureDataToPlot=newVal;
//               redrawLineChart();
//           });
//
//           function setChartParameters(){
//
//               svg
//                  .attr('width', width + margin.right + margin.left)
//                  .attr('height', height + margin.top + margin.bottom);
//               xScale = d3.scale.linear()
//                   .domain([temperatureDataToPlot[0].hour, temperatureDataToPlot[temperatureDataToPlot.length-1].hour])
//                   .range([padding + 2, rawSvg.attr("width") - padding]);
//
//               yScale = d3.scale.linear()
//                   .domain([0, d3.max(temperatureDataToPlot, function (d) {
//                       return d.temperature;
//                   })])
//                   .range([height - padding, 0]);
//
//               xAxisGen = d3.svg.axis()
//                   .scale(xScale)
//                   .orient("bottom")
//                 .ticks(temperatureDataToPlot.length - 1);
//
//               yAxisGen = d3.svg.axis()
//                   .scale(yScale)
//                   .orient("left")
//                   .ticks(5);
//
//               lineFun = d3.svg.line()
//                   .x(function (d) {
//                       return xScale(d.hour);
//                   })
//                   .y(function (d) {
//                       return yScale(d.temperature);
//                   })
//                   .interpolate("basis");
//           }
//         
//         function drawLineChart() {
//
//               setChartParameters();
//
//               svg.append("svg:g")
//                   .attr("class", "x axis")
//                   .attr("transform", 'translate(0,'+ height + ')')
//                   .call(xAxisGen);
//
//               svg.append("svg:g")
//                   .attr("class", "y axis")
//                   .attr("transform", "translate(20,0)")
//                   .call(yAxisGen);
//
//               svg.append("svg:path")
//                   .attr({
//                       d: lineFun(temperatureDataToPlot),
//                       "stroke": "blue",
//                       "stroke-width": 2,
//                       "fill": "none",
//                       "class": pathClass
//                   });
//           }
//
//           function redrawLineChart() {
//
//               updateDimensions($window.innerWidth, $window.innerHeight);
//               setChartParameters();
//
//               svg.selectAll("g.y.axis").call(yAxisGen);
//
//               svg.selectAll("g.x.axis").call(xAxisGen);
//
//               svg.selectAll("."+pathClass)
//                   .attr({
//                       d: lineFun(temperatureDataToPlot)
//                   });
//           }
//           function updateDimensions(winWidth, winHeight) {
//                margin.top = 20;
//                margin.right = winWidth < breakPoint ? 0 : 50;
//                margin.left = winWidth < breakPoint ? 0 : 50;
//                margin.bottom = 50;
//                margin.right = 50;
//                margin.left =  50;
//
//                width = winWidth - margin.left - margin.right;
//                height = .7 * width;
//                console.log("WinWidth: "+ width);
//                height = height >= winHeight ? winHeight * 0.8 : height
//              }
//
//           drawLineChart();
//           window.addEventListener('resize', redrawLineChart);
//       }
//   };
//});