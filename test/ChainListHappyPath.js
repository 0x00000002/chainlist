// Contract to be tested
var ChainList = artifacts.require("./ChainList.sol");

// Test suite
contract('ChainList', function(accounts) {
  var chainListInstance;
  var seller = accounts[2];
  var buyer = accounts[1];
  var articleName1 = "Article 1";
  var articleDescription1 = "Description for article 1";
  var articlePrice1 = 1;
  var articleName2 = "Article 2";
  var articleDescription2 = "Description for article 2";
  var articlePrice2 = 2;
  var sellerBalanceBeforeBuy, sellerBalanceAfterBuy;
  var buyerBalanceBeforeBuy, buyerBalanceAfterBuy;

  // Test case: check initial values
  it("should be initialized with empty values", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.getNumberOfArticles();
    }).then(function(data) {
      assert.equal(data, 0x0, "number of articles must be a zero");
      return chainListInstance.getArticlesForSale();
    }).then(function(receipt) {
      assert.equal(receipt.length, 0, "number of articles must be a zero");
    });
  });

  // Test case: sell 2 articles
  it("should sell 2 articles", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      chainListInstance.sellArticle(
        articleName1, 
        articleDescription1, 
        web3.toWei(articlePrice1, "ether"), 
        { from: seller }
      );
      chainListInstance.sellArticle(
        articleName2, 
        articleDescription2, 
        web3.toWei(articlePrice2, "ether"), 
        { from: seller }
      );
    }).then(function() {
      return chainListInstance.getNumberOfArticles();
    }).then(function(data) {
      assert.equal(data, 2, "should be 2 articles for sale");
    });
  });

  // Test case: get articles for sale
  it("should return 2 articles for sale", function() {
    return ChainList.deployed().then(function(instance) {
    }).then(function() {
      return chainListInstance.getArticlesForSale();
    }).then(function(data) {
      assert.equal(data.length, 2, "should see 2 articles for sale");
    });
  });

  // Test case: buy an article
  it("should buy an article", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;

      //record balances of seller and buyer before the buy
      sellerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

      return chainListInstance.buyArticle(
        1, 
        {
          from: buyer,
          value: web3.toWei(articlePrice1, "ether")
        }
      );
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "BuyArticleEvent", "event should be BuyArticleEvent");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
      assert.equal(receipt.logs[0].args._buyer, buyer, "event buyer must be " + buyer);
      assert.equal(receipt.logs[0].args._name, articleName1, "event article name must be " + articleName1);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "event article price must be " + web3.toWei(articlePrice1, "ether"));

      sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

      //check the effect of buy on balances of buyer and seller, accounting for gas
      assert(sellerBalanceAfterBuy == sellerBalanceBeforeBuy + articlePrice1, "seller should have earned " + articlePrice1 + " ETH");
      assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - articlePrice1, "buyer should have spent " + articlePrice1 + " ETH");
    }).then(function() {
      return chainListInstance.getArticlesForSale();
    }).then(function(data) {
      assert.equal(data.length, 1, "one article should left");
    });
  });

});
