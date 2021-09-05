const HDWalletProvider = require('truffle-hdwallet-provider');
const fs = require('fs');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "1337"
    },
    rinkeby: {
      provider: ()=> {
        //replace string parameters
        return new HDWalletProvider('spirit supply whale amount human item harsh scare congress discover talent hamster', 'https://rinkeby.infura.io/v3/7c244ff134814e02a57bf32a4af11289');
      },
      network_id: 4
    }
  }
};