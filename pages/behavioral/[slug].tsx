import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";
import React, { use, useCallback, useEffect, useRef, useState } from "react";
import { RadioGroup } from "@headlessui/react";
import Link from "next/link";
import Webcam from "react-webcam";
import { v4 as uuid } from "uuid";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { Question, useKoopStore } from "../../lib/koopStore";

const ffmpeg = createFFmpeg({
  // corePath: `http://localhost:3000/ffmpeg/dist/ffmpeg-core.js`,
  // I've included a default import above (and files in the public directory), but you can also use a CDN like this:
  corePath: "https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js",
  log: true,
});

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function TechnicalInterviewPage() {
  const [loading, setLoading] = useState(true);
  const webcamRef = useRef<Webcam | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [seconds, setSeconds] = useState(150);
  const [videoEnded, setVideoEnded] = useState(false);
  const [recordingPermission, setRecordingPermission] = useState(true);
  const [cameraLoaded, setCameraLoaded] = useState(false);
  const vidRef = useRef<HTMLVideoElement>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("Processing");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [generatedFeedback, setGeneratedFeedback] = useState("");

  const router = useRouter();
  const { slug } = router.query;
  console.log("slug", slug);

  const {
    behavioralQuestions,
    hasPreviusQuestion,
    hasNextQuestion,
    getNextQuestion,
    getPreviousQuestion,
  } = useKoopStore();

  // if questionId starts with "pm", then it's a product questions else it's a technical question
  //   const questionListName = slug?.toString().startsWith("pm")
  //     ? "product"
  //     : "technical";

  const questionsArray = behavioralQuestions;

  const firstQuestion = questionsArray[0];
  const question =
    questionsArray.find((q: Question) => q.id === slug) ?? firstQuestion;
  console.log("question", question);

  useEffect(() => {
    setIsDesktop(window.innerWidth >= 768);
  }, []);

  useEffect(() => {
    if (cameraLoaded) {
      const element = document.getElementById("startTimer");

      if (element) {
        element.style.display = "flex";
      }

      //   setCapturing(true);

      mediaRecorderRef.current = new MediaRecorder(
        webcamRef?.current?.stream as MediaStream
      );
      mediaRecorderRef.current.addEventListener(
        "dataavailable",
        handleDataAvailable
      );
      mediaRecorderRef.current.start();
    }
  }, [capturing, cameraLoaded, webcamRef, mediaRecorderRef]);

  const handleStartCaptureClick = useCallback(() => {
    setCapturing(true);
    const startTimer = document.getElementById("startTimer");
    if (startTimer) {
      startTimer.style.display = "none";
    }

    if (vidRef.current) {
      vidRef.current.play();
    }
  }, [webcamRef, setCapturing, mediaRecorderRef]);

  const handleDataAvailable = useCallback(
    ({ data }: BlobEvent) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  const handleStopCaptureClick = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setCapturing(false);
  }, [mediaRecorderRef, webcamRef, setCapturing]);

  useEffect(() => {
    let timer: any = null;
    if (capturing) {
      timer = setInterval(() => {
        setSeconds((seconds) => seconds - 1);
      }, 1000);
      if (seconds === 0) {
        handleStopCaptureClick();
        setCapturing(false);
        setSeconds(0);
      }
    }
    return () => {
      clearInterval(timer);
    };
  }, [capturing, seconds, handleStopCaptureClick]);

  const handleDownload = async () => {
    if (recordedChunks.length) {
      setSubmitting(true);
      setStatus("Processing");

      const file = new Blob(recordedChunks, {
        type: `video/webm`,
      });

      const unique_id = uuid();

      // This checks if ffmpeg is loaded
      if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
      }

      // This writes the file to memory, removes the video, and converts the audio to mp3
      ffmpeg.FS("writeFile", `${unique_id}.webm`, await fetchFile(file));
      await ffmpeg.run(
        "-i",
        `${unique_id}.webm`,
        "-vn",
        "-acodec",
        "libmp3lame",
        "-ac",
        "1",
        "-ar",
        "16000",
        "-f",
        "mp3",
        `${unique_id}.mp3`
      );

      // This reads the converted file from the file system
      const fileData = ffmpeg.FS("readFile", `${unique_id}.mp3`);
      // This creates a new file from the raw data
      const output = new File([fileData.buffer], `${unique_id}.mp3`, {
        type: "audio/mp3",
      });

      const formData = new FormData();
      formData.append("file", output, `${unique_id}.mp3`);
      formData.append("model", "whisper-1");

      // const question =
      //   selected.name === "Behavioral"
      //     ? `Tell me about yourself. Why don${`’`}t you walk me through your resume?`
      //     : selectedInterviewer.name === "John"
      //     ? "What is a Hash Table, and what is the average case and worst case time for each of its operations?"
      //     : selectedInterviewer.name === "Richard"
      //     ? "Uber is looking to expand its product line. Talk me through how you would approach this problem."
      //     : "You have a 3-gallon jug and 5-gallon jug, how do you measure out exactly 4 gallons?";

      setStatus("Transcribing");

      const upload = await fetch(
        `/api/transcribe?question=${encodeURIComponent(question?.question)}`,
        {
          method: "POST",
          body: formData,
        }
      );
      const results = await upload.json();

      if (upload.ok) {
        setIsSuccess(true);
        setSubmitting(false);

        if (results.error) {
          setTranscript(results.error);
        } else {
          setTranscript(results.transcript);
        }

        console.log("Uploaded successfully!");

        await Promise.allSettled([
          new Promise((resolve) => setTimeout(resolve, 800)),
        ]).then(() => {
          setCompleted(true);
          console.log("Success!");
        });

        if (results.transcript.length > 0) {
          const prompt = `Please give feedback on the following interview question: ${question} given the following transcript: ${
            results.transcript
          }. ${"Please also give feedback on the candidate's communication skills. Make sure they accurately explain their thoughts in a coherent way. Make sure they stay on topic and relevant to the question."} \n\n\ Feedback on the candidate's response:`;

          setGeneratedFeedback("");
          const response = await fetch("/api/generate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompt,
            }),
          });

          if (!response.ok) {
            throw new Error(response.statusText);
          }

          // This data is a ReadableStream
          const data = response.body;
          if (!data) {
            return;
          }

          const reader = data.getReader();
          const decoder = new TextDecoder();
          let done = false;

          while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            const chunkValue = decoder.decode(value);
            setGeneratedFeedback((prev: any) => prev + chunkValue);
          }
        }
      } else {
        console.error("Upload failed.");
      }

      setTimeout(function () {
        setRecordedChunks([]);
      }, 1500);
    }
  };

  function restartVideo() {
    setRecordedChunks([]);
    // setVideoEnded(false);
    setCapturing(false);
    // setIsVisible(true);
    setSeconds(150);
  }

  const videoConstraints = isDesktop
    ? { width: 1280, height: 720, facingMode: "user" }
    : { width: 480, height: 640, facingMode: "user" };

  const handleUserMedia = () => {
    setTimeout(() => {
      setLoading(false);
      setCameraLoaded(true);
    }, 1000);
  };

  useEffect(() => {
    restartVideo();
  }, []);

  return (
    <div className="max-w-4xl mx-auto flex flex-col px-4 pt-2 pb-8 md:px-8 md:py-2 bg-[#FCFCFC] relative overflow-x-hidden">
      {completed ? (
        <div className="w-full flex flex-col max-w-[1080px] mx-auto mt-[20vh] overflow-y-auto pb-8 md:pb-12">
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.35, ease: [0.075, 0.82, 0.165, 1] }}
            className="relative md:aspect-[16/9] w-full max-w-[1080px] overflow-hidden bg-[#1D2B3A] rounded-lg ring-1 ring-gray-900/5 shadow-md flex flex-col items-center justify-center"
          >
            <video
              className="w-full h-full rounded-lg"
              controls
              crossOrigin="anonymous"
              autoPlay
            >
              <source
                src={URL.createObjectURL(
                  new Blob(recordedChunks, { type: "video/mp4" })
                )}
                type="video/mp4"
              />
            </video>
          </motion.div>
          {/* <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.5,
              duration: 0.15,
              ease: [0.23, 1, 0.82, 1],
            }}
            className="flex flex-col md:flex-row items-center mt-2 md:mt-4 md:justify-between space-y-1 md:space-y-0"
          >
            <div className="flex flex-row items-center space-x-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 text-[#407BBF] shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
              <p className="text-[14px] font-normal leading-[20px] text-[#1a2b3b]">
                Video is not stored on our servers, and will go away as soon as
                you leave the page.
              </p>
            </div> 
          </motion.div>*/}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.5,
              duration: 0.15,
              ease: [0.23, 1, 0.82, 1],
            }}
            className="mt-8 flex flex-col"
          >
            <div>
              <h2 className="text-xl font-semibold text-left text-[#1D2B3A] mb-2">
                Transcript
              </h2>
              <p className="prose prose-sm max-w-none">
                {transcript.length > 0
                  ? transcript
                  : "Don't think you said anything. Want to try again?"}
              </p>
            </div>
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-left text-[#1D2B3A] mb-2">
                Feedback
              </h2>
              <div className="mt-4 text-sm flex gap-2.5 rounded-lg border border-[#EEEEEE] bg-[#FAFAFA] p-4 leading-6 text-gray-900 min-h-[100px]">
                <p className="prose prose-sm max-w-none">{generatedFeedback}</p>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="h-full w-full items-center flex flex-col mt-[10vh]">
          {recordingPermission ? (
            <div className="w-full flex flex-col max-w-[1080px] mx-auto justify-center">
              <h2 className="text-2xl font-semibold text-left text-[#1D2B3A] mb-2">
                {/* {selected.name === "Behavioral"
                  ? `Tell me about yourself. Why don${`’`}t you walk me through your resume?`
                  : selectedInterviewer.name === "John"
                  ? "What is a Hash Table, and what is the average case and worst case time for each of its operations?"
                  : selectedInterviewer.name === "Richard"
                  ? "Uber is looking to expand its product line. Talk me through how you would approach this problem."
                  : "You have a 3-gallon jug and 5-gallon jug, how do you measure out exactly 4 gallons?"} */}
                {question.question}
              </h2>
              <span className="text-[14px] leading-[20px] text-[#1a2b3b] font-normal mb-4">
                {
                  "Hit record when you're ready to start. You have 2:30 minutes to answer the question."
                }
              </span>
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{
                  duration: 0.35,
                  ease: [0.075, 0.82, 0.965, 1],
                }}
                className="relative aspect-[16/9] w-full max-w-[1080px] overflow-hidden bg-[#1D2B3A] rounded-lg ring-1 ring-gray-900/5 shadow-md"
              >
                {!cameraLoaded && (
                  <div className="text-white absolute top-1/2 left-1/2 z-20 flex items-center">
                    <svg
                      className="animate-spin h-4 w-4 text-white mx-auto my-0.5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth={3}
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                )}
                <div className="relative z-10 h-full w-full rounded-lg">
                  <div className="absolute top-5 lg:top-10 left-5 lg:left-10 z-20">
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-800">
                      {new Date(seconds * 1000).toISOString().slice(14, 19)}
                    </span>
                  </div>
                  {/* {isVisible && ( // If the video is visible (on screen) we show it
                    <div className="block absolute top-[10px] sm:top-[20px] lg:top-[40px] left-auto right-[10px] sm:right-[20px] md:right-10 h-[80px] sm:h-[140px] md:h-[180px] aspect-video rounded z-20">
                      <div className="h-full w-full aspect-video rounded md:rounded-lg lg:rounded-xl">
                        <video
                          id="question-video"
                          onEnded={() => setVideoEnded(true)}
                          controls={false}
                          ref={vidRef}
                          playsInline
                          className="h-full object-cover w-full rounded-md md:rounded-[12px] aspect-video"
                          crossOrigin="anonymous"
                        >
                          <source
                            src={
                              selectedInterviewer.name === "John"
                                ? selected.name === "Behavioral"
                                  ? "https://liftoff-public.s3.amazonaws.com/DemoInterviewMale.mp4"
                                  : "https://liftoff-public.s3.amazonaws.com/JohnTechnical.mp4"
                                : selectedInterviewer.name === "Richard"
                                ? selected.name === "Behavioral"
                                  ? "https://liftoff-public.s3.amazonaws.com/RichardBehavioral.mp4"
                                  : "https://liftoff-public.s3.amazonaws.com/RichardTechnical.mp4"
                                : selectedInterviewer.name === "Sarah"
                                ? selected.name === "Behavioral"
                                  ? "https://liftoff-public.s3.amazonaws.com/BehavioralSarah.mp4"
                                  : "https://liftoff-public.s3.amazonaws.com/SarahTechnical.mp4"
                                : selected.name === "Behavioral"
                                ? "https://liftoff-public.s3.amazonaws.com/DemoInterviewMale.mp4"
                                : "https://liftoff-public.s3.amazonaws.com/JohnTechnical.mp4"
                            }
                            type="video/mp4"
                          />
                        </video>
                      </div>
                    </div>
                  )} */}
                  <Webcam
                    mirrored
                    audio
                    muted
                    ref={webcamRef}
                    videoConstraints={videoConstraints}
                    onUserMedia={handleUserMedia}
                    onUserMediaError={(error) => {
                      setRecordingPermission(false);
                    }}
                    className="absolute z-10 min-h-[100%] min-w-[100%] h-auto w-auto object-cover"
                  />
                </div>
                {loading && (
                  <div className="absolute flex h-full w-full items-center justify-center">
                    <div className="relative h-[112px] w-[112px] rounded-lg object-cover text-[2rem]">
                      <div className="flex h-[112px] w-[112px] items-center justify-center rounded-[0.5rem] bg-[#4171d8] !text-white">
                        Loading...
                      </div>
                    </div>
                  </div>
                )}

                {cameraLoaded && (
                  <div className="absolute bottom-0 left-0 z-50 flex h-[82px] w-full items-center justify-center">
                    {recordedChunks.length > 0 ? (
                      <>
                        {isSuccess ? (
                          <button
                            className="cursor-disabled group rounded-full min-w-[140px] px-4 py-2 text-[13px] font-semibold group inline-flex items-center justify-center text-sm text-white duration-150 bg-green-500 hover:bg-green-600 hover:text-slate-100 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 active:scale-100 active:bg-green-800 active:text-green-100"
                            style={{
                              boxShadow:
                                "0px 1px 4px rgba(27, 71, 13, 0.17), inset 0px 0px 0px 1px #5fc767, inset 0px 0px 0px 2px rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mx-auto"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <motion.path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.5 }}
                              />
                            </svg>
                          </button>
                        ) : (
                          <div className="flex flex-row gap-2">
                            {!isSubmitting && (
                              <button
                                onClick={() => restartVideo()}
                                className="group rounded-full px-4 py-2 text-[13px] font-semibold transition-all flex items-center justify-center bg-white text-[#1E2B3A] hover:[linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), #0D2247] no-underline flex gap-x-2  active:scale-95 scale-100 duration-75"
                              >
                                Restart
                              </button>
                            )}
                            <button
                              onClick={handleDownload}
                              disabled={isSubmitting}
                              className="group rounded-full min-w-[140px] px-4 py-2 text-[13px] font-semibold transition-all flex items-center justify-center bg-[#1E2B3A] text-white hover:[linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), #0D2247] no-underline flex  active:scale-95 scale-100 duration-75  disabled:cursor-not-allowed"
                              style={{
                                boxShadow:
                                  "0px 1px 4px rgba(13, 34, 71, 0.17), inset 0px 0px 0px 1px #061530, inset 0px 0px 0px 2px rgba(255, 255, 255, 0.1)",
                              }}
                            >
                              <span>
                                {isSubmitting ? (
                                  <div className="flex items-center justify-center gap-x-2">
                                    <svg
                                      className="animate-spin h-5 w-5 text-slate-50 mx-auto"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth={3}
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                    <span>{status}</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center gap-x-2">
                                    <span>Process transcript</span>
                                    <svg
                                      className="w-5 h-5"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M13.75 6.75L19.25 12L13.75 17.25"
                                        stroke="white"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                      <path
                                        d="M19 12H4.75"
                                        stroke="white"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </span>
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="absolute bottom-[6px] md:bottom-5 left-5 right-5">
                        <div className="lg:mt-4 flex flex-col items-center justify-center gap-2">
                          {capturing ? (
                            <div
                              id="stopTimer"
                              onClick={handleStopCaptureClick}
                              className="flex h-10 w-10 flex-col items-center justify-center rounded-full bg-transparent text-white hover:shadow-xl ring-4 ring-white  active:scale-95 scale-100 duration-75 cursor-pointer"
                            >
                              <div className="h-5 w-5 rounded bg-red-500 cursor-pointer"></div>
                            </div>
                          ) : (
                            <button
                              id="startTimer"
                              onClick={handleStartCaptureClick}
                              className="flex h-8 w-8 sm:h-8 sm:w-8 flex-col items-center justify-center rounded-full bg-red-500 text-white hover:shadow-xl ring-4 ring-white ring-offset-gray-500 ring-offset-2 active:scale-95 scale-100 duration-75"
                            ></button>
                          )}
                          <div className="w-12"></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 text-5xl text-white font-semibold text-center"
                  id="countdown"
                ></div>
              </motion.div>
            </div>
          ) : (
            <div className="w-full flex flex-col max-w-[1080px] mx-auto justify-center">
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{
                  duration: 0.35,
                  ease: [0.075, 0.82, 0.165, 1],
                }}
                className="relative md:aspect-[16/9] w-full max-w-[1080px] overflow-hidden bg-[#1D2B3A] rounded-lg ring-1 ring-gray-900/5 shadow-md flex flex-col items-center justify-center"
              >
                <p className="text-white font-medium text-lg text-center max-w-3xl">
                  Camera permission is denied.
                </p>
              </motion.div>
              <div className="flex flex-row space-x-4 mt-8 justify-end">
                <button
                  //   onClick={() => setStep(1)}
                  className="group max-w-[200px] rounded-full px-4 py-2 text-[13px] font-semibold transition-all flex items-center justify-center bg-[#f5f7f9] text-[#1E2B3A] no-underline active:scale-95 scale-100 duration-75"
                  style={{
                    boxShadow: "0 1px 1px #0c192714, 0 1px 3px #0c192724",
                  }}
                >
                  Restart demo
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* next and previous questions buttons */}
      <div className="flex gap-[15px] mt-8">
        <div className="flex justify-start">
          <Link
            href={`/home`}
            // href={{
            //   pathname: "/technical/[slug]",
            //   query: {
            //     slug: getNextQuestion(questionListName, question.id).id,
            //     questionId: getNextQuestion(questionListName, question.id).id,
            //   },
            // }}
            className="group rounded-full px-4 py-2 text-[13px] font-semibold transition-all flex items-center justify-center bg-[#1E2B3A] text-white hover:[linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), #0D2247] no-underline flex gap-x-2  active:scale-95 scale-100 duration-75"
            style={{
              boxShadow:
                "0px 1px 4px rgba(13, 34, 71, 0.17), inset 0px 0px 0px 1px #061530, inset 0px 0px 0px 2px rgba(255, 255, 255, 0.1)",
            }}
          >
            <span className=""> Home </span>
          </Link>
          {question && hasPreviusQuestion("behavioral", question.id) && (
            <Link
              href={`/behavioral/${
                getPreviousQuestion("behavioral", question.id).id
              }`}
              // href={{
              //   pathname: "/technical/[slug]",
              //   query: {
              //     slug: getPreviousQuestion(questionListName, question.id).id,
              //     questionId: getPreviousQuestion(questionListName, question.id)
              //       .id,
              //   },
              // }}
              className="group rounded-full px-4 py-2 text-[13px] font-semibold transition-all flex items-center justify-center bg-[#f5f7f9] text-[#1E2B3A] no-underline active:scale-95 scale-100 duration-75"
              style={{
                boxShadow: "0 1px 1px #0c192714, 0 1px 3px #0c192724",
              }}
            >
              Previous
            </Link>
          )}
        </div>
        <div className="flex justify-end w-full">
          {question && hasNextQuestion("behavioral", question.id) && (
            <Link
              href={`/behavioral/${
                getNextQuestion("behavioral", question.id).id
              }`}
              // href={{
              //   pathname: "/technical/[slug]",
              //   query: {
              //     slug: getNextQuestion(questionListName, question.id).id,
              //     questionId: getNextQuestion(questionListName, question.id).id,
              //   },
              // }}
              className="group rounded-full px-4 py-2 text-[13px] font-semibold transition-all flex items-center justify-center bg-[#1E2B3A] text-white hover:[linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), #0D2247] no-underline flex gap-x-2  active:scale-95 scale-100 duration-75"
              style={{
                boxShadow:
                  "0px 1px 4px rgba(13, 34, 71, 0.17), inset 0px 0px 0px 1px #061530, inset 0px 0px 0px 2px rgba(255, 255, 255, 0.1)",
              }}
            >
              <span className=""> Next </span>
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
          )}
        </div>
      </div>
    </div>
  );
}
