import type { Metadata } from "next";
// import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { GeistSans } from "geist/font/sans";

// const sfProRounded = localFont({
//   src: [
//     {
//       path: "./fonts/SF-Pro-Rounded-Ultralight.otf",
//       weight: "100",
//       style: "normal",
//     },
//     {
//       path: "./fonts/SF-Pro-Rounded-Thin.otf",
//       weight: "200",
//       style: "normal",
//     },
//     {
//       path: "./fonts/SF-Pro-Rounded-Light.otf",
//       weight: "300",
//       style: "normal",
//     },
//     {
//       path: "./fonts/SF-Pro-Rounded-Regular.otf",
//       weight: "400",
//       style: "normal",
//     },
//     {
//       path: "./fonts/SF-Pro-Rounded-Medium.otf",
//       weight: "500",
//       style: "normal",
//     },
//     {
//       path: "./fonts/SF-Pro-Rounded-Semibold.otf",
//       weight: "600",
//       style: "normal",
//     },
//     {
//       path: "./fonts/SF-Pro-Rounded-Bold.otf",
//       weight: "700",
//       style: "normal",
//     },
//     {
//       path: "./fonts/SF-Pro-Rounded-Heavy.otf",
//       weight: "800",
//       style: "normal",
//     },
//     {
//       path: "./fonts/SF-Pro-Rounded-Black.otf",
//       weight: "900",
//       style: "normal",
//     },
//   ],
// });

export const metadata: Metadata = {
  title: "$ANON",
  description: "Post anonymously to Farcaster.",
  openGraph: {
    title: "$ANON",
    description: "Post anonymously to Farcaster.",
    images: ["/anon.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.className} antialiased min-h-screen w-full`}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
