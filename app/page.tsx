'use client'
import { useState } from "react";
import { ethers } from "ethers";
import abiJson from "../lib/contractABI.json";

// ✅ Remix에서 배포한 컨트랙트 주소로 교체
const CONTRACT_ADDRESS = "0x8D59149D4E008648Dee9ff2789c39f265DAcF436";
// ✅ ABI 구조가 배열([])이므로 .abi 제거
const abi = abiJson as any;

export default function Home() {
  const [balance, setBalance] = useState("0.0");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [account, setAccount] = useState("");

  // 🦊 MetaMask 연결
  const connectWallet = async () => {
    try {
      if (!(window as any).ethereum) {
        alert("MetaMask가 필요합니다!");
        return;
      }
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      setStatus("지갑 연결 완료!");
      await loadBalance();
    } catch (e: any) {
      console.error(e);
      setStatus("지갑 연결 실패: " + (e?.message || e));
    }
  };

  // 📜 컨트랙트 인스턴스
  const getContract = async () => {
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
  };

  // 💰 잔액 확인
  const loadBalance = async () => {
    try {
      const contract = await getContract();
      const b = await contract.getBalance();
      // ✅ ethers v6에서는 formatEther 사용
      setBalance(ethers.formatEther(b));
      setStatus("잔액 불러오기 성공");
    } catch (e: any) {
      console.error("잔액 확인 에러:", e);
      setStatus("잔액 확인 실패: " + (e?.message || e));
    }
  };

  // 💸 팁 전송
  const sendTip = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.tip({
        value: ethers.parseEther(String(amount)), // ✅ 문자열 변환 필수
      });
      await tx.wait();
      setStatus("✅ 팁 전송 완료!");
      await loadBalance();
    } catch (e: any) {
      console.error("팁 전송 에러:", e);
      setStatus("팁 전송 실패: " + (e?.message || e));
    }
  };

  // 💼 인출 (Owner 전용)
  const withdrawTips = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.withdrawTips();
      await tx.wait();
      setStatus("💰 인출 완료!");
      await loadBalance();
    } catch (e: any) {
      console.error("인출 에러:", e);
      setStatus("인출 실패: " + (e?.message || e));
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-3 text-gray-800">Tip Jar DApp</h1>
      <p className="text-gray-600 mb-6">92313403 신지영</p>

      {!account ? (
        <button
          onClick={connectWallet}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          MetaMask 지갑 연결
        </button>
      ) : (
        <>
          <p className="text-sm text-gray-700 mb-4">
            연결된 계정:{" "}
            <span className="font-mono text-xs break-all">{account}</span>
          </p>

          <button
            onClick={loadBalance}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded mb-2"
          >
            잔액 확인
          </button>

          <p className="text-gray-700 mb-4">
            현재 컨트랙트 잔액: <b>{balance} ETH</b>
          </p>

          <input
            type="text"
            placeholder="보낼 금액 (예: 0.01)"
            className="border p-2 rounded w-48 text-center mb-3"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <button
            onClick={sendTip}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mb-2"
          >
            팁 보내기
          </button>

          <button
            onClick={withdrawTips}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
          >
            인출하기 (Owner 전용)
          </button>
        </>
      )}

      <p className="mt-5 text-gray-800 text-sm text-center">{status}</p>
    </main>
  );
}
