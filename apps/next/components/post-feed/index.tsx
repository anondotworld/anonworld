import { Cast } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useBalance } from "@/hooks/use-balance";
import { TOKEN_CONFIG } from "@anon/utils/src/config";
import { PostProvider, usePost } from "./context";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowUpDown,
  Heart,
  Loader2,
  MessageSquare,
  RefreshCcw,
} from "lucide-react";
import { useState } from "react";
import { useSignMessage } from "wagmi";
import { api } from "@/lib/api";
import { Checkbox } from "../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export default function PostFeed({
  tokenAddress,
  userAddress,
}: {
  tokenAddress: string;
  userAddress?: string;
}) {
  const [selected, setSelected] = useState<"new" | "trending">("trending");
  const { data: balance } = useBalance(tokenAddress, userAddress);
  const { signMessageAsync } = useSignMessage();

  const { data: trendingPosts } = useQuery({
    queryKey: ["trending", tokenAddress],
    queryFn: async (): Promise<Cast[]> => {
      const response = await api.getTrendingPosts(tokenAddress);
      return response?.casts || [];
    },
  });

  const { data: newPosts } = useQuery({
    queryKey: ["posts", tokenAddress],
    queryFn: async (): Promise<Cast[]> => {
      const response = await api.getNewPosts(tokenAddress);
      return response?.casts || [];
    },
  });

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

  const canDelete =
    !!userAddress &&
    !!balance &&
    balance >= BigInt(TOKEN_CONFIG[tokenAddress].deleteAmount);

  const canPromote =
    !!userAddress &&
    !!balance &&
    balance >= BigInt(TOKEN_CONFIG[tokenAddress].promoteAmount);

  return (
    <PostProvider
      tokenAddress={tokenAddress}
      userAddress={userAddress}
      getSignature={getSignature}
    >
      <div className="flex flex-col gap-4 ">
        <div className="flex flex-row justify-between">
          <div className="flex flex-row items-center gap-2">
            <img src="/incognitoIcon.png" alt="ANON" className="w-4 h-4" />
            <p className="font-medium text-gray-400">Anons posting</p>
          </div>

          <Select
            value={selected}
            onValueChange={(value) => setSelected(value as "new" | "trending")}
          >
            <SelectTrigger
              icon={<ArrowUpDown className="w-4 h-4 text-gray-400" />}
              className="w-fit justify-end gap-1 items-center border-0 font-medium"
            >
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="new">New</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {selected === "new" ? (
          <Posts
            canDelete={canDelete}
            canPromote={canPromote}
            casts={newPosts}
          />
        ) : (
          <Posts
            canDelete={canDelete}
            canPromote={canPromote}
            casts={trendingPosts}
          />
        )}
      </div>
    </PostProvider>
  );
}

function Posts({
  casts,
  canDelete,
  canPromote,
}: {
  canDelete: boolean;
  canPromote: boolean;
  casts?: Cast[];
}) {
  return (
    <div className="flex flex-col gap-4">
      {casts?.map((cast) => (
        <Post
          key={cast.hash}
          cast={cast}
          canDelete={canDelete}
          canPromote={canPromote}
        />
      ))}
    </div>
  );
}

export function Post({
  cast,
  canDelete,
  canPromote,
}: {
  cast: Cast;
  canDelete: boolean;
  canPromote: boolean;
}) {
  return (
    <div className="relative [overflow-wrap:anywhere] bg-[#111111]">
      <a
        href={`https://warpcast.com/${cast.author.username}/${cast.hash.slice(
          0,
          10
        )}`}
        target="_blank"
        rel="noreferrer"
      >
        <div className="flex flex-row gap-4 border p-4 sm:p-6 rounded-xl">
          <div className="flex flex-col gap-2 w-full">
            <div className=" font-medium">{cast.text}</div>
            {cast.embeds.map((embed) => {
              if (embed.metadata?.image) {
                return (
                  <img
                    key={embed.url}
                    src={embed.url}
                    alt="embed"
                    className="rounded-xl"
                  />
                );
              }
              if (embed.metadata?.html) {
                return (
                  <div
                    key={embed.url}
                    className="w-full border rounded-xl overflow-hidden"
                  >
                    {embed.metadata?.html?.ogImage &&
                      embed.metadata?.html?.ogImage.length > 0 && (
                        <img
                          src={embed.metadata?.html?.ogImage?.[0]?.url}
                          alt={embed.metadata?.html?.ogImage?.[0]?.alt}
                          className="object-cover aspect-video"
                        />
                      )}
                    <div className="p-2">
                      <h3 className="text-lg font-bold">
                        {embed.metadata?.html?.ogTitle}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {embed.metadata?.html?.ogDescription}
                      </p>
                    </div>
                  </div>
                );
              }

              if (embed.cast) {
                return (
                  <div
                    key={embed.cast.hash}
                    className="flex flex-row gap-4 border p-4 rounded-xl"
                  >
                    <img
                      src={embed.cast.author?.pfp_url}
                      className="w-10 h-10 rounded-full"
                      alt="pfp"
                    />
                    <div className="flex flex-col gap-2 w-full">
                      <div className="flex flex-row items-center gap-2">
                        <div className="text-md font-bold">
                          {embed.cast.author?.username}
                        </div>
                        <div className="text-sm font-semibold">
                          {timeAgo(embed.cast.timestamp)}
                        </div>
                      </div>
                      <div className="text-md">{embed.cast.text}</div>
                    </div>
                  </div>
                );
              }

              return <div key={embed.url}>{embed.url}</div>;
            })}
            <div className="flex flex-col gap-4 sm:flex-row justify-between">
              <div className="flex flex-row items-center gap-2 mt-2">
                <div className="text-sm font-medium text-gray-400">
                  {timeAgo(cast.timestamp)}
                </div>
                <div className="w-1 h-1 bg-gray-400" />

                <div className="flex flex-row items-center gap-1 ">
                  <MessageSquare size={16} className="text-gray-400" />
                  <p className="text-sm font-medium">{cast.replies.count}</p>
                </div>
                <div className="flex flex-row items-center gap-1 ">
                  <RefreshCcw size={16} className="text-gray-400" />
                  <p className="text-sm font-medium ">
                    {cast.reactions.recasts_count}
                  </p>
                </div>
                <div className="flex flex-row items-center gap-1 w-16">
                  <Heart size={16} className="text-gray-400" />
                  <p className="text-sm font-medium">
                    {cast.reactions.likes_count}
                  </p>
                </div>
              </div>

              <div className=" flex flex-row gap-3 items-center">
                {canDelete && <DeleteButton cast={cast} />}
                {canPromote && <PromoteButton cast={cast} />}
              </div>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
}

function timeAgo(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  const intervals = [
    { label: "y", seconds: 31536000 },
    { label: "mo", seconds: 2592000 },
    { label: "d", seconds: 86400 },
    { label: "h", seconds: 3600 },
    { label: "m", seconds: 60 },
    { label: "s", seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count}${interval.label} ago`;
    }
  }

  return "just now";
}

function DeleteButton({ cast }: { cast: Cast }) {
  const { toast } = useToast();
  const { deletePost, deleteState } = usePost();
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    await deletePost(cast.hash);
    toast({
      title: "Post will be deleted in 1-2 minutes",
    });
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <p className="text-sm text-red-500 underline decoration-dotted font-semibold cursor-pointer hover:text-red-400">
          Delete
        </p>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the post.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteState.status !== "idle"}
          >
            {deleteState.status === "generating" ? (
              <div className="flex flex-row items-center gap-2">
                <Loader2 className="animate-spin" />
                <p>Generating proof</p>
              </div>
            ) : deleteState.status === "signature" ? (
              <div className="flex flex-row items-center gap-2">
                <Loader2 className="animate-spin" />
                <p>Awaiting signature</p>
              </div>
            ) : (
              "Delete"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function PromoteButton({ cast }: { cast: Cast }) {
  const { toast } = useToast();
  const { promotePost, promoteState } = usePost();
  const [open, setOpen] = useState(false);
  const [asReply, setAsReply] = useState(false);

  const handlePromote = async () => {
    await promotePost(cast.hash, asReply);
    toast({
      title: "Post will be promoted in 1-2 minutes",
    });
    setOpen(false);
  };

  const twitterEmbed = cast.embeds?.find(
    (e) => e.url?.includes("x.com") || e.url?.includes("twitter.com")
  );

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <p className="text-sm underline decoration-dotted font-semibold cursor-pointer hover:text-red-400">
          Promote
        </p>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Promote to X/Twitter?</AlertDialogTitle>
          <AlertDialogDescription>
            You will need to delete the post if you want to remove it from
            X/Twitter.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {twitterEmbed && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="as-reply"
              checked={asReply}
              onCheckedChange={(checked) => setAsReply(checked as boolean)}
            />
            <label
              htmlFor="as-reply"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Promote as reply
            </label>
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            onClick={handlePromote}
            disabled={promoteState.status !== "idle"}
          >
            {promoteState.status === "generating" ? (
              <div className="flex flex-row items-center gap-2">
                <Loader2 className="animate-spin" />
                <p>Generating proof</p>
              </div>
            ) : promoteState.status === "signature" ? (
              <div className="flex flex-row items-center gap-2">
                <Loader2 className="animate-spin" />
                <p>Awaiting signature</p>
              </div>
            ) : (
              "Promote"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
