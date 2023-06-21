import React, { useEffect, useState } from "react";
import { Xumm } from "xumm";
import {
  Client,
  // convertStringToHex,
  // getBalanceChanges
} from "xrpl";
import { xummConfig } from "./env";

import imgLogo from "./assets/img/logo.jpeg";

import "./index.css";
import "./App.css";
import deployment from "./deployment.json";

const connectClient = async () => {
  const client = new Client("wss://s1.ripple.com:443");
  await client.connect();
  console.log("Connected to Sandbox");

  return client;
};

const make = async () => {
  const xumm = await new Xumm(xummConfig.AppId);

  console.log("====== XUMM runtime", xumm.runtime);

  if (xumm.runtime.xapp) {
    console.log("XAPP");
    xumm.user.account.then(
      (account) => (document.getElementById("account").innerText = account)
    );
    xumm.xapp.on("destination", (data) => {
      console.log(
        "A-xapp-destination@",
        data.destination?.name,
        data.destination?.address,
        data?.reason
      );
    });
    xumm.on("destination", (data) => {
      console.log(
        "B-xapp-destination@",
        data.destination?.name,
        data.destination?.address,
        data?.reason
      );
    });
  }

  if (xumm.runtime.browser && !xumm.runtime.xapp) {
    console.log("WEBAPP");
    xumm.on("error", (error) => {
      console.log("error", error);
    });
    xumm.on("success", async () => {
      console.log("success", await xumm.user.account);
    });
    xumm.on("retrieved", async () => {
      console.log(
        "Retrieved: from localStorage or mobile browser redirect",
        await xumm.user.account
      );
    });
  }

  return xumm;
};

const xumm = make();

/**
 * xumm link handling for external links must be handled by the app
 * sdk, so we need some way to pass the link to the app as well as
 * just dispay it as a link for webapp users.
 *
 * links is a list of objects with the following structure:
 * [{ 'title': 'title', 'url': 'url' }]
 *
 * @param {*} param0
 */
const ExternalLinksViewer = ({
  links,
  xumm,
  title = "Important Links",
  showTitle = true,
}) => {
  const [runtime, setRuntime] = useState();

  useEffect(() => {
    xumm.then((xummSDK) => {
      setRuntime(xummSDK.runtime);
    });
  }, [xumm]);

  /**
   * this handles the xApp and webapp cases for external links
   *
   * @param {*} url
   */
  let handleClickedLink = (url) => {
    if (runtime.xapp) {
      console.log("clicked link in xApp", url);

      xumm.then((xummSDK) => {
        xummSDK.xapp
          .openBrowser({ url: url })
          .then((d) => {
            // d (returned value) can be Error or return data:
            console.log(
              "openBrowser response:",
              d instanceof Error ? d.message : d
            );
          })
          .catch((e) => console.log("Error:", e.message));
      });
    } else if (runtime.browser && !runtime.xapp) {
      console.log("clicked link in Web browser", url);
      window.open(url, "_blank");
    }
  };

  let renderUrls = (links) => {
    return links.map((key, index) => (
      <div
        className="w-32 h-8 text-yellow-200
          bg-slate-900 m-1 rounded p-1 break-words"
        key={index}
      >
        <div
          onClick={() => handleClickedLink(key.url)}
          className="text-xs font-bold text-blue-300 
              hover:underline cursor-pointer"
        >
          {key.title}
        </div>
      </div>
    ));
  };

  return (
    <div className="w-full flex flex-col">
      {showTitle && <div className="text-2xl text-white">{title}</div>}
      <div className="flex flex-wrap">{renderUrls(links)}</div>
    </div>
  );
};

const LinkedFooter = ({ xumm }) => {
  const externalLinks = [
    { title: "zoetic Home", url: "https://zoetic.xurlpay.org/" },
    {
      title: "xApp Deeplink",
      url: "https://xumm.app/detect/xapp:sandbox.a8f76d357322",
    },
    { title: "Github", url: "https://github.com/claytantor/zoetic-xumm" },
    { title: "Terms of Service", url: "https://zoetic.xurlpay.org/tos.html" },
    { title: "Privacy Policy", url: "https://zoetic.xurlpay.org/privacy.html" },
    {
      title: "Xumm-Universal-SDK",
      url: "https://github.com/XRPL-Labs/Xumm-Universal-SDK",
    },
    {
      title: "Tailwinds CSS Docs",
      url: "https://tailwindcss.com/docs/installation",
    },
    {
      title: "React Docs",
      url: "https://reactjs.org/docs/getting-started.html",
    },
  ];

  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-center mb-2">
        <img src={imgLogo} alt="logo" className="w-6 h-6 rounded-full mt-1" />
        <span className="ml-2 text-3xl">zoetic</span>
      </div>
      <ExternalLinksViewer
        links={externalLinks}
        xumm={xumm}
        showTitle={false}
      />
      <HashedInfoViewer
        hashedInfo={deployment}
        title="Deployment Info"
        showTitle={false}
      />
      {/* <div className="flex flex-row items-center mb-2 justify-start">Use zoetic to make donations to this wallet: <span className="text-pink-500 ml-2 font-mono">rrnR8qAP8tczCbgD1gqt4RgcwTZPcSXyn2</span></div> */}
    </div>
  );
};

/**
 * simple component to display of hashed data
 * @param {*} param0
 * @returns
 */
const HashedInfoViewer = ({
  hashedInfo,
  title = "Hashed Data",
  showTitle = true,
}) => {
  let renderAttributes = (hashedInfo) => {
    if (hashedInfo) {
      const keys = Object.keys(hashedInfo);
      if (keys.length === 0) {
        return <div className="flex">No account data</div>;
      } else {
        return keys.map((key, index) => (
          <div
            className="w-32 md:w-64 flex flex-col min-h-fit text-yellow-200
                   bg-slate-800 m-1 rounded p-1 break-words"
            key={index}
          >
            <div className="text-xs font-bold text-purple-300">{key}</div>
            {hashedInfo[key] && (
              <div className="text-xs font-mono font-bold break-words">
                {JSON.stringify(hashedInfo[key])}
              </div>
            )}
          </div>
        ));
      }
    }
  };

  return (
    <>
      {hashedInfo && (
        <div className="flex flex-col">
          {showTitle && (
            <div className="flex flex-row text-heading text-2xl">{title}</div>
          )}
          <div className="flex flex-wrap w-full bg-slate-700 p-1">
            {renderAttributes(hashedInfo)}
          </div>
        </div>
      )}
    </>
  );
};

const PaymentPayloadViewer = ({
  payload,
  amountXRP = 1.0,
  title = "Payload",
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [runtime, setRuntime] = useState();

  /**
   * when on a mobile webapp the user wont be able to scan
   * the qr code, so we need to make it easy for them
   * to click the link and open the xumm app for sign
   */
  useEffect(() => {
    if (/Mobi/.test(navigator.userAgent)) {
      setIsMobile(true);
    }
    xumm.then((xummSDK) => {
      setRuntime(xummSDK.runtime);
    });
  }, []);

  /**
   * only when on a mobile webapp and the user is not in the xumm app
   * do we want to show the link to open the xumm app
   *
   * @param {*} uuid
   * @param {*} runtime
   */
  const handleSignPopup = async (uuid, runtime) => {
    if (isMobile && runtime.browser && !runtime.xapp) {
      window.location.href = `https://xumm.app/sign/${uuid}`;
    }
  };

  return (
    <>
      {payload && (
        <div className="flex flex-col">
          {payload.refs && payload.refs.qr_png && (
            <div className="flex flex-col w-full justify-center">
              <div className="text-white text-2xl font-mono w-full text-center flex justify-center">
                PAY {amountXRP} XRPL
              </div>
              <div className="text-white text-2xl font-mono w-full text-center flex justify-center">
                <img
                  className="w-96 rounded"
                  src={payload.refs.qr_png}
                  alt="qr_code"
                />
              </div>
            </div>
          )}

          {payload.refs && isMobile && (
            <div
              onClick={() => handleSignPopup(payload.uuid, runtime)}
              className="btn-common bg-green-800 text-white uppercase"
            >
              Sign in XUMM
            </div>
          )}
          <HashedInfoViewer hashedInfo={payload} title={title} />
        </div>
      )}
    </>
  );
};

const WebsocketMessageViewer = ({ message, title = "Message" }) => {
  return (
    <>
      {message && (
        <div className="flex flex-col">
          <HashedInfoViewer hashedInfo={message} title={title} />
        </div>
      )}
    </>
  );
};

const PaymentForm = ({ xumm, fromAccount }) => {
  const [formState, setFormState] = useState({ destination: "" });
  const [runtime, setRuntime] = useState(null);

  /** state for the tx listening */
  const [websocketMessage, setWebsocketMessage] = useState(null);
  const [paymentPayload, setPaymentPayload] = useState(null);
  const [txStatus, setTxStatus] = useState(0);
  const [txStatusMessage, setTxStatusMessage] = useState(null);
  const [error, setError] = useState(null);

  /**
   * detect if this is a mobile device
   */
  useEffect(() => {
    // get the runtime so we can launch tx listening
    // for xapp
    xumm.then((xummSDK) => {
      setRuntime(xummSDK.runtime);
    });
  }, []);

  const handleInputChange = (event) => {
    setError(null);
    setTxStatusMessage(null);
    const target = event.target;
    let value = target.value;
    const name = target.name;
    console.log(name, value);

    setFormState((formState) => ({
      ...formState,
      [name]: value,
    }));
  };

  /**
   * create a payment payload
   * @param {*} account
   * @param {*} destination
   * @returns
   */
  const paymentPayloadRequest = (account, destination) => {
    return {
      Account: account,
      TransactionType: "Payment",
      Flags: 0,
      SigningPubKey: "",
      Amount: "1000000",
      Destination: destination,
    };
  };

  const isValidXRPAddress = (address) => {
    // Check if the address is a string and 34 characters long
    if (typeof address !== "string" || address.length !== 34) {
      return false;
    }

    // Check if the address starts with the letter "r"
    if (address[0] !== "r") {
      return false;
    }

    // Check if the address contains only valid characters (alphanumeric and "-")
    if (!/^[a-zA-Z0-9-]+$/.test(address)) {
      return false;
    }

    return true;
  };

  const payAccount = () => {
    console.log("payAccount");
    setTxStatusMessage("Creating payload");

    if (!isValidXRPAddress(formState.destination)) {
      setError("Invalid destination address");
      return;
    } else {
      setTxStatusMessage("Creating payload");
      xumm.then((xummSDK) => {
        const paymentPayload = {
          txjson: paymentPayloadRequest(fromAccount, formState.destination),
        };
        handleTxPayloadNativeWS(xummSDK, paymentPayload);
      });
    }
  };

  /**
   * uses the create and subscribe method from the xumm
   * SDK to listen for events
   *
   * @param {*} xummSDK
   * @param {*} xummPayload
   */
  const handleTxPayloadNativeWS = async (xummSDK, xummPayload) => {
    try {
      const pong = await xummSDK.ping();
      console.log(pong.application);

      const payloadResponse = xummSDK.payload.createAndSubscribe(
        xummPayload,
        (e) => {
          console.log("event subscription", e.data);
          setWebsocketMessage(e.data);

          if (typeof e.data.signed !== "undefined") {
            setTxStatus(1);
            setTxStatusMessage(`Payment signed.`);
            setPaymentPayload(null);
            setFormState({ destination: "" });

            // wait 5 seconds and then clear the message
            setTimeout(function () {
              setWebsocketMessage(null);
              setTxStatusMessage(null);
              setTxStatus(0);
            }, 5000);
            return e.data;
          }
        }
      );
      // .catch(e => {
      //   console.log("error", e);
      //   setError(e);
      // });

      const r = await payloadResponse;
      setPaymentPayload(await r.created);
      setTxStatusMessage("Listening for the TX Sign request to the Wallet.");
    } catch (e) {
      // console.log({error: e.message, stack: e.stack})
      setError(e.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {error && (
        <div className="w-full text-center text-2xl text-red-700 bg-red-200 italic p-2 rounded">
          {error}
        </div>
      )}
      <div className="flex flex-col justify-center w-full">
        {txStatusMessage && txStatus === 1 ? (
          <div className="w-full text-center text-2xl text-green-700 bg-green-200 italic p-2 rounded">
            {txStatusMessage}
          </div>
        ) : (
          <div className="w-full text-center text-2xl text-slate-300 italic p-2">
            {txStatusMessage}
          </div>
        )}
        {websocketMessage && (
          <WebsocketMessageViewer message={websocketMessage} />
        )}
        {paymentPayload && <PaymentPayloadViewer payload={paymentPayload} />}
      </div>

      <div className="w-full flex flex-row justify-center">
        {!paymentPayload && (
          <form className="w-full mb-3 md:w-fit">
            <div
              className="flex flex-col md:flex-row items-center border-b border-blue-500 
              py-2 w-full justify-center md:justify-between"
            >
              <input
                name="destination"
                value={formState.destination}
                onChange={handleInputChange}
                className="m-1 rounded border-2 border-slate-500 w-3/4 text-lg text-center appearance-none bg-slate-800 text-blue-300 mr-3 py-1 px-2 leading-tight focus:outline-none md:w-96"
                type="text"
                placeholder="Enter account address"
                aria-label="XRP Account"
              />
              <button
                onClick={() => payAccount()}
                className="flex-shrink-0 bg-blue-500 hover:bg-blue-700 border-blue-500 hover:border-blue-700 text-sm border-4 text-white py-1 px-2 rounded"
                type="button"
              >
                Pay 1 XRP
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export function App() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [runtime, setRuntime] = useState(null);
  const [xummSDK, setXummSDK] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [clientType, setClientType] = useState(null);
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

  useEffect(() => {
    console.log("App.js useEffect");
    xumm.then((xummSDK) => {
      console.log("loginXumm xummSDK", xummSDK.runtime);
      if (!xummSDK.runtime) return;
      const xruntime = { ...xummSDK.runtime };
      setRuntime(xruntime);
      setXummSDK(xummSDK);

      /**
       * IMPORTANT: dont worry about calling this when the api
       * is not available, it just try to call what you need and it will be available after authorization. The promise will be resolved if the api is not available.
       */
      xummSDK.environment.bearer
        ?.then((r) => {
          // if you use a backend such as axios, you can set the bearer token here for the default header
          // ie. Axios.defaults.headers.common['Authorization'] = `Bearer ${r}`;
          console.log("bearer", r);

          setIsAuthorized(true);
        })
        .catch((err) => {
          console.log("error with bearer", err);
        });

      /***
       * its important to determine if the user is using the xumm app or the webapp
       */
      if (xruntime.xapp) {
        console.log("XAPP in App");
        setClientType("XAPP");
        xummSDK.environment.ott?.then((r) => console.log("ott App", r));
      }

      if (xruntime.browser && !xruntime.xapp) {
        console.log("WEBAPP in App");
        setClientType("WEBAPP");
        xummSDK.environment.openid?.then((r) => {
          console.log("openid App", r);
          setIdentity(r);
        });
      }
    });
  }, []);

  const loginXumm = () => {
    xummSDK
      .authorize()
      .then((res) => {
        console.log("authorized", res);
        // xumm.environment.jwt?.then(r => console.log('jwt', r));
        // res = {jwt: 'eiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRfa…4sN9Dxfq-fCtvEjqkpxWjYjafpWZCV47S65kM-jHvH467UmJ3', sdk: XummSdkJwt, me: {…}}
        // you can use the jwt set a bearer
        // token for your backend and the identity
        if (res.me) {
          setIdentity(res.me);
        }
        setIsAuthorized(true);
      })
      .catch((err) => {
        console.log("error with auth", err);
      });
  };

  const logoutXumm = () => {
    console.log("logout");
    xummSDK
      .logout()
      .then((res) => {
        console.log("logout promise result", res);
        setIsAuthorized(false);
        setIdentity(null);
      })
      .catch((err) => {
        console.log("error with logout", err);
      });
  };

  const mintToken = async () => {
    const client = await connectClient();

    // const transactionBlob = {
    //   TransactionType: "NFTokenMint",
    //   Account: identity?.sub || "",
    //   URI: convertStringToHex(tokenUrl),
    //   Flags: parseInt(flags),
    //   TokenTaxon: 0, //Required, but if you have no use for it, set to zero.
    // };
    // // Submit signed blob --------------------------------------------------------
    // const tx = await client.submitAndWait(transactionBlob, { identity?.sub });

    // const nfts = await client.request({
    //   method: "account_nfts",
    //   account: identity?.sub || "",
    // });
    // console.log(nfts);

    // // Check transaction results -------------------------------------------------
    // console.log("Transaction result:", tx.result.meta.TransactionResult);
    // console.log(
    //   "Balance changes:",
    //   JSON.stringify(getBalanceChanges(tx.result.meta), null, 2)
    // );
    client.disconnect();
  };

  const getTokens = async () => {
    const client = await connectClient();

    // console.log("Connected to Sandbox");
    // const nfts = await client.request({
    //   method: "account_nfts",
    //   account: identity?.sub || "",
    // });
    // console.log(nfts);
    client.disconnect();
  };

  const burnToken = async () => {
    const client = await connectClient();

    // // Prepare transaction -------------------------------------------------------
    // const transactionBlob = {
    //   TransactionType: "NFTokenBurn",
    //   Account: identity?.sub || ",
    //   TokenID: tokenId,
    // };

    // // Submit signed blob --------------------------------------------------------
    // const tx = await client.submitAndWait(transactionBlob, { wallet });
    // const nfts = await client.request({
    //   method: "account_nfts",
    //   account: identity?.sub || ",
    // });
    // console.log(nfts);
    // // Check transaction results -------------------------------------------------
    // console.log("Transaction result:", tx.result.meta.TransactionResult);
    // console.log(
    //   "Balance changes:",
    //   JSON.stringify(getBalanceChanges(tx.result.meta), null, 2)
    // );
    client.disconnect();
  };

  const createSellOffer = async () => {
    const client = await connectClient();

    // // Prepare transaction -------------------------------------------------------
    // const transactionBlob = {
    //   TransactionType: "NFTokenCreateOffer",
    //   Account: identity?.sub || ",
    //   TokenID: tokenId,
    //   Amount: amount,
    //   Flags: parseInt(flags),
    // };

    // // Submit signed blob --------------------------------------------------------

    // const tx = await client.submitAndWait(transactionBlob, { wallet }); //AndWait

    // console.log("***Sell Offers***");
    // let nftSellOffers;
    // try {
    //   nftSellOffers = await client.request({
    //     method: "nft_sell_offers",
    //     tokenid: tokenId,
    //   });
    // } catch (err) {
    //   console.log("No sell offers.");
    // }
    // console.log(JSON.stringify(nftSellOffers, null, 2));
    // console.log("***Buy Offers***");
    // let nftBuyOffers;
    // try {
    //   nftBuyOffers = await client.request({
    //     method: "nft_buy_offers",
    //     tokenid: tokenId,
    //   });
    // } catch (err) {
    //   console.log("No buy offers.");
    // }
    // console.log(JSON.stringify(nftBuyOffers, null, 2));

    // // Check transaction results -------------------------------------------------
    // console.log(
    //   "Transaction result:",
    //   JSON.stringify(tx.result.meta.TransactionResult, null, 2)
    // );
    // console.log(
    //   "Balance changes:",
    //   JSON.stringify(getBalanceChanges(tx.result.meta), null, 2)
    // );
    client.disconnect();
  };

  const createBuyOffer = async () => {
    const client = await connectClient();

    // // Prepare transaction -------------------------------------------------------
    // const transactionBlob = {
    //   TransactionType: "NFTokenCreateOffer",
    //   Account: identity?.sub || ",
    //   Owner: owner,
    //   TokenID: tokenId,
    //   Amount: amount,
    //   Flags: parseInt(flags),
    // };

    // // Submit signed blob --------------------------------------------------------
    // const tx = await client.submitAndWait(transactionBlob, { wallet });

    // console.log("***Sell Offers***");
    // let nftSellOffers;
    // try {
    //   nftSellOffers = await client.request({
    //     method: "nft_sell_offers",
    //     tokenid: tokenId,
    //   });
    // } catch (err) {
    //   console.log("No sell offers.");
    // }
    // console.log(JSON.stringify(nftSellOffers, null, 2));
    // console.log("***Buy Offers***");
    // let nftBuyOffers;
    // try {
    //   nftBuyOffers = await client.request({
    //     method: "nft_buy_offers",
    //     tokenid: tokenId,
    //   });
    // } catch (err) {
    //   console.log("No buy offers.");
    // }
    // console.log(JSON.stringify(nftBuyOffers, null, 2));

    // // Check transaction results -------------------------------------------------
    // console.log(
    //   "Transaction result:",
    //   JSON.stringify(tx.result.meta.TransactionResult, null, 2)
    // );
    // console.log(
    //   "Balance changes:",
    //   JSON.stringify(getBalanceChanges(tx.result.meta), null, 2)
    // );
    client.disconnect();
  };

  const cancelOffer = async () => {
    const client = await connectClient();
    console.log("Connected to Sandbox");

    // const tokenID = tokenOfferIndex;
    // const tokenIDs = [tokenID];

    // // Prepare transaction -------------------------------------------------------
    // const transactionBlob = {
    //   TransactionType: "NFTokenCancelOffer",
    //   Account: identity?.sub || ",
    //   TokenIDs: tokenIDs,
    // };

    // // Submit signed blob --------------------------------------------------------
    // const tx = await client.submitAndWait(transactionBlob, { wallet });

    // console.log("***Sell Offers***");
    // let nftSellOffers;
    // try {
    //   nftSellOffers = await client.request({
    //     method: "nft_sell_offers",
    //     tokenid: tokenId,
    //   });
    // } catch (err) {
    //   console.log("No sell offers.");
    // }
    // console.log(JSON.stringify(nftSellOffers, null, 2));
    // console.log("***Buy Offers***");
    // let nftBuyOffers;
    // try {
    //   nftBuyOffers = await client.request({
    //     method: "nft_buy_offers",
    //     tokenid: tokenId,
    //   });
    // } catch (err) {
    //   console.log("No buy offers.");
    // }
    // console.log(JSON.stringify(nftBuyOffers, null, 2));

    // // Check transaction results -------------------------------------------------

    // console.log(
    //   "Transaction result:",
    //   JSON.stringify(tx.result.meta.TransactionResult, null, 2)
    // );
    // console.log(
    //   "Balance changes:",
    //   JSON.stringify(getBalanceChanges(tx.result.meta), null, 2)
    // );

    client.disconnect();
  };

  const getOffers = async () => {
    const client = await connectClient();

    // console.log("***Sell Offers***");
    // let nftSellOffers;
    // try {
    //   nftSellOffers = await client.request({
    //     method: "nft_sell_offers",
    //     tokenid: tokenId,
    //   });
    // } catch (err) {
    //   console.log("No sell offers.");
    // }
    // console.log(JSON.stringify(nftSellOffers, null, 2));
    // console.log("***Buy Offers***");
    // let nftBuyOffers;
    // try {
    //   nftBuyOffers = await client.request({
    //     method: "nft_buy_offers",
    //     tokenid: tokenId,
    //   });
    // } catch (err) {
    //   console.log("No buy offers.");
    // }
    // console.log(JSON.stringify(nftBuyOffers, null, 2));
    client.disconnect();
  };

  const acceptSellOffer = async () => {
    const client = await connectClient();

    // Prepare transaction -------------------------------------------------------
    // const transactionBlob = {
    //   TransactionType: "NFTokenAcceptOffer",
    //   Account: identity?.sub || ",
    //   SellOffer: tokenOfferIndex,
    // };
    // // Submit signed blob --------------------------------------------------------
    // const tx = await client.submitAndWait(transactionBlob, { wallet });
    // const nfts = await client.request({
    //   method: "account_nfts",
    //   account: identity?.sub || ",
    // });
    // console.log(JSON.stringify(nfts, null, 2));

    // // Check transaction results -------------------------------------------------
    // console.log(
    //   "Transaction result:",
    //   JSON.stringify(tx.result.meta.TransactionResult, null, 2)
    // );
    // console.log(
    //   "Balance changes:",
    //   JSON.stringify(getBalanceChanges(tx.result.meta), null, 2)
    // );
    client.disconnect();
  };

  const acceptBuyOffer = async () => {
    const client = await connectClient();
    // Prepare transaction -------------------------------------------------------
    // const transactionBlob = {
    //   TransactionType: "NFTokenAcceptOffer",
    //   Account: identity?.sub || ",
    //   BuyOffer: tokenOfferIndex,
    // };
    // Submit signed blob --------------------------------------------------------
    // const tx = await client.submitAndWait(transactionBlob, { wallet });
    // const nfts = await client.request({
    //   method: "account_nfts",
    //   account: identity?.sub || ",
    // });
    // console.log(JSON.stringify(nfts, null, 2));

    // // Check transaction results -------------------------------------------------
    // console.log(
    //   "Transaction result:",
    //   JSON.stringify(tx.result.meta.TransactionResult, null, 2)
    // );
    // console.log(
    //   "Balance changes:",
    //   JSON.stringify(getBalanceChanges(tx.result.meta), null, 2)
    // );
    client.disconnect();
  };

  return (
    <>
      <div class="flex flex-col h-screen justify-between">
        <header class="h-fit bg-pink-900 flex flex-row justify-between">
          <div className="m-1 mt-2 flex flex-row items-center justify-start">
            <img
              src={imgLogo}
              alt="logo"
              className="w-8 h-8 rounded-full mt-1"
            />
            <span className="ml-2 text-4xl">zoetic</span>
          </div>
          <div className="text-lg flex flex-col justify-end md:justify-start md:flex-row">
            {isAuthorized ? (
              <div className="m-1">
                <div
                  onClick={() => logoutXumm()}
                  className="button-common bg-pink-800 hover:bg-pink-400 hover:underline hover:cursor-pointer rounded p-3 m-1 flex flex-row items-center"
                >
                  {identity?.picture ? (
                    <img
                      className="w-8 h-8 m-1"
                      src={identity.picture}
                      alt="icon"
                    />
                  ) : (
                    ""
                  )}
                  Logout {clientType}
                </div>
              </div>
            ) : (
              <>
                {runtime && runtime.browser && !runtime.xapp && (
                  <div
                    onClick={() => loginXumm()}
                    className="button-common border-2 bg-blue-600 hover:bg-pink-400 hover:underline hover:cursor-pointer rounded-lg p-3 m-1"
                  >
                    Login with xumm
                  </div>
                )}
              </>
            )}
          </div>
        </header>
        <main class="mb-auto p-4 h-fit">
          <div className="m-2 flex flex-col justify-center">
            <div className="w-full text-pink-400 text-center text-6xl">
              zoetic
            </div>
            <div className="text-center">
              An complete application example for making a xApp using ReactJS,
              Tailwinds CSS, and the Xumm "Universal" SDK
            </div>

            {identity?.sub && (
              <div className="md:text-2xl text-center text-blue-400 font-mono">
                {identity.sub}
              </div>
            )}

            <div id="logo" className="p-1 m-1 w-full flex justify-center">
              {isAuthorized ? (
                <></>
              ) : (
                <img
                  src={imgLogo}
                  alt="logo"
                  className="w-64 h-64 rounded-full"
                />
              )}
            </div>

            {isAuthorized && <PaymentForm xumm={xumm} />}

            {identity && (
              <>
                <div className="code mb-4 w-fit">
                  <div className="text-xs break-words w-full">
                    <HashedInfoViewer hashedInfo={identity} title="Identity" />
                  </div>
                </div>
              </>
            )}
            {runtime && (
              <>
                <div className="code mb-4 w-fit">
                  <div className="text-xs break-words w-full">
                    {runtime?.browser && (
                      <HashedInfoViewer
                        hashedInfo={runtime.browser}
                        title="Runtime"
                      />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>

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
                    className="text-center text-blue-400 font-mono bg-black"
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
                    className="text-center text-blue-400 font-mono bg-black"
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
                    className="text-center text-blue-400 font-mono bg-black"
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
                    className="text-center text-blue-400 font-mono bg-black"
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
                    className="text-center text-blue-400 font-mono bg-black"
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
                    className="text-center text-blue-400 font-mono bg-black"
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
                    className="text-center text-blue-400 font-mono bg-black"
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
                    className="text-center text-blue-400 font-mono bg-black"
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

        <footer class="h-fit bg-black p-3">
          <LinkedFooter xumm={xumm} />
        </footer>
      </div>
    </>
  );
}

export default App;
