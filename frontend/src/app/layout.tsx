import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";
import { Providers } from "./providers";
import { PREFS_INIT_SCRIPT } from "@/shared/prefs/prefs-store";
import { SiteFooter } from "@/widgets/site-footer";
import { SiteHeader } from "@/widgets/site-header";

/** Display font for big headlines. Korean text falls back to Pretendard. */
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "TicketRush — Don't wait in line. Rush it.", template: "%s · TicketRush" },
  description:
    "Concert ticketing built to survive ticket-open day. Live stock, countdowns, QR entry.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the init script changes class/lang before React loads.
    <html lang="en" className={`${spaceGrotesk.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFS_INIT_SCRIPT }} />
      </head>
      <body className="relative flex min-h-full flex-col overflow-x-clip">
        <div className="backdrop-glow pointer-events-none fixed inset-0 -z-10" aria-hidden />
        <Providers>
          <SiteHeader />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
            {children}
          </main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
