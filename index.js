import { homedir } from "node:os";
import { resolve } from "node:path";
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

const commands = {
  up: () => {
    currentDir = resolve(currentDir, "..");
    printCurrentDir();
  }
}

process.stdin.setDefaultEncoding("utf-8").on("data", (data) => {
  const input = data.toString().trim();
  const command = commands[input];
  if (command !== undefined) {
    command();
    return;
  }
});

console.log(`Welcome to the File Manager, ${username}!`);
printCurrentDir();
