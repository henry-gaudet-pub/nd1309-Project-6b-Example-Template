App = {
    web3Provider: null,
    web3: null,
    contracts: {},
    emptyAddress: "0x0000000000000000000000000000000000000000",
    sku: 0,
    upc: 0,
    metamaskAccountID: "0x0000000000000000000000000000000000000000",
    ownerID: "0x0000000000000000000000000000000000000000",
    originFarmerID: "0x0000000000000000000000000000000000000000",
    originFarmName: null,
    originFarmInformation: null,
    originFarmLatitude: null,
    originFarmLongitude: null,
    productNotes: null,
    productPrice: 0,
    distributorID: "0x0000000000000000000000000000000000000000",
    retailerID: "0x0000000000000000000000000000000000000000",
    consumerID: "0x0000000000000000000000000000000000000000",

    init: async function () {
        App.readForm();
        /// Setup access to blockchain
        return await App.initWeb3();
    },

    readForm: function () {
        App.sku = $("#sku").val();
        App.upc = $("#upc").val();
        App.ownerID = $("#ownerID").val();
        App.originFarmerID = $("#originFarmerID").val();
        App.originFarmName = $("#originFarmName").val();
        App.originFarmInformation = $("#originFarmInformation").val();
        App.originFarmLatitude = $("#originFarmLatitude").val();
        App.originFarmLongitude = $("#originFarmLongitude").val();
        App.productNotes = $("#productNotes").val();
        App.productPrice = $("#productPrice").val();
        App.distributorID = $("#distributorID").val();
        App.retailerID = $("#retailerID").val();
        App.consumerID = $("#consumerID").val();

        console.log(`
            App.sku: ${App.sku}\n
            App.upc: ${App.upc}\n
            App.ownerID: ${App.ownerID}\n
            App.originFarmerID: ${App.originFarmerID}\n
            App.originFarmName: ${App.originFarmName}\n
            App.originFarmInformation: ${App.originFarmInformation}\n
            App.originFarmLatitude: ${App.originFarmLatitude}\n
            App.originFarmLongitude: ${App.originFarmLongitude}\n
            App.productNotes: ${App.productNotes}\n
            App.productPrice: ${App.productPrice}\n
            App.distributorID: ${App.distributorID}\n
            App.retailerID: ${App.retailerID}\n
            App.consumerID: ${App.consumerID}\n
        `);
    },

    initWeb3: async function () {
        /// Find or Inject Web3 Provider
        /// Modern dapp browsers...
        if (window.ethereum) {
            try {
                App.web3Provider = window.ethereum;
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                App.metamaskAccountID = accounts[0];
                console.log(`Using metmask account: ${App.metamaskAccountID}`);
                web3 = new Web3(App.web3Provider);
                web3.eth.defaultAccount = App.metamaskAccountID;
            } catch (error) {
                if (error.code === 4001) {
                    console.log(`User rejected request: code ${error.code}`);
                    // User rejected request
                }

                console.log(`error: ${error.code}`);
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }

        return App.initSupplyChain();
    },

    initSupplyChain: function () {
        /// Source the truffle compiled smart contracts
        var jsonSupplyChain = '../../build/contracts/SupplyChain.json';

        /// JSONfy the smart contracts
        $.getJSON(jsonSupplyChain, function (data) {
            console.log('data', data);
            var SupplyChainArtifact = data;
            App.contracts.SupplyChain = TruffleContract(SupplyChainArtifact);
            App.contracts.SupplyChain.setProvider(App.web3Provider);

            App.fetchItemBufferOne();
            App.fetchItemBufferTwo();
            App.fetchEvents();
        });

        return App.bindEvents();
    },

    bindEvents: function () {
        $(document).on('click', App.handleButtonClick);
    },

    handleButtonClick: async function (event) {
        event.preventDefault();

        var processId = parseInt($(event.target).data('id'));
        console.log('processId', processId);

        switch (processId) {
            case 1:
                return await App.harvestItem(event);
                break;
            case 2:
                return await App.processItem(event);
                break;
            case 3:
                return await App.packItem(event);
                break;
            case 4:
                return await App.sellItem(event);
                break;
            case 5:
                return await App.buyItem(event);
                break;
            case 6:
                return await App.shipItem(event);
                break;
            case 7:
                return await App.receiveItem(event);
                break;
            case 8:
                return await App.purchaseItem(event);
                break;
            case 9:
                return await App.fetchItemBufferOne(event);
                break;
            case 10:
                return await App.fetchItemBufferTwo(event);
                break;
            case 11:
                return await App.addFarmer(event);
                break;
            case 12:
                return await App.addDistributor(event);
                break;
            case 13:
                return await App.addRetailer(event);
                break;
            case 14:
                return await App.addConsumer(event);
                break;
        }
    },

    harvestItem: function (event) {
        event.preventDefault();

        window.ethereum.request({ method: 'eth_requestAccounts' }
        ).then((accounts) => {
            App.metamaskAccountID = accounts[0];
            web3.eth.defaultAccount = App.metamaskAccountID;
            return App.contracts.SupplyChain.deployed()
        }).then(function (instance) {
            return instance.harvestItem(
                App.upc,
                App.metamaskAccountID,
                App.originFarmName,
                App.originFarmInformation,
                App.originFarmLatitude,
                App.originFarmLongitude,
                App.productNotes,
                { from: App.metamaskAccountID }
            );
        }).then(function (result) {
            $("#ftc-item").text(result);
            console.log('harvestItem', result);
            $("#farmerErrorText").text("");
        }).catch(function (err) {
            console.log(`harvestItem error: ${err.message}`);
            $("#farmerErrorText").text("The transaction was not processed. Only farmers can Harvest, Process, Pack, or Sell items. Are you a farmer?");
            setInterval(function() {
                $("#farmerErrorText").text("");
            }, 10000);
        });
    },

    processItem: function (event) {
        event.preventDefault();

        window.ethereum.request({ method: 'eth_requestAccounts' }
        ).then((accounts) => {
            App.metamaskAccountID = accounts[0];
            web3.eth.defaultAccount = App.metamaskAccountID;
            return App.contracts.SupplyChain.deployed()
        }).then(function (instance) {
            return instance.processItem(App.upc, { from: App.metamaskAccountID });
        }).then(function (result) {
            $("#ftc-item").text(result);
            console.log('processItem', result);
            $("#farmerErrorText").text("");
        }).catch(function (err) {
            console.log(`processItem error: ${err.message}`);
            $("#farmerErrorText").text("The transaction was not processed. Only farmers can Harvest, Process, Pack, or Sell items. Are you a farmer?");
            setInterval(function() {
                $("#farmerErrorText").text("");
            }, 10000);
        });
    },

    packItem: function (event) {
        event.preventDefault();

        window.ethereum.request({ method: 'eth_requestAccounts' }
        ).then((accounts) => {
            App.metamaskAccountID = accounts[0];
            web3.eth.defaultAccount = App.metamaskAccountID;
            return App.contracts.SupplyChain.deployed()
        }).then(function (instance) {
            return instance.packItem(App.upc, { from: App.metamaskAccountID });
        }).then(function (result) {
            $("#ftc-item").text(result);
            console.log('packItem', result);
            $("#farmerErrorText").text("");
        }).catch(function (err) {
            console.log(`packItem error: ${err.message}`);
            $("#farmerErrorText").text("The transaction was not processed. Only farmers can Harvest, Process, Pack, or Sell items. Are you a farmer?");
            setInterval(function() {
                $("#farmerErrorText").text("");
            }, 10000);
        });
    },

    sellItem: function (event) {
        event.preventDefault();

        window.ethereum.request({ method: 'eth_requestAccounts' }
        ).then((accounts) => {
            App.metamaskAccountID = accounts[0];
            web3.eth.defaultAccount = App.metamaskAccountID;
            return App.contracts.SupplyChain.deployed()
        }).then(function (instance) {
            const productPrice = web3.toWei("1", "ether");
            console.log('productPrice', productPrice);
            return instance.sellItem(App.upc, App.productPrice, { from: App.metamaskAccountID });
        }).then(function (result) {
            $("#ftc-item").text(result);
            console.log('sellItem', result);
            $("#farmerErrorText").text("");
        }).catch(function (err) {
            console.log(`sellItem error: ${err.message}`);
            $("#farmerErrorText").text("The transaction was not processed. Only farmers can Harvest, Process, Pack, or Sell items. Are you a farmer?");
            setInterval(function() {
                $("#farmerErrorText").text("");
            }, 10000);
        });
    },

    buyItem: function (event) {
        event.preventDefault();

        window.ethereum.request({ method: 'eth_requestAccounts' }
        ).then((accounts) => {
            App.metamaskAccountID = accounts[0];
            web3.eth.defaultAccount = App.metamaskAccountID;
            return App.contracts.SupplyChain.deployed()
        }).then(function (instance) {
            const walletValue = web3.toWei("3", "ether");
            return instance.buyItem(App.upc, { from: App.metamaskAccountID, value: walletValue });
        }).then(function (result) {
            $("#ftc-item").text(result);
            console.log('buyItem', result);
            $("#productErrorText").text("");
        }).catch(function (err) {
            console.log(`buyItem error: ${err.message}`);
            $("#productErrorText").text("The transaction was not processed. Only distributors can Buy and Ship items. Are you a distributor?");
            setInterval(function() {
                $("#productErrorText").text("");
            }, 10000);
        });
    },

    shipItem: function (event) {
        event.preventDefault();

        window.ethereum.request({ method: 'eth_requestAccounts' }
        ).then((accounts) => {
            App.metamaskAccountID = accounts[0];
            web3.eth.defaultAccount = App.metamaskAccountID;
            return App.contracts.SupplyChain.deployed()
        }).then(function (instance) {
            return instance.shipItem(App.upc, { from: App.metamaskAccountID });
        }).then(function (result) {
            $("#ftc-item").text(result);
            console.log('shipItem', result);
            $("#productErrorText").text("");
        }).catch(function (err) {
            console.log(`shipItem error: ${err.message}`);
            $("#productErrorText").text("The transaction was not processed. Only distributors can Buy and Ship items. Are you a distributor?");
            setInterval(function() {
                $("#productErrorText").text("");
            }, 10000);
        });
    },

    receiveItem: function (event) {
        event.preventDefault();

        window.ethereum.request({ method: 'eth_requestAccounts' }
        ).then((accounts) => {
            App.metamaskAccountID = accounts[0];
            web3.eth.defaultAccount = App.metamaskAccountID;
            return App.contracts.SupplyChain.deployed()
        }).then(function (instance) {
            return instance.receiveItem(App.upc, { from: App.metamaskAccountID });
        }).then(function (result) {
            $("#ftc-item").text(result);
            console.log('receiveItem', result);
            $("#productErrorText").text("");
        }).catch(function (err) {
            console.log(`receiveItem error: ${err.message}`);
            $("#productErrorText").text("The transaction was not processed. Only retailers can Receive items. Are you a retailer?");
            setInterval(function() {
                $("#productErrorText").text("");
            }, 10000);
        });
    },

    purchaseItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        window.ethereum.request({ method: 'eth_requestAccounts' }
        ).then((accounts) => {
            App.metamaskAccountID = accounts[0];
            web3.eth.defaultAccount = App.metamaskAccountID;
            return App.contracts.SupplyChain.deployed()
        }).then(function (instance) {
            return instance.purchaseItem(App.upc, { from: App.metamaskAccountID });
        }).then(function (result) {
            $("#ftc-item").text(result);
            console.log('purchaseItem', result);
            $("#productErrorText").text("");
        }).catch(function (err) {
            console.log(`purchaseItem error: ${err.message}`);
            $("#productErrorText").text("The transaction was not processed. Only consumers can Purchase items. Are you a consumer?");
            setInterval(function() {
                $("#productErrorText").text("");
            }, 10000);
        });
    },

    addFarmer: function (event) {
        event.preventDefault();

        window.ethereum.request({ method: 'eth_requestAccounts' }
        ).then((accounts) => {
            App.metamaskAccountID = accounts[0];
            web3.eth.defaultAccount = App.metamaskAccountID;
            return App.contracts.SupplyChain.deployed()
        }).then(function (instance) {
            console.log(`adding farmer ${App.metamaskAccountID}`)
            return instance.addFarmer(App.metamaskAccountID);
        }).then(function (result) {
            console.log(`addFarmer result: ${Object.getOwnPropertyNames(result)}`);
        }).catch(function (error) {
            console.log(`addFarmer error: ${error.message}`);
        });
    },
    
    addDistributor: function(event) {
        event.preventDefault();

        window.ethereum.request({ method: 'eth_requestAccounts' }
        ).then((accounts) => {
            App.metamaskAccountID = accounts[0];
            web3.eth.defaultAccount = App.metamaskAccountID;
            return App.contracts.SupplyChain.deployed()
        }).then(function (instance) {
            console.log(`adding distributor ${App.metamaskAccountID}`)
            return instance.addDistributor(App.metamaskAccountID);
        }).then(function (result) {
            console.log(`addDistributor result: ${Object.getOwnPropertyNames(result)}`);
        }).catch(function (error) {
            console.log(`addDistributor error: ${error.message}`);
        });
    },
    
    addRetailer: function(event) {
        event.preventDefault();

        window.ethereum.request({ method: 'eth_requestAccounts' }
        ).then((accounts) => {
            App.metamaskAccountID = accounts[0];
            web3.eth.defaultAccount = App.metamaskAccountID;
            return App.contracts.SupplyChain.deployed()
        }).then(function (instance) {
            console.log(`adding retailer ${App.metamaskAccountID}`)
            return instance.addRetailer(App.metamaskAccountID);
        }).then(function (result) {
            console.log(`addRetailer result: ${Object.getOwnPropertyNames(result)}`);
        }).catch(function (error) {
            console.log(`addRetailer error: ${error.message}`);
        });
    },
    
    addConsumer: function(event) {
        event.preventDefault();

        window.ethereum.request({ method: 'eth_requestAccounts' }
        ).then((accounts) => {
            App.metamaskAccountID = accounts[0];
            web3.eth.defaultAccount = App.metamaskAccountID;
            return App.contracts.SupplyChain.deployed()
        }).then(function (instance) {
            console.log(`adding consumer ${App.metamaskAccountID}`)
            return instance.addConsumer(App.metamaskAccountID);
        }).then(function (result) {
            console.log(`addConsumer result: ${Object.getOwnPropertyNames(result)}`);
        }).catch(function (error) {
            console.log(`addConsumer error: ${error.message}`);
        });
    },

    fetchItemBufferOne: function () {
        ///   event.preventDefault();
        ///    var processId = parseInt($(event.target).data('id'));
        App.upc = $('#upc').val();
        console.log('upc', App.upc);

        App.contracts.SupplyChain.deployed().then(function (instance) {
            return instance.fetchItemBufferOne(App.upc);
        }).then(function (result) {
            $("#ftc-item").text(result);
            console.log('fetchItemBufferOne', result);
        }).catch(function (err) {
            console.log(err.message);
        });
    },

    fetchItemBufferTwo: function () {
        ///    event.preventDefault();
        ///    var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function (instance) {
            return instance.fetchItemBufferTwo.call(App.upc);
        }).then(function (result) {
            $("#ftc-item").text(result);
            console.log('fetchItemBufferTwo', result);
        }).catch(function (err) {
            console.log(err.message);
        });
    },

    fetchEvents: function () {
        if (typeof App.contracts.SupplyChain.currentProvider.sendAsync !== "function") {
            App.contracts.SupplyChain.currentProvider.sendAsync = function () {
                return App.contracts.SupplyChain.currentProvider.send.apply(
                    App.contracts.SupplyChain.currentProvider,
                    arguments
                );
            };
        }

        App.contracts.SupplyChain.deployed().then(function (instance) {
            var events = instance.allEvents(function (err, log) {
                if (!err)
                    $("#ftc-events").append('<li>' + log.event + ' - ' + log.transactionHash + '</li>');
            });
        }).catch(function (err) {
            console.log(err.message);
        });

    }
};

$(function () {
    $(window).load(function () {
        App.init();
    });
});
