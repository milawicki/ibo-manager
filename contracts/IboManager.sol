// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.10;

import "./Ibo.sol" as Contract;

contract IboManager {
  struct Ibo {
    string symbol;
    address addr;
  }

  event IboCreated(string symbol, address addr);

  address private immutable owner;

  /// maps tokens symbols to contract address
  mapping(string => address) ibos;
  
  /// list of created tokens
  string[] symbols;

  constructor() {
    owner = msg.sender;
  }

  function withdraw() external {
    payable(owner).transfer(address(this).balance);
  }

  /// Returns paginated list of IBOs
  /// offset = index of first element to get
  /// limit = number of elements to get
  function getIbos(uint256 offset, uint256 limit) view external returns(Ibo[] memory) {
    require(offset < symbols.length, "not enough data");

    if (offset + limit >= symbols.length) {
      limit = symbols.length - offset;
    }

    Ibo[] memory arr = new Ibo[](limit);
    uint256 index = 0;

    for (uint256 ndx = offset; ndx < offset + limit; ndx++) {
      arr[index] = Ibo(symbols[ndx], ibos[symbols[ndx]]);
      index++;
    }
    
    return arr;
  }

  function getAddressBySymbol(string calldata symbol) view external returns(address) {
    return ibos[symbol];
  }

  /// Creates new token and transfer it's ownership to sender
  /// symbol_ has to be unique
  function create(string memory name_, 
    string memory symbol_, 
    uint bottles_,
    string calldata desc_,
    string calldata producer_,
    string calldata url_,
    uint256 price_,
    uint256 shopPrice_) external {

    require(ibos[symbol_] == address(0), "this symbol is already taken");
    
    Contract.Ibo newIbo = new Contract.Ibo(name_, symbol_, bottles_, desc_, producer_, url_, price_, shopPrice_);
    newIbo.transferOwnership(msg.sender);

    symbols.push(symbol_);
    ibos[symbol_] = address(newIbo);

    emit IboCreated(symbol_, address(newIbo));
  }

  function getNumberOfIbos() view external returns(uint256) {
    return symbols.length;
  }
}
