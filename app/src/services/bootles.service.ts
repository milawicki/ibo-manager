import Web3 from 'web3';
import { Contract, ContractSendMethod } from 'web3-eth-contract';
import { EthService, UserService } from '.';
import { Address, Bottle, BuyBottles, TokenBalance } from '@/interfaces';
import contractMetadata from '../../../build/contracts/Ibo.json';

export enum BottlesServiceEvents {
  Approval = 'Approval',
  Purchase = 'Purchase',
  Transfer = 'Transfer',
  Withdraw = 'Withdraw'
}

export default class BottlesService extends EthService {
  private contract?: Contract;

  constructor(private address: Address) {
    super();
  }

  protected async getContract(): Promise<Contract | null> {
    if (this.contract) {
      return this.contract;
    }

    const eth = this.getEthClient();
    const from = await UserService.getCurrentUser() || undefined;
  
    if (!eth) {
      return null;
    }

    this.contract = new eth.Contract(contractMetadata.abi, this.address, { from });

    if (!this.contract) {
      return null;
    }

    eth.givenProvider.on('accountsChanged', (accounts: Address[]) => {
      this.contract!.options.from = accounts[0];
    });

    return this.contract;
  }

  async getDetails(): Promise<Bottle | undefined> {
    return (await this.getContract())?.methods.getDetails().call();
  }

  async getUserBalance(address: Address): Promise<TokenBalance | null> {
    const contract = await this.getContract();
    if (!contract) {
      return null;
    }

    const balance = +(await contract.methods.balanceOf(address).call());
    const token = await contract.methods.symbol().call();

    return { token, balance };
  }

  async buyToken(qua: number): Promise<void> {
    const contract = await this.getContract();
    if (!contract) {
      return;
    }

    const details = await this.getDetails();
    const value = Web3.utils.toBN(details!.price).mul(Web3.utils.toBN(qua));
    await contract.methods.buy(qua).send({ value });
  }

  async updateBottleData(updatedBottle: Bottle, bottle: Bottle): Promise<void> {
    const contract = await this.getContract();
    if (!contract) {
      return;
    }

    const toUpdate = this.getFieldsToUpdate(contract, updatedBottle, bottle);
    const separateCallsGas = await this.calculateGas(toUpdate);

    const setDetails = contract.methods.setDetails(bottle.desc, bottle.producer, bottle.url, Web3.utils.toBN(bottle.price.toString()), Web3.utils.toBN(bottle.shopPrice.toString()));
    const setDetailsGas = await setDetails.estimateGas();

    if (separateCallsGas < setDetailsGas) {
      const batch = new (this.getEthClient())!.BatchRequest();
      toUpdate.forEach(async (method: any) => batch.add(await method.send()));
      batch.execute();
    } else {
      setDetails.send();
    }
  }

  private getFieldsToUpdate(contract: Contract, updatedBottle: Bottle, bottle: Bottle): ContractSendMethod[] {
    const toUpdate = [];

    if (updatedBottle.desc !== bottle.desc) {
      toUpdate.push(contract.methods.setDescription(updatedBottle.desc));
    }

    if (+updatedBottle.price !== +bottle.price) {
      toUpdate.push(contract.methods.setPrice(Web3.utils.toBN(updatedBottle.price.toString())));
    }

    if (+updatedBottle.shopPrice !== +bottle.shopPrice) {
      toUpdate.push(contract.methods.setShopPrice(Web3.utils.toBN(updatedBottle.shopPrice.toString())))
    }

    if (updatedBottle.producer !== bottle.producer) {
      toUpdate.push(contract.methods.setProducer(updatedBottle.producer));
    }

    if (updatedBottle.url !== bottle.url) {
      toUpdate.push(contract.methods.setUrl(updatedBottle.url));
    }

    return toUpdate;
  }

  private async calculateGas(methods: ContractSendMethod[]): Promise<number> {
    let separateCallsGas = 0;
    for (let ndx = 0; ndx < methods.length; ndx++) {
      separateCallsGas += await methods[ndx].estimateGas();
    }

    return separateCallsGas;
  }

  async startWithdrawingProcess(owner: Address, data: TokenBalance): Promise<void> {
    (await this.getContract())?.methods.approve(owner, Web3.utils.toBN(data.balance.toString())).send();
  }

  async withdraw(): Promise<void> {
    (await this.getContract())?.methods.withdraw().send();
  }
}
