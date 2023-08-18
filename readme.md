# Etch-a-Sketch Copilot Demo

## Motivation

A very simple demo of how to use Copilot to generate code for a simple Etch-a-Sketch game.

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

4. Type in commands like `draw a circle`, `draw a triangle`.

## License

MIT