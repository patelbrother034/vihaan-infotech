import { createChatMiddleware } from "../server/chat.mjs";

const chat = createChatMiddleware(process.env, { deployment: true });

export default function handler(req, res) {
  return chat(req, res, () => {
    res.statusCode = 404;
    res.end();
  });
}
