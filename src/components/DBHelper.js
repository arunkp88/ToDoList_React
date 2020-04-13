import React from 'react';
import { openDatabase } from 'react-native-sqlite-storage';
import { Alert } from 'react-native';
import moment from "moment";

var db = openDatabase({ name: 'ToDoList.db' });
class DBHelper {

  constructor() {
    this.toDoListItems = [
    ];
  }

  createToDoListDB = () => {
    db.transaction(function (txn) {
      //txn.executeSql('DROP TABLE IF EXISTS table_toDoList', []);
      txn.executeSql(
        'CREATE TABLE IF NOT EXISTS table_toDoList(taskId INTEGER PRIMARY KEY AUTOINCREMENT, taskTitle VARCHAR(20), isCompleted BOOLEAN, taskDate VARCHAR(20))',
        []
      );
    });

  };

  insertTaskToDB = (taskTitle, callBack) => {
    
    var currentDateTime = moment().format("MMM D, YYYY")
    
    db.transaction(function (tx) {
      tx.executeSql(
        'INSERT INTO table_toDoList (taskTitle, isCompleted, taskDate) VALUES (?,?,?)',
        [taskTitle, false, currentDateTime],
        (tx, results) => {
          callBack()
        }
      )
    });
  };

  fetchToDoTasksFromDB = (isCompleted, callBack) => {
    var that = this
    db.transaction(function (txn) {
      var that = this
      txn.executeSql(
        "SELECT * FROM table_toDoList WHERE isCompleted = ?",
        [isCompleted],
        function (tx, res) {
          that.toDoListItems = []
          if (res.rows.length > 0) {
            
            for (let i = 0; i < res.rows.length; i++) {
              that.toDoListItems[i] = { id: res.rows.item(i).taskId, title: res.rows.item(i).taskTitle, subtitle: res.rows.item(i).taskDate}
            }            
            
          }
          callBack(that.toDoListItems)
          
        }
      );
    });
    
  };

  updateToDoTask = (taskId, isCompleted, callBack) => {
    var that = this
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE table_toDoList set isCompleted=? where taskId=?',
        [isCompleted, taskId],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            callBack()
          }
        }
      );
    });
  }
  
   checkIfTaskAlreadyExistsAndInsert = (taskTitle, callBack) => {
     
     var that = this
    db.transaction(function (txn) {
      
      txn.executeSql(
        "SELECT * FROM table_toDoList WHERE taskTitle = ? COLLATE NOCASE",
        [taskTitle],
        function (tx, res) {
          
          if (res.rows.length > 0) {
            Alert.alert('Task already exists')
          } else {
            that.insertTaskToDB(taskTitle, callBack)
          }
        }
      );
    });
  }

  insertionCompleted() {
    
  }

  submitDialog = (inputTask) => {
    this.addTaskToToDoList(inputTask, false)
  }

  toDoListSelected = (taskId) => {
    this.updateToDoTask(taskId)
  }

}
const dbhelper = new DBHelper()
export default dbhelper;