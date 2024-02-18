import { AnimatePresence, motion } from "framer-motion";
import React, { use, useEffect, useState } from "react";
import { RadioGroup } from "@headlessui/react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/router";
import { useKoopStore } from "@/lib/koopStore";

const dummyQuestions = [
  "1. Can you explain the key differences between Next.js and React, and how these differences impact the development of web applications?",
  "2. Describe a project where you had to integrate frontend interfaces with backend services using GraphQL. What challenges did you face, and how did you overcome them?",
  "3. How would you approach implementing responsive …iences across different devices and screen sizes?",
  "4. How do you ensure cross-browser compatibility and responsive design in your web applications? Can you provide examples of tools or techniques you have used to achieve this?",
  "5. How do you stay updated on emerging trends and technologies in frontend development? Can you discuss a recent technology or technique that you have learned and applied in your work?",
];

const Custom = () => {
  const [jobDescription, setjobDescription] = useState("");
  const [jobDescriptionReady, setJobDescriptionReady] = useState(false);
  const [typeValue, setTypeValue] = useState("technical");
  const [loading, setLoading] = useState(false);
  // const [questionsData, setQuestionsData] = useState([
  // dummyQuestions
  // ]);
  const router = useRouter();

  const { customQuestions, setCustomQuestions } = useKoopStore();

  useEffect(() => {
    console.log("customQuestions", customQuestions);
  }, [customQuestions]);

  const continueHandler = async () => {
    // if (jobDescription === "") {
    // }
    setJobDescriptionReady(true);
    setLoading(true);
    await fetch("/api/customgen", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isTechnical: typeValue === "technical" ? true : false,
        prompt: jobDescription,
      }),
    })
      .then((res) => res.json())
      .catch((err) => console.log(err))
      .then((data) => {
        setCustomQuestions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setCustomQuestions(dummyQuestions);
      });
  };

  const question1 = customQuestions[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        key="step-2"
        transition={{
          duration: 0.95,
          ease: [0.165, 0.84, 0.44, 1],
        }}
        className="max-w-4xl mx-auto h-screen px-4 lg:px-0 flex flex-col justify-center items-center"
      >
        {!jobDescriptionReady ? (
          <div className="w-full flex flex-col justify-center items-center">
            <h2 className="text-4xl font-bold text-[#1E2B3A] mb-2">
              Enter your job description
            </h2>
            <Select
              value={typeValue}
              onValueChange={(value) => setTypeValue(value)}
            >
              <SelectTrigger className="">
                <SelectValue placeholder="Select a interview type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Interview Type</SelectLabel>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Textarea
              value={jobDescription}
              onChange={(e) => setjobDescription(e.target.value)}
              placeholder="Enter your job description here."
              className="h-96 w-full my-4"
            />

            <div className="flex gap-[15px] justify-end mt-2">
              <div>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="group rounded-full px-4 py-2 text-[13px] font-semibold transition-all flex items-center justify-center bg-[#f5f7f9] text-[#1E2B3A] no-underline active:scale-95 scale-100 duration-75"
                  style={{
                    boxShadow: "0 1px 1px #0c192714, 0 1px 3px #0c192724",
                  }}
                >
                  Previous
                </button>
              </div>
              <div>
                <button
                  // href={{
                  //   pathname: "/custom/[slug]",
                  //   query: { slug: "my-post" },
                  // }}
                  onClick={continueHandler}
                  className="group rounded-full px-4 py-2 text-[13px] font-semibold transition-all flex items-center justify-center bg-[#1E2B3A] text-white hover:[linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), #0D2247] no-underline flex gap-x-2  active:scale-95 scale-100 duration-75"
                  style={{
                    boxShadow:
                      "0px 1px 4px rgba(13, 34, 71, 0.17), inset 0px 0px 0px 1px #061530, inset 0px 0px 0px 2px rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <span> Continue </span>
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.75 6.75L19.25 12L13.75 17.25"
                      stroke="#FFF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M19 12H4.75"
                      stroke="#FFF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* <button
            className="group rounded-full px-4 py-2 text-[13px] font-semibold transition-all flex items-center justify-center bg-[#1E2B3A] text-white hover:[linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), #0D2247] no-underline flex gap-x-2  active:scale-95 scale-100 duration-75"
            style={{
              boxShadow:
                "0px 1px 4px rgba(13, 34, 71, 0.17), inset 0px 0px 0px 1px #061530, inset 0px 0px 0px 2px rgba(255, 255, 255, 0.1)",
            }}
          >
            <span> Continue </span>
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.75 6.75L19.25 12L13.75 17.25"
                stroke="#FFF"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19 12H4.75"
                stroke="#FFF"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button> */}
          </div>
        ) : (
          <div className="w-full flex flex-col justify-center items-center">
            {customQuestions.map((question, index) => {
              return (
                <Link
                  href={`/custom/${question.id}`}
                  // href={{
                  //   pathname: "/custom/[slug]",
                  //   query: { slug: "question", question: question.question },
                  // }}
                  key={index}
                  className="w-full p-4 rounded-md cursor-pointer flex flex-col border my-2 justify-center items-center"
                >
                  <h2 className="text-lg font-bold mb-2">
                    {question.question}
                  </h2>
                </Link>
              );
            })}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default Custom;
