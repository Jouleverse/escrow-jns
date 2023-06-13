// SPDX-License-Identifier: MIT
// Version: 1
// Author: Evan Liu <evan@blockcoach.com>
// Date: 2023.6.7
pragma solidity =0.8.0;

interface IERC721 {
    function balanceOf(address owner) external view returns (uint256 balance);
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function getApproved(uint256 tokenId) external view returns (address operator);
    function setApprovalForAll(address operator, bool _approved) external;
    function isApprovedForAll(address owner, address operator) external view returns (bool);
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;
}

interface IERC721Receiver {
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external returns (bytes4);
}

contract Escrow is IERC721Receiver {

    // the state of the transaction
    enum State { Inactive, Created, Locked }
    // the structure of a transaction
    struct Transaction {
        State state; // the state has a default value `State.Inactive`
		address arbitrator;
        address seller;
        address buyer;
        address token; // token contract address
        uint256 tokenId; // token id to be transacted
		bytes32 message;
    }
    // transactions that initiated by a token buyer
    // A buyer can have only one active transaction at once
    mapping(address=>Transaction) public transactions;
    
	// arbitrator who can judge the quarrel
	// and transfer the locked token to
	// either the seller or the buyer
	//address public arbitrator;

    // fully decentralized. no owner. non-stoppable. no monopolized arbitrator!
    constructor() {}

	/*// let another one to be the new arbitrator
	function abdicate(address _newArbitrator) public 
	{
		require(msg.sender == arbitrator, "Not Arbitrator");
		arbitrator = _newArbitrator;
	}*/

    event Created(address token, uint256 tokenId);
    event Aborted(address token, uint256 tokenId);
    event Accepted(address token, uint256 tokenId);
    event Confirmed(address token, uint256 tokenId);

    // Buyer (anyone) can initiate a transaction with an offer
	// _message can be any bytes (encrypted by seller's pub key) for seller's info
    function create(address _arbitrator, address _token, uint256 _tokenId, bytes32 _message) public
    {
        require(State.Inactive == transactions[msg.sender].state, "State is not Inactive");

        Transaction memory txn = Transaction({
            state: State.Created,
			arbitrator: _arbitrator,
            seller: IERC721(_token).ownerOf(_tokenId),
            buyer: msg.sender,
            token: _token,
            tokenId: _tokenId,
			message: _message
        });

        transactions[msg.sender] = txn;

        emit Created(_token, _tokenId);
    }

    // Buyer can abort the transaction and withdraw the offer
    // before the txn is locked
    function abort() public
    {
        require(State.Created == transactions[msg.sender].state, "State is not Created");
        require(msg.sender == transactions[msg.sender].buyer, "Not Buyer");

        address token = transactions[msg.sender].token;
        uint256 tokenId = transactions[msg.sender].tokenId;

        emit Aborted(token, tokenId);
        transactions[msg.sender].state = State.Inactive;
    }

    // Seller accepts the sale offer
    // token will be locked up
    // until confirmed
    function accept(address _buyer) public
    {
        require(State.Created == transactions[_buyer].state, "State is not Created");
        require(msg.sender == transactions[_buyer].seller, "Not Seller");

        address token = transactions[_buyer].token;
        uint256 tokenId = transactions[_buyer].tokenId;

        emit Accepted(token, tokenId);
        transactions[_buyer].state = State.Locked;

        IERC721(token).safeTransferFrom(msg.sender, address(this), tokenId);
    }

    function onERC721Received(address , address , uint256 , bytes calldata ) pure external override returns (bytes4) 
	{
		return IERC721Receiver.onERC721Received.selector;
	}

	// Arbitrator judge the deadlock.
	function judge(address _buyer, bool _buyerWins) public
	{
        require(State.Locked == transactions[_buyer].state, "State is not Locked");
		require(msg.sender == transactions[_buyer].arbitrator, "Not suitable Arbitrator");

        address token = transactions[_buyer].token;
        uint256 tokenId = transactions[_buyer].tokenId;

		if (_buyerWins) {
			emit Confirmed(token, tokenId);
			transactions[_buyer].state = State.Inactive;
			IERC721(token).safeTransferFrom(address(this), _buyer, tokenId);
		} else { // seller wins
			emit Aborted(token, tokenId);
			transactions[_buyer].state = State.Inactive;
			IERC721(token).safeTransferFrom(address(this), transactions[_buyer].seller, tokenId);
		}
	}

    // Seller confirms to close the deal
	// token will be transferred to the buyer
    function confirm(address _buyer) public 
    {
        require(State.Locked == transactions[_buyer].state, "State is not Locked");
        require(msg.sender == transactions[_buyer].seller, "Not Seller");

        address token = transactions[_buyer].token;
        uint256 tokenId = transactions[_buyer].tokenId;

        emit Confirmed(token, tokenId);
        transactions[_buyer].state = State.Inactive; //FIXME? plz be aware that _seller is not reset correctly

		IERC721(token).safeTransferFrom(address(this), _buyer, tokenId);
    }

}

