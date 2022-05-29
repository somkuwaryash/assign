const algosdk = require('algosdk');
const keypress = async () => {
    process.stdin.setRawMode(true)
    return new Promise(resolve => process.stdin.once('data', () => {
        process.stdin.setRawMode(false)
        resolve()
    })) 
}
const createAccount =  function (){
    try{  
        const myaccount = algosdk.generateAccount();
        console.log("Account Address = " + myaccount.addr);
        let account_mnemonic = algosdk.secretKeyToMnemonic(myaccount.sk);
        console.log("Account Mnemonic = "+ account_mnemonic);
        console.log("Account created. Save off Mnemonic and address");
        console.log("Add funds to account using the TestNet Dispenser: ");
        console.log("https://dispenser.testnet.aws.algodev.network?account=" + myaccount.addr);


        return myaccount;
    }
    catch (err) {
        console.log("err", err);
    }
};


async function firstTransaction() {

    try {
        let myAccount = createAccount();
        console.log("Press any key when the account is funded");
        await keypress();
        
        const algodToken = '2f3203f21e738a1de6110eba6984f9d03e5a95d7a577b34616854064cf2c0e7b';
        const algodServer = 'https://academy-algod.dev.aws.algodev.network/';
        const algodPort = '';
        let algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

 
        let accountInfo = await algodClient.accountInformation(myAccount.addr).do();
        console.log("Account balance: %d microAlgos", accountInfo.amount);
        let startingAmount = accountInfo.amount;
       
        let params = await algodClient.getTransactionParams().do();
    
        const receiver = "HZ57J3K46JIJXILONBBZOHX6BKPXEM2VVXNRFSUED6DKFD5ZD24PMJ3MVA";
        const enc = new TextEncoder();
        const note = enc.encode("Hello World");
        let amount = 100000;
        let closeout = receiver; 
        let sender = myAccount.addr;
        let txn = algosdk.makePaymentTxnWithSuggestedParams(sender, receiver, amount, closeout, note, params);
   
        let signedTxn = txn.signTxn(myAccount.sk);
        let txId = txn.txID().toString();
        console.log("Signed transaction with txID: %s", txId);


        await algodClient.sendRawTransaction(signedTxn).do();


        let confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

        console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
        var string = new TextDecoder().decode(confirmedTxn.txn.txn.note);
        console.log("Note field: ", string);
        accountInfo = await algodClient.accountInformation(myAccount.addr).do();
        console.log("Transaction Amount: %d microAlgos", confirmedTxn.txn.txn.amt);        
        console.log("Transaction Fee: %d microAlgos", confirmedTxn.txn.txn.fee);
        let closeoutamt = startingAmount - confirmedTxn.txn.txn.amt - confirmedTxn.txn.txn.fee;     
        console.log("Close To Amount: %d microAlgos", closeoutamt);
        console.log("Account balance: %d microAlgos", accountInfo.amount);
    }
    catch (err) {
        console.log("err", err);
    }
    process.exit();
};

firstTransaction();

