import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import query from "./query.js";

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/conversation", async (req, res) => {
  // read the JSON body from the request
  
  console.log(req.body.messages);
  req.body.messages.forEach((message) => message.content = message.content || null)
  const response = await query(req.body.messages)
  console.log(response)
  res.json(response);
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
