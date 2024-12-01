import React, { useState, useEffect } from "react";
import { useActiveTabUrl } from "./hooks/useActiveUrl";
import { tab } from "@testing-library/user-event/dist/tab";
import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";

const apiKey = process.env.GEMINI_API_KEY;

function ChatScreen() {
  const [data, setData] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const tab_url = useActiveTabUrl();

  const { GoogleGenerativeAI } = require("@google/generative-ai");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `Read this content: "${content}". Greet the user cheerfully to start. Suggest the user ask about any topics related to this page. For following messages, answer in less than 200 words. Use easy to understand languages and analogies to help you explain.`,
  });

  const handleClick = async () => {
    const prompt = "Hello! Quote sentence from the content you have read.";

    const result = await model.generateContent(prompt);
    console.log(result.response.text());

    setData(result.response.text());
    alert("clicked");
  };

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("tab_url: " + tab_url);
        const response = await fetch(tab_url);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const text = await response.text();

        if (text) {
          // Parse the HTML content to extract body text
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, "text/html");
          const bodyText = doc.body.textContent || "";

          // Now set the content with just the body text
          setContent(bodyText);
        }
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

  return (
    <div>
      Answer: {data}
      <TextField id="outlined-basic" label="Outlined" variant="outlined" />
      <Button variant="contained" onClick={handleClick}>
        Send
      </Button>
    </div>
  );
}

export default ChatScreen;
