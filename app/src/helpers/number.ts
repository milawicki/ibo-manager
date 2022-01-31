import Web3 from "web3";

export function toEth(value: number | string): string {
  return Web3.utils.fromWei(value.toString());
}

export function fromEth(value: number | string): string {
  return Web3.utils.toWei(value.toString());
}
