// Time Entry Controller : used aggregate pipeline :(getSummaryByProject fun.)
$lookup → joins Project collection to get title
 $unwind → flatten array to object
 $project → return only:

projectId: original ObjectId

projectTitle: title of the project

totalDuration: sum of durations

entries: list of entries with only selected fields

$dateToString → formats timestamp to human-readable like "2025-07-14 12:20" (with timezone)