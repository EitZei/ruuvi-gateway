require('./lib/conf/logging');

const log = require('winston');
const noble = require('@abandonware/noble');
const axios = require('axios');
const mqtt = require('mqtt')

const ruuvi = require('./lib/ruuvi');

const perDeviceBufferSize = process.env.PER_DEVICE_BUFFER_SIZE || 30;
const previousData = {};
const buffer = [];

log.info('Ruuvi Gateway starting...');


const client = MQTT.connect(process.env.MQTT_URL, { username: process.env.USERNAME, password: process.env.PASSWORD });

client.on('connect', () => {
  log.info('MQTT client connected.')
});

noble.on('stateChange', (state) => {
  if (state === 'poweredOn') {
    log.info('BLE powered on. Start scanning.');
    noble.startScanning([], true);
  } else {
    log.info('Other state change. Stop scanning.');
    noble.stopScanning();
  }
});

noble.on('discover', (peripheral) => {
  const rawData = peripheral.advertisement.manufacturerData;

  if (rawData && rawData.length > 0) {
    const data = ruuvi.parseData(rawData.toString('hex'));

    if (data) {
      log.debug(`Got ${peripheral.id} ${JSON.stringify(data)}`);

      // Send to MQTT
      sendToMqtt(peripheral.id, data)

      previousData[peripheral.id] = data;

      buffer.push({
        id: peripheral.id,
        timestamp: new Date().getTime(),
        data,
      });

      // Size buffer by number of detected devices and buffer size
      const bufferLimit = Object.keys(previousData).length * perDeviceBufferSize;

      if (buffer.length > bufferLimit) {
        const auth = {
          username: process.env.DATA_INBOUND_API_USERNAME,
          password: process.env.DATA_INBOUND_API_PASSWORD,
        };

        const dataToSend = buffer.splice(0, buffer.length);

        axios.post(process.env.DATA_INBOUND_API_URL, dataToSend, {
            auth
          })
          .then(() => {
            log.debug(`Successfully send ${dataToSend.length} measurements to the server.`);
          })
          .catch((e) => {
            log.log(`Failed sending data to the serve ${e}.`);
          });
      }
    }
  }
});

function sendToMqtt(id, data) {
  client.publish(`ruuvi/${id}/temperature`, data.temperature)
  client.publish(`ruuvi/${id}/humidity`, data.humidity)
  client.publish(`ruuvi/${id}/pressure`, data.pressure)
  client.publish(`ruuvi/${id}/battery`, data.battery)
  client.publish(`ruuvi/${id}/acceleration`, JSON.stringify({ x: data.accelerationX, y: data.accelerationY, z: data.accelerationZ}))
}
