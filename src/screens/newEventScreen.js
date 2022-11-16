import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';


export default function NewEventScreen() {

  return (
    <View style={styles.body}>
      <Text style={styles.text}>This is the create event screen</Text>
    </View>
  )
}
const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: 'white',
  },
  text: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
  },
  eventItem: {
    padding: 20,
    flexDirection: 'row',
    elevation: 4,
    borderRadius: 8,
    marginVertical: 10,
    backgroundColor: 'white'
  },
})
