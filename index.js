require('./lib/conf/logging');

const log = require('winston');
const noble = require('noble');
const axios = require('axios');

const ruuvi = require('./lib/ruuvi');

log.info('Ruuvi Gateway starting...');

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

      const auth = {
        username: process.env.DATA_INBOUND_API_USERNAME,
        password: process.env.DATA_INBOUND_API_PASSWORD,
      };

      axios.post(process.env.DATA_INBOUND_API_URL, {
          id: peripheral.id,
          data,
        }, {
          auth
        })
        .then(() => {
          log.debug(`Successfully send data to the server for ID ${peripheral.id}.`);
        })
        .catch((e) => {
          log.log(`Failed sending data to the serve ${e}.`);
        });
    }
  }
});
