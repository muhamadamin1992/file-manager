import os, { homedir } from "node:os";
import { resolve, join } from "node:path";
import { parseArgs } from "node:util";
import {
  readdir,
  readFile,
  writeFile,
  mkdir,
  rename,
  unlink,
} from "node:fs/promises";
import { createWriteStream, createReadStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { createHash } from "node:crypto";
import { createBrotliCompress, createBrotliDecompress } from "node:zlib";

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
  cp: async (sourceName, copyDir) => {
    const sourcePath = join(currentDir, sourceName);
    const copyPath = join(currentDir, copyDir);
    await pipeline(createReadStream(sourcePath), createWriteStream(copyPath));
  },
  mv: async (sourceName, copyDir) => {
    await commands.cp(sourceName, copyDir);
    await commands.rm(sourceName);
  },
  rm: async (fileName) => {
    await unlink(join(currentDir, fileName));
  },
  cd: async (arg) => {
    const newPath = resolve(currentDir, arg);
    await readdir(newPath);
    currentDir = newPath;
  },
  os: (arg) => {
    const commandName = arg.slice(2);
    if (commandName === "username") {
      console.log(os.userInfo().username);
      return;
    }
    const osCommand = os[arg.slice(2)];
    if (typeof osCommand === "function") {
      console.log(osCommand());
      return;
    }
    console.log(osCommand);
  },
  hash: async (fileName) => {
    const hash = createHash("sha256");

    const input = createReadStream(join(currentDir, fileName));
    const chunks = [];

    input.on("readable", () => {
      let chunk;
      while (null !== (chunk = input.read())) {
        chunks.push(chunk);
      }
    });

    input.on("end", () => {
      const content = chunks.join("");
      hash.update(content);
      console.log(hash.digest("hex"));
    });
  },
  compress: async (source, dest) => {
    await pipeline(
      createReadStream(join(currentDir, source)),
      createBrotliCompress(),
      createWriteStream(join(currentDir, dest))
    );
  },
  decompress: async (source, dest) => {
    await pipeline(
      createReadStream(join(currentDir, source)),
      createBrotliDecompress(),
      createWriteStream(join(currentDir, dest))
    );
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
    } finally {
      printCurrentDir();
    }
  }
});

console.log(import.meta.url);

console.log(`Welcome to the File Manager, ${username}!`);
printCurrentDir();
