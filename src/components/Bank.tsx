// TODO: Bank
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { FC, useState } from "react";
import {
  Program,
  AnchorProvider,
  web3,
  BN,
  setProvider,
} from "@coral-xyz/anchor";
import idl from "./solana-pdas.json";
import { SolanaPdas } from "./solana-pdas";
import { PublicKey } from "@solana/web3.js";

const idl_string = JSON.stringify(idl);
const idl_object = JSON.parse(idl_string);
const programID = new PublicKey(idl.address);

export const Bank: FC = () => {
  const ourWallet = useWallet();
  const { connection } = useConnection();
  const [banks, setBanks] = useState([]);

  const getProvider = () => {
    const provider = new AnchorProvider(
      connection,
      ourWallet,
      AnchorProvider.defaultOptions()
    );
    setProvider(provider);
    return provider;
  };

  const createBank = async () => {
    try {
      const anchorProvider = getProvider();
      const program = new Program<SolanaPdas>(idl_object, anchorProvider);

      await program.methods
        .create("New Bank")
        .accounts({
          user: anchorProvider.publicKey,
        })
        .rpc();

      console.log("New Bank is Created!");
    } catch (error) {
      console.log(`Error while creating a bank: ${error}`);
    }
  };

  const getBank = async () => {
    try {
      const anchorProvider = getProvider();
      const program = new Program<SolanaPdas>(idl_object, anchorProvider);

      Promise.all(
        (await connection.getParsedProgramAccounts(programID)).map(
          async (bank) => ({
            ...(await program.account.bank.fetch(bank.pubkey)),
            pubkey: bank.pubkey,
          })
        )
      ).then((banks) => {
        console.log(banks);
        setBanks(banks);
      });
    } catch (error) {
      console.log(`Error while getting banks: ${error}`);
    }
  };

  const depositBank = async (pub_key) => {
    try {
      const anchorProvider = getProvider();
      const program = new Program<SolanaPdas>(idl_object, anchorProvider);

      await program.methods
        .deposit(new BN(0.1 * web3.LAMPORTS_PER_SOL))
        .accounts({
          user: anchorProvider.publicKey,
          bank: pub_key,
        })
        .rpc();

      console.log(`Deposit done: ${pub_key}`);
    } catch (error) {
      console.log(`Error while depositing to a bank: ${error}`);
    }
  };

  return (
    <div>
      {banks.map((bank) => (
        <div key={bank.pubkey} className="md:hero-content flex flex-col">
          <h1>{bank.name.toString()}</h1>
          <span>{bank.balance.toString()} Lamport(s)</span>
          <button
            className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
            onClick={() => depositBank(bank.pubkey)}
          >
            <span>Deposit 0.1 SOL</span>
          </button>
        </div>
      ))}

      <div className="flex flex-row justify-center">
        <div className="relative group items-center">
          <div
            className="m-1 absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 
              rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"
          ></div>
          <button
            className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
            onClick={createBank}
          >
            <div className="hidden group-disabled:block">
              Wallet not connected
            </div>
            <span className="block group-disabled:hidden">Create Bank</span>
          </button>

          <button
            className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
            onClick={getBank}
          >
            <div className="hidden group-disabled:block">
              Wallet not connected
            </div>
            <span className="block group-disabled:hidden">Fetch Bank</span>
          </button>
        </div>
      </div>
    </div>
  );
};
