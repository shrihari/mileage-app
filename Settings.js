import Expo from 'expo';
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
  
class Settings extends React.Component {
  static navigationOptions = {
    tabBarVisible: false,
  };
  constructor(props) {
    super(props);

    this.state = {
      units: this.props.screenProps.units
    }

    this.setMetric = this.setMetric.bind(this);
    this.setImperial = this.setImperial.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({units: nextProps.screenProps.units})
  }

  async setMetric() {
    this.props.screenProps.setUnits("metric")
  }
  async setImperial() {
    this.props.screenProps.setUnits("imperial")
  }

  render() {

    const { navigate } = this.props.navigation;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{opacity: 0, padding: 20}}>
            <Image source={require('./images/forward.png')} />
          </View>
          <View style={{padding: 20}}>
            <Text style={{color: '#aaa'}}>SETTINGS</Text>
          </View>
          <TouchableOpacity onPress={() => navigate('Home') } style={{padding: 20}}>
            <Image source={require('./images/forward.png')} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.settingsContainer}>

          <View style={{padding: 20}}>
            <Text style={{color: '#aaa'}}>UNITS</Text>
          </View>

          <View style={[styles.buttons]}>
            <TouchableWithoutFeedback onPress={this.setMetric}>
                <View style={[
                    styles.button, 
                    (this.state.units == "metric") && styles.selected,
                    ]}>
                  <Text style={[{color: '#666', fontSize: 12}]}>KILOMETERS</Text>
                  <Text style={[{color: '#666', fontSize: 20, fontWeight: '200'}]}>&amp;</Text>
                  <Text style={[{color: '#666', fontSize: 12}]}>LITERS</Text>
                </View>
            </TouchableWithoutFeedback>
            
            <TouchableWithoutFeedback onPress={this.setImperial}>
                <View style={[
                    styles.button, 
                    (this.state.units == "imperial") && styles.selected,
                    ]}>
                  <Text style={[{color: '#666', fontSize: 12}]}>MILES</Text>
                  <Text style={[{color: '#666', fontSize: 20, fontWeight: '200'}]}>&amp;</Text>
                  <Text style={[{color: '#666', fontSize: 12}]}>GALLONS</Text>
                </View>
            </TouchableWithoutFeedback>
          </View>

        </ScrollView>
      </View>
    );
  }
}

export default Settings

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Expo.Constants.statusBarHeight,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // alignItems: 'flex-start',
    // height: 50,
    // padding: 20,
  },

  settingsContainer: {
    flex: 1
  },

  buttons: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingLeft: 10,
    paddingRight: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    marginLeft: 10,
    marginRight: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'transparent',
    borderColor: '#eee',
    borderWidth: 1
  },
  selected: {
    backgroundColor: '#eee',
    borderColor: '#ddd',
  }
});