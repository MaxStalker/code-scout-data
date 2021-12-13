import fs from "fs";
import * as fcl from "@onflow/fcl";
import { setEnvironment } from "flow-cadut";
import addresses from "./addresses";

(async () => {
  const accountData = [];
  await setEnvironment("mainnet");
  for (const address of addresses.slice(0, 3)) {
    console.log(`Processing: ${address}`);
    try {
      const { account } = await fcl.send([fcl.getAccount(address)]);
      const contractNames = Object.keys(account.contracts);
      for (const contractName of contractNames) {
        accountData.push({
          address,
          contractName,
          code: account.contracts[contractName],
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  let data = JSON.stringify(accountData);
  fs.writeFileSync("deployed-contracts.json", data);
})();
