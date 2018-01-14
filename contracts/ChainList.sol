pragma solidity 0.4.15;

contract ChainList {

    bool private lockBalance;
    address owner;

    struct Article {
        uint id;
        address seller;
        address buyer;
        string name;
        string description;
        uint256 price;
    }

    mapping(uint => Article) public articles;
    uint articleCounter;

    event SellArticleEvent (
        uint indexed id,
        address indexed _seller,
        string _name,
        uint256 _price
    );

    event BuyArticleEvent (
        uint indexed id,
        address indexed _seller,
        address indexed _buyer,
        string _name,
        uint256 _price
    );

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function ChainList() public { owner = msg.sender; }

    function sellArticle(string _name, string _description, uint256 _price) public {
        articleCounter++;
        articles[articleCounter] = Article (articleCounter, msg.sender, 0x0, _name, _description, _price);
        SellArticleEvent(articleCounter, msg.sender, _name, _price);
    }

    function getNumberOfArticles() public constant returns (uint) { return articleCounter; }

    function getArticlesForSale() public constant returns (uint[]) { 
        if (articleCounter == 0) { return new uint[](0); }

        uint[] memory articleIds = new uint[](articleCounter);
        uint numberOfArticlesForSale = 0;

        for (uint i = 1; i <= articleCounter; i++) {
            if (articles[i].buyer == 0x0) {
                articleIds[numberOfArticlesForSale++] = articles[i].id;
            }
        }

        uint[] memory forSale = new uint[](numberOfArticlesForSale);
        for (uint j = 0; j < numberOfArticlesForSale; j++) {
            forSale[j] = articleIds[j];
        }

        return (forSale); 
    }


    function buyArticle(uint id) payable public {
        require(!lockBalance);                          // lock function from re-entrance
        lockBalance = true;

        require(articleCounter > 0);                    // at least one article exist
        require(id > 0 && id <= articleCounter);        // id is in the range
        require(articles[id].buyer == 0x0);             // we check that the article was not already sold
        require(articles[id].seller != msg.sender);     // we don't allow the seller to buy its own article
        require(articles[id].price == msg.value);       // we check whether the value sent corresponds to the article price

        articles[id].buyer = msg.sender;
        articles[id].seller.transfer(msg.value);
        BuyArticleEvent(id, articles[id].seller, articles[id].buyer, articles[id].name, articles[id].price);
        
        lockBalance = false;
    }

    function kill() public onlyOwner {
        selfdestruct(owner);
    }
}

