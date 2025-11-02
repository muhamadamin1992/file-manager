import { homedir } from "node:os";
import { resolve, join } from "node:path";
import { parseArgs } from "node:util";
import { readdir, readFile, writeFile, mkdir, rename } from "node:fs/promises";

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
  cat: async (filePath) => {
    const data = await readFile(join(currentDir, filePath));
    console.log(data.toString());
  },
  add: async (fileName) => {
    const pathName = join(currentDir, fileName);
    await writeFile(pathName, "");
  },
  mkdir: async (dirName) => {
    const pathName = join(currentDir, dirName);
    await mkdir(pathName);
  },
  rn: async (oldFileName, newFileName) => {
    const oldPath = join(currentDir, oldFileName);
    const newPath = join(currentDir, newFileName);
    await rename(oldPath, newPath);
  },
};

process.stdin.setDefaultEncoding("utf-8").on("data", async (data) => {
  const [input, ...args] = data.toString().trim().split(/\s+/);
  const command = commands[input];
  if (command !== undefined) {
    if (command.length > args.length) {
      throw new Error("Invalid input");
    }
    try {
      await command(...args);
    } catch (err) {
      throw new Error("Operation failed");
    }
  }
});

console.log(import.meta.url);

console.log(`Welcome to the File Manager, ${username}!`);
printCurrentDir();
