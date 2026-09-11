import type { Metadata } from "next";
import { AboutContent } from "@/components/about-content";

export const metadata: Metadata = {
  title: "About — Cliply",
  description: "Cliply is a free, ad-free, account-free media downloader and converter.",
};

export default function AboutPage() {
  return <AboutContent />;
}
