import Web3 from "web3";
import { Eth } from 'web3-eth';
import { Contract } from 'web3-eth-contract';

export default abstract class EthService {
  private eth?: Eth;

  protected getEthClient(): Eth | null {
    if (this.eth) {
      return this.eth;
    }

    if (!Web3.givenProvider) {
      return null;
    }
  
    const web3 = new Web3(Web3.givenProvider);
    this.eth = web3.eth;
    return this.eth;
  }

  connectToWallet(): Promise<string[]> | undefined {
    return this.eth?.requestAccounts();
  }

  protected abstract getContract(): Promise<Contract | null>;

  async subscribeForEvent(event: string, callback: Function): Promise<void> {
    (await this.getContract())?.events[event]().on('data', callback);
  }

  async subscribeForEventOnce(event: string, callback: Function): Promise<void> {
    (await this.getContract())?.events[event]().once('data', callback);
  }
}
