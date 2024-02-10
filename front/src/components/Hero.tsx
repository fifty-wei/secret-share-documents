"use client";

import Link from "next/link";
import { use } from "react";
import { useAccount } from "wagmi";
import { DropContent } from "./DropContent";

export default function Hero() {
  const { address, isConnected } = useAccount();

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
                Please connect your wallet to be able to depose, protect and
                share a file with Secret Network
              </p>
              {isConnected && (
                <div className="mt-10 mx-auto sm:w-full md:w-3/4 lg:w-1/2">
                  {" "}
                  <DropContent />{" "}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
