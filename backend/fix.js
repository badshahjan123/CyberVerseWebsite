const fs = require('fs');
let content = fs.readFileSync('c:/SZABIST/FYP/CyberVerseWeb-main/CyberVerseWeb-main/backend/utils/badgeRegistry.js', 'utf8');

// Find where context.roomId === "slug" is used and add roomId property to the badge object.
// Wait, a better way is to just add it inside the object explicitly.
// But there are 13 badges. Let me just run a regex on the file content.

content = content.replace(/evaluator: \(user, context\) =>[\s\S]*?context\.roomId === "(.*?)"/g, (match, p1) => {
    return `roomId: "${p1}",\n    ${match}`;
});

content = content.replace(/evaluator: \(user, context\) =>[\s\S]*?context\.labId === "(.*?)"/g, (match, p1) => {
    return `labId: "${p1}",\n    ${match}`;
});

fs.writeFileSync('c:/SZABIST/FYP/CyberVerseWeb-main/CyberVerseWeb-main/backend/utils/badgeRegistry.js', content);
console.log("Done");
