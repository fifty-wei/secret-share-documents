"use client";

import Hero from "@/components/Hero";
import Content from "@/components/Content";
import Footer from "@/components/Footer";
import Menu from "@/components/Menu";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useContext, useEffect, useState } from "react";
import { SecretDocumentContext } from "@/context/SecretDocumentContext";

export default function Home() {
  const { client } = useContext(SecretDocumentContext);
  const [fileIds, setFileIds] = useState<string[]>([]);

  useEffect(() => {
    if (!client) {
      return;
    }

    const fetchFileIds = async () => {
      try {
        const res = await client.viewDocument().getAllFileIds();
        console.log("res", res);

        setFileIds(res);
      } catch (e) {
        console.error(e);
      }
    };

    fetchFileIds();
  }, [client]);

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
