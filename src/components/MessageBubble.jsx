import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ThumbsUp, ThumbsDown, Copy, Check } from "lucide-react";

function MessageBubble({ role, text = "", time, highlight }) {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);
  const [reaction, setReaction] = useState(null);

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const formattedTime =
    time instanceof Date
      ? time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : time;

  const renderHighlightedText = () => {
    if (!highlight) return text;
    return text.split(new RegExp(`(${highlight})`, "gi")).map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="group max-w-[720px]">

        <div
          className={`px-4 py-3 rounded-2xl shadow-sm break-words
            ${
              isUser
                ? "bg-sky-500 text-white rounded-br-sm"
                : "bg-white text-gray-900 rounded-bl-sm"
            }`}
        >
          {isUser ? (
            <div className="text-sm">{renderHighlightedText()}</div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>
                {text || "…"}
              </ReactMarkdown>
            </div>
          )}

          {formattedTime && (
            <div className="text-[11px] opacity-60 mt-1 text-right">
              {formattedTime}
            </div>
          )}
        </div>

        {!isUser && (
          <div className="flex gap-3 mt-1 opacity-0 group-hover:opacity-100 transition">
            <button onClick={handleCopy} className="text-gray-400 hover:text-gray-700">
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>

            <button
              onClick={() => setReaction(reaction === "like" ? null : "like")}
              className={reaction === "like" ? "text-green-600" : "text-gray-400"}
            >
              <ThumbsUp size={14} />
            </button>

            <button
              onClick={() => setReaction(reaction === "dislike" ? null : "dislike")}
              className={reaction === "dislike" ? "text-red-600" : "text-gray-400"}
            >
              <ThumbsDown size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;
