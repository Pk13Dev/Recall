export const demoQuizData = {
  questions: [
    {
      id: 1,
      question: "What does JSON stand for?",
      options: [
        "JavaScript Object Notation",
        "Java Source Open Network",
        "Joined Syntax Object Number",
        "Java Serialized Output Namespace",
        "Justified Syntax Operation Notation"
      ],
      correctIndex: 0
    },
    {
      id: 2,
      question: "Which index points to the first element in an array?",
      options: ["1", "-1", "0", "2", "10"],
      correctIndex: 2
    },
    {
      id: 3,
      question: "Which value type is valid in JSON?",
      options: ["undefined", "function", "symbol", "string", "bigint"],
      correctIndex: 3
    }
  ],
  fillInTheBlanks: [
    {
      id: "fib-demo-1",
      title: "JSON structure",
      paragraph: "JSON stores data in {{b1}} pairs, arrays use {{b2}}, and strings must be wrapped in {{b3}}.",
      maxBlanks: 3,
      selectionMode: "ordered",
      baitWords: ["parentheses"],
      blanks: [
        {
          id: "b1",
          answer: "key-value",
          acceptedAnswers: ["key-value", "key value"],
          hint: "The name and value pattern"
        },
        {
          id: "b2",
          answer: "square brackets",
          acceptedAnswers: ["square brackets", "brackets"],
          hint: "Array delimiters"
        },
        {
          id: "b3",
          answer: "double quotes",
          acceptedAnswers: ["double quotes", "quotes"],
          hint: "String delimiters"
        }
      ]
    }
  ]
};

export const DEFAULT_VOLUME = 0.75;

export const DEFAULT_GOAL_PERCENT = 70;

export const DEFAULT_THEME = "light";

export const DISPLAY_OPTION_COUNT = 4;

export const MAX_QUESTIONS_PER_ATTEMPT = 20;

export const MIN_OPTIONS_PER_QUESTION = 4;

export const MAX_OPTIONS_PER_QUESTION = 17;

export const THEMES = ["light", "dark", "neon", "vibrant"];

export const THEME_LABELS = {
  light: "Light",
  dark: "Dark",
  neon: "Neon",
  vibrant: "Vibrant"
};

export const ROOT_LIBRARY_LABEL = "Library";

export const LIBRARY_DIRECTORY = "library";

export const PREVIOUS_LIBRARY_DIRECTORY = "libarray";

export const LEGACY_LIBRARY_DIRECTORY = "libaray";

export const LIBRARY_MODEL_FILE = "library-model.json";

export const LIBRARY_MODEL_KEY = "recall::libarray::library-model";

export const LEGACY_LIBRARY_MODEL_KEY = "recall::libaray::library-model";

export const LEGACY_LOCAL_PREFIX = "libaray::";

export const MAX_RECENT_ANALYTIC_SESSIONS = 180;

export const MAX_RECENT_ANALYTIC_ANSWERS = 2000;

export const ANALYTICS_BEHAVIOR_THRESHOLD_MS = 5000;

export const ANALYTICS_ROLLING_WINDOW = 5;

export const fireworkColors = ["#3ea66a", "#6bc58d", "#4e7b72", "#8cd9af", "#9fd5c5"];
