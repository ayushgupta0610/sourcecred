// @flow

import type {Command} from "./command";
import dedent from "../util/dedent";

import load from "./load";
import graph from "./graph";
import score from "./score";

function die(std, message) {
  std.err("fatal: " + message);
  return 1;
}

const NO_LOAD_ARG = "--no-load";

const goCommand: Command = async (args, std) => {
  let noLoad = false;
  if (args.length === 1 && args[0] === NO_LOAD_ARG) {
    noLoad = true;
  } else if (args.length !== 0) {
    return die(std, "usage: sourcecred go [--no-load]");
  }

  const commandSequence = [
    {name: "load", command: load},
    {name: "graph", command: graph},
    {name: "score", command: score},
  ];

  for (const {name, command} of commandSequence) {
    if (name === "load" && noLoad) continue;
    const ret = await command([], std);
    if (ret !== 0) {
      return die(std, `go: failed on command ${name}`);
    }
  }
  return 0;
};

export const goHelp: Command = async (args, std) => {
  std.out(
    dedent`\
      usage: sourcecred go [--no-load]

      Load data from plugins, build a graph and generate cred scores.
      
      Under the hood, this runs 'sourcecred load', 'sourcecred graph'
      and 'sourcecred score' in sequence.
      If any command in the sequence fails, the sequence will bail and
      subsequent commands will not be executed.
      `.trimRight()
  );
  return 0;
};

export default goCommand;
