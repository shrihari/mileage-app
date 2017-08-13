import Expo, { SQLite } from 'expo';
import React from 'react';
import { 
  Alert, 
  Animated, 
  AsyncStorage,
  Button, 
  Easing,
  FlatList,
  Image, 
  ListView, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity,
  TouchableWithoutFeedback, 
  View } from 'react-native';
import {
  StackNavigator,
  TabNavigator
} from 'react-navigation';

import HomeScreen from './HomeScreen.js';
import History from './History.js';
import Settings from './Settings.js';

const db = SQLite.openDatabase({ name: 'db.db' });

const App = TabNavigator({
  Settings: { screen: Settings },
  Home: { screen: HomeScreen },
  History: { screen: History }
}, {
  tabBarPosition: 'top',
  swipeEnabled: true,
  animationEnabled: true,
  initialRouteName: 'Home',
  tabBarOptions: {
    activeTintColor: '#e91e63',
    style: {
      backgroundColor: '#ffffff',
      height: 60,
    },
  },
});

class AppNew extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      units: ''
    }

    this.settings = this.settings.bind(this);
    this.setUnits = this.setUnits.bind(this);

    this.settings()
  }

  async settings() {
    let units = await AsyncStorage.getItem('mileageUnits');
    if (units !== null){
      this.setState({units: units})
    } else {
      await AsyncStorage.setItem('mileageUnits', 'metric');
    }
  }

  async setUnits(u) {
    this.setState({units: u})
    this.forceUpdate()

    await AsyncStorage.setItem('mileageUnits', u);
  }

  render() {
    return (
      <App 
        units={this.state.units}
        screenProps={{
          units: this.state.units,
          setUnits: this.setUnits,
        }}
        />
    );
  }
}

export default AppNew

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Expo.Constants.statusBarHeight,
  },
  mileage: {
    // padding: 20,
    height: 100,
    overflow: 'hidden',
    marginTop: 44
  },
  mileageLabel: {
    color: '#aaaaaa',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '200',
  },
  mileageValue: {
    color: '#444',
    textAlign: 'center',
    fontSize: 48,
    fontWeight: '300'
  },
  buttons: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    padding: 10,
  },
  button: {
    flex: 1,
    padding: 20,
    margin: 10,
    alignItems: 'center',
    borderRadius: 10,
    height: 100
  },
  lowFuelButton: {
    backgroundColor: '#FEF5E8',
  },
  refillButton: {
    backgroundColor: '#F1F8ED',
  },
  lowFuelText: {
    color: '#F5A623',
    marginTop: 10
  },
  refillText: {
    color: '#79B74E',
    marginTop: 10
  },
  addLowFuelButton: {
    color: 'white',
    backgroundColor: '#F5A623',
    fontWeight: 'bold',
    padding: 10,
    width: 100,
    textAlign: 'center',
    borderRadius: 10
  },
  todoItem: {
    color: '#79B74E',
    height: 50,
    backgroundColor: '#FEF5E8',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    padding: 10
  },
  addLowFuelContainer: {
    backgroundColor: '#FEF5E8'
  },
  addRefillContainer: {
    backgroundColor: '#F1F8ED'
  },
  inputBox: {
    fontSize: 64,
    height: 72,
    marginBottom: 20,
    textAlign: 'center',
  },
  hide: {
    display: 'none'
  },

  historyLowFuel: {
    height: 50,
    backgroundColor: '#FEF5E8',
    marginBottom: 1,
    paddingLeft: 10,
    paddingRight: 10
  },
  historyLowFuelText: {
    lineHeight: 50,
    color: '#F5A623',
    fontWeight: 'bold',
  },
  historyRefill: {
    height: 50,
    backgroundColor: '#F1F8ED',
    marginBottom: 1,
    paddingLeft: 10,
    paddingRight: 10
  },
  historyRefillText: {
    lineHeight: 50,
    color: '#79B74E',
    fontWeight: 'bold',
  },
});
