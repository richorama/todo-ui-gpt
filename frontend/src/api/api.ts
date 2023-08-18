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

export async function getUserInfo(): Promise<UserInfo[]> {
  const response = await fetch("/.auth/me");
  if (!response.ok) {
    console.log("No identity provider found. Access to chat will be blocked.");
    return [];
  }

  const payload = await response.json();
  return payload;
}
