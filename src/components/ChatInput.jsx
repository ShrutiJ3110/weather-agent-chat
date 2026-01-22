import { useState, useEffect } from "react";

function ChatInput({ onSend, disabled }) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recog = new SpeechRecognition();
    recog.lang = "en-US";
    recog.interimResults = false;

    recog.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recog.onerror = () => setIsListening(false);
    recog.onend = () => setIsListening(false);

    setRecognition(recog);
  }, []);

  const startListening = () => {
    if (!recognition) {
      alert("Voice input not supported in this browser");
      return;
    }
    setIsListening(true);
    recognition.start();
  };

  const sendMessage = () => {
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="p-3 bg-white border-t flex items-center gap-3">
    
      <input
        type="text"
        placeholder={isListening ? "Listening…" : "Type your message…"}
        className="flex-1 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />

    
      <button
        onClick={startListening}
        disabled={isListening || disabled}
        title="Voice input"
        className={`text-gray-500 hover:text-gray-800 transition ${
          isListening ? "animate-pulse" : ""
        }`}
      >
        🎤
      </button>

    
      <button
        onClick={sendMessage}
        disabled={disabled}
        title="Send"
        className="text-blue-600 hover:text-blue-800 text-xl transition disabled:opacity-40"
      >
        ➤
      </button>
    </div>
  );
}

export default ChatInput;
