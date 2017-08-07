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
} from 'react-navigation';

const db = SQLite.openDatabase({ name: 'db.db' });

class HomeScreen extends React.Component {
  static navigationOptions = {
    title: '',
    headerBackTitle: null,
    headerStyle: {backgroundColor: 'white'}
  };
  constructor(props) {
    super(props);

    this.state = {
      lowfuelinput: '',
      refillinput: '',
      mode: 'mileage',
      lastinput: '',
      mileage: 0,
      refillAnim: new Animated.Value(0),
      lowfuelAnim: new Animated.Value(0)
    };

    this.newLowFuel = this.newLowFuel.bind(this);
    this.addLowFuel = this.addLowFuel.bind(this);
    this.newRefill = this.newRefill.bind(this);
    this.addRefill = this.addRefill.bind(this);
    this.cancelAdd = this.cancelAdd.bind(this);
  }

  componentDidMount() {
    let t = this

    db.transaction(tx => {
      // tx.executeSql(
      //   'drop table events;'
      // );
      tx.executeSql('create table if not exists events (id integer primary key not null, type text, value float);');
      tx.executeSql('create table if not exists mileages (id integer primary key not null, value float);');
      tx.executeSql('select * from events', [], (_, { rows }) => {

        console.log(rows)
        // t.setState({dataSource: rows._array})
        // let total = 0;
        // for(let i = 0; i < rows.length; i++) {
        //   total += rows._array[i].value;
        // }
        // t.setState({mileage: parseFloat(total / rows.length)})

        if(rows.length > 0) {
          t.setState({lastinput: rows.item(rows.length-1)})
        }

        // let count = rows.length-1
        // let arr = rows._array
        // let mileages = []
        // let total = 0, denom = 0;

        // while(count > 1) {

        //   let m = (arr[count].value - arr[count-2].value) / arr[count-1].value;
        //   total += m;
        //   denom += 1;
        //   count -= 2;
        // }

        // t.setState({mileage: parseFloat(total / denom)})

      });
      tx.executeSql('select * from mileages', [], (_, { rows }) => {
        console.log(rows)

        if(rows.length > 0) {
          let total = 0;
          for(let i = 0; i < rows.length; i++) {
            total += rows._array[i].value;
          }
          t.setState({mileage: parseFloat(total / rows.length)})
        }
      });
    });
  }

  newLowFuel() {

    this.setState({mode: 'lowfuel'})

    Animated.timing(
      this.state.lowfuelAnim,
      {
        toValue: 10,
        duration: 300
      }
    ).start(() => {
      this.lowFuelInput.focus()
    });

  }

  addLowFuel() {
    let t = this;

    if(t.state.lowfuelinput == "")
      return;

    let val = parseFloat(t.state.lowfuelinput);

    if(t.state.lastinput.type == "lowfuel") {
    // Low fuel after a low fuel. Don't allow.

    } else {
    // Low fuel after a refill. Calculate and insert mileage. Update average mileage.

      db.transaction(
        tx => {
          tx.executeSql('insert into events (type, value) values ("lowfuel", ?)', [val], (_, { insertId }) =>
            t.setState({lastinput: {id: insertId, type: "lowfuel", value: val}})
          );
          tx.executeSql('select * from events where id > ?', [t.state.lastinput.id - 2], (_, { rows }) => {
            console.log(t.state.lastinput.id - 2)
            console.log(JSON.stringify(rows))

            if(rows.length == 3) {
              let mileage = (val - rows.item(0).value) / rows.item(1).value;
              console.log(mileage)
              tx.executeSql('insert into mileages (value) values (?)', [mileage], (_, {insertId}) => 

                t.setState({mileage: (t.state.mileage * (insertId-1) + mileage) / insertId })

              );

            }

          });
          // tx.executeSql('select * from mileages', [], (_, { rows }) =>
          //   console.log(JSON.stringify(rows))
          // );
        }
      );

    }

    this.lowFuelInput.blur()

    Animated.timing(
      this.state.lowfuelAnim,
      {
        toValue: 0,
        duration: 300,
      }
    ).start(() => {
      this.setState({refillinput: '', lowfuelinput: ''});
      this.setState({mode: 'mileage'})
    }); 
  }

  newRefill() {

    this.setState({mode: 'refill'})
      
    Animated.timing(
      this.state.refillAnim,
      {
        toValue: 10,
        duration: 300
      }
    ).start(() => {    
        this.refillInput.focus()
    });
  }

  addRefill() {
    let t = this;

    if(t.state.refillinput == "")
      return;

    let val = parseFloat(t.state.refillinput);

    if(t.state.lastinput.type == "refill") {
    // 2 Refills in a row. Just add it to the last refill.

      val += t.state.lastinput.value;

      db.transaction(
        tx => {
          tx.executeSql('update events set value = ? where id = ? ', [val, t.state.lastinput.id], (_, { insertId }) =>
            t.setState({lastinput: {id: t.state.lastinput.id, type: "refill", value: val}})
          );
        }
      );

    } else {
    // Refill after a low fuel. Just insert and do nothing.

      db.transaction(
        tx => {
          tx.executeSql('insert into events (type, value) values ("refill", ?)', [val], (_, { insertId }) =>
            t.setState({lastinput: {id: insertId, type: "refill", value: val}})
          );
        }
      );

    } 

    this.refillInput.blur()

    Animated.timing(
      this.state.refillAnim,
      {
        toValue: 0,
        duration: 300,
      }
    ).start(() => {
      this.setState({refillinput: '', lowfuelinput: ''});
      this.setState({mode: 'mileage'})
    }); 
  }

  cancelAdd() {

    if(this.state.mode == "refill") {    
      
      this.refillInput.blur()

      Animated.timing(
        this.state.refillAnim,
        {
          toValue: 0,
          duration: 300,
        }
      ).start(() => {
        this.setState({refillinput: '', lowfuelinput: ''});
        this.setState({mode: 'mileage'})
      }); 

    } else if(this.state.mode == "lowfuel") {

      this.lowFuelInput.blur()

      Animated.timing(
        this.state.lowfuelAnim,
        {
          toValue: 0,
          duration: 300,
        }
      ).start(() => {
        this.setState({refillinput: '', lowfuelinput: ''});
        this.setState({mode: 'mileage'})
      }); 

    }

    // this.lowFuelInput.blur()
  }

  render() {
    const { navigate } = this.props.navigation;
    let { refillAnim, lowfuelAnim } = this.state;
    return (
      <Animated.ScrollView 
          keyboardShouldPersistTaps='handled'
          style={[styles.container, 
                  // (this.state.mode == 'lowfuel') && styles.addLowFuelContainer,
                  (this.state.mode == 'refill') && {
                    backgroundColor: refillAnim.interpolate({
                      inputRange: [0, 10],
                      outputRange: ['#ffffff', '#F1F8ED']
                    }),
                  },
                  (this.state.mode == 'lowfuel') && {
                    backgroundColor: lowfuelAnim.interpolate({
                      inputRange: [0, 10],
                      outputRange: ['#ffffff', '#FEF5E8']
                    }),
                  },
                  // (this.state.mode == 'refill') && styles.addRefillContainer,
                  ]}>
        <Animated.View 
          style={[
              styles.mileage,
              (this.state.mode == 'refill') && {
                height: refillAnim.interpolate({
                  inputRange: [0, 10],
                  outputRange: [100, 0]
                })
              },
              (this.state.mode == 'lowfuel') && {
                height: lowfuelAnim.interpolate({
                  inputRange: [0, 10],
                  outputRange: [100, 0]
                })
              },
              ]}>
              <Button onPress={() => navigate('AddLowFuel')} title="History" />
          <Text style={styles.mileageLabel}>MILEAGE</Text>
          <Text style={styles.mileageValue}>{Math.round(this.state.mileage * 100) / 100}</Text>
        </Animated.View>

        <View style={styles.buttons}>
          <TouchableWithoutFeedback onPress={this.newLowFuel}>
            <Animated.View style={[
                      {
                        overflow: 'hidden',
                        flex: refillAnim.interpolate({
                          inputRange: [0, 10],
                          outputRange: [1, 0]
                        }),
                        width: refillAnim.interpolate({
                          inputRange: [0, 10],
                          outputRange: [1, 0]
                        }),
                        opacity: refillAnim.interpolate({
                          inputRange: [0, 10],
                          outputRange: [1, 0]
                        }),
                      }, 
                      // (this.state.mode == 'refill') && styles.hide
                      ]}>
              <View style={[styles.button, styles.lowFuelButton]}>
                <Image source={require('./images/lowfuel.png')} />
                <Text style={[styles.lowFuelText, {fontWeight: 'bold'}]}>LOW FUEL</Text>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
          

          <TouchableWithoutFeedback onPress={this.newRefill}>
            <Animated.View style={[
                      {
                        overflow: 'hidden',
                        flex: lowfuelAnim.interpolate({
                          inputRange: [0, 10],
                          outputRange: [1, 0]
                        }),
                        width: lowfuelAnim.interpolate({
                          inputRange: [0, 10],
                          outputRange: [1, 0]
                        }),
                        opacity: lowfuelAnim.interpolate({
                          inputRange: [0, 10],
                          outputRange: [1, 0]
                        }),
                      }, 
                      // (this.state.mode == 'lowfuel') && styles.hide
                      ]}>
              <View style={[styles.button, styles.refillButton]}>
                <Image source={require('./images/refill.png')} />
                <Text style={[styles.refillText, {fontWeight: 'bold'}]}>REFILL</Text>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>

        </View>

        <Animated.View style={[
            {alignItems: 'center'}, 
            (this.state.mode != 'lowfuel') && styles.hide,
            {
              opacity: lowfuelAnim.interpolate({
                inputRange: [5, 10],
                outputRange: [0, 1]
              })
            }
            ]}>
          <TextInput
            ref={(input) => { this.lowFuelInput = input; }} 
            style={[styles.inputBox, styles.lowFuelText, {fontWeight: '300'}]}
            selectionColor='#F5A623'
            onChangeText={(text) => this.setState({lowfuelinput: text})}
            keyboardType="numeric"
            value={this.state.lowfuelinput}
          />

          <View style={styles.buttons}>
            <TouchableOpacity onPress={this.cancelAdd}>
               <Image source={require('./images/cancel.png')} style={{opacity: 0.5, marginRight: 10}} />
            </TouchableOpacity>

            <TouchableOpacity onPress={this.addLowFuel}>
               <Image source={require('./images/addLowFuel.png')} style={{marginLeft: 10}} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View style={[
            {alignItems: 'center'}, 
            (this.state.mode != 'refill') && styles.hide,
            {
              opacity: refillAnim.interpolate({
                inputRange: [5, 10],
                outputRange: [0, 1]
              })
            }
            ]}>
          <TextInput
            ref={(input) => { this.refillInput = input; }} 
            style={[styles.inputBox, styles.refillText, {fontWeight: '300'}]}
            selectionColor='#79B74E'
            onChangeText={(text) => this.setState({refillinput: text})}
            keyboardType="numeric"
            value={this.state.refillinput}
          />

          <View style={styles.buttons}>
            <TouchableOpacity onPress={this.cancelAdd}>
               <Image source={require('./images/cancel.png')} style={{opacity: 0.5, marginRight: 20}} />
            </TouchableOpacity>

            <TouchableOpacity onPress={this.addRefill}>
               <Image source={require('./images/addRefill.png')} />
            </TouchableOpacity>
          </View>

        </Animated.View>

      </Animated.ScrollView>
    );
  }
}

class AddLowFuel extends React.Component {
  static navigationOptions = {
    title: 'History',
    // headerStyle: {backgroundColor: '#FEF5E8'},
    header: <View><Text style={{color: 'red'}}>hi</Text></View>
  };

  constructor(props) {
    super(props);

    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
  
    this.state = {
      dataSource: ds.cloneWithRows(["sfsdfsdf", "Sdfsdfsd", "Sdfdsf"]),
    };
  }
  componentDidMount(){
    let t = this

    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    db.transaction(tx => {
      tx.executeSql('select * from events', [], (_, { rows }) => {

        console.log(rows)

        if(rows.length > 0) {
          // t.setState({dataSource: ds.cloneWithRows(rows._array)})
          t.setState({dataSource: rows._array})
        }

      });
    });
  }
  render() {
    return (
      <ScrollView style={styles.addLowFuelContainer}>
        <FlatList
          data={this.state.dataSource}
          renderItem={({item}) => <View style={styles.todoItem}><Text style={styles.todoText}>{item.value}</Text></View>}
        />
      </ScrollView>
    );
  }
}


const App = StackNavigator({
  Home: { screen: HomeScreen },
  AddLowFuel: { screen: AddLowFuel }
});
// { headerMode: 'float' });

export default App

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
});
