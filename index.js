require('./lib/conf/logging');

const log = require('winston');
const noble = require('noble');

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
      log.info(`Got ${peripheral.id} ${JSON.stringify(data)}`);
    }
  }
});
