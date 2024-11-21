"use client";

import ActionComponent from "@/components/action";
import { ConnectButton } from "@/components/connect-button";
import PostFeed from "@/components/post-feed";
import { ANON_ADDRESS } from "@anon/utils/src/config";
import { useAccount, useSignMessage } from "wagmi";

export default function Home() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const getSignature = async ({
    address,
    timestamp,
  }: {
    address: string;
    timestamp: number;
  }) => {
    try {
      const message = `${address}:${timestamp}`;
      const signature = await signMessageAsync({
        message,
      });
      return { signature, message };
    } catch {
      return;
    }
  };

  return (
    <div className="flex h-screen flex-col p-4 xl:p-8 max-w-screen-sm mx-auto gap-8">
      {/* Header */}
      <div className="flex items-center justify-between xl:absolute xl:top-0 xl:left-0 xl:right-0 xl:p-8">
        <div className="text-lg font-bold flex flex-row items-center font-geist">
          <img
            src="/anon.webp"
            alt="ANON"
            className="w-8 h-8 mr-3 rounded-full"
          />
          <span className="hidden sm:block">$ANON</span>
        </div>
        <ConnectButton />
      </div>

      {/* Info */}
      <ActionComponent
        tokenAddress={ANON_ADDRESS}
        userAddress={address}
        getSignature={getSignature}
      />
      <PostFeed tokenAddress={ANON_ADDRESS} userAddress={address} />
    </div>
  );
}
