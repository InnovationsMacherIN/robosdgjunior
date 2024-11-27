// Ble3.jsx
import React, { Component } from 'react';

class Ble3 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deviceCache: null,
      characteristicCache_tx: null,
      characteristicCache_rx: null,
      characteristicCache_temp: null,
      connected: false,
    };
  }

  async connect() {
    console.log('Connecting...');
    try {
      const device = await this.requestBluetoothDevice();
      await device.gatt.connect();
      this.setState({ deviceCache: device });

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('6e400001-b5a3-f393-e0a9-e50e24dcca9e');
      const characteristics = await service.getCharacteristics();

      const tx = characteristics.find(
        c => c.uuid === '6e400002-b5a3-f393-e0a9-e50e24dcca9e'
      );
      const rx = characteristics.find(
        c => c.uuid === '6e400003-b5a3-f393-e0a9-e50e24dcca9e'
      );

      if (!tx || !rx) {
        throw new Error('Required characteristics not found');
      }

      this.setState({
        characteristicCache_tx: tx,
        characteristicCache_rx: rx
      });

      await tx.startNotifications();
      tx.addEventListener('characteristicvaluechanged', this.handleCharacteristicValueChanged);

      this.setState({ connected: true });
      this.props.onConnected(true);
      console.log('Connected successfully');

    } catch (error) {
      console.error('Connection failed:', error);
      this.setState({
        deviceCache: null,
        characteristicCache_tx: null,
        characteristicCache_rx: null,
        connected: false
      });
      throw error;
    }
  }

  disconnect() {
    if (!this.state.deviceCache) {
      return;
    }

    this.state.deviceCache.gatt.disconnect();
    this.setState({
      deviceCache: null,
      characteristicCache_tx: null,
      characteristicCache_rx: null,
      characteristicCache_temp: null,
      connected: false,
    });
    this.props.onConnected(false);
  }

  async requestBluetoothDevice() {
    const filters = [{ namePrefix: 'BBC micro:bit' }];
    const optionalServices = [
      '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
      'e95d6100-251d-470a-a062-fa1922dfa9a8',
    ];

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters,
        optionalServices,
      });

      return device;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async connectDeviceAndCacheCharacteristics(device) {
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(
      '6e400001-b5a3-f393-e0a9-e50e24dcca9e'
    );
    const characteristics = await service.getCharacteristics();

    const characteristicCache_tx = characteristics.find(
      (c) => c.uuid === '6e400002-b5a3-f393-e0a9-e50e24dcca9e'
    );
    const characteristicCache_rx = characteristics.find(
      (c) => c.uuid === '6e400003-b5a3-f393-e0a9-e50e24dcca9e'
    );

    this.setState({ characteristicCache_tx, characteristicCache_rx });
  }

  async startNotifications(characteristic) {
    await characteristic.startNotifications();
    characteristic.addEventListener(
      'characteristicvaluechanged',
      this.handleCharacteristicValueChanged
    );
  }

  isConnected() {
    return this.state.connected;
  }

  async sendData(data) {
    if (!this.state.connected || !this.state.characteristicCache_rx) {
      throw new Error('Not connected to device');
    }
    await this.state.characteristicCache_rx.writeValue(new TextEncoder().encode(data));
  }

  handleCharacteristicValueChanged(event) {
    const value = new TextDecoder().decode(event.target.value);
    console.log(value);
  }

  render() {
    return (
      <div>
        <button onClick={() => this.connect()}>
          {this.state.connected ? 'Connected' : 'Connect'}
        </button>
        <button onClick={() => this.disconnect()}>Disconnect</button>
      </div>
    );
  }
}

export default Ble3;
