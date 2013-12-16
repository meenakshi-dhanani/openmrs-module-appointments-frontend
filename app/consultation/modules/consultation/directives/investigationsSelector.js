angular.module('opd.consultation')
.directive('investigationsSelector',function(){
    var Selectable = function(data, selectableChildren, onSelectionChange) {
        angular.extend(this, data);
        var selectionSources = [];
        var children = selectableChildren || [];

        this.isSelected = function() {
            return selectionSources.length > 0;
        }

        this.isSelectedFromSelf = function() {
            return selectionSources.indexOf(this) !== -1;
        }

        this.addChild = function(selectable) {
            children.push(selectable);
        }
        
        this.toggle = function(selectionSource) {
            selectionSource = selectionSource || this;
            this.isSelected() ? this.unselect(selectionSource) : this.select(selectionSource);
        }

        this.select = function(selectionSource) {
            selectionSource = selectionSource || this;
            if(selectionSources.indexOf(selectionSource) === -1) {
                selectionSources.push(selectionSource);  
                angular.forEach(children, function(child){ 
                    child.unselect(child); 
                    child.select(selectionSource); 
                });
                onSelectionChange(this); 
            }
        }        

        this.unselect = function(selectionSource) {
            selectionSource = selectionSource || this;
            var index = selectionSources.indexOf(selectionSource)
            if(index !== -1) {
                selectionSources.splice(index, 1);
                angular.forEach(children, function(child){ child.unselect(selectionSource); });
                onSelectionChange(this);
            }
        }        
    }

    var Category = function(name, tests) {
        this.name = name;
        this.tests = tests;
        
        this.filter = function(filterFunction) {
            this.filteredTests = tests.filter(filterFunction);
        }

        this.hasTests = function() {
            return this.filteredTests.length > 0;
        }
    }

    var controller = function($scope, $rootScope) {
        var onSelectionChange = function(selectable) {
            if(selectable.isSelected()) {
                if(selectable.isSelectedFromSelf()) addInvestigationForSelectable(selectable);
            } else {
                removeInvestigationForSelectable(selectable);
            }
        }

        var initializeTests = function() {
            var categories = [];
            var selectablePanels = [];
            var selectableTests = []
            var filters = [];
            angular.forEach($scope.tests, function(test){
                var selectableTest = new Selectable(test, [], onSelectionChange);            
                selectableTests.push(selectableTest);
                var categoryData = test[$scope.categoryColumn] || {name: "Other"};
                var category = categories.filter(function(category) { return category.name === categoryData.name })[0];
                category ? category.tests.push(selectableTest) : categories.push(new Category(categoryData.name, [selectableTest]));
                
                angular.forEach(test.panels, function(testPanel){
                    var selectablePanel = selectablePanels.filter(function(panel){ return panel.name === testPanel.name })[0];
                    if(selectablePanel) {
                        selectablePanel.addChild(selectableTest)
                    } else {
                        selectablePanel = new Selectable(testPanel, [selectableTest], onSelectionChange);
                        selectablePanels.push(selectablePanel)                    
                    }
                });

                var filter = test[$scope.filterColumn];
                if(filters.indexOf(filter) === -1) filters.push(filter);
            });
            $scope.categories = categories;
            $scope.selectablePanels = selectablePanels;
            $scope.selectableTests = selectableTests;
            $scope.filters = filters;
        };

        var selectSelectablesBasedOnInvestigations = function() {
            var selectables = $scope.selectablePanels.concat($scope.selectableTests);
            angular.forEach($scope.investigations, function(investigation){
                var selectable = selectables.filter(function(selectableConcept){ return selectableConcept.uuid === investigation.concept.uuid; })[0];
                if(selectable) selectable.select();
            });
        }
        
        var createInvestigationFromSelectable = function(selectable) {
            return {
                concept: {uuid: selectable.uuid, name: selectable.name},
                orderTypeUuid: $rootScope.encounterConfig.orderTypes['Lab Order']//TODO: Fetch this based on tab    
            };
        }

        var addInvestigationForSelectable = function(selectable) {
            var investigation = findInvestigationForSelectable(selectable);
            if(investigation) {
                investigation.voided = false;
            } else {
                $scope.investigations.push(createInvestigationFromSelectable(selectable));
            }         
        }

        var removeInvestigationForSelectable = function(selectable) {
            var investigation = findInvestigationForSelectable(selectable);
            if(investigation) removeInvestigation(investigation);;
        }

        var removeInvestigation = function(investigation) {
            if(investigation.uuid) {
                investigation.voided = true;
            } else {
                var index = $scope.investigations.indexOf(investigation);
                $scope.investigations.splice(index, 1);
            }
        }

        var findInvestigationForSelectable = function(selectable) {
            return $scope.investigations.filter(function(investigation){ return investigation.concept.uuid === selectable.uuid })[0];
        }

        $scope.$watch('tests', function(){
            initializeTests();
            selectSelectablesBasedOnInvestigations();
            $scope.clearFilter();
        });

        $scope.clearFilter = function() {
            $scope.filterBy(null)
        }

        var applyCurrentFilterByFilterCoulmn = function(selectable) {
            return $scope.currentFilter ? selectable[$scope.filterColumn] === $scope.currentFilter : true;
        }

        $scope.filterBy = function(filter) {
            $scope.currentFilter = filter;
            $scope.filteredPanels = $scope.selectablePanels.filter(applyCurrentFilterByFilterCoulmn);
            angular.forEach($scope.categories, function(category){
                category.filter(applyCurrentFilterByFilterCoulmn);
            });
        }
        
        $scope.hasFilter = function() {
            return !!$scope.currentFilter;
        }

        $scope.isFilteredBy = function(filter) {
            return $scope.currentFilter === filter;
        }
    }

    return {
        restrict: 'EA',
        templateUrl: 'modules/consultation/views/investigationsSelector.html',
        controller: controller,
        require: 'ngModel',
        scope: {
            investigations: '=ngModel',
            tests: "=",
            filterColumn: "@",
            categoryColumn: "@"
        }
    }
});