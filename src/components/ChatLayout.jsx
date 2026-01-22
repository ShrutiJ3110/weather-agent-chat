import { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { streamWeatherAgent } from "../api/weatherAgent";
import { MoreVertical, Pin, Trash2, Archive } from "lucide-react";

function ChatLayout() {
  const [chats, setChats] = useState([
    {
      id: Date.now(),
      title: "New Chat",
      pinned: false,
      archived: false,
      messages: [
        {
          role: "agent",
          text: "Hello! Ask me about the weather.",
          time: new Date()
        }
      ]
    }
  ]);

  const [activeChatId, setActiveChatId] = useState(chats[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const bottomRef = useRef(null);
  const activeChat = chats.find(c => c.id === activeChatId);
  const messages = activeChat?.messages || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text) => {
    if (!text.trim() || isStreaming) return;
    setIsStreaming(true);

    setChats(prev =>
      prev.map(chat =>
        chat.id === activeChatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                { role: "user", text, time: new Date() },
                { role: "agent", text: "", time: new Date() }
              ]
            }
          : chat
      )
    );

    try {
      await streamWeatherAgent(text, chunk => {
  setChats(prev =>
    prev.map(chat => {
      if (chat.id !== activeChatId) return chat;

      const updated = [...chat.messages];

      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        text: chunk
      };

      return { ...chat, messages: updated };
    })
  );
});

    } catch {
      setChats(prev =>
        prev.map(chat =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages.slice(0, -1),
                  {
                    role: "agent",
                    text: "Sorry, something went wrong.",
                    time: new Date()
                  }
                ]
              }
            : chat
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const highlight = (text) => {
    if (!searchQuery) return text;
    const parts = text.split(new RegExp(`(${searchQuery})`, "gi"));
    return parts.map((p, i) =>
      p.toLowerCase() === searchQuery.toLowerCase()
        ? <mark key={i} className="bg-yellow-200">{p}</mark>
        : p
    );
  };

  return (
    <div className="h-screen w-screen flex bg-gray-100">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r flex flex-col">

        <div className="p-4">
          <button
            className="w-full bg-blue-500 text-white py-2 rounded-lg"
            onClick={() => {
              const newChat = {
                id: Date.now(),
                title: "New Chat",
                pinned: false,
                archived: false,
                messages: [
                  {
                    role: "agent",
                    text: "Hello! Ask me about the weather.",
                    time: new Date()
                  }
                ]
              };
              setChats(prev => [newChat, ...prev]);
              setActiveChatId(newChat.id);
            }}
          >
            + New Chat
          </button>
        </div>

        <div className="px-4 pb-3">
          <input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 rounded-md border"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats
            .filter(c => !c.archived)
            .sort((a, b) => b.pinned - a.pinned)
            .map(chat => (
              <div
                key={chat.id}
                className={`group px-4 py-3 flex justify-between items-center cursor-pointer
                  ${chat.id === activeChatId ? "bg-gray-200" : "hover:bg-gray-100"}`}
                onClick={() => setActiveChatId(chat.id)}
              >
                <div className="truncate">
                  {highlight(chat.title)}
                </div>

                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === chat.id ? null : chat.id);
                    }}
                  >
                    <MoreVertical size={16} />
                  </button>

                  {openMenuId === chat.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-white shadow rounded z-10 text-sm">
                      <button
                        className="flex gap-2 px-3 py-2 hover:bg-gray-100 w-full"
                        onClick={() => {
                          setChats(prev =>
                            prev.map(c =>
                              c.id === chat.id ? { ...c, pinned: !c.pinned } : c
                            )
                          );
                          setOpenMenuId(null);
                        }}
                      >
                        <Pin size={14} /> {chat.pinned ? "Unpin" : "Pin"}
                      </button>

                      <button
                        className="flex gap-2 px-3 py-2 hover:bg-gray-100 w-full"
                        onClick={() => {
                          setChats(prev =>
                            prev.map(c =>
                              c.id === chat.id ? { ...c, archived: true } : c
                            )
                          );
                          setOpenMenuId(null);
                        }}
                      >
                        <Archive size={14} /> Archive
                      </button>

                      <button
                        className="flex gap-2 px-3 py-2 hover:bg-red-100 text-red-600 w-full"
                        onClick={() => {
                          setChats(prev => prev.filter(c => c.id !== chat.id));
                          setOpenMenuId(null);
                        }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </aside>

      {/* MAIN CHAT */}
      <main className="flex-1 flex flex-col">
        <header className="px-6 py-4 border-b bg-white">
          <div className="font-semibold">Weather Agent</div>
          <div className="text-xs text-gray-500">AI Assistant</div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((m, i) => (
            <MessageBubble
              key={i}
              role={m.role}
              text={m.text}
              time={m.time}
            />
          ))}
          {isStreaming && (
            <div className="text-sm italic opacity-60">Agent is typing…</div>
          )}
          <div ref={bottomRef} />
        </div>

        <ChatInput onSend={handleSend} disabled={isStreaming} />
      </main>
    </div>
  );
}

export default ChatLayout;
