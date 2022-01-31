// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.10;

import "./ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/bootle.struct.sol";

// This abstract contract takes care about all operations related to metatags of the token
// It's created to split contract into smaller parts that will be easier to maintain

abstract contract IboMetadata is Ownable, ERC20Burnable, ERC20Capped {
  string internal desc;
  string internal producer;
  string internal url;
  uint256 internal price;
  uint256 internal shopPrice;

  constructor(
    string memory name_, 
    string memory symbol_, 
    uint bottles_,
    string memory desc_,
    string memory producer_,
    string memory url_,
    uint256 price_,
    uint256 shopPrice_
  ) ERC20(name_, symbol_) ERC20Capped(bottles_) {
    desc = desc_;
    producer = producer_;
    url = url_;
    price = price_;
    shopPrice = shopPrice_;
  }

  function decimals() public view virtual override returns (uint8) {
    return 0;
  }

  function setDescription(string calldata desc_) external onlyOwner {
    desc = desc_;
  }

  function setProducer(string calldata producer_) external onlyOwner {
    producer = producer_;
  }

  function setUrl(string calldata url_) external onlyOwner {
    url = url_;
  }

  function setPrice(uint256 price_) external onlyOwner {
    price = price_;
  }

  function setShopPrice(uint256 shopPrice_) external onlyOwner {
    shopPrice = shopPrice_;
  }

  function setDetails(string calldata desc_, string calldata producer_, string calldata url_, uint256 price_, uint256 shopPrice_) external onlyOwner {
    desc = desc_;
    producer = producer_;
    url = url_;
    price = price_;
    shopPrice = shopPrice_;
  }

  function getDetails() external view returns(Bootle memory bootle) {
    return Bootle (
      name(),
      symbol(),
      owner(),
      totalSupply(),
      cap(),
      desc,
      producer,
      url,
      price,
      shopPrice
    );
  }

  function _mint(address account, uint256 amount) internal override(ERC20, ERC20Capped) {
    super._mint(account, amount);
  }
}
