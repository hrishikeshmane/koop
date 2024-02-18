import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { RadioGroup } from "@headlessui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useKoopStore } from "@/lib/koopStore";

const interviewers = [
  {
    id: "SDE",
    name: "",
    description: "Software Engineering",
    level: "L3",
  },
  {
    id: "PM",
    name: "",
    description: "Product Management",
    level: "L5",
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const Technical = () => {
  const router = useRouter();

  const [selectedInterviewer, setSelectedInterviewer] = useState(
    interviewers[0]
  );

  const { technicalQuestions, productQuestions } = useKoopStore();
  const question1 =
    selectedInterviewer.id === "SDE"
      ? technicalQuestions[0]
      : productQuestions[0];

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
        className="max-w-lg mx-auto h-screen px-4 lg:px-0 flex flex-col justify-center items-center"
      >
        <h2 className="text-4xl font-bold text-[#1E2B3A]">Select a vertical</h2>
        <p className="text-[14px] leading-[20px] text-[#1a2b3b] font-normal my-4 text-center">
          Choose a vertical that you want to master.
        </p>
        <div className="w-full">
          <RadioGroup
            value={selectedInterviewer}
            onChange={setSelectedInterviewer}
          >
            <RadioGroup.Label className="sr-only">Server size</RadioGroup.Label>
            <div className="space-y-4 w-full">
              {interviewers.map((question) => (
                <RadioGroup.Option
                  key={question.name}
                  value={question}
                  className={({ checked, active }) =>
                    classNames(
                      checked ? "border-transparent" : "border-gray-300",
                      active ? "border-blue-500 ring-2 ring-blue-200" : "",
                      "relative cursor-pointer rounded-lg border bg-white px-6 py-4 shadow-sm focus:outline-none flex justify-between"
                    )
                  }
                >
                  {({ active, checked }) => (
                    <>
                      <span className="flex items-center">
                        <span className="flex flex-col text-sm">
                          <RadioGroup.Label
                            as="span"
                            className="font-medium text-gray-900"
                          >
                            {question.description}
                          </RadioGroup.Label>
                          <RadioGroup.Description
                            as="span"
                            className="text-gray-500"
                          >
                            <span className="block">{question.name}</span>
                          </RadioGroup.Description>
                        </span>
                      </span>

                      <span
                        className={classNames(
                          active ? "border" : "border-2",
                          checked ? "border-blue-500" : "border-transparent",
                          "pointer-events-none absolute -inset-px rounded-lg"
                        )}
                        aria-hidden="true"
                      />
                    </>
                  )}
                </RadioGroup.Option>
              ))}
            </div>
          </RadioGroup>
        </div>
        <div className="flex gap-[15px] justify-end mt-8">
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
            <Link
              href={`/technical/${question1.id}`}
              // href={{
              //   pathname: "/technical/[slug]1,
              //   query: { slug: question1.id, questionId: question1.id },
              // }}
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
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Technical;
