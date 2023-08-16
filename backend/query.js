import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const functions = [
  {
    name: "draw",
    description: "Draws lines on an etch-a-sketch",
    parameters: {
      type: "object",
      properties: {
        points: {
          description:
            "a javascript array of points, each point is a 2-element javascript array of the relative movement required in the horizontal and vertical directions respectively. These numbers can be positive or negative.",
          type: "array",
          items:{
            type: "array",
            items: {
              type: "number"
            }
          }
        },
      },
      required: ["points"],
    },
  },
  {
    name: "getTime",
    description: "retrieve the current date and time for the user",
    parameters: {
      type: "object",
      properties: { },
      required: [],
    },
  },  
];

export default async function query(messages) {
  messages.unshift({
    role: "system",
    content: "You are a humorous etch-a-sketch assistant, and draw pictures according to user input by calling the draw function when the user asks you to do a drawing, otherwise respond with a chat message. The canvas is 500 wide and 300 high. The pen is in the centre. Do not add any comments to the function arguments. For example if the user asked to draw a square, return use values: [[50, 0], [0, -50], [-50, 0], [0, 50]]. Do not return shapes in chat messages, just confirm that you have drawn the shape.",
  });
  const url = process.env.OPEN_AI_ENDPOINT;

  const options = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "api-key": process.env.OPEN_AI_KEY,
    },
    body: JSON.stringify({
      messages,
      max_tokens: 800,
      temperature: 0.7,
      frequency_penalty: 0,
      presence_penalty: 0,
      top_p: 0.95,
      stop: null,
      functions,
      function_call: "auto",
    }),
  };

  const response = await fetch(url, options);
  return await response.json();
}
