import React, { Component, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  FlatList,
  Alert,
  SegmentedControlIOS,
  TouchableOpacity,
  Button,
  BlurView,
  CheckBox,
} from 'react-native';

import { Cell, Section, TableView, Separator } from 'react-native-tableview-simple';
import { openDatabase } from 'react-native-sqlite-storage';
import DialogInput from 'react-native-dialog-input';
import SegmentedControlTab from "react-native-segmented-control-tab";
import { ListItem } from 'react-native-elements';
import dbhelper from "./DBHelper"

var width = Dimensions.get('window').width;

const blurComponentIOS = (
  <BlurView
    style={StyleSheet.absoluteFill}
    blurType="xlight"
    blurAmount={50}
  />
)

export default class ToDoList extends Component {

        constructor() {
          super();
          this.state = {
            selectedIndex: 0,
            isDialogVisible: false,
            checkedImageURL: "./Images/checked.png",
            refresh: false,
          };
          this.toDoListItems = [
          ];
          this.segmentControl = React.createRef();
          this.taskAddedCompleted = this.taskAddedCompleted.bind(this);
          this.updateTaskCompleted = this.updateTaskCompleted.bind(this);
          this.refreshTable = this.refreshTable.bind(this);
          dbhelper.createToDoListDB()
          this.fetchToDoListTasks(false);
      
        }
      
        fetchToDoListTasks = (isCompleted) => {
          var that = this
          that.toDoListItems = []
          dbhelper.fetchToDoTasksFromDB(isCompleted, (result) => {
            this.toDoListItems = result
            that.refreshTable.bind(that)
            that.refreshTable()
          });
          
          
        };
        
        refreshTable = () => {
          var that = this
          that.setState({
            refresh: !that.state.refresh
          })
          that.setState({ isDialogVisible: false })
        }
      
        submitDialog = (inputTask) => {    
          this.addTaskToToDoList(inputTask, false)
          //this.setState({ selectedIndex: 0 });
        }
      
        addTaskToToDoList = (taskTitle, isCompleted) => {
          var that = this
          dbhelper.checkIfTaskAlreadyExistsAndInsert(taskTitle, that.taskAddedCompleted)
          
        };
      
        toDoListSelected = (taskId) => {
          
          var that = this
          var isCompleted = (that.state.selectedIndex == 0) ? true : false;
          
          dbhelper.updateToDoTask(taskId, isCompleted, that.updateTaskCompleted)
        };
      
        taskAddedCompleted() {
          var that = this
          that.toDoListItems = []
          var isCompleted = (that.state.selectedIndex == 0) ? false : true;
          dbhelper.fetchToDoTasksFromDB(isCompleted, (result) => {
            that.toDoListItems = result
            that.refreshTable.bind(that)
            that.refreshTable()
          });
          
        }
      
      
        updateTaskCompleted() {
          
          var that = this
          var isCompleted = (that.state.selectedIndex == 0) ? false : true;
          console.log('tes')
          console.log(isCompleted)
          that.toDoListItems = []
          dbhelper.fetchToDoTasksFromDB(isCompleted, (result) => {
            that.toDoListItems = result
            that.refreshTable.bind(that)
            that.refreshTable()
          });
          
        }
      
        processToDoItems(response) {
          this.refreshTable()
        }
      
        renderListItem = ({ item }) => (
          <ListItem
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              bottomDivider
              onPress={() => this.toDoListSelected(item.id)}
              checkBox= {{ 
                checkedColor:'grey',
                uncheckedColor: 'grey',
                onPress: () => this.toDoListSelected(item.id),
                checked: (this.state.selectedIndex == 0) ? false : true,
              }}
            />
          
                  
              
        )
      
        renderCellItem = ({ item, separators }) => (
          <Cell
            title={item.title}
            accessory={(this.state.selectedIndex == 0) ? "" : "Checkmark"}
            onPress={() => this.toDoListSelected(item.id)}
            onHighlightRow={separators.highlight}
            onUnHighlightRow={separators.unhighlight}
          />
        )
      
      
        segmentControlTabPress = () => {
          this.setState({ isDialogVisible: true })
          //this.test()
        }
      
        test() {
          this.segmentControl.current.onTabPress(0)
        }
      
        render() {
      
      
          return (
            <View style={styles.container}>
              <DialogInput isDialogVisible={this.state.isDialogVisible}
                blurComponentIOS={blurComponentIOS}
                title={"ADD TASK"}
                message={""}
                hintInput={"Enter task to do"}
                submitInput={(inputTask) => { this.submitDialog(inputTask) }}
                closeDialog={() => this.setState({ isDialogVisible: false })}>
              </DialogInput>
              <View style={styles.topBar}>
                <Button title="ADD TASK"
                  color='black'
                  onPress={ this.segmentControlTabPress }>
                </Button>
              </View>
              <View style={styles.segment}>
                <SegmentedControlTab
                  ref={this.segmentControl}
                  values={['TO DO', 'Completed']}
                  tabStyle={styles.tabStyle}
                  tabTextStyle={styles.tabTextStyle}
                  activeTabStyle={styles.activeTabStyle}
                  activeTabTextStyle={styles.activeTabTextStyle}
                  selectedIndex={this.state.selectedIndex}
                  onTabPress={index => {
                    this.setState({ selectedIndex: index });
                    if (this.state.selectedIndex == 0) {
                      this.fetchToDoListTasks(true)
                    } else {
                      this.fetchToDoListTasks(false)
                    }
                  }}
                />
              </View>
              <View style={styles.tableViewContainer}>
                <FlatList style={styles.tableView}
                  data={this.toDoListItems}
                  extraData={this.state.refresh}
                  keyExtractor={(item, index) => item.id.toString()}
                  renderItem= {this.renderListItem}
                  ItemSeparatorComponent={({ highlighted }) => (
                    <Separator isHidden={highlighted} />
                  )}
                />
      
              </View>
      
            </View>
          );
        }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white',
      padding: 75,
      flexDirection: 'column'
    },
    topBar: {
      flex: 0.1,
      width: width * 0.8,
      backgroundColor: 'white',
      alignItems: 'flex-end'
    },
    segment: {
      flex: 0.05,
      width: width * 0.8,
      backgroundColor: 'white',
      padding: 10,
    },
    tableViewContainer: {
      flex: 0.85,
      width: width * 0.8,
      backgroundColor: 'white',
      padding: 10,
    },
    tableView: {
      backgroundColor: 'white',
      borderColor: 'grey',
      borderWidth: 1,
    },
    tabStyle: {
      borderColor: 'black',
    },
    activeTabStyle: {
      backgroundColor: 'grey',
    },
    tabTextStyle: {
      color: 'black',
    },
    activeTabTextStyle: {
      color: 'white',
    },
  });