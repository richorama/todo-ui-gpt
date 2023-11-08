import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const functions = [
  {
    name: "add_todo",
    description: "Adds a new todo item to the list",
    parameters: {
      type: "object",
      properties: {
        description: {
          type: "string",
          description: "The description of the todo item",
        },
      },
      required: ["description"],
    },
  },
  {
    name: "remove_todo",
    description: "Removes a todo item by index",
    parameters: {
      type: "object",
      properties: {
        index: {
          type: "integer",
          description: "The index of the todo item to remove, this starts at 1",
        },
      },
      required: ["index"],
    },
  },
]

export default async function query(messages) {
  
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
