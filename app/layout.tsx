import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { CmsProvider } from "@/context/CmsContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/layout/CartDrawer";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CelebrateHub | Luxury Celebration Venues & Event Hosting Partner Marketplace",
  description:
    "Discover and reserve private celebration venues: Rooftop lounges, pool farmhouses, luxury banquets, and boutique estates for birthday parties, anniversaries, and milestone celebrations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${outfit.variable}`}>
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased font-sans selection:bg-purple-500 selection:text-white">
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              <CmsProvider>
                <Navbar />
                <main className="flex-1">{children}</main>
                <CartDrawer />
                <Footer />
              </CmsProvider>
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
