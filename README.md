# IBO - Initial Bottle Offering

*insert screenshot here*

Another variant of IBO (check description of IBO for better understanding of this app). This version supports multiple tokens as well as creating new one from app level. It could be used by one producer to emits tokens for multiple labels or as a base to create marketplace for alcohol producers.

Feel free to check other variants of this dApp:

* IBO - base version of this app, handling only one token at a time
* IBO Auction - NFT version of this contract with auctioning mechanism

## Disclaimer

Following code is NOT production ready. It may contain bugs and be not gas efficient. It was created as learning project. Feel free to use it as an example of creating ERC20 token (fungible token) and dApp associated with it.


## Tooling: 
**Frontend**: TypeScript / VueJS / Vuex / Vuetify / Web3

**Smart contract**: Solidity / Truffle / Ganache / OpenZeppelin / Chai / Mocha

## Instalation

1. Clone the repository

```
git clone X
```

2. Install Truffle
```
npm install -g truffle
```

3. Install smart contract dependencies
```
npm install
```

3. Install frontend app dependencies
```
cd app
npm install
```

## Testing
You can test all features of smart contract by executing
```
truffle test
```

## Running

1. Run Ganache

2. (Optionally) Set up token details

Open `migrations/1641806480_ibo_manager.js` and adjust values of tokens details

3. Deploy smart contract
```
truffle deploy
```

3. Start VueJS app
```
cd app
npm run serve
```

Go to http://localhost:8080/ to interact with the app

*Remember to connect your wallet to Ganache network*

## Using the app

This app works exactly the same like IBO (check its docs for more info). The only difference is that you can create new tokens from app level. To do that click button with plus icon next to "Current offers" header and fill out the form. After submitting it new token will appear on list.



## Author
Mike Lawicki http://lawicki.pl
