# `app.js` Modular Refactor Plan

This plan splits the current single-file `app.js` into smaller JavaScript modules by responsibility. The goal is to make the codebase easier to understand, safer to edit, and friendlier for focused AI-assisted changes.

## Guiding Principle

Split by ownership and responsibility, not by random function count.

Each file should have a clear job:

- Pure helpers go in utility/model files.
- DOM rendering goes in renderer files.
- Event wiring goes in UI/event files.
- Data persistence goes in storage files.
- Quiz runtime logic goes in quiz files.
- Analytics calculations stay separate from analytics rendering.

`main.js` should stay boring. It should only initialize the app.

---

## Proposed Folder Structure

```txt
js/
  main.js

  core/
    constants.js
    state.js
    utils.js
    dom.js
    screens.js

  storage/
    storage.js
    library-model.js
    naming.js

  quiz/
    quiz-validation.js
    quiz-runtime.js
    quiz-renderer.js
    quiz-results.js

  library/
    library-actions.js
    library-renderer.js
    library-editor.js
    delete-modals.js
    overview-quizzes.js

  analytics/
    analytics-model.js
    analytics-recording.js
    analytics-snapshot.js
    analytics-formatters.js
    analytics-renderer.js
    analytics-graphs.js

  import/
    import-model.js
    zip.js
    drag-drop.js
    import-processing.js

  ui/
    audio.js
    effects.js
    settings.js
    popups.js
    navigation.js
    upload-events.js
    app-events.js
```

---

## HTML Entry Point

Update `index.html` to load only the main module:

```html
<script type="module" src="./js/main.js"></script>
```

---

## `main.js`

`main.js` should only boot the app.

```js
import { initializeApp } from "./ui/app-events.js";

initializeApp();
```

A more explicit version could look like this:

```js
import { initializeUploadEvents } from "./ui/upload-events.js";
import { initializeActionEvents } from "./ui/app-events.js";
import { initializeAudioUnlockEvents } from "./ui/audio.js";
import { initializeLibraryStorage } from "./storage/storage.js";
import { setTheme, setNotificationVolume, setGoalPercent } from "./ui/settings.js";

async function initializeApp() {
  initializeUploadEvents();
  initializeActionEvents();
  initializeAudioUnlockEvents();

  setTheme(undefined, false);
  setNotificationVolume(undefined, false);
  setGoalPercent(undefined, false);

  await initializeLibraryStorage();
}

initializeApp();
```

---

## Shared State

Create a single state module so other files are not relying on scattered globals.

### `core/state.js`

```js
export const appState = {
  currentScreen: "home",
  previousNonGuideScreen: "home",

  libraryModel: null,
  currentFolderId: "root",

  currentQuiz: [],
  currentQuestionIndex: 0,
  score: 0,
  analyticsSession: null,
};
```

Other modules should import this state object instead of creating new globals.

---

# Module Breakdown

## `core/utils.js`

General-purpose helpers that do not strongly belong to one feature.

```txt
clamp
normalizeGoalPercent
safeDivide
roundTo
safeJsonParse
supportsLocalStorage
shuffleList
createElement
appendChildren
cloneQuestions
```

`getGoalPercent` may live here if it stays generic, but it probably belongs in `ui/settings.js` because it reads app settings.

---

## `core/screens.js`

Screen switching and app-level error display.

```txt
showScreen
clearError
showError
goToMainMenu
openGuideScreen
closeGuideScreen
```

---

## `ui/upload-events.js`

Upload card behavior and drag/drop UI state.

```txt
hasDraggedFiles
setUploadDragActive
resetUploadInputs
initializeUploadEvents
handleUploadDragEnter
handleUploadDragOver
handleUploadDragLeave
handleUploadDrop
onDrop
```

---

## `ui/audio.js`

Sound objects, playback recovery, volume, and browser audio unlock behavior.

```txt
createSoundInstance
resetSoundPlayback
recreateSound
primeAudioPlayback
playSoundWithRecovery
attemptPlay
playFallback
playSound
setNotificationVolume
initializeAudioUnlockEvents
```

---

## `ui/effects.js`

Visual effects and result celebration/loss effects.

```txt
triggerFireworks
clearConfetti
triggerVictoryConfetti
playVictoryCelebration
triggerLossEffect
playLossEffect
resetVictoryFeedback
```

Note: `playVictoryCelebration` and `playLossEffect` may import `playSound` from `ui/audio.js`.

---

## `ui/settings.js`

Theme, sound volume, goal percentage, and related UI notes.

```txt
isValidTheme
formatThemeName
setLibraryNote
updateLibraryNote
setTheme
setGoalPercent
getGoalPercent
setNotificationVolume
```

`setNotificationVolume` can live here or in `ui/audio.js`. Keeping all settings together is usually cleaner.

---

## `ui/popups.js`

Mini popups, dropdowns, action menus, and outside-click closing.

```txt
closeQuizActionMenus
positionPopupWithinViewport
repositionOpenMiniPopups
setSoundPopupOpen
setThemePopupOpen
setGoalPopupOpen
closeAllMiniPopups
handleGlobalPopupClose
```

---

## `ui/app-events.js`

Main app event wiring and boot sequence.

```txt
initializeActionEvents
initializeApp
```

Try to keep this file as wiring-only. If business logic appears here, move it into the relevant feature module.

---

## `storage/library-model.js`

Library data model helpers and folder/quiz lookup.

```txt
createDefaultLibraryModel
normalizeLibraryModel
getFolder
getQuiz
getCurrentFolder
nextFolderId
nextQuizId
createFolderRecord
getFolderPath
getAllFolderPaths
visit
getFolderDepth
```

---

## `storage/naming.js`

Folder, quiz, managed-entry, and upload file naming helpers.

```txt
normalizeEntityName
sanitizeManagedEntryName
ensureManagedJsonFileName
ensureUniqueManagedEntryName
ensureUniqueFolderName
ensureUniqueQuizName
normalizeUploadedQuizName
```

---

## `storage/storage.js`

Persistence, loading, saving, and legacy import support.

```txt
readTextFileFromDirectory
writeTextFileToDirectory
readLibraryModelFromStorage
saveLibraryModel
scheduleLibrarySave
initializeLibraryStorage
importLegacyQuizzesIfNeeded
addQuizToFolder
addQuizRecord
saveUploadedQuizToFolder
```

---

## `library/delete-modals.js`

Folder and quiz deletion modal behavior.

```txt
closeFolderDeleteModal
closeQuizDeleteModal
openFolderDeleteModal
openQuizDeleteModal
confirmFolderDelete
confirmQuizDelete
```

---

## `library/library-actions.js`

Library mutations and navigation actions.

```txt
getFolderStats
moveQuizToFolder
moveFolderToParent
deleteQuizRecord
deleteFolderRecursively
createFolder
openFolder
goUpOneFolder
loadQuizById
createOverviewForCurrentFolder
persistAndRefreshLibrary
```

---

## `library/library-editor.js`

Inline create, rename, and move editor.

```txt
closeLibraryEditor
populateMoveFolderOptions
openLibraryEditor
saveLibraryEditor
```

---

## `library/library-renderer.js`

Library list rendering, breadcrumbs, row actions, and click dispatch.

```txt
formatCount
getFolderMetaText
getQuizMetaText
renderBreadcrumb
createActionButton
createSavedItemCopy
createSavedItemActions
createQuizActionMenu
renderLibraryList
refreshLibraryUI
handleLibraryClick
```

---

## `library/overview-quizzes.js`

Overview quiz generation.

```txt
getQuizTypeLabel
getEligibleOverviewSourceQuizzes
canGenerateOverview
createOverviewQuestions
generateOverviewQuizForFolder
```

---

## `quiz/quiz-validation.js`

Imported quiz validation and normalization.

```txt
normalizeQuestion
validateQuizData
```

---

## `quiz/quiz-runtime.js`

Quiz attempt state, launch context, and progression.

```txt
selectQuestionOptionsForAttempt
prepareQuizQuestionsForAttempt
buildQuizLaunchContext
getLaunchContextForQuiz
startQuiz
nextQuestion
resetQuizState
```

`nextQuestion` may eventually be split further because it likely handles quiz progression, scoring, analytics, and result display.

---

## `quiz/quiz-renderer.js`

Live question rendering.

```txt
renderQuestion
```

This file should touch the DOM. It should not own long-term quiz state.

---

## `quiz/quiz-results.js`

Result-screen logic.

```txt
finishQuiz
showQuizResults
```

These functions may need to be extracted from `nextQuestion` if they do not already exist.

---

## `analytics/analytics-model.js`

Analytics default objects, normalization, and math helpers.

```txt
createDefaultDailyStat
createDefaultBehaviorStats
createDefaultScoreMoments
createDefaultTrendRegression
createDefaultStreakStats
createDefaultDropoffStats
createDefaultTopicEntry
normalizeBooleanResult
getLocalDateKey
ensureDailyStatBucket
updateRunningMoments
getVarianceFromMoments
getStdDevFromMoments
getConsistencyFromStdDev
updateRegressionTotals
getRegressionSlope
calculateQuestionMastery
calculateHalfAccuracy
calculateSessionDropoff
normalizeTopicEntry
normalizeTopicMap
ensureTopicEntry
updateTopicEntry
decorateQuestionStat
decorateQuizStat
createDefaultAnalyticsModel
seedAnalyticsFromHistory
normalizeAnalyticsModel
```

---

## `analytics/analytics-recording.js`

Recording quiz sessions and answers into analytics state.

```txt
nextAnalyticsId
pushLimitedEntry
buildQuizAnalyticsKey
buildQuestionAnalyticsKey
recordQuestionAnalytics
completeAnalyticsSession
```

---

## `analytics/analytics-formatters.js`

Text formatting for analytics values.

```txt
formatTimestamp
formatDuration
formatPercent
formatRatioPercent
formatDecimal
formatSignedScoreChange
formatSignedRatioPercent
formatTrendSlope
formatMetricText
```

---

## `analytics/analytics-snapshot.js`

Derived analytics data used by dashboard renderers.

```txt
buildRollingAverageSeries
buildDailyMetrics
buildTopicMetrics
getAnalyticsSnapshot
```

---

## `analytics/analytics-renderer.js`

Analytics dashboard DOM rendering.

```txt
createAnalyticsEmptyMessage
renderCollection
createAnalyticsRowCopy
createAnalyticsScoreChip
createAnalyticsAnswerBadge
createAnalyticsMiniCopy
createAnalyticsMiniRow
createAnalyticsPerformanceStat
createAnalyticsPerformanceGroup
renderAnalyticsSessions
renderAnalyticsQuizzes
renderAnalyticsQuestions
renderAnalyticsAnswers
renderAnalyticsBehavior
renderAnalyticsTime
renderAnalyticsTopics
renderAnalyticsScreen
openAnalyticsScreen
```

---

## `analytics/analytics-graphs.js`

SVG chart helpers and analytics graphs.

```txt
createSvgElement
renderAnalyticsScoreGraph
renderAnalyticsCoverageGraph
```

---

## `import/import-model.js`

Import-entry objects and file-list conversion.

```txt
normalizeImportPathSegments
createImportEntry
createTextImportEntry
isJsonImportEntry
isZipImportEntry
getImportEntriesFromFileList
```

---

## `import/zip.js`

ZIP parsing and JSON extraction.

```txt
getZipRootName
getUint16
getUint32
findZipEndOfCentralDirectory
decodeZipText
inflateZipBytes
readZipEntryBytes
extractJsonEntriesFromZip
expandZipImportEntries
```

---

## `import/drag-drop.js`

Modern and legacy drag/drop directory traversal.

```txt
readDroppedHandle
readDroppedFile
readAllDirectoryEntries
readBatch
readDroppedEntry
getImportEntriesFromDrop
```

---

## `import/import-processing.js`

End-to-end quiz import flow.

```txt
ensureFolderPath
processQuizFiles
processQuizFile
```

`ensureFolderPath` could also live in `storage/library-model.js`, but keeping it here makes sense because it exists mainly for imports.

---

# Recommended Refactor Order

Do not split everything at once.

Use this order:

```txt
1. Extract pure utilities first.
2. Extract analytics model and analytics formatters.
3. Extract ZIP and import helpers.
4. Extract audio and effects.
5. Extract storage and library model helpers.
6. Extract library renderers and editor logic.
7. Extract quiz validation and quiz runtime.
8. Extract event handlers last.
```

Avoid starting with these functions:

```txt
initializeActionEvents
renderQuestion
nextQuestion
initializeApp
```

Those are likely high-dependency functions. Move low-risk pure helpers first.

---

# AI-Agent Editing Rules

When handing a file to an AI agent, use strict boundaries.

Example instruction:

```txt
You may only edit this file.
Do not change exported function names.
Do not rewrite unrelated logic.
Do not modify HTML or CSS.
If another file needs a change, list the required change instead of making it.
Preserve existing behavior.
Prefer small patches over rewrites.
```

For extraction work:

```txt
Move only the listed functions into this module.
Add the necessary imports and exports.
Do not change function behavior.
Do not rename variables unless required by module scope.
After moving, list every old global dependency this file still needs.
```

---

# Testing Checklist After Each Extraction

After each file is extracted, test the app before moving more code.

```txt
App loads without console errors.
Theme, sound, and goal controls still work.
Library renders.
Folder navigation works.
Quiz import works.
Starting a quiz works.
Answering questions works.
Results screen works.
Analytics screen renders.
Deleting folders/quizzes still works.
Drag/drop upload still works.
ZIP import still works.
```

---

# Big Warning

Do not create 15 files that all secretly depend on each other in weird ways.

That turns spaghetti into lasagna.

The target is not just “more files.”

The target is:

```txt
small modules
clear ownership
few exports
predictable imports
minimal shared mutable state
```

