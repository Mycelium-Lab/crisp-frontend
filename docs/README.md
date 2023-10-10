### Documentation

### Layout:
The parent component is the /App.vue file, it contains the router-view, where the components from the /views folder are stored. It also contains header, notifications-wrapper and socials-wrapper.

The layout uses scss, some basic styles are placed in /assets/scss/main.scss file, for example text sizes and most colors for buttons and text.

# Project structure:
For each page the corresponding component from the /views folder is used, they are rendered in the router-view tag in App.vue, and switched by the router consequence /router/index.js. The router is configured to preserve history. Using a non-existent router (app.crisp.exchange/foo-bar12345), as well as its absence (app.crisp.exchange/), leads to the swap component. 

In the /constants folder there are two files with constants:

1. charts.js is used to store the default set of settings for the chart drawn using the Apexcharts library, if desired, you can change them directly in the constant, or add some parameters of a particular instance in the component using the spread operator (apexCharts = {...apexCharts, tooltip: {enabled: false}).
2. index.js has such constants as CONTRACT_ID, METHOD_NAMES (new methods should be added here, so that the user is granted usage rights for them at login), DEFAULT_SWAP_PAIR (if there is no last used pair in localStorage, SwapView component takes this pair as default) and SWAP_TOKENS (listing of all currently used tokens).

The /utils folder contains five files with reusable functions and code:

1. format.js uses the ethers.js library to convert a token quantity using decimals (addDecimals), and to subtract decimals, converting that quantity to human format (removeDecimals)
2. index.js contains CONFIG which is currently set to testnet, these values can be changed to mainnet
3. localStorage.js simplifies working with localStorage by providing functions to write, read, and delete records from localStorage
4. number.js: toFixed() and isNumber() simplify working with numbers in exponential notation (replaced by ethers.js methods almost everywhere due to imprecision)
5. tick.js is used to round the price to the nearest tick

# Application initialization

When rendering the application, at the moment when the created() hook is triggered in the App.vue file, the load method is called, which sequentially calls the following functions in the store:

1. fetchCrispContract() initializes the walletSelector and setupModal entities of the nearWalletSelector library, as well as nearConnection (using the config), and then walletConnection (which are nearAPI entities themselves). When initializing setupModal, the user is presented with a login prompt if they are not already logged in. After a successful login, the page is refreshed and, if the user is logged in, the crispContract entity is initialized, which is then used for simple calls to contract functions (not batch transactions).
2. fetchPools() fetches the list of pools from the contract by calling the corresponding method
3. fetchBalances(), using the user's accountId, gets a list of the user's balances by initializing the tokenBalances entity. The response from get_balance_all_tokens comes as a single string, so it is broken down into an object, and then for each object there is a query to ft_metadata() to get additional data about the token - symbol, icon, number of decimals etc. This list is then matched against the existing (in constants/index.js) list of tokens to initialize objects for missing balances too, since a user may not have tokens on crisp but have them on nir wallet. After all manipulations for each tokenBalance object the ft_balance_of method is also called to get the same balance on the nir wallet, and as a result we get an array of objects, where each balance object contains all the necessary information about the token, its crisp balance, and its nir balance.
4. processTokensMetadata() is used to get information about tokens available in pools to output additional data for them. Potentially can be written out in the future, as now this information is also duplicated in tokenBalances, but for now it is used in most components
5. processPositions lists all positions in the pools obtained by the fetchPools method and initializes two arrays: one with all positions in all pools (for general display at the bottom of the page) and with user positions (for detailed display on the same page)
6. fetchDeposits retrieves user deposits made available for borrowing by other users, creating a userDeposits entity for rendering on the corresponding page
7. fetchBorrows gets the user's deposits, finds the corresponding items in the userPositions list and updates some values in them, so that the LiquidityView page will display the corresponding information about the item being in the borrowed state and some additional data.

After all these functions are executed, the application displays all the necessary information when navigating through the different pages. Similar calls occur at the reload() function in the store component, which is called during some transactions that are executed directly on the page.

# Transaction invocation, classical method and batch transactions

At the moment there are two types of transaction calls used in a contract.

The first one is simplified, when we need to call only one action in one contract, for example, the withdraw() call in DepositView.

In this case, we only need to take the crispContract entity from the store, which has all existing contract functions in it, and call it in the form:

```
await contract.withdraw(
    {
        token: this.tokenW, // address of the token to be withdrawn
        amount: addDecimals(this.amountW, tokenObj), // amount of token with decimals added
    }
)
```

after which we process the returned promis with .then(), and dispatch reload(), since such functions can be called directly from the application

The second is the so-called batch transaction, a functionality provided by the near wallet selector library, and it allows us to call several actions in one contract, and several actions in several contracts, within one transaction.

Example: the create_deposit function in LendingView. If we set nearWallet as the desired token source to create the deposit, the following batchTx is executed:

```
await wallet.signAndSendTransactions({
    transactions: [
        {
            receiverId: tokenObj.token,
            actions: [
                {
                    type: "FunctionCall",
                    params: {
                        methodName: "storage_deposit",
                        args: Buffer.from(JSON.stringify(argsDeposit)),
                        gas: 150000000000000,
                        deposit: 1
                    }
                },
                {
                    type: "FunctionCall",
                    params: {
                        methodName: "ft_transfer_call",
                        args: Buffer.from(JSON.stringify(argsTransfer)),
                        gas: 150000000000000,
                        deposit: 1
                    }
                }
            ]
        },
        {
            receiverId: CONTRACT_ID,
            actions: [
                {
                    type: "FunctionCall",
                    params: {
                        methodName: "create_deposit",
                        args: Buffer.from(JSON.stringify(argsCreateDeposit)),
                        gas: 150000000000000
                        // deposit: 1
                    }
                }
            ]
        }
    ]
})
```

The signAndSendTransactions function is a function of the wallet object that we need to get from store.

The transactions parameter is an array of calls to the contracts we will access, and each transaction has an array of receiverId, which is the address of the contract where the actions will be executed, and the actions themselves, which is a list of actions in that contract.

In each action we need to specify the type, as well as parameters such as the name of the method, the maximum amount of gas per transaction, and for some transactions we need to specify the deposit (in NEAR). Arguments are composed in the same way as for the previous transaction call, but they must be cast first to a string and then to a buffer (as specified in the example)
