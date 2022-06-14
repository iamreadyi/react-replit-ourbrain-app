import React, { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import abi from "./utils/OurBrain.json";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allThoughts, setAllThoughts] = useState([]);
  const [currentThought, setCurrentThought] = useState("");

  const contractAddress = "0xb5cE23859041988AD4D1F1570FcCc730a21E2be6";

  const contractABI = abi.abi;

  const getAllThoughts = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const brainPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const thoughts = await brainPortalContract.getAllThoughts();

        
        const thoughtsCleaned = thoughts.map(thought => {
          return {
            address: thought.user,
            timestamp: new Date(thought.timestamp * 1000),
            message: thought.message
          };
        });

        setAllThoughts(thoughtsCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }  

  useEffect(() => {
  let brainPortalContract;

  const onNewThought = (from, timestamp, message) => {
    console.log("NewThought", from, timestamp, message);
    setAllThoughts(prevState => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
    ]);
  };

  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    brainPortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    brainPortalContract.on("NewThought", onNewThought);
  }

  return () => {
    if (brainPortalContract) {
      brainPortalContract.off("NewThought", onNewThought);
    }
  };
}, []);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);

        await getAllThoughts();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const brainPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        console.log(currentThought);
        await brainPortalContract.sendThought(currentThought);
        
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
    
  }
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          Store your thoughts permanently and read others'
        </div>

        <div className="bio">
          Here, you can store your thoughts on blockchain permanently and everyone can see them. Write down what is inside your head, your unique thoughts, your emotions. 
        </div>
          
        <div className="bio">
        You have %50 chance of earning some ether, so check your balance after you sent your message.
        </div>

        <div className="bio">
        You have to connect your Goerli Testnet wallet to send your thought and to receive some ether.
        </div>

        <div className="bio">
        If you don't have testnet ether to pay the gas price you can get some         from  
        <a href="https://goerlifaucet.com/" target="_blank"> here.</a>
        
        </div>

        {!currentAccount && (
          <button className="connectButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        <div className="submit">
          <form onSubmit={handleSubmit}>
              <textarea
                spellCheck="false"
                value={currentThought}
                onChange={(e) => setCurrentThought(e.target.value)}
                style= {{fontSize: 20}}
              />
            <input type="submit" value="SEND"/>
          </form>
        </div>

        {allThoughts.map((thought, index) => {
          return(
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {thought.address}</div>
              <div>Time: {thought.timestamp.toString()}</div>
              <div>Message: {thought.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}

export default App
