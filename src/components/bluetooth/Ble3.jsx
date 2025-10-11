/**
 * @file Ble3.jsx
 * @description A component for handling Bluetooth Low Energy (BLE) communication with a micro:bit device.
 * @module components/bluetooth/Ble3
 */
import { Component } from 'react';

class Ble3 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deviceCache: null,
      characteristicCache_tx: null,
      characteristicCache_rx: null,
      characteristicCache_temp: null,
      connected: false,
      sending_data: false,
      stopButtonClicked: false
    };
  }

  /**
   * @function connect
   * @description Connects to a Bluetooth device.
   */
  async connect() {
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

    } catch (error) {
      this.setState({
        deviceCache: null,
        characteristicCache_tx: null,
        characteristicCache_rx: null,
        connected: false
      });
      throw error;
    }
  }

  /**
   * @function disconnect
   * @description Disconnects from the Bluetooth device.
   */
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

  /**
   * @function requestBluetoothDevice
   * @description Requests a Bluetooth device from the user.
   * @returns {Promise<BluetoothDevice>} The selected Bluetooth device.
   */
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
      throw error;
    }
  }

  /**
   * @function connectDeviceAndCacheCharacteristics
   * @description Connects to a device and caches its characteristics.
   * @param {BluetoothDevice} device - The device to connect to.
   */
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

  /**
   * @function startNotifications
   * @description Starts notifications for a characteristic.
   * @param {BluetoothRemoteGATTCharacteristic} characteristic - The characteristic to start notifications for.
   */
  async startNotifications(characteristic) {
    await characteristic.startNotifications();
    characteristic.addEventListener(
      'characteristicvaluechanged',
      this.handleCharacteristicValueChanged
    );
  }

  /**
   * @function isConnected
   * @description Checks if the device is connected.
   * @returns {boolean} Whether the device is connected.
   */
  isConnected() {
    return this.state.connected;
  }

  /**
   * @function sendData
   * @description Sends data to the device.
   * @param {Array<string>} commands - The commands to send.
   * @param {number} counter - The current command index.
   */
  async sendData(commands, counter = 0) {
    if (!this.state.connected || !this.state.characteristicCache_rx) {
      throw new Error('Not connected to device');
    }

    if (counter === 0) {
      if (this.state.stopButtonClicked) {
        this.setState({ stopButtonClicked: false });
      }
      if (typeof commands === 'string') {
        commands = commands.split(':').filter(cmd => cmd).map(cmd => cmd + ':');
      }
    }

    const encoder = new TextEncoder('utf-8');
    const data = encoder.encode(commands[counter]);

    this.setState({ sending_data: true });

    try {
      await this.state.characteristicCache_rx.writeValue(data);

      await Promise.race([
        this.waitForConfirmation(counter),
        this.timeout(20000)
      ]);

      if (counter < commands.length - 1 && !this.state.stopButtonClicked) {
        await this.sendData(commands, counter + 1);
      }

    } catch (error) {
      this.setState({ sending_data: false });
      throw error;
    }

    if (counter === commands.length - 1 || this.state.stopButtonClicked) {
      this.setState({ sending_data: false });
    }
  }

  /**
   * @function timeout
   * @description A timeout promise.
   * @param {number} ms - The timeout in milliseconds.
   * @returns {Promise<void>}
   */
  timeout(ms) {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Command timeout')), ms)
    );
  }

  /**
   * @function waitForConfirmation
   * @description Waits for a confirmation from the device.
   * @param {number} counter - The current command index.
   * @returns {Promise<number>} The next command index.
   */
  waitForConfirmation(counter) {
    return new Promise((resolve, reject) => {
      const handleResponse = (event) => {
        const value = new TextDecoder().decode(event.target.value).trim();

        if (value === 'OK' || value === 'UC') {
          this.state.characteristicCache_tx.removeEventListener(
            'characteristicvaluechanged',
            handleResponse
          );
          resolve(counter + 1);
        } else if (value === 'STOP') {
          reject(new Error('Program was stopped'));
        } else {
          reject(new Error(`Invalid confirmation value: ${value}`));
        }
      };

      this.state.characteristicCache_tx.addEventListener(
        'characteristicvaluechanged',
        handleResponse
      );
    });
  }

  render() {
    return null
  }
}

export default Ble3;