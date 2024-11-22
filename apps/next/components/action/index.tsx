import { useBalance } from "@/hooks/use-balance";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { CircleCheckIcon } from "lucide-react";
import { CircleXIcon } from "lucide-react";
import { CircleMinusIcon } from "lucide-react";
import { CreatePost } from "../create-post";

export enum PostAmounts {
  FARCASTER_POST = 30_000,
  TWITTER_PROMOTE = 1_000_000,
  DELETE_POST = 3_000_000,
}

export default function ActionComponent({
  tokenAddress,
  userAddress,
  getSignature,
}: {
  tokenAddress: string;
  userAddress: `0x${string}` | undefined;
  getSignature: ({
    address,
    timestamp,
  }: {
    address: string;
    timestamp: number;
  }) => Promise<
    | {
        signature: string;
        message: string;
      }
    | undefined
  >;
}) {
  const { data } = useBalance(tokenAddress, userAddress);

  return (
    <Alert className="flex flex-col gap-4 bg-[#111111]">
      <AlertTitle className="font-semibold text-xl">
        Post anonymously to Farcaster and X/Twitter
      </AlertTitle>
      <AlertDescription>
        <p className="text-gray-400">
          Posts are made anonymous using zk proofs. Due to the complex
          calculations required, it could take up to a few minutes to post and
          take other actions. We&apos;ll work on speeding this up in the future.
        </p>
        <br />
        <p className="text-gray-400 ">Requirements:</p>
        <ul className="flex flex-col gap-1 mt-3">
          <TokenRequirement
            tokenAmount={data}
            tokenNeeded={PostAmounts.FARCASTER_POST}
            string="Hold 30,000 $ANON: Post on Farcaster"
            isConnected={!!userAddress}
          />
          <TokenRequirement
            tokenAmount={data}
            tokenNeeded={PostAmounts.TWITTER_PROMOTE}
            string="Hold 1,000,000 $ANON: Promote posts to X/Twitter"
            isConnected={!!userAddress}
          />
          <TokenRequirement
            tokenAmount={data}
            tokenNeeded={PostAmounts.DELETE_POST}
            string="Hold 3,000,000 $ANON: Delete posts"
            isConnected={!!userAddress}
          />
        </ul>
      </AlertDescription>
      <div className="flex flex-row gap-2 justify-between ">
        <div className="flex flex-row gap-4">
          <a
            href="https://x.com/anoncast_"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm decoration-dotted underline font-medium"
          >
            <span className="hidden sm:inline">X/Twitter</span>
            <img
              src="/xLogo.png"
              alt="X/Twitter"
              className="w-4 h-4 sm:hidden"
            />
          </a>

          <a
            href="https://warpcast.com/anoncast"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm decoration-dotted underline font-medium"
          >
            <span className="hidden sm:inline">Farcaster</span>
            <img
              src="/warpcastLogo.png"
              alt="Farcaster"
              className="w-4 h-4 sm:hidden"
            />
          </a>
        </div>

        <div className="flex flex-row gap-4 justify-end">
          <a
            href="https://basescan.org/token/0x0db510e79909666d6dec7f5e49370838c16d950f"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm decoration-dotted underline font-medium"
          >
            Basescan
          </a>
          <a
            href="https://app.uniswap.org/swap?outputCurrency=0x0Db510e79909666d6dEc7f5e49370838c16D950f&chain=base"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm decoration-dotted underline font-medium"
          >
            Uniswap
          </a>
          <a
            href="https://github.com/Slokh/anoncast"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm decoration-dotted underline font-medium"
          >
            Github
          </a>
        </div>
      </div>
      {userAddress && (
        <CreatePost
          tokenAddress={tokenAddress}
          userAddress={userAddress}
          getSignature={getSignature}
        />
      )}
    </Alert>
  );
}

function TokenRequirement({
  tokenAmount,
  tokenNeeded,
  string,
  isConnected,
}: {
  tokenAmount: bigint | undefined;
  tokenNeeded: PostAmounts;
  string: string;
  isConnected: boolean;
}) {
  const tokenNeededBigInt = BigInt(tokenNeeded);
  const tokenAmountInTokens = tokenAmount
    ? tokenAmount / BigInt(10 ** 18)
    : BigInt(0);

  return (
    <li className="flex flex-row items-center gap-2 font-medium">
      {isConnected ? (
        tokenAmountInTokens >= tokenNeededBigInt ? (
          <CircleCheckIcon className="text-green-500 w-4 h-4" />
        ) : (
          <CircleXIcon className="text-red-500 w-4 h-4" />
        )
      ) : (
        <CircleMinusIcon className="text-gray-400 w-4 h-4" />
      )}
      <b>{string}</b>
    </li>
  );
}
