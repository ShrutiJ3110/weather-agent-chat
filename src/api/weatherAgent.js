const API_URL =
  "https://brief-thousands-sunset-9fcb1c78-485f-4967-ac04-2759a8fa1462.mastra.cloud/api/agents/weatherAgent/stream";


const THREAD_ID = "222047";

export async function streamWeatherAgent(message, onText) {
  let response;

  try {
    response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8,fr;q=0.7",
        Connection: "keep-alive",
        "Content-Type": "application/json",
        "x-mastra-dev-playground": "true"
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: message
          }
        ],
        runId: "weatherAgent",
        maxRetries: 2,
        maxSteps: 5,
        temperature: 0.5,
        topP: 1,
        runtimeContext: {},
        threadId: THREAD_ID,
        resourceId: "weatherAgent"
      })
    });
  } catch (networkError) {

    await streamFallback(onText);
    return;
  }

  if (!response.ok || !response.body) {
    await streamFallback(onText);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const chunks = buffer.split("\n");
      buffer = chunks.pop();

      for (const chunk of chunks) {
        if (!chunk.trim()) continue;

        try {
          const parsed = JSON.parse(chunk);

          const text =
            parsed?.content ||
            parsed?.response ||
            parsed?.data?.response ||
            parsed?.payload?.text;

          if (typeof text === "string") {
            onText(text);
          }
        } catch {
        }
      }
    }
  } catch {
    await streamFallback(onText);
  }
}

async function streamFallback(onText) {
  const fallbackMessage =
    "⚠️ The weather service is temporarily unavailable. Please try again later.";

  for (const char of fallbackMessage) {
    await new Promise((res) => setTimeout(res, 20));
    onText(char);
  }
}
