import { Address } from ".";

export default interface Approval {
  owner: Address;
  spender: Address
  value: string;
}
