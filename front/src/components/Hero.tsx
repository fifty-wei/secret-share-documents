"use client";

import { Field, Form, Formik } from "formik";
import { useAccount, useWalletClient } from "wagmi";
import FileDropper from "./FileDropper";
import * as Yup from "yup";
import SubmitButton from "./SubmitButton";
import React, { useContext, useState } from "react"; // Make sure to import React and useState
import { getConfig } from "../config/config";
import { NetworkEnum } from "@/config/types";
import PolygonToSecret from "../contracts/ABI/PolygonToSecret.json";
import { SecretDocumentContext } from "@/context/SecretDocumentContext";

export default function Hero() {
  const { address, chainId } = useAccount();
  const { data: walletClient } = useWalletClient({ chainId });
  const { client } = useContext(SecretDocumentContext);
  const config = getConfig(chainId as NetworkEnum);

  interface IFormValues {
    file: File | null;
  }

  const validationSchema = Yup.object({
    file: Yup.mixed().required("Please provide a file"),
  });

  const initialValues: IFormValues = {
    file: null,
  };

  const onSubmit = async (
    values: IFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    if (!client) {
      console.error("No SecretDocumentClient init.");
      return;
    }

    try {
      const tx = await client.storeDocument().fromFile(values.file as File);
      // tx = await walletClient?.writeContract({
      //   address: config.contracts.talentLayerId,
      //   abi: PolygonToSecret.abi,
      //   functionName: "send",
      //   args: [
      //     process.env.NEXT_PUBLIC_DESTINATION_CHAIN,
      //     config.contracts.polygonToSecret,
      //     values.file?.name,
      //   ],
      //   account: address,
      // });

      console.log(tx);
    } catch (error) {
      console.log(error);
    } finally {
      setSubmitting(false);
    }
  };

  const [fileSelected, setFileSelected] = useState<File | null>(null);
  const { isConnected } = useAccount();

  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white" />
        <div className="mx-auto py-10 max-w-7xl sm:px-6 lg:px-8">
          <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
            <div className="absolute inset-0">
              <img
                className="h-full w-full object-cover"
                src="https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2830&q=80&sat=-100"
                alt="People working on laptops"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-800 to-indigo-700 mix-blend-multiply" />
            </div>
            <div className="relative px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8">
              <h1 className="text-center text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                <span className="block text-white">
                  Share confidential documents by using
                </span>
                <span className="block text-indigo-200">
                  Secret Network - Privacy as a Service
                </span>
              </h1>
              <div className="mt-4 flex justify-center">
                <div className="mt-6">
                  <a
                    href="/upload"
                    className="inline-flex rounded-md border border-transparent bg-gradient-to-r from-purple-600 to-indigo-600 bg-origin-border px-4 py-2 text-base font-medium text-white shadow-sm hover:from-purple-700 hover:to-indigo-700"
                  >
                    Dashboard
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
