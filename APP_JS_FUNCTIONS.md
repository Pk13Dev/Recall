# `app.js` Function Reference

Scope: this document covers the named functions in the root [app.js](e:/RECALL/app.js) file only, not the mirrored `www/app.js` copy. It includes nested named helper functions such as `attemptPlay`, `visit`, `readBatch`, and the upload drag handlers.

## Core Utilities And Screen State

- [L195] `clamp(value, min, max)`: Constrains a numeric value to a minimum and maximum. Input: a candidate number plus lower and upper bounds. Output: a bounded `number`.
- [L199] `normalizeGoalPercent(value)`: Normalizes the pass-goal percentage and falls back to the default goal when needed. Input: any goal-like value. Output: an integer `number` from `0` to `100`.
- [L207] `getGoalPercent()`: Reads the current goal percentage from app state, or defaults to `70`. Input: none. Output: the active goal `number`.
- [L214] `safeDivide(numerator, denominator, fallback)`: Divides two values safely and uses a fallback when the math is invalid. Input: numerator, denominator, and optional fallback value. Output: a `number` or the provided fallback.
- [L223] `roundTo(value, digits)`: Rounds a number to a given precision. Input: a value and the number of decimal places. Output: a rounded `number`.
- [L234] `safeJsonParse(text, fallbackValue)`: Parses JSON without throwing. Input: JSON text and a fallback value. Output: the parsed value or `fallbackValue`.
- [L242] `showScreen(name)`: Switches the visible app screen and tracks the previous non-guide screen. Input: a screen name key. Output: none; updates DOM state.
- [L250] `clearError()`: Clears the visible error message. Input: none. Output: none; updates DOM state.
- [L254] `showError(message)`: Shows an error message in the UI. Input: an error string. Output: none; updates DOM state.
- [L258] `hasDraggedFiles(event)`: Detects whether a drag event contains files. Input: a drag event. Output: `boolean`.
- [L263] `setUploadDragActive(isActive)`: Turns the upload drop-zone hover styling on or off. Input: truthy or falsy active state. Output: none; updates DOM state.
- [L270] `resetUploadInputs()`: Clears the file and folder input elements so the same upload can be picked again. Input: none. Output: none; updates DOM state.
- [L275] `resetVictoryFeedback()`: Stops result timers, clears confetti, and resets result-sound side effects. Input: none. Output: none; resets runtime state.
- [L289] `setLibraryNote(message)`: Shows or hides the storage-mode/library note. Input: a message string or falsy value. Output: none; updates DOM state.
- [L293] `updateLibraryNote()`: Recomputes the library note based on the current storage backend. Input: none. Output: none; updates DOM state.
- [L302] `isValidTheme(themeName)`: Checks whether a theme name exists in the supported theme list. Input: a theme name. Output: `boolean`.
- [L306] `formatThemeName(themeName)`: Converts a theme key into a human-readable label. Input: a theme name. Output: a display `string`.
- [L310] `supportsLocalStorage()`: Tests whether `localStorage` is available and writable. Input: none. Output: `boolean`.
- [L321] `cloneQuestions(questions)`: Clones the quiz question array so later mutations do not affect the source quiz. Input: an array of question objects. Output: a cloned `array`.
- [L331] `selectQuestionOptionsForAttempt(question)`: Builds the answer options for one live quiz question while preserving the correct answer reference. Input: a normalized question object. Output: a prepared question `object`.
- [L345] `prepareQuizQuestionsForAttempt(questions)`: Shuffles quiz questions, trims the attempt to the configured maximum, and prepares each question’s options. Input: a question array. Output: a prepared question `array`.
- [L351] `createElement(tagName, className, textContent)`: Creates an HTML element with optional class and text. Input: tag name, optional class name, optional text. Output: an `HTMLElement`.
- [L362] `appendChildren(parent, children)`: Appends multiple child nodes to a parent element, skipping falsy entries. Input: a parent element and a child collection. Output: the same parent `HTMLElement`.

## Audio, Modals, Library Mutation, And Result Effects

- [L367] `createSoundInstance(source)`: Creates and configures an audio object for one sound asset. Input: an audio file path. Output: an `HTMLAudioElement`.
- [L375] `resetSoundPlayback(audio)`: Stops an audio instance and seeks it back to the start. Input: an audio element. Output: none; mutates the audio element.
- [L387] `recreateSound(type)`: Rebuilds one sound instance from its source path and reapplies the current volume. Input: a sound type key such as `win` or `loser`. Output: a fresh `HTMLAudioElement` or `null`.
- [L398] `primeAudioPlayback()`: Attempts a muted one-time audio unlock pass so mobile browsers will allow later playback. Input: none. Output: none; mutates audio runtime state.
- [L433] `playSoundWithRecovery(type, fallbackType)`: Plays a sound, retries with a fresh audio object if needed, and optionally falls back to another sound. Input: a primary sound key and optional fallback sound key. Output: none; starts audio side effects.
- [L436] `attemptPlay(audio, onFailure)` (nested in `playSoundWithRecovery`): Performs one play attempt and calls a failure callback if playback is blocked. Input: an audio element and optional failure handler. Output: none.
- [L462] `playFallback()` (nested in `playSoundWithRecovery`): Plays the configured fallback sound if the primary sound fails. Input: none. Output: none.
- [L481] `playSound(type)`: Convenience wrapper around the recovery-based sound playback path. Input: a sound type key. Output: none.
- [L488] `triggerFireworks(targetButton)`: Shows the small firework burst effect around a clicked answer button. Input: the target button element. Output: none; updates DOM state.
- [L511] `closeFolderDeleteModal()`: Hides the folder-delete confirmation modal and clears its pending state. Input: none. Output: none; updates DOM and runtime state.
- [L519] `closeQuizDeleteModal()`: Hides the quiz-delete confirmation modal and clears its pending state. Input: none. Output: none; updates DOM and runtime state.
- [L525] `getFolderStats(folderId)`: Calculates aggregate counts for a folder tree, such as descendant folders and quizzes. Input: a folder ID. Output: a folder stats `object`.
- [L543] `openFolderDeleteModal(folderId)`: Prepares and displays the folder-delete confirmation modal for a folder. Input: a folder ID. Output: none; updates DOM state.
- [L560] `openQuizDeleteModal(quizId)`: Prepares and displays the quiz-delete confirmation modal for a quiz. Input: a quiz ID. Output: none; updates DOM state.
- [L574] `moveQuizToFolder(quizId, targetFolderId)`: Moves a quiz into another folder and makes its name unique there. Input: a quiz ID and destination folder ID. Output: none; mutates the library model.
- [L592] `moveFolderToParent(folderId, targetParentId)`: Moves a folder under a different parent folder and resolves name collisions. Input: a folder ID and new parent folder ID. Output: none; mutates the library model.
- [L607] `deleteQuizRecord(quizId)`: Removes a quiz from the model and from its parent folder list. Input: a quiz ID. Output: none; mutates the library model.
- [L620] `deleteFolderRecursively(folderId)`: Deletes a folder, all nested child folders, and all quizzes inside them. Input: a folder ID. Output: none; mutates the library model.
- [L637] `confirmFolderDelete()`: Confirms the pending folder deletion, persists it, and refreshes the UI. Input: none. Output: `Promise<void>`.
- [L665] `confirmQuizDelete()`: Confirms the pending quiz deletion, persists it, and refreshes the UI. Input: none. Output: `Promise<void>`.
- [L681] `clearConfetti()`: Removes active confetti pieces and clears the confetti timeout. Input: none. Output: none; updates DOM and runtime state.
- [L690] `triggerVictoryConfetti()`: Creates the full-screen success confetti effect. Input: none. Output: none; updates DOM state.
- [L725] `playVictoryCelebration()`: Plays the victory sound and coordinates the success confetti timing. Input: none. Output: none; triggers audio and visual effects.
- [L755] `triggerLossEffect()`: Creates the full-screen “sad confetti” effect for a failed result. Input: none. Output: none; updates DOM state.
- [L787] `playLossEffect()`: Plays the lose-result effect, including the loss sound with fallback recovery. Input: none. Output: none; triggers audio and visual effects.

## Quiz Validation And Analytics Model Helpers

- [L794] `normalizeQuestion(rawQuestion, index)`: Validates and normalizes one raw question record from imported JSON. Input: a raw question object and its index. Output: a normalized question `object`, or throws on invalid data.
- [L848] `validateQuizData(rawData)`: Validates the overall quiz payload and normalizes every question. Input: a parsed quiz JSON object. Output: a normalized question `array`, or throws on invalid data.
- [L860] `createDefaultDailyStat()`: Creates the default shape for one daily analytics bucket. Input: none. Output: a daily stat `object`.
- [L869] `createDefaultBehaviorStats()`: Creates the default shape for answer-behavior analytics. Input: none. Output: a behavior stats `object`.
- [L879] `createDefaultScoreMoments()`: Creates the default running-moments accumulator for score variance. Input: none. Output: a score moments `object`.
- [L883] `createDefaultTrendRegression()`: Creates the default regression accumulator used for score trends. Input: none. Output: a regression stats `object`.
- [L887] `createDefaultStreakStats()`: Creates the default correct-answer streak tracker. Input: none. Output: a streak stats `object`.
- [L891] `createDefaultDropoffStats()`: Creates the default session drop-off tracker. Input: none. Output: a drop-off stats `object`.
- [L895] `createDefaultTopicEntry(label)`: Creates the default aggregate analytics entry for one topic bucket. Input: a label string. Output: a topic entry `object`.
- [L904] `normalizeBooleanResult(value, fallback)`: Normalizes a mixed truthy/falsy value into a boolean with fallback support. Input: a candidate value and fallback. Output: `boolean`.
- [L917] `getLocalDateKey(timestamp)`: Converts a timestamp into the app’s local YYYY-MM-DD-style key. Input: a timestamp. Output: a date-key `string`.
- [L930] `ensureDailyStatBucket(analytics, dateKey)`: Returns the daily analytics bucket for a date, creating it when missing. Input: the analytics model and a date key. Output: a daily stat bucket `object`.
- [L937] `updateRunningMoments(moments, value)`: Updates a mean/variance accumulator using Welford-style running moments. Input: a moments object and a numeric value. Output: the updated moments `object`.
- [L952] `getVarianceFromMoments(moments)`: Computes variance from the stored running moments. Input: a moments object. Output: a variance `number` or `null`.
- [L959] `getStdDevFromMoments(moments)`: Computes standard deviation from stored running moments. Input: a moments object. Output: a standard deviation `number` or `null`.
- [L964] `getConsistencyFromStdDev(stdDev)`: Converts a standard deviation into a consistency score. Input: a standard deviation value. Output: a consistency `number` or `null`.
- [L972] `updateRegressionTotals(regression, timestamp, scorePercent)`: Updates the trend-regression accumulator with one scored session. Input: a regression object, timestamp, and score percent. Output: the updated regression `object`.
- [L988] `getRegressionSlope(regression)`: Computes the regression slope for historical score trend data. Input: a regression object. Output: a slope `number` or `null`.
- [L999] `calculateQuestionMastery(accuracyRatio, averageTimeMs)`: Derives a mastery score from accuracy and average answer time. Input: answer accuracy and average time. Output: a mastery `number` or `null`.
- [L1010] `calculateHalfAccuracy(answers, startIndex, endIndex)`: Computes accuracy over a subsection of session answers. Input: an answer array plus start and end indexes. Output: an accuracy ratio `number` or `null`.
- [L1019] `calculateSessionDropoff(answers)`: Compares first-half and second-half session accuracy to estimate drop-off. Input: a session answer array. Output: a drop-off summary `object`.
- [L1041] `normalizeTopicEntry(rawEntry, fallbackLabel)`: Normalizes one stored topic aggregate entry. Input: a raw topic entry and fallback label. Output: a normalized topic entry `object`.
- [L1055] `normalizeTopicMap(rawMap)`: Normalizes a map of topic aggregate entries. Input: a raw topic map object. Output: a normalized topic map `object`.
- [L1067] `ensureTopicEntry(topicMap, key, label)`: Returns the topic aggregate entry for a key, creating or labeling it as needed. Input: a topic map, entry key, and label. Output: a topic entry `object`.
- [L1076] `updateTopicEntry(entry, scorePercent)`: Adds one score into a topic aggregate entry. Input: a topic entry and score percent. Output: none; mutates the entry.
- [L1082] `decorateQuestionStat(rawStat)`: Computes derived analytics fields for one question stat record. Input: a raw question stat object. Output: a decorated question stat `object`.
- [L1103] `decorateQuizStat(rawStat)`: Computes derived analytics fields for one quiz stat record. Input: a raw quiz stat object. Output: a decorated quiz stat `object`.
- [L1139] `createDefaultAnalyticsModel()`: Creates the full default analytics model. Input: none. Output: an analytics model `object`.
- [L1166] `seedAnalyticsFromHistory(analytics)`: Backfills missing derived analytics fields from stored recent sessions and answers. Input: an analytics model. Output: none; mutates the analytics model.
- [L1265] `normalizeAnalyticsModel(rawAnalytics)`: Validates and normalizes the persisted analytics model. Input: a raw analytics payload. Output: a normalized analytics model `object`.
- [L1393] `createDefaultLibraryModel()`: Creates the default library model, including folders, settings, flags, and analytics. Input: none. Output: a library model `object`.
- [L1418] `normalizeLibraryModel(rawModel)`: Rebuilds a safe in-memory library model from stored data. Input: a raw library model payload. Output: a normalized library model `object`.

## Library Access, Storage, Naming, And Overview Building

- [L1539] `getFolder(folderId)`: Looks up a folder by ID. Input: a folder ID. Output: a folder `object` or `undefined`.
- [L1543] `getQuiz(quizId)`: Looks up a quiz by ID. Input: a quiz ID. Output: a quiz `object` or `undefined`.
- [L1547] `getCurrentFolder()`: Returns the currently open folder, defaulting to root when needed. Input: none. Output: a folder `object`.
- [L1556] `nextFolderId()`: Generates and stores the next folder ID. Input: none. Output: a folder ID `string`.
- [L1561] `nextQuizId()`: Generates and stores the next quiz ID. Input: none. Output: a quiz ID `string`.
- [L1566] `normalizeEntityName(name, fallbackName)`: Trims and normalizes a user-provided folder or quiz name. Input: a candidate name and fallback string. Output: a normalized name `string`.
- [L1575] `sanitizeManagedEntryName(name, fallbackName)`: Normalizes a managed file or folder entry name while stripping invalid parts. Input: a candidate name and fallback. Output: a sanitized name `string`.
- [L1581] `ensureManagedJsonFileName(name, fallbackName)`: Ensures a managed entry name ends in `.json`. Input: a candidate name and fallback. Output: a JSON file name `string`.
- [L1586] `ensureUniqueManagedEntryName(baseName, usedNames)`: Adds a numeric suffix until a managed entry name is unique. Input: a base name and a set of used names. Output: a unique name `string`.
- [L1607] `readTextFileFromDirectory(directoryHandle, fileName)`: Reads a UTF-8 text file from an OPFS directory. Input: a directory handle and file name. Output: `Promise<string|null>`.
- [L1617] `writeTextFileToDirectory(directoryHandle, fileName, content)`: Writes a UTF-8 text file into an OPFS directory. Input: a directory handle, file name, and file content. Output: `Promise<void>`.
- [L1624] `readLibraryModelFromStorage()`: Loads the persisted library model from OPFS or `localStorage`, including legacy fallbacks. Input: none. Output: `Promise<object|null>`.
- [L1652] `saveLibraryModel()`: Persists the current library model to the active storage backend. Input: none. Output: `Promise<void>`.
- [L1669] `scheduleLibrarySave()`: Debounces model persistence so rapid edits only trigger one save. Input: none. Output: none; schedules async persistence.
- [L1678] `addQuizToFolder(folderId, quizName, questions)`: Adds a standard quiz record to a folder. Input: a folder ID, quiz name, and question array. Output: the created quiz `object`.
- [L1685] `addQuizRecord(folderId, config)`: Adds a quiz record with full config support, including overview metadata. Input: a folder ID and config object. Output: the created quiz `object`.
- [L1709] `importLegacyQuizzesIfNeeded()`: Imports old standalone quiz files or legacy localStorage quizzes into the new model once. Input: none. Output: `Promise<boolean>` indicating whether anything was imported.
- [L1776] `ensureUniqueFolderName(parentFolderId, desiredName, excludedFolderId)`: Makes a folder name unique under one parent folder. Input: parent folder ID, desired name, and optional folder ID to ignore. Output: a unique folder name `string`.
- [L1799] `ensureUniqueQuizName(folderId, desiredName, excludedQuizId)`: Makes a quiz name unique inside one folder. Input: folder ID, desired name, and optional quiz ID to ignore. Output: a unique quiz name `string`.
- [L1822] `shuffleList(items)`: Returns a shuffled copy of an array. Input: an array. Output: a shuffled `array`.
- [L1833] `getQuizTypeLabel(quiz)`: Returns the UI label for a quiz kind such as standard or overview. Input: a quiz object. Output: a label `string`.
- [L1837] `getEligibleOverviewSourceQuizzes(folderId)`: Finds quizzes in a folder that can contribute questions to an overview quiz. Input: a folder ID. Output: a quiz `array`.
- [L1848] `canGenerateOverview(folderId)`: Checks whether a folder has enough quizzes to build an overview quiz. Input: a folder ID. Output: `boolean`.
- [L1853] `createOverviewQuestions(sourceQuizzes)`: Builds one mixed-review overview quiz from source quizzes. Input: an array of source quiz objects. Output: a question `array`.
- [L1872] `generateOverviewQuizForFolder(folderId, shouldStartQuiz)`: Creates an overview quiz for a folder, optionally persists it, and can launch it immediately. Input: a folder ID and whether to start the quiz right away. Output: `Promise<object|void>`, usually the created quiz object when built successfully.
- [L1901] `getFolderPath(folderId)`: Builds the slash-separated display path for a folder. Input: a folder ID. Output: a path `string`.

## Analytics Recording, Folder Editing, And Library UI Builders

- [L1919] `nextAnalyticsId(counterKey, prefix)`: Generates the next analytics entity ID for sessions or answers. Input: a counter key and string prefix. Output: an analytics ID `string`.
- [L1925] `pushLimitedEntry(list, entry, maxItems)`: Appends one item to a capped list and trims old entries. Input: a target list, new entry, and max size. Output: none; mutates the list.
- [L1932] `buildQuizLaunchContext(config)`: Builds the analytics/context metadata used when a quiz starts. Input: a launch config object. Output: a launch-context `object`.
- [L1947] `getLaunchContextForQuiz(quiz)`: Builds launch metadata for a stored library quiz. Input: a quiz object. Output: a launch-context `object`.
- [L1957] `buildQuizAnalyticsKey(session)`: Builds the stable analytics key used to group a quiz’s session history. Input: a session context object. Output: a key `string`.
- [L1964] `buildQuestionAnalyticsKey(session, question, questionIndex)`: Builds the stable analytics key for one question inside a quiz. Input: session context, question object, and question index. Output: a key `string`.
- [L1974] `recordQuestionAnalytics(currentQuestion, selectedIndex, isCorrect, answeredAt)`: Records analytics for one answered question and updates streak and behavior counters. Input: the current question, selected answer index, correctness flag, and answer timestamp. Output: none; mutates analytics state.
- [L2100] `completeAnalyticsSession(scorePercent)`: Rolls the active quiz attempt into long-term analytics summaries. Input: the finished quiz score percent. Output: none; mutates analytics state.
- [L2231] `getAllFolderPaths()`: Flattens the folder tree into a list of folder IDs and display paths. Input: none. Output: a folder-path `array`.
- [L2234] `visit(folderId)` (nested in `getAllFolderPaths`): Recursively walks one folder subtree while building the folder-path list. Input: a folder ID. Output: none; pushes into the outer array.
- [L2247] `getFolderDepth(folderId)`: Returns how deep a folder is in the folder tree. Input: a folder ID. Output: a depth `number`.
- [L2257] `closeLibraryEditor()`: Hides the inline library editor and clears its mode/entity state. Input: none. Output: none; updates DOM and runtime state.
- [L2270] `formatCount(count, singularLabel, pluralLabel)`: Formats a count with singular/plural wording. Input: a count and the singular/plural labels. Output: a formatted `string`.
- [L2274] `getFolderMetaText(folder)`: Creates the descriptive subtitle shown for a folder row. Input: a folder object. Output: a metadata `string`.
- [L2292] `getQuizMetaText(quiz)`: Creates the descriptive subtitle shown for a quiz row. Input: a quiz object. Output: a metadata `string`.
- [L2302] `populateMoveFolderOptions(currentFolderId, selectedFolderId)`: Fills the move-target dropdown for folder or quiz relocation. Input: the current folder and selected folder IDs. Output: none; updates DOM state.
- [L2325] `openLibraryEditor(mode, entityId)`: Opens and configures the inline library editor for create, rename, or move flows. Input: an editor mode and optional entity ID. Output: none; updates DOM state.
- [L2378] `renderBreadcrumb()`: Renders the folder breadcrumb trail for the current library location. Input: none. Output: none; updates DOM state.
- [L2407] `createActionButton(config)`: Creates one reusable action button for saved item rows or menus. Input: a button config object. Output: an `HTMLButtonElement`.
- [L2420] `createSavedItemCopy(typeLabel, titleText, metaText)`: Builds the text block used inside a saved folder or quiz row. Input: type label, title text, and meta text. Output: an `HTMLElement`.
- [L2432] `createSavedItemActions(actionConfigs)`: Builds the action button stack for one saved row. Input: an array of action config objects. Output: an `HTMLElement`.
- [L2439] `createQuizActionMenu(quizId)`: Builds the overflow action menu for one saved quiz row. Input: a quiz ID. Output: an `HTMLElement`.
- [L2470] `renderLibraryList()`: Renders the saved library view for the current folder. Input: none. Output: none; updates DOM state.
- [L2544] `refreshLibraryUI()`: Refreshes breadcrumb, row list, and related library UI. Input: none. Output: none; updates DOM state.
- [L2552] `persistAndRefreshLibrary()`: Saves the model and then refreshes the library UI. Input: none. Output: `Promise<void>`.

## Formatting Helpers And Analytics Rendering

- [L2557] `formatTimestamp(timestamp)`: Formats a timestamp for human-readable analytics output. Input: a timestamp. Output: a display `string`.
- [L2573] `formatDuration(durationMs)`: Formats milliseconds into `ms`, `s`, `m`, or `h m`. Input: a duration in milliseconds. Output: a display `string`.
- [L2594] `formatPercent(value)`: Formats a whole-number percentage. Input: a numeric value. Output: a percent `string`.
- [L2598] `formatRatioPercent(value, digits)`: Formats a ratio like `0.72` as a percentage string. Input: a ratio and optional decimal precision. Output: a percent `string`.
- [L2606] `formatDecimal(value, digits, suffix)`: Formats a decimal with fixed precision and optional suffix. Input: a numeric value, digits, and suffix. Output: a display `string`.
- [L2615] `formatSignedScoreChange(value)`: Formats a percentage-point score change with a sign. Input: a score delta. Output: a signed score-change `string`.
- [L2631] `formatSignedRatioPercent(value, digits)`: Formats a signed ratio delta as a percent string. Input: a ratio delta and optional precision. Output: a signed percent `string`.
- [L2647] `formatTrendSlope(value)`: Formats a regression slope as points gained or lost per day. Input: a slope value. Output: a trend `string`.
- [L2664] `formatMetricText(value, formatter)`: Formats a metric value or returns an em dash when it is missing. Input: a value and optional formatter function. Output: a display `string`.
- [L2671] `createAnalyticsEmptyMessage(message)`: Creates the shared empty-state paragraph used across analytics sections. Input: a message string. Output: an `HTMLElement`.
- [L2675] `createSvgElement(tagName)`: Creates one SVG element in the SVG namespace. Input: an SVG tag name. Output: an `SVGElement`.
- [L2680] `renderCollection(container, items, emptyMessage, limit, buildItem)`: Renders a limited list of analytics items or an empty-state message. Input: a container, source items, empty-state message, limit, and row-builder function. Output: none; updates DOM state.
- [L2692] `createAnalyticsRowCopy(titleText, metaText, detailText)`: Builds the text block for one analytics list row. Input: title, meta, and detail strings. Output: an `HTMLElement`.
- [L2704] `createAnalyticsScoreChip(text, className)`: Creates the pill-style score chip used in analytics lists. Input: chip text and optional extra class. Output: an `HTMLElement`.
- [L2708] `createAnalyticsAnswerBadge(isCorrect)`: Creates the correct/incorrect badge for answer history rows. Input: whether the answer was correct. Output: an `HTMLElement`.
- [L2716] `createAnalyticsMiniCopy(titleText, metaText)`: Builds the compact text block used inside mini analytics rows. Input: title and meta text. Output: an `HTMLElement`.
- [L2725] `createAnalyticsMiniRow(titleText, metaText, chipText, chipClassName)`: Builds a compact analytics row with copy and a chip. Input: title text, meta text, chip text, and optional chip class. Output: an `HTMLElement`.
- [L2734] `createAnalyticsPerformanceStat(labelText, valueText, noteText)`: Builds one summary stat card for the analytics quiz section. Input: label, value, and note text. Output: an `HTMLElement`.
- [L2742] `createAnalyticsPerformanceGroup(titleText, items, emptyMessage, buildItem)`: Builds one grouped analytics panel such as top performers. Input: group title, items, empty message, and row-builder callback. Output: an `HTMLElement`.
- [L2759] `buildRollingAverageSeries(sessions, windowSize)`: Computes the rolling average series for recent sessions. Input: session array and rolling window size. Output: a chart-series `array`.
- [L2779] `buildDailyMetrics(dailyStats)`: Flattens daily stats into sorted chart/list-friendly objects. Input: the daily stats map. Output: a daily metrics `array`.
- [L2791] `buildTopicMetrics(topicMap)`: Converts a topic stats map into a sorted array of topic metric objects. Input: a topic map. Output: a topic metrics `array`.
- [L2810] `getAnalyticsSnapshot()`: Produces the fully derived analytics snapshot used by the dashboard renderer. Input: none. Output: an analytics snapshot `object`.
- [L3002] `renderAnalyticsSessions(sessions)`: Renders the recent sessions section. Input: a recent session array. Output: none; updates DOM state.
- [L3023] `renderAnalyticsQuizzes(snapshot)`: Renders the quiz-performance analytics section. Input: the analytics snapshot. Output: none; updates DOM state.
- [L3087] `renderAnalyticsQuestions(questionStats)`: Renders the most-missed questions section. Input: a question stats array. Output: none; updates DOM state.
- [L3107] `renderAnalyticsAnswers(answers)`: Renders the recent answers section. Input: an answer-history array. Output: none; updates DOM state.
- [L3130] `renderAnalyticsBehavior(snapshot)`: Renders answer-behavior analytics such as guessing and fast-correct patterns. Input: the analytics snapshot. Output: none; updates DOM state.
- [L3179] `renderAnalyticsTime(snapshot)`: Renders time-based analytics and study-time summaries. Input: the analytics snapshot. Output: none; updates DOM state.
- [L3224] `renderAnalyticsTopics(snapshot)`: Renders folder- and quiz-kind topic analytics panels. Input: the analytics snapshot. Output: none; updates DOM state.
- [L3258] `renderAnalyticsScoreGraph(trendSeries)`: Draws the score trend SVG chart. Input: a trend-series array. Output: none; updates DOM state.
- [L3372] `renderAnalyticsCoverageGraph(snapshot)`: Draws the attempted/passed/needs-work coverage chart. Input: the analytics snapshot. Output: none; updates DOM state.
- [L3404] `renderAnalyticsScreen()`: Refreshes the entire analytics dashboard from current stored analytics data. Input: none. Output: none; updates DOM state.

## Settings, Popups, Navigation, Library Actions, And Quiz Flow

- [L3458] `openAnalyticsScreen()`: Opens the analytics screen after refreshing its content. Input: none. Output: none; updates DOM state.
- [L3466] `setNotificationVolume(volume, shouldPersist)`: Applies a new sound volume to all audio elements and optionally saves it. Input: a volume ratio and a persist flag. Output: none; mutates audio and settings state.
- [L3484] `setTheme(themeName, shouldPersist)`: Applies a theme to the page and optionally saves it. Input: a theme name and a persist flag. Output: none; updates DOM and settings state.
- [L3507] `setGoalPercent(goalPercent, shouldPersist)`: Applies the score-goal slider value and optionally saves it. Input: a percentage and a persist flag. Output: none; updates DOM and settings state.
- [L3528] `closeQuizActionMenus(activeQuizId)`: Closes all quiz action menus except an optional active one. Input: an optional quiz ID to keep open. Output: none; updates DOM state.
- [L3543] `positionPopupWithinViewport(triggerButton, popup)`: Repositions a mini popup so it stays inside the viewport. Input: the trigger button and popup element. Output: none; updates DOM style.
- [L3577] `repositionOpenMiniPopups()`: Repositions all currently open mini popups. Input: none. Output: none; updates DOM style.
- [L3583] `setSoundPopupOpen(isOpen)`: Opens or closes the sound popup. Input: desired open state. Output: none; updates DOM state.
- [L3592] `setThemePopupOpen(isOpen)`: Opens or closes the theme popup. Input: desired open state. Output: none; updates DOM state.
- [L3601] `setGoalPopupOpen(isOpen)`: Opens or closes the goal popup. Input: desired open state. Output: none; updates DOM state.
- [L3610] `closeAllMiniPopups()`: Closes theme, sound, goal, and quiz action popups. Input: none. Output: none; updates DOM state.
- [L3617] `goToMainMenu()`: Returns the app to the library/upload home state and clears transient UI. Input: none. Output: none; updates DOM and runtime state.
- [L3628] `openGuideScreen()`: Opens the guide/help screen. Input: none. Output: none; updates DOM state.
- [L3636] `closeGuideScreen()`: Leaves the guide screen and returns to the previous non-guide screen. Input: none. Output: none; updates DOM state.
- [L3641] `handleGlobalPopupClose(event)`: Closes popups when the user clicks outside them. Input: a click event. Output: none; updates DOM state.
- [L3668] `createFolder()`: Opens the library editor in create-folder mode. Input: none. Output: none; updates DOM state.
- [L3673] `createOverviewForCurrentFolder()`: Triggers overview quiz generation for the current folder. Input: none. Output: none directly; starts an async overview-generation flow.
- [L3679] `openFolder(folderId)`: Switches the library view into a specific folder. Input: a folder ID. Output: none; updates runtime and DOM state.
- [L3687] `goUpOneFolder()`: Moves the library view to the parent of the current folder. Input: none. Output: none; updates runtime and DOM state.
- [L3697] `loadQuizById(quizId)`: Loads a stored quiz and starts a live quiz attempt from it. Input: a quiz ID. Output: none; starts quiz flow.
- [L3709] `saveLibraryEditor()`: Executes the current inline editor action such as create, rename, or move. Input: none. Output: none directly; starts async persistence when needed.
- [L3824] `handleLibraryClick(event)`: Central click handler for library rows, breadcrumbs, and row actions. Input: a click event. Output: none; dispatches UI actions.
- [L3897] `renderQuestion()`: Draws the current quiz question and wires answer-button behavior. Input: none. Output: none; updates DOM state.
- [L3956] `startQuiz(questions, launchConfig)`: Initializes quiz runtime state and shows the first question. Input: a question array and optional launch metadata. Output: none; starts quiz flow.
- [L3977] `nextQuestion()`: Advances to the next quiz question or finishes the quiz and shows results. Input: none. Output: none; updates quiz, analytics, and DOM state.

## Imports, ZIP Processing, Drag And Drop, And App Initialization

- [L4004] `normalizeUploadedQuizName(fileName)`: Normalizes an uploaded quiz file name and guarantees a `.json` suffix. Input: a file name string. Output: a normalized file name `string`.
- [L4010] `normalizeImportPathSegments(relativePath)`: Splits and cleans a relative import path into folder segments. Input: a relative path string. Output: a segment `array`.
- [L4021] `createFolderRecord(parentFolderId, folderName)`: Creates a new folder record under a parent folder. Input: a parent folder ID and folder name. Output: the created folder `object`.
- [L4040] `ensureFolderPath(parentFolderId, segments)`: Creates or reuses nested folders for a relative import path. Input: a starting folder ID and folder-name segment array. Output: the deepest folder `object`.
- [L4065] `saveUploadedQuizToFolder(folderId, questions, fileName)`: Saves an uploaded quiz into a folder using a unique normalized name. Input: folder ID, validated question array, and original file name. Output: `Promise<object>` resolving to the created quiz object.
- [L4071] `createImportEntry(file, relativePath)`: Wraps one file plus relative path into the app’s import-entry shape. Input: a file-like object and optional relative path. Output: an import-entry `object`.
- [L4078] `createTextImportEntry(fileName, relativePath, content)`: Builds an in-memory import entry from text content, usually for ZIP extraction. Input: file name, relative path, and JSON text. Output: an import-entry `object`.
- [L4089] `isJsonImportEntry(entry)`: Checks whether an import entry represents a JSON file. Input: an import-entry object. Output: `boolean`.
- [L4093] `isZipImportEntry(entry)`: Checks whether an import entry represents a ZIP file. Input: an import-entry object. Output: `boolean`.
- [L4101] `getImportEntriesFromFileList(fileList)`: Converts a browser `FileList` into import-entry objects. Input: a file list. Output: an import-entry `array`.
- [L4107] `getZipRootName(fileName)`: Derives a folder-like root name from a ZIP file name. Input: a ZIP file name. Output: a normalized root name `string`.
- [L4113] `getUint16(bytes, offset)`: Reads an unsigned 16-bit integer from ZIP bytes. Input: a byte array and offset. Output: a `number`.
- [L4117] `getUint32(bytes, offset)`: Reads an unsigned 32-bit integer from ZIP bytes. Input: a byte array and offset. Output: a `number`.
- [L4121] `findZipEndOfCentralDirectory(bytes)`: Locates the ZIP end-of-central-directory record. Input: ZIP bytes. Output: the EOCD offset `number`.
- [L4131] `decodeZipText(bytes)`: Decodes a byte array as text for JSON extraction. Input: a byte array. Output: a decoded `string`.
- [L4135] `inflateZipBytes(bytes)`: Inflates compressed ZIP entry bytes using the browser `DecompressionStream` path. Input: compressed bytes. Output: `Promise<Uint8Array>`.
- [L4154] `readZipEntryBytes(bytes, centralEntry)`: Reads and decompresses one ZIP file entry. Input: the whole ZIP byte array and one central-directory entry descriptor. Output: `Promise<Uint8Array>`.
- [L4176] `extractJsonEntriesFromZip(entry)`: Reads a ZIP upload and turns all JSON members into import-entry objects. Input: a ZIP import entry. Output: `Promise<array>` of import-entry objects.
- [L4227] `expandZipImportEntries(importEntries)`: Replaces ZIP import entries with the JSON entries extracted from them. Input: an import-entry array. Output: `Promise<array>` of expanded import entries.
- [L4259] `readDroppedHandle(handle, parentPath)`: Recursively reads files and directories from File System Access handles during drag/drop. Input: a file-system handle and optional parent path. Output: `Promise<array>` of import entries.
- [L4289] `readDroppedFile(entry, parentPath)`: Reads one dropped file entry from the legacy drag/drop API. Input: a dropped entry and optional parent path. Output: `Promise<array>` of import entries.
- [L4301] `readAllDirectoryEntries(reader)`: Reads every batch from a directory reader into one array. Input: a directory reader. Output: `Promise<array>` of directory entries.
- [L4305] `readBatch()` (nested in `readAllDirectoryEntries`): Recursively reads one directory batch at a time until the reader is empty. Input: none. Output: `Promise<array>` via the outer helper flow.
- [L4324] `readDroppedEntry(entry, parentPath)`: Reads a dropped file or directory entry recursively. Input: a dropped entry and optional parent path. Output: `Promise<array>` of import entries.
- [L4350] `getImportEntriesFromDrop(event)`: Converts a drop event into import entries using modern handles when possible. Input: a drop event. Output: `Promise<array>` of import entries.
- [L4397] `processQuizFiles(fileList)`: Imports one or more dropped or selected quiz files into the library model. Input: a file list or import-entry collection. Output: `Promise<void>`.
- [L4502] `processQuizFile(file)`: Convenience wrapper for importing a single selected file. Input: one file object. Output: `Promise<void>`.
- [L4506] `onDrop(event)`: Handles the upload-card drop event end to end. Input: a drop event. Output: `Promise<void>`.
- [L4514] `initializeLibraryStorage()`: Chooses the storage backend, restores the saved model, and refreshes the library UI. Input: none. Output: `Promise<void>`.
- [L4557] `resetQuizState()`: Clears transient quiz-attempt state. Input: none. Output: none; resets runtime state.
- [L4569] `initializeUploadEvents()`: Wires the upload card, file pickers, drag/drop events, and demo/import entry points. Input: none. Output: none; registers DOM listeners.
- [L4585] `handleUploadDragEnter(event)` (nested in `initializeUploadEvents`): Activates the upload drop-zone styling when dragged files enter. Input: a drag event. Output: none.
- [L4596] `handleUploadDragOver(event)` (nested in `initializeUploadEvents`): Keeps drag-over behavior active and marks the upload target as droppable. Input: a drag event. Output: none.
- [L4609] `handleUploadDragLeave(event)` (nested in `initializeUploadEvents`): Deactivates drop-zone styling when the drag leaves the upload card. Input: a drag event. Output: none.
- [L4622] `handleUploadDrop(event)` (nested in `initializeUploadEvents`): Handles drag/drop file import from inside the upload card. Input: a drop event. Output: `Promise<void>`.
- [L4677] `initializeActionEvents()`: Registers click, input, resize, scroll, and keyboard handlers for the main app UI. Input: none. Output: none; registers DOM listeners.
- [L4806] `initializeAudioUnlockEvents()`: Registers the one-time user-interaction listeners used to unlock mobile audio playback. Input: none. Output: none; registers DOM listeners.
- [L4819] `initializeApp()`: Boots the app by wiring listeners, applying defaults, and loading saved state. Input: none. Output: `Promise<void>`.
