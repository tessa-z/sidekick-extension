import React, { useState, useEffect } from "react";
import { useActiveTabUrl } from "./hooks/useActiveUrl";
import { tab } from "@testing-library/user-event/dist/tab";

const apiKey = process.env.GEMINI_API_KEY;

function ChatScreen() {
  const [data, setData] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const tab_url = useActiveTabUrl();

  useEffect(() => {
    async function fetchData() {
      try {
        fetch(tab_url) // Replace with your URL
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((content) => {
            setContent(content);
            setLoading(false);
          })
          .catch((error) => {
            setLoading(false);
          });
          
        const { GoogleGenerativeAI } = require("@google/generative-ai");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          systemInstruction: `Read this content: "${content}". Greet the user cheerfully to start. Suggest the user ask about any topics related to this page. For following messages, answer in less than 200 words. Use easy to understand languages and analogies to help you explain.`,
        });

        const prompt = "Hello! Quote sentence from the content you have read.";

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
  }, [tab_url]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <div>Answer: {data}</div>;
}

export default ChatScreen;
