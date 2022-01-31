const IboManager = artifacts.require('IboManager');

module.exports = async function(_deployer) {
  await _deployer.deploy(IboManager);

  const contract = await IboManager.deployed()

  await contract.create('Solaris 2022', 'SOL22', 100, 'New vintage of our best wine', 'Chateau Lawicki', 'http://www.wine.eth', '500000000000000', '200000000000000000');
  await contract.create('Solaris 2023', 'SOL23', 100, 'New vintage of our best wine - 2023', 'Chateau Lawicki', 'http://www.wine.eth', '500000000000000', '200000000000000000');
};
