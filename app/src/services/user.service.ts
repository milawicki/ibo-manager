import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import { Address } from "@/interfaces";
import { EthService } from ".";

class UserService extends EthService {
  protected getContract(): Promise<Contract | null> {
    throw new Error("Method not implemented.");
  }

  async getCurrentUser(): Promise<Address | null> {
    const eth = this.getEthClient();
    if (!eth) {
      return null;
    }
  
    const accounts = await eth.getAccounts();
    return accounts[0];
  }

  async getCurrentUserBalance(): Promise<number> {
    const eth = this.getEthClient();
    const currentUser = eth && await this.getCurrentUser();
    const balance = currentUser && eth ? await eth.getBalance(currentUser) : '0';

    return +Web3.utils.fromWei(balance);
  }
}

export default new UserService;
