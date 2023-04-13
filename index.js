import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output, env } from "node:process";
import { Configuration, OpenAIApi } from "openai";
import * as dotenv from "dotenv"
dotenv.config();

import { Go1, Go1Mode } from "@droneblocks/go1-js"

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);
const readline = createInterface({ input, output });

let dog = new Go1();

const extractJSCode = (content) => {
  const regex = /```([^\n]*)\n([\s\S]*?)```/g;
  const match = regex.exec(content)
  const language = match[1].trim(); // For this example will always be "javascript"
  const codeBlock = match[2].trim();
  return codeBlock
}

const chatPrompt = `You are an assistant that is helping me control the Unitree Go1 quadruped robot dog. All programming of the robot will be done with the @droneblocks/go-1js node library.

I've already taken care of importing the library and created an instance of the class called dog. The method definitions for moving Go1 are defined here:

goForward(speed: number, lengthOfTime: number)
goBackward(speed: number, lengthOfTime: number)
goLeft(speed: number, lengthOfTime: number)
goRight(speed: number, lengthOfTime: number)
turnLeft(speed: number, lengthOfTime: number)
turnRight(speed: number, lengthOfTime: number)

All methods accept two arguments the first is speed with a value from 0 to 1 where 1 is full speed. The second argument is a duration in milliseconds.

Also, please keep in mind that before we can move Go1 we need to make sure to set it's mode to Go1Mode.walk.

There is a wait method in cases where we want to pause between commands. It accepts a number in milliseconds:

wait(lengthOfTime: number)

There are also stances such as beg, which the method definition looks like this:

setMode(Go1Mode.straightHand1)

For the dog to lay down we use the following command:

setMode(Go1Mode.standDown)

and to stand up we use

setMode(Go1Mode.standUp)

You can also change the LEDs of the robot dog using the following:

setLedColor(red: number, green: number, blue: number)

Where red, green, and blue are integers between 0 and 255.

`

const messages = [{ role: "system", content: chatPrompt }];

let userInput = await readline.question("Welcome to the Go1 chatbot. Please feel free to ask it for code to control your robot!\n>");

while (userInput !== ".quit") {
  messages.push({ role: "user", content: userInput });
  try {
    const response = await openai.createChatCompletion({
      messages,
      model: "gpt-3.5-turbo",
    });

    const botMessage = response.data.choices[0].message;

    if (botMessage) {
      messages.push(botMessage);

      //let code = extractJSCode(botMessage.content)

      console.log(botMessage.content)

      // Let the user review the code before executing the program
      let confirmCode = await readline.question("Does the code look good to run? (y/n)")

      if (confirmCode == "y") {

        let program = await eval(extractJSCode(botMessage.content))

      } else {
        console.log("Sorry. Please specify more details.\n")
      }

      userInput = await readline.question("\nFeel free to ask another question:\n>")

    } else {
      userInput = await readline.question("\nNo response, try asking again\n");
    }
  } catch (error) {
    console.log(error.message);
    userInput = await readline.question(
      "\nSomething went wrong, try asking again\n"
    );
  }
}

readline.close();
