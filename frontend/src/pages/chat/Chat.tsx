import { useRef, useState, useEffect } from "react";
import { Stack } from "@fluentui/react";
import {
  BroomRegular,
  DismissRegular,
  SquareRegular,
  ShieldLockRegular,
  ErrorCircleRegular,
} from "@fluentui/react-icons";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

import styles from "./Chat.module.css";
import Azure from "../../assets/Azure.svg";

import {
  ChatMessage,
  conversationApi,
  Citation,
  ChatResponse,
  FunctionCall,
} from "../../api";
import { Answer } from "../../components/Answer";
import { QuestionInput } from "../../components/QuestionInput";

const Chat = () => {
  const lastQuestionRef = useRef<string>("");
  const chatMessageStreamEnd = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showLoadingMessage, setShowLoadingMessage] = useState<boolean>(false);
  const [activeCitation, setActiveCitation] =
    useState<
      [
        content: string,
        id: string,
        title: string,
        filepath: string,
        url: string,
        metadata: string
      ]
    >();
  const [isCitationPanelOpen, setIsCitationPanelOpen] =
    useState<boolean>(false);
  const [todos, setTodos] = useState<string[]>([
    "Buy some milk",
    "Put the bins out",
    "Walk the dog",
  ]);

  const writeTodos = () => todos.map((x, i) => `${i + 1}. ${x}`).join("\n");

  const evalFunction = async (functionCall: FunctionCall) => {
    const args = JSON.parse(functionCall.arguments);
    switch (functionCall.name) {
      case "add_todo":
        setTodos((prev) => [...prev, args.description]);
        return `The ${
          args.description
        } item was added successfully. The todos are now:\n---\n${writeTodos()}}`;
      case "remove_todo":
        setTodos((prev) => prev.filter((x, index) => index !== args.index - 1));
        return `The ${
          args.index
        } todo ${args.index} was removed successfully. The todos are now:\n---\n${writeTodos()}}`;
    }
  };

  const [answers, setAnswers] = useState<ChatMessage[]>([
    {
      role: "system",
      content: `You are a super positive a AI assistant that helps people maintain a todo list and gets things done. You can respond in markdown and use emojis. You can add and remove items on the list by calling the add_todo and remove_todo functions.\nThese are the initial todo items:\n---\n${writeTodos()}`,
    },
  ]);

  const makeRequest = async (messages: ChatMessage[]) => {
    let result = {} as ChatResponse;

    try {
      const result = await conversationApi({
        messages: messages.filter((x) => x.role !== "error"),
      });

      const message = result.choices[0].message;
      setAnswers([...messages, message]);

      if (message.function_call) {
        // the chat results requires us to go and call function
        message.content = await evalFunction(message.function_call);
        const nextAnswers = [...messages, message];
        setAnswers(nextAnswers);
        makeRequest(nextAnswers);
        return;
      }
      setShowLoadingMessage(false);
    } catch (e) {
      console.log(e);

      console.error(result);
      let errorMessage =
        "An error occurred. Please try again. If the problem persists, please contact the site administrator.";
      if (result.error?.message) {
        errorMessage = result.error.message;
      } else if (typeof result.error === "string") {
        errorMessage = result.error;
      }
      setAnswers([
        ...answers,
        {
          role: "error",
          content: errorMessage,
        },
      ]);
    } finally {
      setIsLoading(false);
      setShowLoadingMessage(false);
      setTimeout(scrollToBottom, 100)
    }
  };

  const makeApiRequest = async (question: string) => {
    lastQuestionRef.current = question;

    setIsLoading(true);
    setShowLoadingMessage(true);

    const userMessage: ChatMessage = {
      role: "user",
      content: question,
    };

    const nextAnswers = [...answers, userMessage];

    makeRequest(nextAnswers);
  };

  const clearChat = () => {
    lastQuestionRef.current = "";
    setActiveCitation(undefined);
    setAnswers([   {
      role: "system",
      content: `You are a super positive a AI assistant that helps people maintain a todo list and gets things done. You can respond in markdown and use emojis. You can add and remove items on the list by calling the add_todo and remove_todo functions.\nThese are the initial todo items:\n---\n${writeTodos()}`,
    }]);
  };

  const stopGenerating = () => {
    setShowLoadingMessage(false);
    setIsLoading(false);
  };

  const scrollToBottom = () => {
    chatMessageStreamEnd.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [showLoadingMessage, setAnswers]);

  const onShowCitation = (citation: Citation) => {
    setActiveCitation([
      citation.content,
      citation.id,
      citation.title ?? "",
      citation.filepath ?? "",
      "",
      "",
    ]);
    setIsCitationPanelOpen(true);
  };

  return (
    <div className={styles.container} role="main">
      {false ? (
        <Stack className={styles.chatEmptyState}>
          <ShieldLockRegular
            className={styles.chatIcon}
            style={{ color: "darkorange", height: "200px", width: "200px" }}
          />
          <h1 className={styles.chatEmptyStateTitle}>
            Authentication Not Configured
          </h1>
          <h2 className={styles.chatEmptyStateSubtitle}>
            This app does not have authentication configured. Please add an
            identity provider by finding your app in the
            <a href="https://portal.azure.com/" target="_blank">
              {" "}
              Azure Portal{" "}
            </a>
            and following
            <a
              href="https://learn.microsoft.com/en-us/azure/app-service/scenario-secure-app-authentication-app-service#3-configure-authentication-and-authorization"
              target="_blank"
            >
              {" "}
              these instructions
            </a>
            .
          </h2>
          <h2
            className={styles.chatEmptyStateSubtitle}
            style={{ fontSize: "20px" }}
          >
            <strong>
              Authentication configuration takes a few minutes to apply.{" "}
            </strong>
          </h2>
          <h2
            className={styles.chatEmptyStateSubtitle}
            style={{ fontSize: "20px" }}
          >
            <strong>
              If you deployed in the last 10 minutes, please wait and reload the
              page after 10 minutes.
            </strong>
          </h2>
        </Stack>
      ) : (
        <Stack horizontal className={styles.chatRoot}>
          <div style={{ width: "50%", height: "100%" }}>
            <Stack
              className={styles.chatContainer}
              style={{ alignItems: "inherit", height: "100%" }}
            >
              {(todos || []).map((todo) => (
                <div
                  style={{
                    alignItems: "left",
                    padding: 20,
                    fontSize: 20,
                    borderBottom: "1px solid #ddd",
                  }}
                  key={todo}
                >
                  {todo}
                </div>
              ))}
            </Stack>
          </div>
          <div className={styles.chatContainer}>
            {!lastQuestionRef.current ? (
              <Stack className={styles.chatEmptyState}>
                <img
                  src={Azure}
                  className={styles.chatIcon}
                  aria-hidden="true"
                />
                <h1 className={styles.chatEmptyStateTitle}>Start chatting</h1>
                <h2 className={styles.chatEmptyStateSubtitle}>
                  🤖 This chatbot is configured to help you be productive!
                </h2>
              </Stack>
            ) : (
              <div
                className={styles.chatMessageStream}
                style={{ marginBottom: isLoading ? "40px" : "0px" }}
                role="log"
              >
                {answers.map((answer) => (
                  <>
                    {answer.function_call ? (
                      <div className={styles.chatMessageGpt}>
                        <div
                          className={styles.chatMessageUserMessage}
                          style={{ background: "whitesmoke" }}
                        >
                          <i>Function called:</i>
                          <br />
                          <pre>
                            {answer.function_call.name}("
                            {JSON.parse(answer.function_call.arguments || "{}")
                              .description ||
                              JSON.parse(answer.function_call.arguments || "{}")
                                .index}
                            ")
                          </pre>
                        </div>
                      </div>
                    ) : answer.role === "user" ? (
                      <div className={styles.chatMessageUser} tabIndex={0}>
                        <div className={styles.chatMessageUserMessage}>
                          {answer.content}
                        </div>
                      </div>
                    ) : answer.role === "assistant" && answer.content ? (
                      <div className={styles.chatMessageGpt}>
                        <Answer
                          answer={{
                            answer: answer.content || "",
                            citations: [],
                          }}
                          onCitationClicked={(c) => onShowCitation(c)}
                        />
                      </div>
                    ) : answer.role === "error" ? (
                      <div className={styles.chatMessageError}>
                        <Stack
                          horizontal
                          className={styles.chatMessageErrorContent}
                        >
                          <ErrorCircleRegular
                            className={styles.errorIcon}
                            style={{ color: "rgba(182, 52, 67, 1)" }}
                          />
                          <span>Error</span>
                        </Stack>
                        <span className={styles.chatMessageErrorContent}>
                          {answer.content}
                        </span>
                      </div>
                    ) : null}
                  </>
                ))}
                {showLoadingMessage && (
                  <>
                    <div className={styles.chatMessageUser}>
                      <div className={styles.chatMessageUserMessage}>
                        {lastQuestionRef.current}
                      </div>
                    </div>
                    <div className={styles.chatMessageGpt}>
                      <Answer
                        answer={{
                          answer: "Generating answer...",
                          citations: [],
                        }}
                        onCitationClicked={() => null}
                      />
                    </div>
                  </>
                )}
                <div ref={chatMessageStreamEnd} />
              </div>
            )}

            <Stack horizontal className={styles.chatInput}>
              {isLoading && (
                <Stack
                  horizontal
                  className={styles.stopGeneratingContainer}
                  role="button"
                  aria-label="Stop generating"
                  tabIndex={0}
                  onClick={stopGenerating}
                  onKeyDown={(e) =>
                    e.key === "Enter" || e.key === " " ? stopGenerating() : null
                  }
                >
                  <SquareRegular
                    className={styles.stopGeneratingIcon}
                    aria-hidden="true"
                  />
                  <span
                    className={styles.stopGeneratingText}
                    aria-hidden="true"
                  >
                    Stop generating
                  </span>
                </Stack>
              )}
              <div
                role="button"
                tabIndex={0}
                onClick={clearChat}
                onKeyDown={(e) =>
                  e.key === "Enter" || e.key === " " ? clearChat() : null
                }
                aria-label="Clear session"
              >
                <BroomRegular
                  className={styles.clearChatBroom}
                  style={{
                    background:
                      isLoading || answers.length === 0
                        ? "#BDBDBD"
                        : "radial-gradient(109.81% 107.82% at 100.1% 90.19%, #0F6CBD 33.63%, #2D87C3 70.31%, #8DDDD8 100%)",
                    cursor: isLoading || answers.length === 0 ? "" : "pointer",
                  }}
                  aria-hidden="true"
                />
              </div>
              <QuestionInput
                clearOnSend
                placeholder="Type a new question..."
                disabled={isLoading}
                onSend={(question) => makeApiRequest(question)}
              />
            </Stack>
          </div>
        </Stack>
      )}
    </div>
  );
};

export default Chat;
