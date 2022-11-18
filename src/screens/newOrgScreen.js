import React, { useState, useRef, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Pressable, Button, Platform } from 'react-native';

export default function NewOrgScreen() {

  const [name, setName] = useState('')
  const [id, setId] = useState('')

  return (
    <View style={styles.body}>
      <TextInput 
          style={styles.input} 
          placeholder="Organization Name"
          value={name}
          onChangeText={(value) => setName(value)}    
      ></TextInput>
      <TextInput 
          style={styles.input} 
          placeholder="example: @myOrgId1234"
          value={id}
          onChangeText={(value) => setId(value)}    
      ></TextInput>
      <TouchableOpacity style={styles.button} onPress={() => onSavePressHandler()}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </View>
  )
}
const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    paddingTop: 50,
  },
  input: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#fff',
    textAlign: 'left',
    fontSize: 20,
    margin: 20,
    paddingHorizontal: 10,
  },
  button: {
    width: 90,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#49b3b3',
    justifyContent: 'center',
    alignItems: 'center', 
    position: 'absolute',
    bottom: 40,
    elevation: 2,
  },
  buttonText: {
    color: '#eef5db',
    fontSize: 16,
  },
})

