import { Address } from ".";

export default interface Withdraw {
  to: Address;
  value: number;
}
