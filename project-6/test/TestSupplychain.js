// This script is designed to test the solidity smart contract - SuppyChain.sol -- and the various functions within
// Declare a variable and assign the compiled smart contract artifact
var SupplyChain = artifacts.require('SupplyChain')

contract('SupplyChain', function(accounts) {
    // Declare few constants and assign a few sample accounts generated by ganache-cli
    var sku = 1;
    var upc = 1;
    const ownerID = accounts[0];
    const originFarmerID = accounts[1];
    const originFarmName = "John Doe";
    const originFarmInformation = "Yarray Valley";
    const originFarmLatitude = "-38.239770";
    const originFarmLongitude = "144.341490";
    var productID = sku + upc;
    const productNotes = "Best beans for Espresso";
    const productPrice = web3.toWei("1", "ether");
    var itemState = 0;
    const distributorID = accounts[2];
    const retailerID = accounts[3];
    const consumerID = accounts[4];
    const emptyAddress = '0x00000000000000000000000000000000000000';

    ///Available Accounts
    ///==================
    ///(0) 0x27d8d15cbc94527cadf5ec14b69519ae23288b95
    ///(1) 0x018c2dabef4904ecbd7118350a0c54dbeae3549a
    ///(2) 0xce5144391b4ab80668965f2cc4f2cc102380ef0a
    ///(3) 0x460c31107dd048e34971e57da2f99f659add4f02
    ///(4) 0xd37b7b8c62be2fdde8daa9816483aebdbd356088
    ///(5) 0x27f184bdc0e7a931b507ddd689d76dba10514bcb
    ///(6) 0xfe0df793060c49edca5ac9c104dd8e3375349978
    ///(7) 0xbd58a85c96cc6727859d853086fe8560bc137632
    ///(8) 0xe07b5ee5f738b2f87f88b99aac9c64ff1e0c7917
    ///(9) 0xbd3ff2e3aded055244d66544c9c059fa0851da44

    console.log("ganache-cli accounts used here...");
    console.log("Contract Owner: accounts[0] ", accounts[0]);
    console.log("Farmer: accounts[1] ", accounts[1]);
    console.log("Distributor: accounts[2] ", accounts[2]);
    console.log("Retailer: accounts[3] ", accounts[3]);
    console.log("Consumer: accounts[4] ", accounts[4]);

    // 1st Test
    it("Testing smart contract function harvestItem() that allows a farmer to harvest coffee", async() => {
        console.log(web3.version.api)
        const supplyChain = await SupplyChain.deployed();

        await supplyChain.addFarmer(originFarmerID);

        // Mark an item as Harvested by calling function harvestItem()
        let res = await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, {from: originFarmerID});
        let resupc = parseInt(res.receipt.logs[0].data);

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(resupc);
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(resupc);

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, `Error: Invalid item SKU, expected ${sku} but was ${resultBufferOne[0]}`);
        assert.equal(resultBufferOne[1], upc, `Error: Invalid item UPC, expected ${upc}, but was ${resultBufferOne[1]}`);
        assert.equal(resultBufferOne[2], ownerID, `Error: Missing or Invalid ownerID, expected ${originFarmerID} but was ${resultBufferOne[2]}`);
        assert.equal(resultBufferOne[3], originFarmerID, `Error: Missing or Invalid originFarmerID, expected ${originFarmerID} but was ${resultBufferOne[3]}`);
        assert.equal(resultBufferOne[4], originFarmName, `Error: Missing or Invalid originFarmName, expected ${originFarmName} but was ${resultBufferOne[4]}`);
        assert.equal(resultBufferOne[5], originFarmInformation, `Error: Missing or Invalid originFarmInformation, expected ${originFarmInformation} but was ${resultBufferOne[5]}`);
        assert.equal(resultBufferOne[6], originFarmLatitude, `Error: Missing or Invalid originFarmLatitude, expected ${originFarmLatitude} but was ${resultBufferOne[6]}`);
        assert.equal(resultBufferOne[7], originFarmLongitude, `Error: Missing or Invalid originFarmLongitude, expected ${originFarmLongitude} but was ${resultBufferOne[7]}`);
        assert.equal(resultBufferTwo[5], itemState, `Error: Invalid itemState, expected ${itemState} but was ${resultBufferTwo[5]}`);

        itemState++;
    });

    // 2nd Test
    it("Testing smart contract function processItem() that allows a farmer to process coffee", async() => {
        const supplyChain = await SupplyChain.deployed();
        
        // Watch the emitted event Processed()
        let res = await supplyChain.processItem(upc, {from: originFarmerID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

        // Verify the result set
        assert.equal(resultBufferTwo[5], itemState, `Error: Invalid itemState, expected ${itemState} but was ${resultBufferTwo[5]}`);

        itemState++;
    })

    // 3rd Test
    it("Testing smart contract function packItem() that allows a farmer to pack coffee", async() => {
        const supplyChain = await SupplyChain.deployed();

        // Mark an item as Packed by calling function packItem()
        let res = await supplyChain.packItem(upc, {from: originFarmerID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

        // Verify the result set
        assert.equal(resultBufferTwo[5], itemState, `Error: Invalid itemState, expected ${itemState} but was ${resultBufferTwo[5]}`);

        itemState++;
    })    

    // 4th Test
    it("Testing smart contract function sellItem() that allows a farmer to sell coffee", async() => {
        const supplyChain = await SupplyChain.deployed();

        // Mark an item as ForSale by calling function sellItem()
        let res = await supplyChain.sellItem(upc, productPrice, {from: originFarmerID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

        // Verify the result set
        assert.equal(resultBufferTwo[4], productPrice, `Error: Invalid productPrice, expected ${productPrice} but was ${resultBufferTwo[5]}`);
        assert.equal(resultBufferTwo[5], itemState, `Error: Invalid itemState, expected ${itemState} but was ${resultBufferTwo[5]}`);

        itemState++;
    })

    // 5th Test
    it("Testing smart contract function buyItem() that allows a distributor to buy coffee", async() => {
        const supplyChain = await SupplyChain.deployed();

        await supplyChain.addDistributor(distributorID);

        // Mark an item as Sold by calling function buyItem()
        let priceBefore = await web3.eth.getBalance(distributorID);
        let res = await supplyChain.buyItem(upc, {from: distributorID, value: productPrice});        

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

        // Verify the result set
        let priceAfter = await web3.eth.getBalance(distributorID);
        let difference = priceBefore - priceAfter;

        assert.isAtLeast(parseInt(difference), parseInt(productPrice), `Error: Invalid price paid, expected ${difference} but was ${productPrice}`);
        assert.equal(resultBufferTwo[6], distributorID, `Error: Invalid distributorID, expected ${distributorID} but was ${resultBufferOne[6]}`);
        assert.equal(resultBufferTwo[5], itemState, `Error: Invalid itemState, expected ${itemState} but was ${resultBufferTwo[5]}`);

        itemState++;
    })    

    // 6th Test
    it("Testing smart contract function shipItem() that allows a distributor to ship coffee", async() => {
        const supplyChain = await SupplyChain.deployed();

        // Mark an item as Shipped by calling function shipItem()
        let res = await supplyChain.shipItem(upc, {from: distributorID});        

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

        // Verify the result set
        assert.equal(resultBufferTwo[5], itemState, `Error: Invalid itemState, expected ${itemState} but was ${resultBufferTwo[5]}`);

        itemState++;
    })

    // 7th Test
    it("Testing smart contract function receiveItem() that allows a retailer to mark coffee received", async() => {
        const supplyChain = await SupplyChain.deployed();

        await supplyChain.addRetailer(retailerID);

        // Mark an item as Sold by calling function recieveItem()
        let res = await supplyChain.receiveItem(upc, {from: retailerID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

        // Verify the result set
        assert.equal(resultBufferTwo[7], retailerID, `Error: Invalid retailerID, expected ${retailerID} but was ${resultBufferTwo[7]}`);
        assert.equal(resultBufferTwo[5], itemState, `Error: Invalid itemState, expected ${itemState} but was ${resultBufferTwo[5]}`);

        itemState++;
    })

    // 8th Test
    it("Testing smart contract function purchaseItem() that allows a consumer to purchase coffee", async() => {
        const supplyChain = await SupplyChain.deployed();

        await supplyChain.addConsumer(consumerID);

        // Mark an item as Sold by calling function purchaseItem()
        let res = await supplyChain.purchaseItem(upc, {from: consumerID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

        // Verify the result set
        assert.equal(resultBufferTwo[8], consumerID, `Error: Invalid consumerID, expected ${consumerID} but was ${resultBufferTwo[8]}`);
        assert.equal(resultBufferTwo[5], itemState, `Error: Invalid itemState, expected ${itemState} but was ${resultBufferTwo[5]}`);
    })

    // 9th Test
    it("Testing smart contract function fetchItemBufferOne() that allows anyone to fetch item details from blockchain", async() => {
        const supplyChain = await SupplyChain.deployed();

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);

        // Verify the result set:
        assert.equal(resultBufferOne[0], sku, `Error: Invalid item SKU, expected ${sku} but was ${resultBufferOne[0]}`);
        assert.equal(resultBufferOne[1], upc, `Error: Invalid item UPC, expected ${upc}, but was ${resultBufferOne[1]}`);
        assert.equal(resultBufferOne[2], ownerID, `Error: Missing or Invalid ownerID, expected ${ownerID} but was ${resultBufferOne[2]}`);
        assert.equal(resultBufferOne[3], originFarmerID, `Error: Missing or Invalid originFarmerID, expected ${originFarmerID} but was ${resultBufferOne[3]}`);
        assert.equal(resultBufferOne[4], originFarmName, `Error: Missing or Invalid originFarmName, expected ${originFarmName} but was ${resultBufferOne[4]}`);
        assert.equal(resultBufferOne[5], originFarmInformation, `Error: Missing or Invalid originFarmInformation, expected ${originFarmInformation} but was ${resultBufferOne[5]}`);
        assert.equal(resultBufferOne[6], originFarmLatitude, `Error: Missing or Invalid originFarmLatitude, expected ${originFarmLatitude} but was ${resultBufferOne[6]}`);
        assert.equal(resultBufferOne[7], originFarmLongitude, `Error: Missing or Invalid originFarmLongitude, expected ${originFarmLongitude} but was ${resultBufferOne[7]}`);
    })

    // 10th Test
    it("Testing smart contract function fetchItemBufferTwo() that allows anyone to fetch item details from blockchain", async() => {
        const supplyChain = await SupplyChain.deployed();

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);
        
        // Verify the result set:
        assert.equal(resultBufferTwo[0], sku, `Error: Invalid item SKU, expected ${sku} but was ${resultBufferTwo[0]}`);
        assert.equal(resultBufferTwo[1], upc, `Error: Invalid item UPC, expected ${upc}, but was ${resultBufferTwo[1]}`);
        assert.equal(resultBufferTwo[2], productID, `Error: Missing or Invalid productID, expected ${productID} but was ${resultBufferTwo[2]}`);
        assert.equal(resultBufferTwo[3], productNotes, `Error: Missing or Invalid productNotes, expected ${productNotes} but was ${resultBufferTwo[3]}`);
        assert.equal(resultBufferTwo[4], productPrice, `Error: Missing or Invalid productPrice, expected ${productPrice} but was ${resultBufferTwo[4]}`);
        assert.equal(resultBufferTwo[5], itemState, `Error: Missing or Invalid itemState, expected ${itemState} but was ${resultBufferTwo[5]}`);
        assert.equal(resultBufferTwo[6], distributorID, `Error: Missing or Invalid distributorID, expected ${distributorID} but was ${resultBufferTwo[6]}`);
        assert.equal(resultBufferTwo[7], retailerID, `Error: Missing or Invalid retailerID, expected ${retailerID} but was ${resultBufferTwo[7]}`);
        assert.equal(resultBufferTwo[8], consumerID, `Error: Missing or Invalid consumerID, expected ${consumerID} but was ${resultBufferTwo[8]}`);
    })

});

