'use strict';

angular.module('bahmni.dhis')
    .service('TaskService', ['$http', function ($http) {
        this.getAllTasks = function () {
            return $http.get(Bahmni.Common.Constants.dhisAllTasksUrl);
        };
        //TODO: Mujir, Mihir : Make headers constant.
        this.fireQueries = function (reportParams) {
            return $http.post(Bahmni.Common.Constants.dhisFireQueriesUrl, reportParams.json(), {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        };
    }]);