var cassandraVis = angular.module('cassandraVis', []);

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

cassandraVis.controller('TemperatureController', ['$scope','$interval', '$http', function($scope, $interval, $http){

    $scope.temperatureData=[
        {hour: 1,temperature: 54},
        {hour: 2,temperature: 66},
        {hour: 3,temperature: 77},
        {hour: 4,temperature: 70},
        {hour: 5,temperature: 60},
        {hour: 6,temperature: 63},
        {hour: 7,temperature: 55},
        {hour: 8,temperature: 47},
        {hour: 9,temperature: 55},
        {hour: 10,temperature: 30}
    ];
    var counter = 0;
    $interval(function(){
        var hour=$scope.temperatureData.length+1;
        var temperature= Math.round(Math.random() * 100);
        //$scope.temperatureData.push({hour: hour, temperature:temperature});
	counter++;
	if (counter > 99) counter = 0;
	$http.get('/api/temperatures')
		.success(function(data) {
			console.log(data[counter]);
			$scope.temperatureData.push({hour:data[counter].hour, temperature:data[counter].value});
		})
		.error(function(data) {
			console.log('Error: ' + data);
		});
    }, 1000, 10);
}]);

cassandraVis.directive('linearChart', function($parse, $window){
   return{
      restrict:'EA',
      template:"<svg width='850' height='200'></svg>",
       link: function(scope, elem, attrs){
           var exp = $parse(attrs.chartData);

           var temperatureDataToPlot=exp(scope);
           var padding = 20;
           var pathClass="path";
           var xScale, yScale, xAxisGen, yAxisGen, lineFun;

           var d3 = $window.d3;
           var rawSvg=elem.find('svg');
           var svg = d3.select(rawSvg[0]);

           scope.$watchCollection(exp, function(newVal, oldVal){
               temperatureDataToPlot=newVal;
               redrawLineChart();
           });

           function setChartParameters(){

               xScale = d3.scale.linear()
                   .domain([temperatureDataToPlot[0].hour, temperatureDataToPlot[temperatureDataToPlot.length-1].hour])
                   .range([padding + 5, rawSvg.attr("width") - padding]);

               yScale = d3.scale.linear()
                   .domain([0, d3.max(temperatureDataToPlot, function (d) {
                       return d.temperature;
                   })])
                   .range([rawSvg.attr("height") - padding, 0]);

               xAxisGen = d3.svg.axis()
                   .scale(xScale)
                   .orient("bottom")
                   .ticks(temperatureDataToPlot.length - 1);

               yAxisGen = d3.svg.axis()
                   .scale(yScale)
                   .orient("left")
                   .ticks(5);

               lineFun = d3.svg.line()
                   .x(function (d) {
                       return xScale(d.hour);
                   })
                   .y(function (d) {
                       return yScale(d.temperature);
                   })
                   .interpolate("basis");
           }
         
         function drawLineChart() {

               setChartParameters();

               svg.append("svg:g")
                   .attr("class", "x axis")
                   .attr("transform", "translate(0,180)")
                   .call(xAxisGen);

               svg.append("svg:g")
                   .attr("class", "y axis")
                   .attr("transform", "translate(20,0)")
                   .call(yAxisGen);

               svg.append("svg:path")
                   .attr({
                       d: lineFun(temperatureDataToPlot),
                       "stroke": "blue",
                       "stroke-width": 2,
                       "fill": "none",
                       "class": pathClass
                   });
           }

           function redrawLineChart() {

               setChartParameters();

               svg.selectAll("g.y.axis").call(yAxisGen);

               svg.selectAll("g.x.axis").call(xAxisGen);

               svg.selectAll("."+pathClass)
                   .attr({
                       d: lineFun(temperatureDataToPlot)
                   });
           }

           drawLineChart();
       }
   };
});
