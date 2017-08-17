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
import AppIntro from 'react-native-app-intro';

import HomeScreen from './HomeScreen.js';
import History from './History.js';
import Settings from './Settings.js';

const App = TabNavigator({
  Settings: { screen: Settings },
  Home: { screen: HomeScreen },
  History: { screen: History }
}, {
  tabBarPosition: 'top',
  swipeEnabled: true,
  animationEnabled: true,
  initialRouteName: 'Home',
});

class Example extends React.Component {

  doneBtnHandle = () => {
    // Alert.alert('Done');
    this.props.setOnboarding(0)
  }
  onSlideChangeHandle = (index, total) => {
    // console.log(index, total);
  }
  render() {
    const pageArray = [{
      title: 'Welcome',
      description: 'Ride to valhalla.',
      img: require('./images/motorcycle.png'),
      // imgStyle: {
      //   height: 80 * 2.5,
      //   width: 109 * 2.5,
      // },
      backgroundColor: '#fff',
      fontColor: '#aaa',
      level: 10,
    }, {
      title: 'Refill',
      description: 'When you fill your tank, note the volume.',
      img: require('./images/refill.png'),
      // imgStyle: {
      //   height: 93 * 2.5,
      //   width: 103 * 2.5,
      // },
      backgroundColor: '#fff',
      fontColor: '#aaa',
      level: 10,
    }, {
      title: 'Low Fuel',
      description: 'When you run low on fuel, note the odometer. ',
      img: require('./images/lowfuel.png'),
      // imgStyle: {
      //   height: 93 * 2.5,
      //   width: 103 * 2.5,
      // },
      backgroundColor: '#fff',
      fontColor: '#aaa',
      level: 10,
    }];
    return (
      <AppIntro
        onNextBtnClick={this.nextBtnHandle}
        onDoneBtnClick={this.doneBtnHandle}
        onSkipBtnClick={this.onSkipBtnHandle}
        onSlideChange={this.onSlideChangeHandle}
        showSkipButton={false}
        pageArray={pageArray}
        dotColor='rgba(0,0,0,0.2)'
        activeDotColor='rgba(0,0,0,0.5)'
        rightTextColor='#aaa'
        leftTextColor='#aaa'
        customStyles={{
          paginationContainer: {
            // backgroundColor: 'red',
          },
          btnContainer: {
            // backgroundColor: 'red',
            // alignItems: 'flex-start'
          },
          nextButtonText: {
            fontFamily: null,
          },
          controllText: {
            fontWeight: 'normal',
            marginRight: -30
          },
          dotStyle: {
            // width: 10,
            // height: 10
          }
        }}
      />
    );
  }
}


class AppNew extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      units: '',
      onboarding: 0
    }

    this.settings = this.settings.bind(this);
    this.setUnits = this.setUnits.bind(this);
    this.setOnboarding = this.setOnboarding.bind(this);

  }

  componentDidMount() {
    this.settings()
  }

  async settings() {
    let units = await AsyncStorage.getItem('mileageUnits');
    if (units !== null){
      this.setState({units: units})
    } else {
      await AsyncStorage.setItem('mileageUnits', 'metric');
      this.setState({onboarding: 1})
    }
  }

  async setUnits(u) {
    this.setState({units: u})
    this.forceUpdate()

    await AsyncStorage.setItem('mileageUnits', u);
  }

  setOnboarding(o) {
    this.setState({onboarding: o})
  }

  render() {
    if(this.state.onboarding == 1) {

      return (
        <Example setOnboarding={this.setOnboarding} />
      );

    } else {
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
}





export default AppNew

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB',
    padding: 15,
  },
  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
});
