const IboManager = artifacts.require("IboManager");
const Ibo = artifacts.require("Ibo");

contract('IboManager', function (accounts) {
  let contract;

  beforeEach(async() => {
    contract = await IboManager.new();
  });

  describe('creating new IBO', () => {
    it('should create new IBO', async () => {
      const result = await contract.create(
        'Solaris 2022', 'SOL22', 100, 'New vintage of our best wine', 'Chateau Lawicki', 
        'http://www.wine.eth', '5000000000000000', '2000000000000000000'
      );

      const log = result.logs[0];
      expect(log.event).to.equal('IboCreated');

      const ibo = await Ibo.at(log.args.addr);
      expect(await ibo.owner()).to.equal(accounts[0]);
    });

    it('should failt when symbol exists', async() => {
      try {
        await contract.create(
          'Solaris 2022', 'SOL22', 100, 'New vintage of our best wine', 'Chateau Lawicki', 
          'http://www.wine.eth', '5000000000000000', '2000000000000000000'
        );
        await contract.create(
          'Solaris 2022', 'SOL22', 100, 'New vintage of our best wine', 'Chateau Lawicki', 
          'http://www.wine.eth', '5000000000000000', '2000000000000000000'
        );
      } catch(err) {
        expect(err.message).to.include('this symbol is already taken');
      }
    })
  });

  describe('should get contract address by symbol', () => {
    it('for existing', async() => {
      await contract.create(
        'Solaris 2022', 'SOL22', 100, 'New vintage of our best wine', 'Chateau Lawicki', 
        'http://www.wine.eth', '5000000000000000', '2000000000000000000'
      );

      const address = await contract.getAddressBySymbol('SOL22');
      expect(address).to.not.equal('0x0000000000000000000000000000000000000000');
    });

    it('for non existing', async() => {
      const address = await contract.getAddressBySymbol('SOL22');
      expect(address).to.equal('0x0000000000000000000000000000000000000000');
    })
  });

  describe('should get IBOs list', () => {
    it('should fail when offset is bigger than list', async() => {
      await contract.create('Solaris 2022', 'SOL22', 100, 'New vintage of our best wine', 'Chateau Lawicki', 'http://www.wine.eth', '5000000000000000', '2000000000000000000');

      try {
        await contract.getIbos(10, 10);
      } catch(err) {
        console.log('@@@err.message', err.message);
        expect(err.message).to.include('not enough data')
      }
    });

    it('should get first 10 elements', async() => {
      await contract.create('Solaris 2022', 'SOL22', 100, 'New vintage of our best wine', 'Chateau Lawicki', 'http://www.wine.eth', '5000000000000000', '2000000000000000000');
      await contract.create('Solaris 2023', 'SOL23', 100, 'New vintage of our best wine', 'Chateau Lawicki', 'http://www.wine.eth', '5000000000000000', '2000000000000000000');

      const result = await contract.getIbos(0, 10);
      
      expect(result.length).to.equal(2);
      
      expect(result[0].symbol).to.equal('SOL22');
      expect(result[0].addr).to.not.equal('0x0000000000000000000000000000000000000000');

      expect(result[1].symbol).to.equal('SOL23');
      expect(result[1].addr).to.not.equal('0x0000000000000000000000000000000000000000');
    });

    it('should skip first element', async() => {
      await contract.create('Solaris 2022', 'SOL22', 100, 'New vintage of our best wine', 'Chateau Lawicki', 'http://www.wine.eth', '5000000000000000', '2000000000000000000');
      await contract.create('Solaris 2023', 'SOL23', 100, 'New vintage of our best wine', 'Chateau Lawicki', 'http://www.wine.eth', '5000000000000000', '2000000000000000000');

      const result = await contract.getIbos(1, 10);
      
      expect(result.length).to.equal(1);
    });
  });

  it('should get number of IBOs', async() => {
    await contract.create('Solaris 2022', 'SOL22', 100, 'New vintage of our best wine', 'Chateau Lawicki', 'http://www.wine.eth', '5000000000000000', '2000000000000000000');
    await contract.create('Solaris 2023', 'SOL23', 100, 'New vintage of our best wine', 'Chateau Lawicki', 'http://www.wine.eth', '5000000000000000', '2000000000000000000');

    const result = await contract.getNumberOfIbos();
    
    expect(result).to.eql(web3.utils.toBN(2));
  });
});
