import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';

import edaTweetsIcon from './assets/edatweets.png';
import React, { useEffect, useState } from "react";

import myEpicNft from './utils/MyEpicNFT.json';

// web3 frontend connector 
import { ethers } from "ethers";

// variables 
const TWITTER_HANDLE = 'edatweets_';
const TWITTER_HANDLE_BUILDSPACE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const TWITTER_LINK_BUILDSPACE= `https://twitter.com/${TWITTER_HANDLE_BUILDSPACE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/edas-collection';

const TOTAL_MINT_COUNT = 20;
const CONTRACT_ADDRESS = "0xeA383247fB912E736E01c9Dd974B7E210bC8b617";

const App = () => {
  //A state variable to store user's public wallet
  const [currentAccount, setCurrentAccount] = useState("");

  //A state variable to know when to display spinner
  const [isMiningNFT, setIsMiningNFT] = useState(false);


  //State variables to count number of NFTs already minted and total allowed
  const [mintedNFTs,setMintedNFTs] = useState(0);

  // Render Methods
  const checkIfWalletIsConnected = async () => {
    // Make sure you have access to window.ethereum
    const {ethereum} = window;

    if(!ethereum) {
      console.log("Make sure you have metamask");
      return;
    }
    else{
      console.log("We have the ethereum object", ethereum);
    }

    //Check if we're authorized to access the user's wallet
    const accounts = await ethereum.request({method: 'eth_accounts'});

    //Grab the first account
    if(accounts.length !== 0){
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);

      //Setup listener when some user already has his wallet connected + authorized
      setupEventListener();
    }
    else{
      console.log("No authorized account found");
    }
  }

  const connectWallet = async () => {
    try {
      const {ethereum} = window;

      if(!ethereum) {
        alert("Get Metamask!");
        return;
      }

      //request access to account
      const accounts = await ethereum.request({ method: "eth_requestAccounts"});

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
        //Create the connection to our contract.
      const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
      const mintedNfts = await connectedContract.getTotalNFTsMintedSoFar(); 
      
      setMintedNFTs(mintedNfts.toNumber());
      setupEventListener();
    }
    catch( error){
      console.log(error);
    }
  }

  const setupEventListener = async () => {
    try {
      const {ethereum} = window;

      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        //Create the connection to our contract.
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        //capture our event when the contract throws it
        //capture our event when the contract throws it
        connectedContract.on("NewEpicNFTMinted", async (from, tokenId)=> {
          const mintedNfts = await connectedContract.getTotalNFTsMintedSoFar(); 
          setMintedNFTs(mintedNfts.toNumber());

          alert(`Wo hoo! We've minted your NFT and set it to your wallet. Don't hurry, it takes a few minuites. Here is the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`);
        });

        console.log("Setup event listener");
      } 
      else{
         console.log("Ethereum object doesn't exist!")
      }
    }
    catch (error){
      console.log(error)
    }
  }

  const askContractToMintNft = async () =>{
    try {
      const {ethereum} = window;

      const currentNetwork = ethereum.networkVersion;
      console.log("Current network", currentNetwork);

      if(currentNetwork != 4){
        alert("Opps, only works on Rinkeby! Please change your network :)");
        return;
      }

      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        //Create the connection to our contract.
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        console.log("Going to pop wallet now to pay gass...")
        let nftTxn = await connectedContract.makeAnEpicNFT();

        setIsMiningNFT(true);
        await nftTxn.wait();
        console.log(nftTxn);
        setIsMiningNFT(false);
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`)

      } 
      else{
         console.log("Ethereum object doesn't exist!")
      }
    }
    catch (error){
      console.log(error)
    }
  }

  
  //Update local state varibales referencing NFTs numbers
  const getNftsMintedSoFar = async () =>{
    const {ethereum} = window;
    if(ethereum){
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      //Create the connection to our contract.
      const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

      const mintedNfts = await connectedContract.getTotalNFTsMintedSoFar();
      setMintedNFTs(mintedNfts.toNumber());
    }
  }
  useEffect(()=>{
    getNftsMintedSoFar();
  },[]);  
  
  //run function checkIfWalletIsConnected when the page loads
  useEffect(()=> {
    checkIfWalletIsConnected();
  }, []);

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  //alternative button
  const renderMintUI = () => (
    <>
      <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
        Mint!
      </button>
      <p className="sub-text-awesome gradient-text">
        {mintedNFTs}/{TOTAL_MINT_COUNT} already minted!!
      </p>
    </>
  );

  const renderMintCompleted = () =>(
    <p className="sub-text-awesome gradient-text">
      Ohh looks like we are sold out! Don't forget to follow edatweets, there will be more! wagmi :)
    </p>
  );

  const renderSpinner = () =>(
    <div>
      <div class="lds-ellipsis"><div></div><div></div><div></div></div>
    </div>
  );

  const mintUIButtons = () =>(
    <div>
      { (mintedNFTs < {TOTAL_MINT_COUNT}) ? renderMintCompleted() : renderMintUI()} 
    </div>
  );

  return (
    <div className="App">

      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Eda's NFT Collection</p>
          <p className="sub-text-mini">what a great day to mint an nft</p>

          <img className="site-logo" src={edaTweetsIcon} />

          {currentAccount === "" ? renderNotConnectedContainer()  : mintUIButtons()}
          <br />
          
          <div>
            {isMiningNFT ? renderSpinner(): null }        
          </div>

          <a href={OPENSEA_LINK} target="_blank">
            <input type="button" class="cta-button opensea-button" value="View Collection on OpenSea" />
          </a>
      </div>

        <div className="footer-container">
            <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
            <a className="footer-text"
              href={TWITTER_LINK}
              target="_blank"
              rel="noreferrer"
            >{`built by @${TWITTER_HANDLE}`}</a>
            <br />
            <a className="footer-text"
              href={TWITTER_LINK_BUILDSPACE}
              target="_blank"
              rel="noreferrer"
            >{`// from @${TWITTER_HANDLE_BUILDSPACE} `}</a>
        </div>



      </div>
    </div>
  );
};

export default App;