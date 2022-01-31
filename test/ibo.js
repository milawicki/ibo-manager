const Ibo = artifacts.require("ibo");

contract('ibo', function (accounts) {
  let contract;
  const defaultBoolteDetails = {
    name: 'Solaris 2022',
    symbol: 'SOL22',
    bottles: '100',
    totalSupply: '0',
    desc: 'New vintage of our best wine',
    producer: 'Chateau Lawicki',
    url: 'http://www.wine.eth',
    price: '50000000000000',
    shopPrice: '20000000000000000'
  };

  beforeEach(async() => {
    contract = await Ibo.new(defaultBoolteDetails.name, defaultBoolteDetails.symbol, defaultBoolteDetails.bottles, 
      defaultBoolteDetails.desc, defaultBoolteDetails.producer, defaultBoolteDetails.url,
      defaultBoolteDetails.price, defaultBoolteDetails.shopPrice);
  });

  it('should get bottle data', async() => {
    const { name, symbol, bottles, totalSupply, desc, producer, url, price, shopPrice } = await contract.getDetails();
    
    expect(name).to.equal(defaultBoolteDetails.name);
    expect(symbol).to.equal(defaultBoolteDetails.symbol);
    expect(bottles).to.equal(defaultBoolteDetails.bottles);
    expect(totalSupply).to.equal(defaultBoolteDetails.totalSupply);
    expect(desc).to.equal(defaultBoolteDetails.desc);
    expect(producer).to.equal(defaultBoolteDetails.producer);
    expect(url).to.equal(defaultBoolteDetails.url);
    expect(price).to.equal(defaultBoolteDetails.price);
    expect(shopPrice).to.equal(defaultBoolteDetails.shopPrice);
  });

  describe('editing bottle data', () => {
    it('should setDescription', async() => {
      const input = 'abc';
      await contract.setDescription(input);

      const { desc } = await contract.getDetails();
      expect(desc).to.equal(input);
    });

    it('should fail on setDescription when not owner', async() => {
      const input = 'abc';
      try {
        await contract.setDescription(input, { from: accounts[1] });
      } catch(err) {
        expect(err.message).includes('Ownable: caller is not the owner');
      }
    });

    it('should setProducer', async() => {
      const input = 'abc';
      await contract.setProducer(input);

      const { producer } = await contract.getDetails();
      expect(producer).to.equal(input);
    });

    it('should fail to setProducer when not owner', async() => {
      const input = 'abc';
      try {
        await contract.setProducer(input);
      } catch(err) {
        expect(err.message).includes('Ownable: caller is not the owner');
      }
    });

    it('should setUrl', async() => {
      const input = 'abc';
      await contract.setUrl(input);

      const { url } = await contract.getDetails();
      expect(url).to.equal(input);
    });

    it('should fail to setUrl when not owner', async() => {
      const input = 'abc';
      try {
        await contract.setUrl(input);
      } catch(err) {
        expect(err.message).includes('Ownable: caller is not the owner');
      }
    });

    it('should setPrice', async() => {
      const input = web3.utils.toWei('5');
      await contract.setPrice(input);

      const { price } = await contract.getDetails();
      expect(price).to.equal(input);
    });

    it('should fail to setPrice when not owner', async() => {
      const input = web3.utils.toWei('5');

      try {
        await contract.setPrice(input);
      } catch(err) {
        expect(err.message).includes('Ownable: caller is not the owner');
      }
    });

    it('should setShopPrice', async() => {
      const input = web3.utils.toWei('5');
      await contract.setShopPrice(input);

      const { shopPrice } = await contract.getDetails();
      expect(shopPrice).to.equal(input);
    });

    it('should fail to setShopPrice when not owner', async() => {
      const input = web3.utils.toWei('5');

      try {
        await contract.setShopPrice(input);
      } catch(err) {
        expect(err.message).includes('Ownable: caller is not the owner');
      }
    });

    it('should update bottle details', async() => {
      const newData = {
        desc: 'New vintage of our best wine123',
        producer: 'Chateau Lawicki123',
        url: 'http://www.wine.eth/123',
        price: '1000000000000000',
        shopPrice: '3000000000000000000'
      };

      await contract.setDetails(newData.desc, newData.producer, newData.url, newData.price, newData.shopPrice);

      const { desc, producer, url, price, shopPrice } = await contract.getDetails();
      expect(desc).to.equal(newData.desc);
      expect(producer).to.equal(newData.producer);
      expect(url).to.equal(newData.url);
      expect(price).to.equal(newData.price);
      expect(shopPrice).to.equal(newData.shopPrice);
    });

    it('should fail on updating bottle details when not owner', async() => {
      const newData = {
        desc: 'New vintage of our best wine123',
        producer: 'Chateau Lawicki123',
        url: 'http://www.wine.eth/123',
        price: '1000000000000000',
        shopPrice: '3000000000000000000'
      };

      try {
        await contract.setDetails(newData.desc, newData.producer, newData.url, newData.price, newData.shopPrice);
      } catch(err) {
        expect(err.message).includes('Ownable: caller is not the owner');
      }
    });
  });

  describe('buying token', () => {
    it('should reject transaction when msg.value not equals to bottle price', async() => {
      try {
        await contract.buy(1, { value: web3.utils.toWei('10') });
      } catch(err) {
        expect(err.message).includes('Transfered value must be equal to bottle price');
      }
    });

    it('should buy bottle when value is proper', async() => {
        const response = await contract.buy(2, { value: defaultBoolteDetails.price * 2 });
        
        const balance = await contract.balanceOf(accounts[0]);
        expect(balance).to.eql(web3.utils.toBN(2));

        const supply = await contract.totalSupply();
        expect(supply).to.eql(web3.utils.toBN(2));
    });

    it('should fail on buying more bootles that cap', async() => {
      const qua = defaultBoolteDetails.bottles +1;
      const value = web3.utils.toBN(defaultBoolteDetails.price).mul(web3.utils.toBN(qua));

      try {
        await contract.buy(qua, { value });
      } catch(err) {
        expect(err.message).includes('ERC20Capped: cap exceeded');
      }
    })
  });

  it('should withdraw bootle', async() => {
    const tokens = 2;
    await contract.buy(2, { value: defaultBoolteDetails.price * tokens });
    await contract.approve(accounts[0], tokens);
    await contract.burnFrom(accounts[0], tokens);

    const balance = await contract.balanceOf(accounts[0]);
    expect(balance).to.eql(web3.utils.toBN(0));

    const currentCap = await contract.cap();
    expect(currentCap).to.eql(web3.utils.toBN((+defaultBoolteDetails.bottles) -tokens));
  });

  describe('withdrawing eth', () => {
    it('should fail when nothing to transfer', async() => {
      try {
        await contract.withdraw();
      } catch(err) {
        expect(err.message).includes('nothing to withdraw');
      }
    });

    it('should fail when not owner', async() => {
      await contract.buy(2, { value: defaultBoolteDetails.price * 2 });

      try {
        await contract.withdraw({ from: accounts[1] });
      } catch(err) {
        expect(err.message).includes('Ownable: caller is not the owner');
      }
    });

    it('should transfer all eth to owner', async() => {
      const tokens = 2;
      const initialbalance = await web3.eth.getBalance(accounts[0]);

      await contract.buy(2, { value: defaultBoolteDetails.price * tokens, from: accounts[1] });
      expect(await web3.eth.getBalance(contract.address)).to.not.equal('0');

      const result = await contract.withdraw();
      expect(await web3.eth.getBalance(contract.address)).to.equal('0');
      expect(+(await web3.eth.getBalance(accounts[0]))).to.be.above(+initialbalance);

      expect(result.logs[0].event).to.equal('Withdraw');
    });
  })
});
