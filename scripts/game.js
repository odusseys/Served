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
    };
});

app.controller('GameController', ['$scope', 'TableFactory', 'PatronFactory', function ($scope, TableFactory, PatronFactory) {

    var nTables = 3;
    var tableCapacity = 6;
    var startingPatience = 5;
    var wantTypes = 2;

    var tables = [];
    $scope.tables = tables;

    var generateWant = function () {
        return Math.floor(Math.random() * wantTypes);
    };

    var tryCreatePatron = function () {
        var t = shuffled(tables.filter(function (t) {
            return !t.isFull();
        }));
        console.debug(t);
        if (t.length > 0) {
            t[0].addPatron(PatronFactory(generateWant(), startingPatience));
        }
    };

    $scope.initGame = function () {
        for (var i = 0; i < nTables; i++) {
            tables.push(TableFactory(tableCapacity));
        }
        tryCreatePatron();
    };

    $scope.initGame();


}]);

