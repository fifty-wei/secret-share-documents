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
import {useContext, useEffect, useState} from "react";
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
        <div className="mx-auto max-w-xl px-4 sm:px-6 lg:mx-0lg:py-16 lg:grid lg:max-w-7xl lg:gap-24 lg:px-8 ">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Your documents
          </h2>
          <Table>
            <TableCaption>A list of your recent invoices.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Invoice</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fileIds.map(fileId => (
                <TableRow key={fileId}>
                  <TableCell className="font-medium">
                    {fileId}
                  </TableCell>
                  {/*<TableCell>{invoice.paymentStatus}</TableCell>*/}
                  {/*<TableCell>{invoice.paymentMethod}</TableCell>*/}
                  <TableCell className="text-right">
                    {/*{invoice.totalAmount}*/}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>Total</TableCell>
                <TableCell className="text-right">$2,500.00</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
        <Content />
        <Footer />
      </>
    </main>
  );
}
