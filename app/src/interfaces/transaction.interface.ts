import { Address } from ".";

export default interface Transaction {
  from: Address;
  to: Address;
  value: number;
  symbol: string;
}
