import type { Config } from "jest";
import { defaults } from "jest-config";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  moduleFileExtensions: [...defaults.moduleFileExtensions],
  injectGlobals: true,
  globalSetup: "<rootDir>/tests/setup.ts",
  // setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
};

export default config;
