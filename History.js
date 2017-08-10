import Expo, { SQLite } from 'expo';
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
import {
  StackNavigator,
  TabNavigator
} from 'react-navigation';

const db = SQLite.openDatabase({ name: 'db.db' });

class History extends React.Component {
  static navigationOptions = {
    tabBarVisible: false,
  };
  constructor(props) {
    super(props);

    this.historyItem = this.historyItem.bind(this);
    this.updateData = this.updateData.bind(this);
  
    this.state = {
      data: [],
      refreshing: false
    };

  }

  componentDidMount() {
    this.updateData()
  }

  updateData() {
    let t = this

    t.setState({refreshing: true});

    db.transaction(tx => {
      tx.executeSql('select * from events order by id desc', [], (_, { rows }) => {

        console.log(rows)

        if(rows.length > 0) {
          t.setState({data: rows._array, refreshing: false})
        }

      });
    });

  }

  historyItem({item}) {

    if(item.type == "lowfuel") {
      return (
        <View style={styles.historyLowFuel}>
          <Text style={styles.historyLowFuelText}>{item.value}</Text>
        </View>
      )
    } else if(item.type == "refill") {
      return (
        <View style={styles.historyRefill}>
          <Text style={styles.historyRefillText}>{item.value}</Text>
        </View>
      )
    }

  }

  render() {

    const { navigate } = this.props.navigation;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableWithoutFeedback onPress={() => navigate('Home') }>
            <Image source={require('./images/back.png')} />
          </TouchableWithoutFeedback>
          <View>
            <Text style={{color: '#aaa'}}>HISTORY</Text>
          </View>
          <View style={{opacity: 0}}>
            <Image source={require('./images/back.png')} />
          </View>
        </View>
        <View style={styles.historyContainer}>
          <FlatList
            data={this.state.data}
            renderItem={this.historyItem}
            keyExtractor={item => item.id}
            onRefresh={this.updateData}
            refreshing={this.state.refreshing}
          />
        </View>
      </View>
    );
  }
}

export default History



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

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    // height: 50,
    padding: 20,
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
    paddingLeft: 20,
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
    paddingLeft: 20,
    paddingRight: 10
  },
  historyRefillText: {
    lineHeight: 50,
    color: '#79B74E',
    fontWeight: 'bold',
  },
});
