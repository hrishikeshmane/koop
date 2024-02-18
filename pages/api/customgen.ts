const { Configuration, OpenAIApi } = require("openai");
import type { NextApiRequest, NextApiResponse } from "next";
type ResponseData = {
  message: string;
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);
  const isTechnical = req.body.isTechnical;
  let type = "Technical";
  if (!isTechnical) {
    type = "Behavioral";
  }
  const completion = await openai.createChatCompletion({
    messages: [
      { role: "system", content: "You are a hiring manager." },
      {
        role: "user",
        content:
          req.body.prompt +
          `\n\nGiven the Job description, Just Generate 5 ${type} interview questions to assess the candidates fit for the role. Dont print job description`,
      },
    ],
    model: "gpt-3.5-turbo",
  });
  console.log(completion.data.choices[0].message.content);
  const questionsArray =
    completion.data.choices[0].message.content.split(/\n(?=\d\.)/g);
  res.status(200).json(questionsArray);
}
