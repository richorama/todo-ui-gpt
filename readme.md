# Todo Copilot Demo

A very simple demo of how to use Copilot to maintain a todo list.

## Installation

1. Install npm

```bash
$ cd backend
$ npm i
$ cd ../frontend
$ npm i
```
2. Create a .env file in the backend folder with the following contents:

```
OPEN_AI_ENDPOINT=https://XXX.openai.azure.com/openai/deployments/XXX/chat/completions?api-version=2023-07-01-preview
OPEN_AI_KEY=XXX
```

## Run Locally

1. Start the backend server

```bash
$ cd backend
$ npm run dev
```

2. Start the frontend server

```bash
$ cd frontend
$ npm run dev
```

3. Open [http://localhost:5173/](http://localhost:5173/) in your browser

4. Type in commands like `add a reminder to buy the milk` or `I have completed the shopping`.

## License

MIT