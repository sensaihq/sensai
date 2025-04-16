#!/usr/bin/env node
import * as commander from "commander";
import dev from "@/src/bin/sensai-dev";
import build from "@/src/bin/sensai-build";
import start from "@/src/bin/sensai-start";
import tmp from "@/src/bin/sensai-tmp";
import pkg from "#/package.json";

// create main program
const program = new commander.Command();

// setup sensai CLI
program.name("sensai").version(pkg.version).usage("<command>");

// add sub commands
program.addCommand(dev);
program.addCommand(build);
program.addCommand(start);
program.addCommand(tmp);

// pass arguments
program.parse(process.argv);
