import { homedir } from "node:os";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { readdir } from "node:fs/promises";

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
  },
  ls: async () => {
    console.table(
      (
        await readdir(currentDir, {
          withFileTypes: true,
        })
      )
        .map((dirent) => ({
          name: dirent.name,
          type: dirent.isDirectory() ? "directory" : "file",
        }))
        .toSorted((a, b) => {
          if (a.type > b.type) {
            return 1;
          }
          if (a.type < b.type) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return -1;
        })
    );
  },
};

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
