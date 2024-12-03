import React, { useState, useEffect } from "react";
import { useActiveTabUrl } from "./hooks/useActiveUrl";
import { tab } from "@testing-library/user-event/dist/tab";
import TextField from "@mui/material/TextField";
import { Box, Button, Grid2, Icon, Stack } from "@mui/material";
import ReactMarkdown from "react-markdown";

const apiKey = process.env.GEMINI_API_KEY;

function ChatScreen() {
  const [data, setData] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const tab_url = useActiveTabUrl();
  const [prompt, setPrompt] = useState<string>(
    "Hello! Quote a line from content you just read."
  );

  const { GoogleGenerativeAI } = require("@google/generative-ai");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `Read this content: "${content}". Greet the user cheerfully to start, providing a summary of 3 specific key points from the content. Suggest related topics the user may be interested in from this content. Answer in less than 300 words. You may use broken sentences and pointers to make it information compact. Use easy to understand languages and analogies to help you explain.`,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(event.target.value); // Update state with input value
  };

  const handleClick = async () => {
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
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, "text/html");
          const bodyText = doc.body.textContent || "";

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
    <Grid2>
      <Stack padding={2}>
        Gemini for Chrome+
        <Box padding={2} width={3 / 4}>
          <ReactMarkdown>{data}</ReactMarkdown>
        </Box>
        <Stack direction={"row"} spacing={1} alignItems={"center"}>
          <TextField
            id="input-box"
            variant="outlined"
            multiline
            maxRows={4}
            onChange={handleChange}
          />
          <Button variant="contained" onClick={handleClick}>
            ?
          </Button>
        </Stack>
      </Stack>
    </Grid2>
  );
}

export default ChatScreen;
