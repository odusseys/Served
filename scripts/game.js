function shuffled(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
    return a;
}

app.factory('TableFactory', function () {
    return function (capacity) {
        var table = {};
        table.patrons = [];
        table.capacity = capacity;
        table.addPatron = function (patron) {
            table.patrons.push(patron);
        };
        table.isFull = function () {
            return table.patrons.length == capacity;
        };
        table.grow = function () {
            table.capacity++;
        };
        return table;
    };
});

app.factory('PatronFactory', function () {
    return function (wants, patience) {
        var patron = {};
        patron.wants = wants;
        patron.patience = patience;
        return patron;
    };
});

app.factory('PatronColor', function () {
    var colors = ["red", "blue", "yellow", "#9400D3", "orange", "green", "pink"]; //todo: make this infinite ?
    return {
        of: function (want) {
            return colors[want];
        }
    }
});

app.factory('State', function(){
   return function(){
       var state = {};
       state.level = 1;
       state.score = 0;
       return state;
   }
});

app.filter('reverse', function() {
    return function(items) {
        return items.slice().reverse();
    };
});

app.controller('GameController', ['$scope', 'TableFactory', 'PatronFactory', 'PatronColor', 'State',
    function ($scope, TableFactory, PatronFactory, PatronColor, State) {

        var nTables = 3;
        var tableCapacity = 6;
        var startingPatience = 5;
        var wantTypes = 2;
        var nFoods = 5;
        var startingPatrons = 3;
        var queueSize = 5;

        var tables = null;
        $scope.tableClicks = null;
        $scope.tables = null;
        $scope.foods = null;
        var queue = null;
        var foods = null;
        var state = null;

        $scope.patronColor = function(patron){ return PatronColor.of(patron.wants); };

        var generateWant = function () {
            return Math.floor(Math.random() * wantTypes);
        };

        var trySeatPatron = function () {
            var t = shuffled(tables.filter(function (t) {
                return !t.isFull();
            }));
            if (t.length > 0) {
                t[0].addPatron(queue.shift());
                var patron = PatronFactory(generateWant(), startingPatience);
                queue.push(patron);
            }
        };

        var tableClick = function (i) {
            return function () {
                round(function () {
                    var food = foods[0];
                    console.debug(food);
                    var newPatrons = [];
                    tables[i].patrons.forEach(function (patron) {
                        if (patron.wants != food) {
                            newPatrons.push(patron);
                            patron.patience++;
                        }
                    });
                    tables[i].patrons = newPatrons;
                });
            };
        };

        var decrementPatiences = function () {
            var patienceExceeded = false;
            tables.forEach(function (table) {
                table.patrons.forEach(function (patron) {
                    patron.patience--;
                    if (patron.patience == 0) {
                        patienceExceeded = true;
                    }
                });
            });
            return patienceExceeded;
        };

        var round = function (action) {
            action();
            if (decrementPatiences()) {
                $scope.gameState = 'LOST';
            }
            foods.shift();
            pushFood();
            trySeatPatron();
        };

        $scope.addTable = function () {
            $scope.tables.push(TableFactory(tableCapacity));
            $scope.tableClicks.push(tableClick(tables.size - 1));
        };

        var pushFood = function () {
            foods.push(generateWant());
        };

        $scope.foodColor = function (food) {
            return PatronColor.of(food);
        };

        var initStorages = function(){
            $scope.tables = [];
            tables = $scope.tables;
            $scope.foods = [];
            foods = $scope.foods;
            $scope.tableClicks = [];
            state = State();
            $scope.state = State();
            queue = [];
            $scope.queue = queue;
        };

        $scope.initGame = function () {
            initStorages();
            for (var i = 0; i < nTables; i++) {
                (function (i) {
                    tables.push(TableFactory(tableCapacity));
                    $scope.tableClicks.push(tableClick(i));
                })(i);
            }
            for (var i = 0; i < nFoods; i++) {
                pushFood();
            }
            for(var i = 0; i < queueSize; i++){
                queue.push(PatronFactory(generateWant(), startingPatience));
            }
            for(var i = 0; i < startingPatrons; i++){
                trySeatPatron();
            }
            $scope.gameState = 'PLAYING';
        };

        $scope.initGame();

        console.debug(queue);

    }
]);

app.directive('lunchTable', function (PatronColor) {
    return {
        restrict: 'E',
        templateUrl: 'templates/lunch-table.html',
        scope: {
            data: "=",
            select: "="
        },
        link: function ($scope) {

            $scope.patronColor = function (patron) {
                return PatronColor.of(patron.wants);
            };

            var data = $scope.data;

            $scope.leftSide = [];
            $scope.rightSide = [];

            var assignSides = function () {
                $scope.leftSide = data.patrons.slice(0, 3);
                $scope.rightSide = data.patrons.slice(3, 6);
            };

            assignSides();

            //paint loop
            $scope.$watch('data', function () {
                assignSides();
            }, true);
        }

    }
});
