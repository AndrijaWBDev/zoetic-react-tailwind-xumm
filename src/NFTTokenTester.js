import React, { useState } from "react";
import { Client, Wallet, convertStringToHex, getBalanceChanges } from "xrpl";

// Convert helper function from inline script.
const connectClient = async (secret) => {
  const wallet = Wallet.fromSeed(secret);
  const client = new Client("wss://s1.ripple.com:443");
  await client.connect();
  console.log("Connected to Sandbox");

  return { wallet, client };
};

//... continue to convert other script functions...

function NFTokenTester() {
  const [account, setAccount] = useState("");
  const [secret, setSecret] = useState("");
  const [tokenUrl, setTokenURL] = useState(
    "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf4dfuylqabf3oclgtqy55fbzdi"
  );
  const [flags, setFlag] = useState(1);
  const [tokenId, setTokenId] = useState(0);
  const [amount, setAmount] = useState(1000000);
  const [tokenOfferIndex, setOfferIndex] = useState(0);
  const [owner, setOwner] = useState(0);

  const handleAccountChange = (event) => setAccount(event.target.value);
  const handleSecretChange = (event) => setSecret(event.target.value);
  const handleTokenURLChange = (event) => setTokenURL(event.target.value);
  const handleFlagChange = (event) => setFlag(event.target.value);
  const handleTokenIdChange = (event) => setTokenId(event.target.value);
  const handleAmountChange = (event) => setAmount(event.target.value);
  const handleOfferIndexChange = (event) => setOfferIndex(event.target.value);
  const handleOwnerChange = (event) => setOwner(event.target.value);

  const mintToken = async () => {
    const { wallet, client } = await connectClient(secret);

    const transactionBlob = {
      TransactionType: "NFTokenMint",
      Account: wallet.classicAddress,
      URI: convertStringToHex(tokenUrl),
      Flags: parseInt(flags),
      TokenTaxon: 0, //Required, but if you have no use for it, set to zero.
    };
    // Submit signed blob --------------------------------------------------------
    const tx = await client.submitAndWait(transactionBlob, { wallet });

    const nfts = await client.request({
      method: "account_nfts",
      account: wallet.classicAddress,
    });
    console.log(nfts);

    // Check transaction results -------------------------------------------------
    console.log("Transaction result:", tx.result.meta.TransactionResult);
    console.log(
      "Balance changes:",
      JSON.stringify(getBalanceChanges(tx.result.meta), null, 2)
    );
    client.disconnect();
  };

  const getTokens = async () => {
    const { wallet, client } = await connectClient(secret);

    console.log("Connected to Sandbox");
    const nfts = await client.request({
      method: "account_nfts",
      account: wallet.classicAddress,
    });
    console.log(nfts);
    client.disconnect();
  };

  const burnToken = async () => {
    const { wallet, client } = await connectClient(secret);

    // Prepare transaction -------------------------------------------------------
    const transactionBlob = {
      TransactionType: "NFTokenBurn",
      Account: wallet.classicAddress,
      TokenID: tokenId,
    };

    // Submit signed blob --------------------------------------------------------
    const tx = await client.submitAndWait(transactionBlob, { wallet });
    const nfts = await client.request({
      method: "account_nfts",
      account: wallet.classicAddress,
    });
    console.log(nfts);
    // Check transaction results -------------------------------------------------
    console.log("Transaction result:", tx.result.meta.TransactionResult);
    console.log(
      "Balance changes:",
      JSON.stringify(getBalanceChanges(tx.result.meta), null, 2)
    );
    client.disconnect();
  };

  const createSellOffer = async () => {
    const { wallet, client } = await connectClient(secret);

    // Prepare transaction -------------------------------------------------------
    const transactionBlob = {
      TransactionType: "NFTokenCreateOffer",
      Account: wallet.classicAddress,
      TokenID: tokenId,
      Amount: amount,
      Flags: parseInt(flags),
    };

    // Submit signed blob --------------------------------------------------------

    const tx = await client.submitAndWait(transactionBlob, { wallet }); //AndWait

    console.log("***Sell Offers***");
    let nftSellOffers;
    try {
      nftSellOffers = await client.request({
        method: "nft_sell_offers",
        tokenid: tokenId,
      });
    } catch (err) {
      console.log("No sell offers.");
    }
    console.log(JSON.stringify(nftSellOffers, null, 2));
    console.log("***Buy Offers***");
    let nftBuyOffers;
    try {
      nftBuyOffers = await client.request({
        method: "nft_buy_offers",
        tokenid: tokenId,
      });
    } catch (err) {
      console.log("No buy offers.");
    }
    console.log(JSON.stringify(nftBuyOffers, null, 2));

    // Check transaction results -------------------------------------------------
    console.log(
      "Transaction result:",
      JSON.stringify(tx.result.meta.TransactionResult, null, 2)
    );
    console.log(
      "Balance changes:",
      JSON.stringify(getBalanceChanges(tx.result.meta), null, 2)
    );
    client.disconnect();
  };

  const createBuyOffer = async () => {
    const { wallet, client } = await connectClient(secret);

    // Prepare transaction -------------------------------------------------------
    const transactionBlob = {
      TransactionType: "NFTokenCreateOffer",
      Account: wallet.classicAddress,
      Owner: owner,
      TokenID: tokenId,
      Amount: amount,
      Flags: parseInt(flags),
    };

    // Submit signed blob --------------------------------------------------------
    const tx = await client.submitAndWait(transactionBlob, { wallet });

    console.log("***Sell Offers***");
    let nftSellOffers;
    try {
      nftSellOffers = await client.request({
        method: "nft_sell_offers",
        tokenid: tokenId,
      });
    } catch (err) {
      console.log("No sell offers.");
    }
    console.log(JSON.stringify(nftSellOffers, null, 2));
    console.log("***Buy Offers***");
    let nftBuyOffers;
    try {
      nftBuyOffers = await client.request({
        method: "nft_buy_offers",
        tokenid: tokenId,
      });
    } catch (err) {
      console.log("No buy offers.");
    }
    console.log(JSON.stringify(nftBuyOffers, null, 2));

    // Check transaction results -------------------------------------------------
    console.log(
      "Transaction result:",
      JSON.stringify(tx.result.meta.TransactionResult, null, 2)
    );
    console.log(
      "Balance changes:",
      JSON.stringify(getBalanceChanges(tx.result.meta), null, 2)
    );
    client.disconnect();
  };

  const cancelOffer = async () => {
    const { wallet, client } = await connectClient(secret);
    console.log("Connected to Sandbox");

    const tokenID = tokenOfferIndex;
    const tokenIDs = [tokenID];

    // Prepare transaction -------------------------------------------------------
    const transactionBlob = {
      TransactionType: "NFTokenCancelOffer",
      Account: wallet.classicAddress,
      TokenIDs: tokenIDs,
    };

    // Submit signed blob --------------------------------------------------------
    const tx = await client.submitAndWait(transactionBlob, { wallet });

    console.log("***Sell Offers***");
    let nftSellOffers;
    try {
      nftSellOffers = await client.request({
        method: "nft_sell_offers",
        tokenid: tokenId,
      });
    } catch (err) {
      console.log("No sell offers.");
    }
    console.log(JSON.stringify(nftSellOffers, null, 2));
    console.log("***Buy Offers***");
    let nftBuyOffers;
    try {
      nftBuyOffers = await client.request({
        method: "nft_buy_offers",
        tokenid: tokenId,
      });
    } catch (err) {
      console.log("No buy offers.");
    }
    console.log(JSON.stringify(nftBuyOffers, null, 2));

    // Check transaction results -------------------------------------------------

    console.log(
      "Transaction result:",
      JSON.stringify(tx.result.meta.TransactionResult, null, 2)
    );
    console.log(
      "Balance changes:",
      JSON.stringify(getBalanceChanges(tx.result.meta), null, 2)
    );

    client.disconnect();
  };

  const getOffers = async () => {
    const { wallet, client } = await connectClient(secret);

    console.log("***Sell Offers***");
    let nftSellOffers;
    try {
      nftSellOffers = await client.request({
        method: "nft_sell_offers",
        tokenid: tokenId,
      });
    } catch (err) {
      console.log("No sell offers.");
    }
    console.log(JSON.stringify(nftSellOffers, null, 2));
    console.log("***Buy Offers***");
    let nftBuyOffers;
    try {
      nftBuyOffers = await client.request({
        method: "nft_buy_offers",
        tokenid: tokenId,
      });
    } catch (err) {
      console.log("No buy offers.");
    }
    console.log(JSON.stringify(nftBuyOffers, null, 2));
    client.disconnect();
  };

  const acceptSellOffer = async () => {
    const { wallet, client } = await connectClient(secret);

    // Prepare transaction -------------------------------------------------------
    const transactionBlob = {
      TransactionType: "NFTokenAcceptOffer",
      Account: wallet.classicAddress,
      SellOffer: tokenOfferIndex,
    };
    // Submit signed blob --------------------------------------------------------
    const tx = await client.submitAndWait(transactionBlob, { wallet });
    const nfts = await client.request({
      method: "account_nfts",
      account: wallet.classicAddress,
    });
    console.log(JSON.stringify(nfts, null, 2));

    // Check transaction results -------------------------------------------------
    console.log(
      "Transaction result:",
      JSON.stringify(tx.result.meta.TransactionResult, null, 2)
    );
    console.log(
      "Balance changes:",
      JSON.stringify(getBalanceChanges(tx.result.meta), null, 2)
    );
    client.disconnect();
  };

  const acceptBuyOffer = async () => {
    const { wallet, client } = await connectClient(secret);
    // Prepare transaction -------------------------------------------------------
    const transactionBlob = {
      TransactionType: "NFTokenAcceptOffer",
      Account: wallet.classicAddress,
      BuyOffer: tokenOfferIndex,
    };
    // Submit signed blob --------------------------------------------------------
    const tx = await client.submitAndWait(transactionBlob, { wallet });
    const nfts = await client.request({
      method: "account_nfts",
      account: wallet.classicAddress,
    });
    console.log(JSON.stringify(nfts, null, 2));

    // Check transaction results -------------------------------------------------
    console.log(
      "Transaction result:",
      JSON.stringify(tx.result.meta.TransactionResult, null, 2)
    );
    console.log(
      "Balance changes:",
      JSON.stringify(getBalanceChanges(tx.result.meta), null, 2)
    );
    client.disconnect();
  };

  return (
    <div>
      <h1>NFToken Tester</h1>
      <button onClick={mintToken}>Mint Token</button>
      <button onClick={getTokens}>Get Tokens</button>
      <button onClick={burnToken}>Burn Token</button>

      <button onClick={createSellOffer}>Create Sell Offer</button>
      <button onClick={createBuyOffer}>Create Buy Offer</button>
      <button onClick={getOffers}>Get Offers</button>

      <button onClick={acceptSellOffer}>Accept Sell Offer</button>
      <button onClick={acceptBuyOffer}>Accept Buy Offer</button>
      <button onClick={cancelOffer}>Cancel Offer</button>

      <table>
        <tbody>
          <tr>
            <td align="right">Account</td>
            <td>
              <input
                type="text"
                value={account}
                onChange={handleAccountChange}
                size="40"
              />
            </td>
          </tr>
          <tr>
            <td align="right">Secret</td>
            <td>
              <input
                type="text"
                value={secret}
                onChange={handleSecretChange}
                size="40"
              />
            </td>
          </tr>
          <tr>
            <td align="right">Token URL</td>
            <td>
              <input
                type="text"
                value={tokenUrl}
                onChange={handleTokenURLChange}
                size="40"
              />
            </td>
          </tr>
          <tr>
            <td align="right">Flags</td>
            <td>
              <input
                type="text"
                value={flags}
                onChange={handleFlagChange}
                size="40"
              />
            </td>
          </tr>
          <tr>
            <td align="right">Token ID</td>
            <td>
              <input
                type="text"
                value={tokenId}
                onChange={handleTokenIdChange}
                size="40"
              />
            </td>
          </tr>
          <tr>
            <td align="right">Amount</td>
            <td>
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                size="40"
              />
            </td>
          </tr>
          <tr>
            <td align="right">Token Offer Index</td>
            <td>
              <input
                type="text"
                value={tokenOfferIndex}
                onChange={handleOfferIndexChange}
                size="40"
              />
            </td>
          </tr>
          <tr>
            <td align="right">Owner</td>
            <td>
              <input
                type="text"
                value={owner}
                onChange={handleOwnerChange}
                size="40"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default NFTokenTester;
