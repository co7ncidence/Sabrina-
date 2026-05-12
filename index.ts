import express from "express";

const app = express();

app.get("/", (_, res) => {
  res.send("Bot is running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
export { openai, generateImageBuffer, editImages } from "./client";
