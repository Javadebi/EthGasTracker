import React, {FC, useState} from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  TextInput,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {storeData} from './App';

const ModalPicker: FC<ModalPickerProps> = ({
  isSet,
  modalVisible,
  setIsSet,
  setModalVisible,
}) => {
  const [selectedValue, setSelectedValue] = useState('SafeGasPrice');
  const [smallerNumber, setSmallerNumber] = useState('');
  // const [biggerNumber, setBiggerNumber] = useState("");
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible()}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 17}}>
            Select Gas Speed
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <View style={styles.pickerView}>
              <Picker
                selectedValue={selectedValue}
                onValueChange={(itemValue: string) => {
                  setSelectedValue(itemValue);
                }}
                style={styles.picker}
                mode="dropdown">
                <Picker.Item label="Slow" value="SafeGasPrice" />
                <Picker.Item label="Normal" value="ProposeGasPrice" />
                <Picker.Item label="Fast" value="FastGasPrice" />
                {/* <Picker.Item label="Instant" value="fastest" /> */}
              </Picker>
            </View>
            <Text style={styles.buttonText}>{'<'}</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={smallerNumber}
              onChangeText={value => {
                setSmallerNumber(value);
              }}
              placeholder="0"
              placeholderTextColor="#fff"
            />
          </View>
          <View style={styles.buttonsView}>
            <Pressable style={styles.button} onPress={() => setModalVisible()}>
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={styles.button}
              onPress={async () => {
                setModalVisible();
                await storeData('push_notifications', 'true');
                await storeData('selected', selectedValue);
                await storeData('limit', `${smallerNumber}`);
                setIsSet();
              }}>
              <Text style={styles.buttonText}>Set</Text>
            </Pressable>
          </View>
          {isSet ? (
            <Pressable
              style={styles.clearButton}
              onPress={async () => {
                setSmallerNumber('');
                await storeData('isSet', 'false');
                await storeData('push_notifications', 'false');
                setModalVisible();
              }}>
              <Text style={styles.buttonText}>Clear</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

export default ModalPicker;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: '#383E4D',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  picker: {
    height: 40,
    width: 120,
    color: '#fff',
  },
  button: {
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    backgroundColor: '#4e75b5',
    margin: 10,
  },
  buttonsView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
  },
  textInput: {
    height: 45,
    margin: 10,
    width: 50,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    borderColor: '#fff',
    color: '#fff',
  },
  pickerView: {
    borderWidth: 1,
    borderRadius: 20,
    margin: 10,
    borderColor: '#fff',
  },
  clearButton: {
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    backgroundColor: '#bd2424',
    margin: 10,
  },
});

interface ModalPickerProps {
  isSet: boolean;
  modalVisible: boolean;
  setIsSet: () => void;
  setModalVisible: () => void;
}
