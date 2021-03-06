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

const db = SQLite.openDatabase({ name: 'db.db' });

class HomeScreen extends React.Component {

  static navigationOptions = {
    tabBarVisible: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      lowfuelinput: '',
      refillinput: '',
      mode: 'mileage',
      lastinput: '',
      lastlowfuel: {id: 0},
      lowfuelvalidation: null, 
      mileage: 0,
      units: this.props.screenProps.units,
      refillAnim: new Animated.Value(0),
      lowfuelAnim: new Animated.Value(0)
    };

    this.newLowFuel = this.newLowFuel.bind(this);
    this.addLowFuel = this.addLowFuel.bind(this);
    this.newRefill = this.newRefill.bind(this);
    this.addRefill = this.addRefill.bind(this);
    this.cancelAdd = this.cancelAdd.bind(this);
    this.clear = this.clear.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({units: nextProps.screenProps.units})
  }

  componentDidMount() {
    let t = this

    // t.clear();
    
    db.transaction(tx => {
      // tx.executeSql(
      //   'drop table events;'
      // );
      // tx.executeSql(
      //   'drop table mileages;'
      // );
      tx.executeSql('create table if not exists events (id integer primary key not null, type text, value float, date);');
      tx.executeSql('create table if not exists mileages (id integer primary key not null, value float);');

      // Find out last input type
      tx.executeSql('select * from events order by id desc limit 1', [], (_, { rows }) => {

        if(rows.length > 0) {
          t.setState({lastinput: rows.item(0)})
        }

      });

      // Find out last low fuel entry. Will come in handy
      tx.executeSql('select * from events where type = ? order by id desc limit 1', ["lowfuel"], (_, { rows }) => {

        if(rows.length > 0) {
          t.setState({lastlowfuel: rows.item(0)})
        }

      });

      // Calculate average mileage
      tx.executeSql('select * from mileages', [], (_, { rows }) => {
        // console.log(rows)
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

  async clear() {

    db.transaction(tx => {
      tx.executeSql(
        'drop table events;'
      );
      tx.executeSql(
        'drop table mileages;'
      );
    })
    await AsyncStorage.removeItem('mileageUnits')

  }
  // Get input for New Low Fuel
  newLowFuel() {

    if(this.state.lastinput.type == "lowfuel") {

      return;

    } else {

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

  }

  // Add Low Fuel, on tap of Tick
  addLowFuel() {
    let t = this;

    if(t.state.lowfuelinput == "")
      return;

    let val = parseFloat(t.state.lowfuelinput);

    if (val <= t.state.lastlowfuel.value) {
      t.setState({
        lowfuelvalidation: "You've already travelled " + t.state.lastlowfuel.value + " Kilometers",
      })
      return;
    }

    // Low fuel after a refill. Calculate and insert mileage. Update average mileage.

    db.transaction(
      tx => {
        tx.executeSql('insert into events (type, value, date) values ("lowfuel", ?, ?)', [val, Date()], (_, { insertId, rows }) => {
          t.setState({
            lastinput: {id: insertId, type: "lowfuel", value: val},
            lastlowfuel: {id: insertId, type: "lowfuel", value: val},
            lowfuelvalidation: null
          })
        });

        tx.executeSql('select * from events where id >= ?', [t.state.lastlowfuel.id], (_, { rows }) => {

          // console.log(rows)

          if(rows.length > 2) {

            let oldOdo = rows.item(0).value
            let newOdo = rows.item(rows.length-1).value
            let refills = rows.length - 2, totalVolume = 0;

            while (refills > 0) {
              totalVolume += rows.item(refills).value
              refills -= 1
            }

            let mileage = (newOdo - oldOdo) / totalVolume

            tx.executeSql('insert into mileages (value) values (?)', [mileage], (_, {insertId}) => 
              t.setState({mileage: (t.state.mileage * (insertId-1) + mileage) / insertId })
            );

          }

        });

      }
    );

    this.lowFuelInput.blur()

    Animated.timing(
      this.state.lowfuelAnim,
      {
        toValue: 0,
        duration: 300,
      }
    ).start(() => {
      this.setState({refillinput: '', lowfuelinput: '', mode: 'mileage'});
    }); 
  }

  // Accept input for New Refill
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

  // Add Refill, on tap of Tick
  addRefill() {
    let t = this;

    if(t.state.refillinput == "")
      return;

    let val = parseFloat(t.state.refillinput);

    // Insert into db
    db.transaction(
      tx => {
        tx.executeSql('insert into events (type, value, date) values ("refill", ?, ?)', [val, Date()], (_, { insertId }) =>
          t.setState({lastinput: {id: insertId, type: "refill", value: val}})
        );
      }
    );

    this.refillInput.blur()

    Animated.timing(
      this.state.refillAnim,
      {
        toValue: 0,
        duration: 300,
      }
    ).start(() => {
      this.setState({refillinput: '', lowfuelinput: '', mode: 'mileage'});
    }); 
  }

  // Cancel either Add New
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
        this.setState({refillinput: '', lowfuelinput: '', mode: 'mileage'});
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
        this.setState({refillinput: '', lowfuelinput: '', mode: 'mileage', lowfuelvalidation: null});
      }); 

    }
  }

  render() {
    const { navigate } = this.props.navigation;
    let { refillAnim, lowfuelAnim } = this.state;

    return (
      <Animated.ScrollView 
          keyboardShouldPersistTaps='handled'
          style={[styles.container, 
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
                  ]}>

        <View style={styles.header}>
          <Animated.View 
            style={[
                (this.state.mode == 'refill') && {
                  opacity: refillAnim.interpolate({
                    inputRange: [0, 10],
                    outputRange: [1, 0]
                  })
                },
                (this.state.mode == 'lowfuel') && {
                  opacity: lowfuelAnim.interpolate({
                    inputRange: [0, 10],
                    outputRange: [1, 0]
                  },)
                },
            ]}>
            <TouchableOpacity onPress={() => navigate('Settings') } style={{padding: 20}}>
              <Image source={require('./images/settings.png')} />
            </TouchableOpacity>
          </Animated.View>

          <View style={{padding: 20}}>
            <Image source={require('./images/motorcycle.png')} />
          </View>

          <Animated.View 
            style={[
                (this.state.mode == 'refill') && {
                  opacity: refillAnim.interpolate({
                    inputRange: [0, 10],
                    outputRange: [1, 0]
                  })
                },
                (this.state.mode == 'lowfuel') && {
                  opacity: lowfuelAnim.interpolate({
                    inputRange: [0, 10],
                    outputRange: [1, 0]
                  },)
                },
            ]}>
            <TouchableOpacity onPress={() => navigate('History') } style={{padding: 20}}>
              <Image source={require('./images/history.png')} />
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Animated.View 
          style={[
              styles.mileage,
              (this.state.mode == 'refill') && {
                height: refillAnim.interpolate({
                  inputRange: [0, 10],
                  outputRange: [140, 0]
                })
              },
              (this.state.mode == 'lowfuel') && {
                height: lowfuelAnim.interpolate({
                  inputRange: [0, 10],
                  outputRange: [140, 0]
                })
              },
              ]}>
          <Text style={styles.mileageLabel}>MILEAGE</Text>
          <Text style={styles.mileageValue}>{Math.round(this.state.mileage * 100) / 100}</Text>
          <Text style={{color: '#aaa', textAlign: 'center'}}>
            {(this.state.units == "metric" && "KILOMETERS PER LITER") ||
              (this.state.units == "imperial" && "MILES PER GALLON")}
          </Text>
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
                      ]}>
              <View style={[
                  styles.button, 
                  styles.lowFuelButton,
                  (this.state.lastinput.type == "lowfuel") && styles.disabled,
                  ]}>
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
          <Text 
            style={[
              {color: 'red'},
              (this.state.lowfuelvalidation == null) && styles.hide,
              ]}
            >{this.state.lowfuelvalidation}</Text>
          <TextInput
            ref={(input) => { this.lowFuelInput = input; }} 
            style={[styles.inputBox, styles.lowFuelText, {fontWeight: '300'}]}
            selectionColor='#F5A623'
            onChangeText={(text) => this.setState({lowfuelinput: text})}
            keyboardType="numeric"
            value={this.state.lowfuelinput}
            underlineColorAndroid='transparent'
          />
          <Text style={{color: '#666', marginBottom: 30}}>
            {(this.state.units == "metric" && "KILOMETERS") ||
              (this.state.units == "imperial" && "MILES")}
          </Text>

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
            underlineColorAndroid='transparent'
          />
          <Text style={{color: '#666', marginBottom: 30}}>
            {(this.state.units == "metric" && "LITERS") ||
              (this.state.units == "imperial" && "GALLONS")}
          </Text>

          <View style={styles.buttons}>
            <TouchableOpacity onPress={this.cancelAdd}>
               <Image source={require('./images/cancel.png')} style={{opacity: 0.5, marginRight: 10}} />
            </TouchableOpacity>

            <TouchableOpacity onPress={this.addRefill}>
               <Image source={require('./images/addRefill.png')} style={{marginLeft: 10}} />
            </TouchableOpacity>
          </View>

        </Animated.View>

      </Animated.ScrollView>
    );
  }
}

export default HomeScreen



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Expo.Constants.statusBarHeight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  mileage: {
    height: 140,
    overflow: 'hidden',
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
    paddingLeft: 10,
    paddingRight: 10,
  },
  button: {
    flex: 1,
    padding: 20,
    marginLeft: 10,
    marginRight: 10,
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

  inputBox: {
    fontSize: 64,
    height: 72,
    width: '100%',
    marginBottom: 10,
    textAlign: 'center',
  },
  hide: {
    display: 'none'
  },
  disabled: {
    opacity: .4
  },

});