import { parseArgs } from "node:util";

const { values: { username } } = parseArgs({ options: {
  username: {
    type: "string",
  }
}});

console.log(`Welcome to the File Manager, ${username}!`);
