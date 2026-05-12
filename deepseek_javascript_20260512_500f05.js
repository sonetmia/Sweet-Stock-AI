"use client";

import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "হ্যালো! আমি Sweet AI 😊\nতোমার Microstock Journey সহায়ক।\nমেমোরি যোগ করতে /remember, সাহায্যের জন্য /help লিখো।",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [customMemories, setCustomMemories] = useState([]);
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [newMemoryText, setNewMemoryText] = useState("");

  const chatEndRef = useRef(null);

  // localStorage থেকে মেমোরি লোড
  useEffect(() => {
    const saved = localStorage.getItem("sweet_ai_memories");
    if (saved) setCustomMemories(JSON.parse(saved));
  }, []);

  // মেমোরি সেভ
  const saveMemories = (memories) => {
    setCustomMemories(memories);
    localStorage.setItem("sweet_ai_memories", JSON.stringify(memories));
  };

  const addMemory = (text) => {
    const updated = [...customMemories, text];
    saveMemories(updated);
  };

  const deleteMemory = (index) => {
    const updated = customMemories.filter((_, i) => i !== index);
    saveMemories(updated);
  };

  const handleCommand = (text) => {
    const parts = text.trim().split(" ");
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(" ");

    switch (cmd) {
      case "/remember":
        if (arg) {
          addMemory(arg);
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: `✔ মেমোরি যোগ হয়েছে: ${arg}` },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "ব্যবহার: /remember <তথ্য>" },
          ]);
        }
        return true;
      case "/forget":
        if (arg && !isNaN(arg) && parseInt(arg) > 0 && parseInt(arg) <= customMemories.length) {
          const idx = parseInt(arg) - 1;
          deleteMemory(idx);
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: `✔ মেমোরি #${arg} মুছে ফেলা হয়েছে।` },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `সঠিক নম্বর দিন। বর্তমানে ${customMemories.length}টি মেমোরি আছে।\nব্যবহার: /forget <সংখ্যা>`,
            },
          ]);
        }
        return true;
      case "/memories":
        if (customMemories.length === 0) {
          setMessages((prev) => [...prev, { role: "assistant", content: "কোনো ব্যক্তিগত মেমোরি নেই।" }]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "📌 তোমার মেমোরি:\n" +
                customMemories.map((m, i) => `${i + 1}. ${m}`).join("\n"),
            },
          ]);
        }
        return true;
      case "/clear":
        setMessages([]);
        setMessages([{ role: "assistant", content: "✔ কথোপকথন পরিষ্কার হয়েছে।" }]);
        return true;
      case "/help":
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "🔹 কমান্ড:\n" +
              "/remember <টেক্সট> – ব্যক্তিগত মেমোরি যোগ\n" +
              "/forget <নম্বর> – মেমোরি মুছুন\n" +
              "/memories – মেমোরি দেখুন\n" +
              "/clear – চ্যাট ইতিহাস মুছুন\n" +
              "/help – এই তালিকা",
          },
        ]);
        return true;
      default:
        return false;
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    // কমান্ড হলে আলাদা হ্যান্ডেল
    if (text.startsWith("/")) {
      handleCommand(text);
      setInput("");
      return;
    }

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          customMemories,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "❌ উত্তর পাওয়া যায়নি।" }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: `❌ নেটওয়ার্ক ত্রুটি: ${error.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "700px",
          height: "85vh",
          background: "rgba(255,255,255,0.95)",
          borderRadius: "20px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(to right, #f12711, #f5af19)",
            color: "white",
            padding: "15px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: "bold",
            fontSize: "1.5em",
          }}
        >
          <span>🍬 Sweet AI</span>
          <button
            onClick={() => setShowMemoryModal(true)}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "white",
              padding: "8px 15px",
              borderRadius: "20px",
              cursor: "pointer",
            }}
          >
            🧠 মেমোরি
          </button>
        </div>

        {/* Chat area */}
        <div
          style={{
            flex: 1,
            padding: "20px",
            overflowY: "auto",
            background: "#fef9ef",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "80%",
                  padding: "12px 18px",
                  borderRadius: "18px",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                  background:
                    msg.role === "user"
                      ? "linear-gradient(135deg, #f12711, #f5af19)"
                      : "#fff",
                  border: msg.role === "assistant" ? "1px solid #ff7e5f" : "none",
                  color: msg.role === "user" ? "white" : "#333",
                  borderBottomLeftRadius: msg.role === "assistant" ? "5px" : "18px",
                  borderBottomRightRadius: msg.role === "user" ? "5px" : "18px",
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && <div style={{ color: "#ff7e5f", fontStyle: "italic" }}>Sweet AI লিখছে...</div>}
          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: "15px",
            background: "#fff",
            borderTop: "1px solid #ddd",
            display: "flex",
            gap: "10px",
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="এখানে লিখুন..."
            style={{
              flex: 1,
              padding: "12px 15px",
              borderRadius: "25px",
              border: "2px solid #ff7e5f",
              outline: "none",
              fontSize: "1em",
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "linear-gradient(to right, #f12711, #f5af19)",
              border: "none",
              color: "white",
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              fontSize: "1.3em",
              cursor: "pointer",
            }}
          >
            ➤
          </button>
        </form>
      </div>

      {/* Memory Modal */}
      {showMemoryModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowMemoryModal(false)}
        >
          <div
            style={{
              background: "white",
              width: "90%",
              maxWidth: "500px",
              borderRadius: "15px",
              padding: "25px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "15px", color: "#f12711" }}>🧠 ব্যক্তিগত মেমোরি</h3>
            <div style={{ maxHeight: "250px", overflowY: "auto", marginBottom: "15px" }}>
              {customMemories.length === 0 ? (
                <p style={{ color: "#888" }}>কোনো মেমোরি নেই।</p>
              ) : (
                customMemories.map((mem, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      background: "#fff5f0",
                      borderRadius: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <span>
                      {i + 1}. {mem}
                    </span>
                    <button
                      onClick={() => deleteMemory(i)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#f12711",
                        fontSize: "1.2em",
                        cursor: "pointer",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
              <input
                type="text"
                placeholder="নতুন মেমোরি"
                value={newMemoryText}
                onChange={(e) => setNewMemoryText(e.target.value)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "20px",
                  border: "2px solid #ff7e5f",
                }}
              />
              <button
                onClick={() => {
                  if (newMemoryText.trim()) {
                    addMemory(newMemoryText.trim());
                    setNewMemoryText("");
                  }
                }}
                style={{
                  background: "linear-gradient(to right, #f12711, #f5af19)",
                  border: "none",
                  color: "white",
                  padding: "8px 15px",
                  borderRadius: "20px",
                  cursor: "pointer",
                }}
              >
                যোগ
              </button>
            </div>
            <button
              onClick={() => setShowMemoryModal(false)}
              style={{
                background: "#ccc",
                border: "none",
                padding: "8px 20px",
                borderRadius: "20px",
                cursor: "pointer",
                float: "right",
              }}
            >
              বন্ধ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}