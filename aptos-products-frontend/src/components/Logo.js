import React from 'react';
import { View, Text } from '@react-pdf/renderer';

const Logo = () => (
  <View style={{
    width: 50,
    height: 50,
    backgroundColor: '#0ea5e9',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <Text style={{ color: 'white', fontSize: 24 }}>🏥</Text>
  </View>
);

export default Logo;