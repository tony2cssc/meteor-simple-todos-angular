Tasks = new Mongo.Collection("tasks");


// Tasks.allow({
//   insert: function(){
//     return true;
//   },
//   update: function(){
//     return true;
//   },
//   remove: function(){
//     return true;
//   }
// });


if (Meteor.isClient) {
  // This code only runs on the client
  angular.module('simple-todos', ['angular-meteor']);

  angular.module('simple-todos').controller('TodosListCtrl', ['$scope', '$meteor',
    function ($scope, $meteor) {
      // $scope.tasks = $meteor.collection(Tasks);
      $scope.tasks = $meteor.collection(function () {
        return Tasks.find($scope.getReactively('query'), { sort: {createdAt: -1}});
      })

      $scope.addTask = function (newTask) {
        $scope.tasks.push( {
          text: newTask,
          createdAt: new Date()
        });
      };

      $scope.$watch('hideCompleted', function () {
        if ($scope.hideCompleted) {
          $scope.query = {checked: {$ne: true}};
        } else {
          $scope.query = {};
        }
      });

      $scope.incompleteCount = function () {
        return Tasks.find({"checked": {$ne: true}}).count();

      }
    }]);
}
