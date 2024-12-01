import React, { useState, useEffect } from "react";

const apiKey = process.env.GEMINI_API_KEY;

function ChatScreen() {
  const [data, setData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { GoogleGenerativeAI } = require("@google/generative-ai");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = "Explain how AI works";

        const result = await model.generateContent(prompt);
        console.log(result.response.text());

        setData(result.response.text());
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <div>Data: {data}</div>;
}

export default ChatScreen;
