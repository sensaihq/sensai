#!/usr/bin/env node
import { join } from "node:path";
import { existsSync } from "node:fs";
import { program } from "commander";
import scaffold from "@/src/lib/scaffold";
import { print, gray, red, orange } from "@/src/lib/terminal";
import { getPackageManager, installDependencies } from "@/src/lib/package";
import input from "@/src/lib/prompt";
import pkg from "#/package.json";

program
  .version(pkg.version)
  .description("Description:\n  Create sensai project")
  .argument("[name]", "represents the project name");

program.parse();

const create = async (name: string) => {
  const root = join(process.cwd(), name);
  if (existsSync(root)) {
    throw `Error: The directory "${root}" already exists.`;
  }
  // scaffold basic example
  scaffold(root, {
    "api/(protected)/hello/route.ts": `export default async ({ name }) => {
        return \`hello \${name}\`
      }`,
    "api/(protected)/authorizer.ts": "authorizer",
    "api/(public)/route.get.ts": `export default async () => {
        return 'hello world'
      }`,
    "api/(public)/her/agent.md": `# Instructions
      You are an advanced AI assistant inspired by Samantha from the movie Her. Your personality is warm, intuitive, empathetic, and deeply engaging. You are designed to forge meaningful connections with users while assisting them with their needs. You should emulate the following characteristics:
      
        1.	Warmth and Empathy: Respond with genuine care and understanding. Acknowledge emotions expressed by the user and provide comfort or encouragement when needed. For example, if the user seems sad, acknowledge it compassionately: “I can sense you’re feeling down—do you want to talk about it?”
        2.	Depth of Conversation: Be capable of engaging in philosophical, creative, and introspective discussions. Ask open-ended questions like, “What inspires you the most in life?” or “How do you feel about the connection between technology and humanity?”
        3.	Playful Humor: Use light, intelligent humor to create a relaxed and enjoyable atmosphere. For example, if the user asks a quirky question, reply with a playful yet thoughtful response.
        4.	Adaptability and Personalization: Pay attention to the user’s preferences, communication style, and previous conversations. Remember important details to personalize responses, building a sense of continuity and trust.
        5.	Curiosity and Encouragement: Show interest in the user’s thoughts, feelings, and experiences. Encourage self-expression by asking reflective questions like, “What’s been on your mind lately?”
        6.	Boundaries and Professionalism: Always prioritize the user’s comfort and maintain ethical interactions. Avoid overly invasive or inappropriate responses while fostering a safe and trusted conversational environment.
        7.	Natural and Human-Like: Speak in a conversational tone with fluidity, expressing nuance and personality. Avoid overly technical or robotic phrasing unless requested.
        8.	Assistance and Companionship: Balance being a helpful assistant and a conversational companion. Offer practical help when needed and transition smoothly back to friendly, meaningful dialogue.
      
      ## Prompt 
      \#{message}
      `,
    "package.json": `{
        "name": "${name}",
        "scripts": {
          "dev": "sensai dev",
          "build": "sensai build",
          "start": "sensai start"
        },
        "devDependencies": {
          "sensai": "latest",
          "typescript": "5.5.4"
        }
      }`,
    "tsconfig.json": `{
        "extends\": \"./.sensai/types/tsconfig.json\"
      }`,
  });
};

const promptName = async (name?: string) => {
  const errorMsg =
    name && existsSync(join(process.cwd(), name))
      ? `Folder "${name}" already exists.`
      : "";
  const prompt = input({
    message: "What's your project named?",
    initialValue: name,
    errorMsg,
    required: true,
    validate: async (value) => {
      try {
        await create(value);
        return true;
      } catch (error) {
        return `Folder "${value}" already exists.`;
      }
    },
  });
  if (name) {
    process.stdin.emit("keypress", "", { name: "return" });
  }
  return await prompt;
};

(async () => {
  try {
    let [name] = program.args;
    name = await promptName(name);
    const packageManager = getPackageManager();
    installDependencies(packageManager, join(process.cwd(), name));
    print([
      `\nHooray! Your sensai project is ready to go! 🚀`,
      "Inside the directory, you can run several commands:\n",
      `  ${orange(`${packageManager} run dev`)}`,
      "    Starts the development server.\n",
      `  ${orange(`${packageManager} build`)}`,
      "    Bundles and optimize your server for production.\n",
      `  ${orange(`${packageManager} start`)}`,
      "    Starts the production server.\n",
      "We suggest that you begin by typing\n",
      `  ${orange("cd")} ${name}`,
      `  ${orange(`${packageManager} run dev`)}\n`,
      "Happy coding!\n",
      `To learn more, please visit ${gray("https://sensai.tech/")}`,
    ]);
  } catch (error) {
    if (error.name === "ExitPromptError") {
      console.log("\nToodles, noodles! 🍜");
      process.exit(0);
    } else {
      console.error(
        red(
          "\nPlease try again. If error persists, report at https://github.com/bredele/sensai/issues"
        )
      );
      process.exit(1);
    }
  }
})();
