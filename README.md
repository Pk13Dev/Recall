# RECALL

RECALL is a local-first study app for running quiz JSON files as multiple-choice practice sessions. The active source of truth is the refactored app under [js](./js), with [RefIndex.html](./RefIndex.html) as the root Vite entry.

## Quick pipeline

- Root `RefIndex.html` is the refactored app entry for development
- `css/styles.css` and the files in `audio/` are shared by the refactored build
- Vite builds the shared web app into `dist/ref`
- Tauri packages desktop from `dist/ref`
- Capacitor packages Android from `dist/ref`

### Run

```powershell
npm run dev
```

Starts the Vite dev server at `http://127.0.0.1:4173/RefIndex.html`.

### Test

```powershell
npm test
```

Runs JavaScript syntax checks and a production Vite build.

### Build web

```powershell
npm run build
npm run preview
```

`npm run build` writes the offline-ready web output to `dist/ref`. `npm run preview` serves that built output locally.

### Build desktop

```powershell
npm run desktop:dev
npm run desktop:build
```

`desktop:dev` opens the Tauri desktop app in development mode. `desktop:build` creates the desktop installer/executable.

### Build mobile

```powershell
npm run mobile:preflight
npm run mobile:sync
npm run mobile:open
npm run mobile:run
npm run mobile:build
```

Android builds use JDK 21, with JDK 17 as a fallback for older generated projects. The mobile scripts auto-detect a supported local JDK and pass it to Capacitor/Gradle, which avoids newer Java releases breaking Android's Gradle/JDK image step. `mobile:sync` builds the ref app and syncs `dist/ref` into Android. `mobile:open` opens Android Studio. `mobile:run` deploys to a connected emulator/device. `mobile:build` creates a release APK through Gradle and prints the output path. If no signing config is set up yet, Android may produce an unsigned release APK.

Android output locations:

- `npm run mobile:build` writes the release APK to `android/app/build/outputs/apk/release/app-release-unsigned.apk`
- `npm run apk` or `npm run apk:debug` writes the debug APK to `android/app/build/outputs/apk/debug/app-debug.apk`
- `npm run apk:release` writes the release APK to `android/app/build/outputs/apk/release/app-release-unsigned.apk`

### Build APK

```powershell
npm run apk
npm run apk:debug
npm run apk:release
```

`npm run apk` is the quick debug APK path. It builds the ref app, syncs Capacitor, runs Gradle `assembleDebug`, and prints the APK path. `apk:release` runs `assembleRelease` and prints the release APK path. If release signing is not configured yet, the output may be an unsigned release APK.

## Build output

The ref build is written to `dist/ref`.

- `dist/ref/index.html` is the Tauri-facing entry
- `dist/ref/RefIndex.html` is kept as the named offline artifact
- Android APKs are written to `android/app/build/outputs/apk/`

Both are generated from the same refactored source and packaged for local use.

## Features

- Local quiz import and study library
- Folder organization and overview quiz generation
- Session analytics and export
- Portable goal-based analytics
- Goal-based result sounds
- Theme and sound settings
- Desktop and mobile-friendly layout

## What RECALL does

- Uploads quiz files in JSON format
- Parses quiz content locally in the browser or app
- Starts an interactive multiple-choice quiz immediately
- Shows one question at a time with exactly 4 answers per question
- Randomly selects up to 20 questions from larger quiz files for a standard run
- Supports `Quickie` runs that sample 3 random questions from a saved quiz
- Shuffles answer positions without losing the correct answer
- Tracks scores, question results, timestamps, and answer times
- Stores imported quizzes locally in the built-in library
- Supports folders of quizzes, nested folders, ZIP import, and overview quiz generation
- Includes analytics for recent sessions, performance trends, behavior patterns, and question-level accuracy
- Keeps all study data on the local device

## How to use

### 1. Start the app

Use the refactored app through Vite during development:

```powershell
npm run dev
```

Create the packaged build with:

```powershell
npm run build
```

For the desktop wrapper:

```powershell
npm run desktop:dev
npm run desktop:build
```

For Android:

```powershell
npm run mobile:sync
npm run mobile:open
```

### 2. Add quizzes

You can load quizzes in three main ways:

- Click `Upload JSON` to select a single quiz file
- Click `Open Folder` to import many quiz files at once
- Drag and drop a ZIP file onto the upload area

Important note:

- Drag and drop currently accepts ZIP files only
- If you want to bring in a plain JSON file, use `Upload JSON`
- If you want to bring in a normal folder from disk, use `Open Folder`

Imported quizzes are stored locally in the app library on that device.

### 3. Start a quiz

After a valid quiz is loaded:

- The quiz opens
- Answers are shuffled
- You select one answer
- RECALL marks it right or wrong
- You move to the next question
- A final score screen appears at the end

Saved quizzes also expose `Actions`, including:

- `Load` for a normal run
- `Quickie` for a short 3-question run
- rename, move, and delete tools

### 4. Organize your library

Inside the library you can:

- Create folders
- Rename folders
- Delete folders
- Move quizzes
- Rename quizzes
- Open saved quizzes later

### 5. Use overview mode

If a folder contains quiz JSON files and no subfolders, RECALL unlocks `Overview`.

Overview mode:

- Takes random questions from the quizzes inside that folder
- Builds a new mixed quiz using the normal JSON structure
- Saves that generated overview quiz back into the same folder
- Lets you study a broader review set quickly

### 6. Check analytics

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
- Goal-based performance summaries

Use `Export Data` in analytics to download a JSON file that can move your statistics to another device, as long as that device has the same quiz files and filenames.

## Supported quiz shape

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
  ],
  "fillInTheBlanks": [
    {
      "id": 2,
      "title": "Topic or question title",
      "paragraph": "Write the paragraph here using placeholders like {{b1}}, {{b2}}, and {{b3}}.",
      "maxBlanks": 3,
      "selectionMode": "random",
      "baitWords": ["Plausible wrong answer"],
      "blanks": [
        {
          "id": "b1",
          "answer": "Correct answer",
          "acceptedAnswers": ["Correct answer", "Alternative spelling"],
          "hint": "Optional hint for this blank"
        }
      ]
    }
  ]
}
```

## Validation rules

RECALL validates quiz files before starting:

- The file must contain a valid JSON object
- The object must contain a non-empty `questions` array, `fillInTheBlanks` array, or both
- Each multiple-choice question must include question text
- Each multiple-choice question must include between 4 and 17 options
- `correctIndex` must point to one of the entries in `options`
- If `correctAnswer` is included, it must match `options[correctIndex]`
- Each FIB must include a title, paragraph, and at least one blank
- FIB paragraphs use placeholders that match blank ids, such as `{{b1}}`
- FIB word banks are built from blank answers; optional `wordBank`, `baitWords`, `distractors`, or `decoys` entries can add extra choices
- If a quiz contains more than 20 questions, RECALL randomly picks 20 questions for a standard run
- `Quickie` runs use up to 3 random questions from a saved quiz
- Multiple-choice questions always display exactly 4 answers per attempt, and one of them is always the correct answer
- Multiple-choice questions with 5 to 17 options let RECALL randomly pick 3 incorrect answers each time the quiz starts
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
        "Java Serialized Output Namespace",
        "Justified Syntax Operation Notation"
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
        "2",
        "10"
      ],
      "correctIndex": 2
    }
  ]
}
```

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
- Goal percentage used for goal-based analytics and result sounds
- Total session duration

Calculated analytics include:

- Total sessions
- Overall accuracy
- Average score
- Average answer time
- Questions per minute
- Total study time
- Rolling score averages
- Consistency estimates
- Recent sessions
- Quiz-level performance
- Most-missed questions
- Time insights
- Topic strength summaries
- Recent answers
- Goal-based summaries and result classifications

This tracking is used only inside the local app and is not sent to an external service.

## Data export

The analytics export creates a JSON file designed to move your statistics between devices.

- It assumes the destination device has the same quiz files
- It assumes matching file and folder names
- It exports analytics data in a concise JSON structure
- It does not upload anything to a server

After export, RECALL notifies you that the file was sent to your browser or app download folder, usually `Downloads`.

## Notes

- All quiz processing, library data, and analytics stay local to the device
- The ref build is the maintained path going forward
- Android and other wrapper-specific folders are maintained separately

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE).
