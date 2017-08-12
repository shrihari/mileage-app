import Expo from 'expo';
import React from 'react';
import { 
  Alert, 
  Animated, 
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


  }
  componentDidMount(){

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
        <View style={styles.settingsContainer}>

        </View>
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
});