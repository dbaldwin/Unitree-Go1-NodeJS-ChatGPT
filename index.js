import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output, env } from "node:process";
import { Configuration, OpenAIApi } from "openai";
import * as dotenv from 'dotenv'
dotenv.config()

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);
const readline = createInterface({ input, output });

class Go1 {
  constructor() {
    console.log('dog created')
  }

  moveForward = (speed, duration) => {
    console.log(`moving forward at ${speed} for ${duration}`)
  }
}

let dog = new Go1();

const extractJSCode = (content) => {
  const regex = /```([^\n]*)\n([\s\S]*?)```/g;
  const match = regex.exec(content)
  const language = match[1].trim(); // For this example will always be "javascript"
  const codeBlock = match[2].trim();
  return codeBlock
}

// const chatbotType = await readline.question(
//   "What type of chatbot would you like to create? "
// );

const chatbotType = `You are an assistant that is helping me control the Unitree Go1 quadruped robot. All programming of the robot will be done with the @droneblocks/go-1js node library.

I've already taken care of importing the library and created an instance of the class called dog. The methods you can use are

dog.moveForward
dog.moveBackward
dog.moveLeft
dog.moveRight

All methods accept two arguments the first is speed with a value from 0 to 1 where 1 is full speed. The second argument is a duration in milliseconds.
`

const messages = [{ role: "system", content: chatbotType }];

let userInput = await readline.question("Welcome to the Go1 chatbot. Please feel free to ask it for code to control your robot!\n>");

while (userInput !== ".quit") {
  messages.push({ role: "user", content: userInput });
  try {
    const response = await openai.createChatCompletion({
      messages,
      model: "gpt-3.5-turbo",
    });

    const botMessage = response.data.choices[0].message;
    
    //extractJSCode(botMessage.content)

    if (botMessage) {
      messages.push(botMessage);

      //let code = extractJSCode(botMessage.content)

      console.log(botMessage.content)

      // Let the user review the code before executing the program
      let confirmCode = await readline.question("Does the code look good to run? (y/n)")

      if (confirmCode == "y") {
        console.log("executing code")
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
