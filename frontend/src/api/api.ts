import { UserInfo, ConversationRequest, ChatResponse } from "./models";

export async function conversationApi(
  requestBody: ConversationRequest
): Promise<ChatResponse> {
  const response = await fetch("/conversation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  return await response.json();
}

