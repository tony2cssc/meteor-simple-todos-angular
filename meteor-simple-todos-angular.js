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
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY",
  });

  // This code only runs on the client
  angular.module('simple-todos', ['angular-meteor', 'accounts.ui']);

  angular.module('simple-todos').controller('TodosListCtrl', ['$scope', '$meteor',
    function ($scope, $meteor) {

      $scope.$meteorSubscribe('tasks');
      // $scope.tasks = $meteor.collection(Tasks);
      $scope.tasks = $meteor.collection(function () {
        return Tasks.find($scope.getReactively('query'), { sort: {createdAt: -1}});
      })

      $scope.addTask = function (newTask) {
        $meteor.call('addTask', newTask);
      };

      $scope.deleteTask = function (task){
        $meteor.call('deleteTask', task._id);
      }

      $scope.setChecked = function (task) {
        $meteor.call('setChecked', task._id, !task.checked);
      }

      $scope.setPrivate = function (task) {
        $meteor.call('setPrivate', task._id, !task.private);
      }

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

Meteor.methods({
  addTask:function(text){
     if (!Meteor.userId()) {
       throw new Meteor.Error('not-authorized');
     }

     Tasks.insert({
       text: text,
       createdAt: new Date(),
       owner: Meteor.userId(),
       username: Meteor.user().username
     });
  },
  deleteTask: function (taskId) {
    var task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can delete it
      throw new Meteor.Error('not-authorized');
    }
    Tasks.remove({_id: taskId});
  },
  setChecked: function (taskId, setChecked) {
    var task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can check it off
      throw new Meteor.Error('not-authorized');
    }
    Tasks.update({_id:taskId}, {$set:{
      checked: setChecked
    }});
  },
  setPrivate: function (taskId, setToPrivate) {
    var task = Tasks.findOne(taskId);
    // Make sure only the task owner can make a task private
    if (task.owner !== Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Tasks.update(taskId, { $set: { private: setToPrivate } });
  }
});

if(Meteor.isServer){
  Meteor.publish("tasks", function(){
    return Tasks.find({
      $or: [
        {private: {$ne: true}},
        {owner: this.userId}
      ]
    });
  });
}
