"use client";

import Hero from "@/components/Hero";
import Content from "@/components/Content";
import Footer from "@/components/Footer";
import Menu from "@/components/Menu";

export default function Home() {
  return (
    <main className="">
      <>
        <Menu />
        <Hero />
        <Content />
        <Footer />
      </>
    </main>
  );
}
