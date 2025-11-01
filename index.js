import { homedir } from "node:os";
import { parseArgs } from "node:util";

const {
  values: { username },
} = parseArgs({
  options: {
    username: {
      type: "string",
    },
  },
});

let currentDir = homedir();

const printCurrentDir = () => {
  console.log(`You are currently in ${currentDir}`);
};

process.stdin.setDefaultEncoding("utf-8").on("data", (data) => {
  console.log(data.toString());
});

console.log(`Welcome to the File Manager, ${username}!`);
printCurrentDir();
