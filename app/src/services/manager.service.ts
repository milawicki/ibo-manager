import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { EthService, UserService } from '.';
import { Address, BottleEditableDetails, Ibo } from '@/interfaces';
import contractMetadata from '../../../build/contracts/IboManager.json';

export enum ManagerServiceEvents {
  IboCreated = 'IboCreated'
}

class ManagerService extends EthService {
  private contract?: Contract;

  protected async getContract(): Promise<Contract | null> {
    if (this.contract) {
      return this.contract;
    }

    const eth = this.getEthClient();
    const networkId = await eth?.net.getId();
    const contractAddressInCurrentNetwork = networkId && contractMetadata?.networks[networkId]?.address;
  
    const from = await UserService.getCurrentUser() || undefined;
  
    if (!eth || !contractAddressInCurrentNetwork) {
      return null;
    }

    this.contract = new eth.Contract(contractMetadata.abi, contractAddressInCurrentNetwork, { from });

    eth.givenProvider.on('accountsChanged', (accounts: Address[]) => {
      this.contract!.options.from = accounts[0];
    });

    return this.contract;
  }

  async getNumberOfIbos(): Promise<number> {
    return +await (await this.getContract())?.methods.getNumberOfIbos().call();
  }

  async getIbos(offset: number, limit: number): Promise<Ibo[]> {
    try {
      return await (await this.getContract())?.methods.getIbos(offset, limit).call();
    } catch(err) {
      return [];
    }
  }

  async createBottle(bottle: BottleEditableDetails, callback: Function | null = null): Promise<void> {
    callback && await this.subscribeForEventOnce(ManagerServiceEvents.IboCreated, callback);

    (await this.getContract())?.methods.create(
      bottle.name, bottle.symbol, bottle.bottles, bottle.desc, bottle.producer, bottle.url, 
      Web3.utils.toBN(bottle.price), Web3.utils.toBN(bottle.shopPrice)
    ).send();
  }
}

export default new ManagerService;
