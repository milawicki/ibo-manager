import { Address } from ".";

export default interface Bottle {
  name: string;
  symbol: string;
  owner: Address;
  totalSupply: number;
  bottles: number;
  desc: string;
  producer: string;
  url: string;
  price: number;
  shopPrice: number;
  address?: Address;
}
