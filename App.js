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

});
