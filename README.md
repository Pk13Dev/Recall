# RECALL

RECALL is a lightweight offline study app that turns quiz JSON files into multiple-choice practice tests.

The app runs entirely in the browser. You can upload a single JSON quiz, import folders of quizzes, organize them into a local library, generate overview quizzes, and review your study analytics over time.

## What RECALL does

- Uploads quiz files in JSON format
- Parses the quiz locally in the browser
- Starts an interactive multiple-choice quiz immediately
- Shows one question at a time with exactly 4 answers
- Shuffles answer positions without losing the correct answer
- Tracks scores, question results, timestamps, and answer times
- Stores imported quizzes locally in the built-in `libarray` library
- Supports folders of quizzes, nested folders, and overview quiz generation
- Includes analytics for recent sessions, quiz performance, most-missed questions, and recent answers
- Works without a backend

## Main features

- Drag-and-drop JSON upload
- `Upload JSON` file picker
- `Open Folder` import for multiple quiz files at once
- Friendly validation for invalid quiz JSON
- Local library with folders and saved quizzes
- Optional project-folder sync through the physical `libarray/` directory
- Folder overview mode
- Quiz sounds and answer feedback animations
- Victory and loss end-of-quiz effects
- Theme switching
- Analytics dashboard
- Responsive layout for desktop and mobile

## How to use

### 1. Download the project

Download or clone the project files and keep everything together in one folder.

Important files include:

- `index.html`
- `styles.css`
- `app.js`
- `win.mp3`
- `fail.mp3`
- `Victory.mp3`
- `Loser.mp3`

### 2. Open the app

Open `index.html` in your browser.

There is no install step and no server is required.

### 3. Add quizzes

You can load quizzes in three ways:

- Drag a `.json` file into the upload area or
- Click `Upload JSON` to select a single quiz file
- Click `Open Folder` to import a folder of quiz files

Imported quizzes are stored locally in the app library.

If you want the library to live in a real folder beside the app files, click `Connect libarray` and select the `libarray/` folder in the project directory.

### 4. Start a quiz

After a valid quiz is loaded:

- The quiz opens
- Answers are shuffled
- You select one answer
- RECALL marks it right or wrong
- You move to the next question
- A final score screen appears at the end

### 5. Organize your library

Inside the library you can:

- Create folders
- Rename folders
- Delete folders
- Move quizzes
- Rename quizzes
- Open saved quizzes later

### 6. Use overview mode

If a folder contains quiz JSON files and no subfolders, RECALL unlocks `Overview`.

Overview mode:

- Takes random questions from the quizzes inside that folder
- Builds a new mixed quiz using the normal JSON structure
- Saves that generated overview quiz back into the same folder
- Lets you study a broader review set quickly

### 7. Check analytics

Open the `Analytics` page from the library or results screen to review:

- Total completed sessions
- Average score
- Correct answer rate
- Total questions answered
- Study time
- Recent quiz scores
- Quiz-by-quiz performance
- Most missed questions
- Recent right and wrong answers

## Supported JSON format

RECALL expects quiz files in this structure:

```json
{
  "questions": [
    {
      "id": 1,
      "question": "Question text",
      "options": [
        "Option 1",
        "Option 2",
        "Option 3",
        "Option 4"
      ],
      "correctIndex": 0
    }
  ]
}
```

## Validation rules

RECALL validates quiz files before starting:

- The file must contain a valid JSON object
- The object must contain a non-empty `questions` array
- Each question must include question text
- Each question must include exactly 4 options
- `correctIndex` must be `0`, `1`, `2`, or `3`
- If `correctAnswer` is included, it must match `options[correctIndex]`
- Extra explanation text outside valid JSON is not supported

## Example quiz file

```json
{
  "questions": [
    {
      "id": 1,
      "question": "What does JSON stand for?",
      "options": [
        "JavaScript Object Notation",
        "Java Source Open Network",
        "Joined Syntax Object Number",
        "Java Serialized Output Namespace"
      ],
      "correctIndex": 0
    },
    {
      "id": 2,
      "question": "Which index is the first array position?",
      "options": [
        "1",
        "-1",
        "0",
        "2"
      ],
      "correctIndex": 2
    }
  ]
}
```

## How RECALL works

RECALL is a front-end-only web app.

That means:

- Quiz files are read locally in your browser
- There is no backend server
- There is no account system
- Your library and analytics stay on your device in browser storage
- Imported quizzes are stored in the app’s local `libarray` library
- If you connect the project `libarray/` folder, RECALL also writes the managed library there as physical files
- If browser storage is unavailable, the app can fall back to temporary in-memory behavior for that session

## Analytics and tracking transparency

RECALL tracks study activity locally so the analytics page can work.

Tracked data includes:

- Quiz name
- Folder name and folder path
- Quiz type
- Question text
- Whether you answered correctly
- Which option you selected
- What the correct answer was
- Timestamps for answers and completed sessions
- Time spent answering each question
- Final quiz score percentage
- Total session duration

This tracking is used only inside the local app and is not sent to an external service.

## Physical project library folder

This project includes a real `libarray/` folder in the repository.

If your browser supports direct folder access, you can click `Connect libarray` in the app and select that folder.

If the browser keeps that permission, RECALL can reconnect to the same `libarray/` folder automatically on later launches and keep saving uploaded quizzes there without asking again.

When connected, RECALL writes:

- `libarray/library-model.json` for the full managed library state
- `libarray/quizzes/` for the physical quiz files and folder structure

This gives you a visible place in the project directory for the library instead of relying only on hidden browser-managed storage.

Important note:

- Browser security rules mean RECALL cannot automatically take control of your project folder on first load
- The user still has to click `Connect libarray` once and choose that folder
- If you do not connect it, the app still works using local browser storage

## Offline behavior

RECALL is designed to work offline once the files are on your machine.

If you open `index.html` locally in a modern browser, the app can:

- read quiz files
- store your library locally
- keep analytics locally
- run without internet access

## Project structure

```text
RECALL/
├─ index.html
├─ styles.css
├─ app.js
├─ README.md
├─ sample-quiz.json
├─ libarray/
│  ├─ README.txt
│  └─ quizzes/
├─ win.mp3
├─ fail.mp3
├─ Victory.mp3
└─ Loser.mp3
```

## Sharing with friends

To share RECALL:

- send the full project folder
- keep all files together
- tell them to open `index.html`
- tell them to prepare quiz files in the supported JSON format

Their saved library and analytics will stay local to their own browser on their own machine unless they explicitly connect the shared `libarray/` project folder for physical syncing.

## Notes

- The managed library folder is now named `libarray`
- Overview quizzes are generated from existing quizzes in eligible folders
- Answers are shuffled at quiz start, but the original saved quiz data is kept unchanged

## License

Add a license here if you want to make sharing rules explicit.
