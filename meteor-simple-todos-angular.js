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
      $scope.tasks = $meteor.collection(Tasks);
    }]);
}
