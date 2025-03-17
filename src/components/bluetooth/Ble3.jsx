// Ble3.jsx
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

  async sendData(commands, counter = 0) {
    if (!this.state.connected || !this.state.characteristicCache_rx) {
      throw new Error('Not connected to device');
    }

    // Jos counter on 0, kyseessä on uusi komentosarja
    if (counter === 0) {
      if (this.state.stopButtonClicked) {
        this.setState({ stopButtonClicked: false });
        console.log("reset stop button");
      }
      // Muunnetaan string-muotoiset komennot arrayksi
      if (typeof commands === 'string') {
        commands = commands.split(':').filter(cmd => cmd).map(cmd => cmd + ':');
      }
      console.log('Starting new command sequence:', commands);
    }

    // Lähetetään nykyinen komento
    const encoder = new TextEncoder('utf-8');
    const data = encoder.encode(commands[counter]);

    console.log('Sending command:', commands[counter]);
    this.setState({ sending_data: true });

    try {
      await this.state.characteristicCache_rx.writeValue(data);

      // Odotetaan vahvistusta micro:bitiltä
      await Promise.race([
        this.waitForConfirmation(counter),
        this.timeout(20000)
      ]);

      // Jos ei olla vielä viimeisessä komennossa ja stop-nappia ei ole painettu
      if (counter < commands.length - 1 && !this.state.stopButtonClicked) {
        // Rekursiivinen kutsu seuraavalle komennolle
        await this.sendData(commands, counter + 1);
      }

    } catch (error) {
      console.error('Error in sendData:', error);
      this.setState({ sending_data: false });
      throw error;
    }

    // Jos tämä oli viimeinen komento tai tuli virhe
    if (counter === commands.length - 1 || this.state.stopButtonClicked) {
      this.setState({ sending_data: false });
    }
  }

  timeout(ms) {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Command timeout')), ms)
    );
  }

  waitForConfirmation(counter) {
    return new Promise((resolve, reject) => {
      const handleResponse = (event) => {
        const value = new TextDecoder().decode(event.target.value).trim();
        console.log('Received confirmation:', value);

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
