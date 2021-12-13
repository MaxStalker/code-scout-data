import fs from "fs";
import * as fcl from "@onflow/fcl";
import { setEnvironment, extractImports } from "flow-cadut";
import prettier from "prettier";
import parserBabel from "prettier/parser-babel";

import addresses from "./addresses";

const filterImports = (imp) => {
  const keys = Object.keys(imp).filter((item) => !item.includes("/"));
  const clear = {};
  for (const key of keys) {
    clear[key] = imp[key];
  }
  return clear;
};

const processAddress = async (address, add) => {
  console.log(`Processing: ${address}`);
  const { account } = await fcl.send([fcl.getAccount(address)]);
  const contractNames = Object.keys(account.contracts);
  for (const contractName of contractNames) {
    const code = account.contracts[contractName];
    const imports = filterImports(extractImports(code));
    console.log(contractName);
    add({
      address,
      contractName,
      code,
      imports,
    });
  }
};

(async () => {
  await setEnvironment("mainnet");
  const accountData = [];
  await Promise.all(
    addresses.map((address) =>
      processAddress(address, (value) => accountData.push(value))
    )
  );

  console.log("Done!");

  console.log("Formatting...");
  let data = prettier.format(JSON.stringify(accountData), { parser: "json" });

  console.log("Writing to file...");
  fs.writeFileSync("deployed-contracts.json", data);

  console.log("Success :)");
})();
