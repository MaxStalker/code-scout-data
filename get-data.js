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

(async () => {
  // const accountData = [];
  await setEnvironment("mainnet");
  const accountData = [];
  await Promise.all(
    addresses.slice(0, 5).map(async (address) => {
      console.log(`Processing: ${address}`);
      const { account } = await fcl.send([fcl.getAccount(address)]);
      console.log(`Got: ${address}`);
      const contractNames = Object.keys(account.contracts);
      for (const contractName of contractNames) {
        const code = account.contracts[contractName];
        const imports = filterImports(extractImports(code));
        console.log(contractName);
        accountData.push({
          address,
          contractName,
          // code,
          imports,
        });
      }
    })
  );

  console.log({ accountData });

  let data = prettier.format(JSON.stringify(accountData), { parser: "json" });
  fs.writeFileSync("deployed-contracts.json", data);
})();
