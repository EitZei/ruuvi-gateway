# ruuvi-gateway

## Configuration

- `LOG_DIR` specify directory to where to log
- `PER_DEVICE_BUFFER_SIZE` amount of measurements to buffer before batch sending them to the server. Value is multiplied with the amount of sensor that have sent data. Defaults to 30.
- `DATA_INBOUND_API_USERNAME` HTTP Basic username used when sending data to the Cloud
- `DATA_INBOUND_API_PASSWORD` HTTP Basic password used when sending data to the Cloud
- `DATA_INBOUND_API_URL` API URL used when sending data to the Cloud

## Installing to Raspberry Pi

These are my instructions to install and get this RuuviTag BLE + Node + Raspberry Pi system up and running. Your mileage may vary.

1. Boot up the Raspberry Pi with monitor, mouse and keyboard attached
2. Go through the initial setup wizard. Reserve some time to do this as the systme updates itself at first start.
3. Open terminal and enable SSH by running `sudo systemctl enable ssh` and `sudo systemctl start ssh`
4. Check the IP of the Raspberry PI by running `ifconfig``
5. SSH into the the Raspberry with username `pi` and the password that you set in phase 2.
6. Create directory `.ssh` to the users home directory and create file `authorized_keys` into that directory. Copy your public SSH key into that file to ease up logging in. Remember set the rights to `chmod 600 authorized_keys`
7. Install Node.js with `sudo apt-get install nodejs`
8. Check that Node.js works with `node -v`
8. Install Bluetooth libraries with `sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev libcap2-bin`
9. Give rights to Nodde `sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)`
10. Go to directory `/usr/local/share/`
11. Clone repository from git `sudo git clone [repositoryUrl]`
12. Give rights to user `sudo chown -R pi:staff ruuvi-gateway`
13. Create directory for logs `sudo mkdir /var/log/ruuvi-gateway`
14. Give rights to user to logs directory `sudo chown -R pi:staff /var/log/ruuvi-gateway/`
15. Add Yarn public key `curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -`
16. Add Yarn repository `echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list`
17. Install Yarn `sudo apt-get update && sudo apt-get install yarn`
18. Install application dependencies `yarn install`


./usr/local/share/ruuvi-gateway
./etc/systemd/system/ruuvi-gateway.service
