// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.10;

import "./IboMetadata.sol";

contract Ibo is IboMetadata {
  event Withdraw(address to, uint256 value);

  constructor(string memory name_, 
    string memory symbol_, 
    uint bottles_,
    string memory desc_,
    string memory producer_,
    string memory url_,
    uint256 price_,
    uint256 shopPrice_) IboMetadata(name_, symbol_, bottles_, desc_, producer_, url_, price_, shopPrice_) {}

  function buy(uint256 qua) payable external returns(bool) {
    require(msg.value == (price * qua), "Transfered value must be equal to bottle price");

    _mint(msg.sender, qua);
    return true;
  }

  /// Decreases _cap after after token is burned aka the bottle has been delivered
  function _afterTokenTransfer(address from, address to, uint256 amount) internal override {
    super._afterTokenTransfer(from, to, amount);

    if (to == address(0)) {
      _cap -= amount;
    }
  }

  function withdraw() external onlyOwner {
    uint256 balance = address(this).balance;
    require(balance > 0, 'nothing to withdraw');

    emit Withdraw(msg.sender, balance);

    payable(msg.sender).transfer(balance);
  }
}
