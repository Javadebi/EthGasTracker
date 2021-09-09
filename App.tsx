import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  StatusBar,
  ToastAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';
import BackgroundService from 'react-native-background-actions';
import ModalPicker from './ModalPicker';

PushNotification.createChannel(
  {
    channelId: '1',
    channelName: 'gasprice',
  },
  created => {
    console.log(created);
  },
);

export const getData = async (item: string) => {
  try {
    const value = await AsyncStorage.getItem(item);
    if (value !== null) {
      return value;
    }
  } catch (error) {
    console.log(error);
  }
};

export const storeData = async (name: string, item: string) => {
  try {
    await AsyncStorage.setItem(name, item);
  } catch (error) {
    console.log(error);
  }
};

const options = {
  taskName: 'Gas Track',
  taskTitle: 'Tracking the gas :)',
  taskDesc: 'Checking gas price when idle',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#6C747C',
};

// const showAlert = () => {
//   Alert.alert('Error', 'Something Went Wrong', [
//     {
//       text: 'Exit',
//       onPress: () => {
//         console.log('hello');
//       },
//     },
//   ]);
// };

const toastWarning = () => {
  ToastAndroid.showWithGravity(
    'Network connection failed!',
    ToastAndroid.SHORT,
    ToastAndroid.BOTTOM,
  );
};

const getGasValues = async () => {
  try {
    const response = await fetch(
      'https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=25JHHF5BPJGHGBHYY9JVGJGV2EVM6BSJAR',
    );
    const json = await response.json();
    return json;
  } catch (error) {
    console.error(error);
  }
};

export default function App() {
  const backgroundJobStart = async () => {
    await BackgroundService.start(backgroundJob, options)
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        console.log(err);
      });
  };
  const backgroundJob = async () => {
    await new Promise(async () => {
      setInterval(() => {
        getGasValues().then(async result => {
          const selected = await getData('selected')
            .then(res => {
              return res;
            })
            .catch(err => {
              return err;
            });
          const push_notifications = await getData('push_notifications')
            .then(res => {
              return res;
            })
            .catch(err => {
              return err;
            });
          const limit = await getData('limit')
            .then(res => {
              return res;
            })
            .catch(err => {
              return err;
            });
          if (
            push_notifications === 'true' &&
            typeof selected !== 'undefined' &&
            typeof push_notifications !== 'undefined' &&
            typeof limit !== 'undefined'
          ) {
            if (
              parseInt(limit, 10) !== 0 &&
              result.result[
                typeof selected !== undefined ? selected : 'SafeGasPrice'
              ] < parseInt(limit, 10)
            ) {
              PushNotification.localNotification({
                message: `Gas is lower than ${limit} gwei`,
                channelId: '1',
              });
              await storeData('push_notifications', 'false');
              await storeData('isSet', 'false');
            }
          }
        });
      }, 1000);
    });
  };
  const [gas, setGas] = useState({
    fastGas: {gwei: 0, time: 0},
    instantGas: {gwei: 0, time: 0},
    normalGas: {gwei: 0, time: 0},
    slowGas: {gwei: 0, time: 0},
  });
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!BackgroundService.isRunning()) {
      backgroundJobStart();
    }
    const interval = setInterval(() => {
      getGasValues()
        .then(result => {
          setGas({
            fastGas: {
              gwei: result.result.FastGasPrice,
              time: 0,
            },
            instantGas: {
              gwei: 0,
              time: 0,
            },
            normalGas: {
              gwei: result.result.ProposeGasPrice,
              time: 0,
            },
            slowGas: {
              gwei: result.result.SafeGasPrice,
              time: 0,
            },
          });
        })
        .catch(err => {
          console.log(err);
          toastWarning();
        });
    }, 1000);
    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.mainContainer}>
      <StatusBar animated={true} backgroundColor="#202224" />
      <ModalPicker
        isSet={true}
        modalVisible={modalVisible}
        setModalVisible={() => setModalVisible(!modalVisible)}
        setIsSet={async () => {
          await storeData('isSet', 'false');
        }}
      />
      <ScrollView
        style={styles.scrollViewStyle}
        contentContainerStyle={styles.container}>
        {/* <Pressable
          style={{
            backgroundColor: 'red',
            position: 'absolute',
            left: 0,
            top: 10,
            zIndex: 1,
            width: 50,
          }}
          onPress={() => {
            console.log('hell');
          }}>
          <Text>Hello</Text>
        </Pressable> */}
        <View style={styles.gasContainer}>
          <Text style={styles.title}>SLOW</Text>
          <Text style={styles.gwei}>{gas.slowGas.gwei} gwei</Text>
          <Text style={styles.time}>{`< ${gas.slowGas.time} minutes`}</Text>
        </View>
        <View style={styles.gasContainer}>
          <Text style={styles.title}>NORMAL</Text>
          <Text style={styles.gwei}>{gas.normalGas.gwei} gwei</Text>
          <Text style={styles.time}>{`< ${gas.normalGas.time} minutes`}</Text>
        </View>
        <View style={styles.gasContainer}>
          <Text style={styles.title}>FAST</Text>
          <Text style={styles.gwei}>{gas.fastGas.gwei} gwei</Text>
          <Text style={styles.time}>{`< ${gas.fastGas.time} minutes`}</Text>
        </View>
        {/* <View style={styles.gasContainer}>
          <Text style={styles.title}>INSTANT</Text>
          <Text style={styles.gwei}>{gas.instantGas.gwei} gwei</Text>
          <Text style={styles.time}>{`< ${gas.instantGas.time} minutes`}</Text>
        </View> */}
        <Pressable
          onPress={() => {
            setModalVisible(!modalVisible);
          }}>
          <Text style={styles.button}>SET NOTIFICATION</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#222629',
    alignItems: 'center',
    padding: 20,
  },
  gasContainer: {
    backgroundColor: '#383E4D',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    padding: 20,
    minWidth: 170,
    minHeight: 170,
    borderRadius: 20,
    marginBottom: 40,
  },
  title: {
    color: '#6C747C',
    fontWeight: 'bold',
    fontSize: 17,
  },
  gwei: {
    color: '#D4D4DC',
    fontWeight: '700',
    fontSize: 15,
  },
  price: {
    color: '#D4D4DC',
  },
  time: {
    color: '#6C747C',
    fontSize: 13,
  },
  button: {
    borderWidth: 1,
    padding: 17,
    backgroundColor: '#4e75b5',
    borderRadius: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollViewStyle: {
    flex: 1,
    backgroundColor: '#222629',
  },
  mainContainer: {
    flex: 1,
  },
});
