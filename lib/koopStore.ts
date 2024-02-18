import { create } from "zustand";

export type Question = {
  id: string;
  question: string;
};

export type KoopStore = {
  behavioralQuestions: Question[];
  technicalQuestions: Question[];
  productQuestions: Question[];

  hasNextQuestion: (list: string, currentId: string) => boolean;
  hasPreviusQuestion: (list: string, currentId: string) => boolean;
  getNextQuestion: (list: string, currentId: string) => Question;
  getPreviousQuestion: (list: string, currentId: string) => Question;
};

export const useKoopStore = create<KoopStore>((set, get) => ({
  behavioralQuestions: [
    {
      id: "bq01",
      question:
        "Tell me about a time when you had to troubleshoot and solve a complex technical problem.",
    },
    {
      id: "bq02",
      question:
        "Describe a situation where you had to work under pressure to meet a tight deadline. How did you handle it?",
    },
    {
      id: "bq03",
      question:
        "Can you share an example of a time when you had to collaborate with a team member who had a different working style or personality?",
    },
    {
      id: "bq04",
      question:
        "Tell me about a project you worked on where you had to adapt to new technologies or tools quickly. How did you approach it?",
    },
    {
      id: "bq05",
      question:
        "Describe a time when you had to persuade others to adopt your idea or approach to a technical problem.",
    },
    {
      id: "bq06",
      question:
        "Can you give me an example of a time when you made a mistake on a project? What did you learn from it?",
    },
    {
      id: "bq07",
      question:
        "Tell me about a situation where you had to prioritize multiple tasks or projects. How did you decide what to focus on?",
    },
    {
      id: "bq08",
      question:
        "Describe a time when you had to explain a complex technical concept to someone with non-technical background.",
    },
    {
      id: "bq09",
      question:
        "Can you share an example of a time when you had to resolve a conflict within a team?",
    },
    {
      id: "bq10",
      question:
        "Tell me about a project where you had to balance quality and efficiency. How did you manage that balance?",
    },
    {
      id: "bq11",
      question:
        "Describe a situation where you had to deal with a difficult or demanding client or stakeholder.",
    },
    {
      id: "bq12",
      question:
        "Can you give me an example of a time when you had to take the lead on a project or initiative?",
    },
    {
      id: "bq13",
      question:
        "Tell me about a time when you had to learn a new programming language or framework. How did you approach it?",
    },
    {
      id: "bq14",
      question:
        "Describe a situation where you had to deal with a major setback or failure in a project. How did you recover from it?",
    },
    {
      id: "bq15",
      question:
        "Can you share an example of a time when you had to work with limited resources or budget?",
    },
    {
      id: "bq16",
      question:
        "Tell me about a project where you had to make a significant decision without complete information. How did you approach it?",
    },
    {
      id: "bq17",
      question:
        "Describe a time when you had to give constructive feedback to a colleague or team member.",
    },
    {
      id: "bq18",
      question:
        "Can you give me an example of a time when you had to juggle multiple competing priorities?",
    },
    {
      id: "bq19",
      question:
        "Tell me about a situation where you had to innovate or come up with a creative solution to a technical problem.",
    },
    {
      id: "bq20",
      question:
        "Describe a project where you had to work with a cross-functional team. What challenges did you face, and how did you overcome them?",
    },
  ],
  technicalQuestions: [
    { id: "tq01", question: "What is the difference between HTTP and HTTPS?" },
    {
      id: "tq02",
      question: "Explain the difference between TCP and UDP protocols.",
    },
    { id: "tq03", question: "What is the purpose of RESTful APIs?" },
    {
      id: "tq04",
      question: "Describe the concept of Object-Oriented Programming (OOP).",
    },
    {
      id: "tq05",
      question:
        "What is the difference between frontend and backend development?",
    },
    {
      id: "tq06",
      question: "Explain the purpose of SQL injection and how to prevent it.",
    },
    {
      id: "tq07",
      question:
        "What are the benefits of using version control systems like Git?",
    },
    {
      id: "tq08",
      question:
        "What is the difference between compiled and interpreted programming languages?",
    },
    {
      id: "tq09",
      question: "Describe the process of normalization in database management.",
    },
    { id: "tq10", question: "Explain the concept of responsive web design." },
    {
      id: "tq11",
      question:
        "What is the role of a CDN (Content Delivery Network) in web development?",
    },
    { id: "tq12", question: "How does a hashing algorithm work?" },
    {
      id: "tq13",
      question: "Explain the concept of Big O notation in algorithm analysis.",
    },
    {
      id: "tq14",
      question: "What are some common HTTP status codes and their meanings?",
    },
    {
      id: "tq15",
      question:
        "Describe the difference between synchronous and asynchronous programming.",
    },
    {
      id: "tq16",
      question: "What is the purpose of Docker in software development?",
    },
    {
      id: "tq17",
      question: "Explain the concept of virtualization and its benefits.",
    },
    {
      id: "tq18",
      question: "What is the difference between a stack and a queue?",
    },
    {
      id: "tq19",
      question:
        "Describe the role of a load balancer in a web application architecture.",
    },
    { id: "tq20", question: "How does a DNS (Domain Name System) work?" },
  ],
  productQuestions: [
    {
      id: "pm01",
      question:
        "Describe a product you successfully brought to market. What was your strategy?",
    },
    {
      id: "pm02",
      question:
        "How do you gather and incorporate feedback from customers and stakeholders?",
    },
    {
      id: "pm03",
      question: "What metrics do you use to measure the success of a product?",
    },
    {
      id: "pm04",
      question:
        "Describe a time when you had to make a tough decision about a product feature. What was the situation and how did you handle it?",
    },
    {
      id: "pm05",
      question:
        "How do you work with engineering and design teams to bring a product to life?",
    },
    {
      id: "pm06",
      question:
        "Tell me about a time when you had to pivot a product strategy. What led to the change and how did you manage it?",
    },
    {
      id: "pm07",
      question: "How do you prioritize features for a product roadmap?",
    },
    {
      id: "pm08",
      question:
        "Describe a time when you used data to inform a product decision.",
    },
    {
      id: "pm09",
      question:
        "How do you handle disagreements with stakeholders about product decisions?",
    },
    {
      id: "pm10",
      question: "Tell me about a product you admire. What makes it great?",
    },
  ],

  hasNextQuestion: (list: string, currentId: string) => {
    if (list === "behavioral") {
      const questions = get().behavioralQuestions;
      const index = questions.findIndex((q) => q.id === currentId);
      return index < questions.length - 1;
    }
    if (list === "product") {
      const questions = get().productQuestions;
      const index = questions.findIndex((q) => q.id === currentId);
      return index < questions.length - 1;
    }

    const questions = get().technicalQuestions;
    const index = questions.findIndex((q) => q.id === currentId);
    return index < questions.length - 1;
  },
  hasPreviusQuestion: (list: string, currentId: string) => {
    if (list === "behavioral") {
      const questions = get().behavioralQuestions;
      const index = questions.findIndex((q) => q.id === currentId);
      return index > 0;
    }
    if (list === "product") {
      const questions = get().productQuestions;
      const index = questions.findIndex((q) => q.id === currentId);
      return index > 0;
    }

    const questions = get().technicalQuestions;
    const index = questions.findIndex((q) => q.id === currentId);
    return index > 0;
  },
  getNextQuestion: (list: string, currentId: string) => {
    if (list === "behavioral") {
      const questions = get().behavioralQuestions;
      const index = questions.findIndex((q) => q.id === currentId);
      return questions[index + 1];
    }
    if (list === "product") {
      const questions = get().productQuestions;
      const index = questions.findIndex((q) => q.id === currentId);
      return questions[index + 1];
    }

    const questions = get().technicalQuestions;
    const index = questions.findIndex((q) => q.id === currentId);
    return questions[index + 1];
  },
  getPreviousQuestion: (list: string, currentId: string) => {
    if (list === "behavioral") {
      const questions = get().behavioralQuestions;
      const index = questions.findIndex((q) => q.id === currentId);
      return questions[index - 1];
    }
    if (list === "product") {
      const questions = get().productQuestions;
      const index = questions.findIndex((q) => q.id === currentId);
      return questions[index - 1];
    }

    const questions = get().technicalQuestions;
    const index = questions.findIndex((q) => q.id === currentId);
    return questions[index - 1];
  },
}));
