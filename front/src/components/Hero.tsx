"use client";

import { Field, Form, Formik } from "formik";
import { useAccount, useWalletClient } from "wagmi";
import FileDropper from "./FileDropper";
import * as Yup from "yup";
import SubmitButton from "./SubmitButton";
import React, { useState } from "react"; // Make sure to import React and useState
import { getConfig } from "../config/config";
import { NetworkEnum } from "@/config/types";
import PolygonToSecret from "../contracts/ABI/PolygonToSecret.json";

export default function Hero() {
  const { address, chainId } = useAccount();
  const { data: walletClient } = useWalletClient({ chainId });
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
    console.log("values", values.file?.name);
    console.log("destination chain", process.env.NEXT_PUBLIC_DESTINATION_CHAIN);

    let tx;
    if (isConnected && address) {
      try {
        tx = await walletClient?.writeContract({
          address: config.contracts.talentLayerId,
          abi: PolygonToSecret.abi,
          functionName: "send",
          args: [
            process.env.NEXT_PUBLIC_DESTINATION_CHAIN,
            config.contracts.polygonToSecret,
            values.file?.name,
          ],
          account: address,
        });

        console.log(tx);
      } catch (error) {
        console.log(error);
      } finally {
        setSubmitting(false);
      }
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
              <p className="mx-auto mt-6 max-w-lg text-center text-xl text-indigo-200 sm:max-w-3xl">
                {!isConnected && (
                  <span className="text-white">
                    Please connect your wallet to be able to depose, protect,
                    and share a file with Secret Network
                  </span>
                )}
              </p>
              {isConnected && (
                <div className="mt-10 mx-auto lg:w-1/3">
                  <Formik
                    initialValues={initialValues}
                    onSubmit={onSubmit}
                    validationSchema={validationSchema}
                  >
                    {({ isSubmitting, dirty, isValid }) => (
                      <Form className="justify-center">
                        <div className="flex justify-center gap-6 border border-gray-200 rounded-md p-8">
                          <FileDropper
                            setFileSelected={setFileSelected}
                            fileSelected={fileSelected}
                          />
                          <Field type="hidden" id="file" name="file" />
                          {/* Error messages and submit button */}
                        </div>
                        <div className="mt-4 flex justify-center">
                          <SubmitButton
                            isSubmitting={isSubmitting}
                            disabled={!isValid || !dirty}
                            label="Submit your file"
                          />
                        </div>
                      </Form>
                    )}
                  </Formik>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
