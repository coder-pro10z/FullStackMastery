const fs = require('fs');
const path = require('path');

const answersPath = path.join(__dirname, 'answers.json');
const questionsPath = path.join(__dirname, 'questions.json');
const backupPath = path.join(__dirname, 'answers_with_snippets.json');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY environment variable is not set.");
    console.error("Please run: $env:GEMINI_API_KEY='your_key' before running this script.");
    process.exit(1);
}

// Ensure backup file exists (copy of answers.json)
if (!fs.existsSync(backupPath)) {
    console.log("Creating backup answers_with_snippets.json...");
    fs.copyFileSync(answersPath, backupPath);
}

const answersData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

const args = process.argv.slice(2);
const limit = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : null;
const dryRun = args.includes('--dry-run');

async function callGeminiApi(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json"
        }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return JSON.parse(data.candidates[0].content.parts[0].text);
}

async function processAnswers() {
    let processedCount = 0;
    
    for (const answer of answersData.answers) {
        if (limit && processedCount >= limit) break;
        if (answer.code_snippets && answer.code_snippets.length > 0) continue; // Skip already processed

        const question = questionsData.questions.find(q => q.question_id === answer.question_id);
        if (!question) continue;

        console.log(`Processing: ${answer.question_id}`);

        const prompt = `You are a Senior Developer writing code for a Learning Management System.
Given this interview Q&A, generate practical, high-quality code snippets required to demonstrate the concept.

Question: ${question.question}
Tags: ${(question.tags || []).join(', ')}
Technical Explanation: ${answer.technical_explanation || ''}

Return a JSON array of snippets. If the answer is purely conceptual and no code is needed, return an empty array.
EACH snippet MUST have the following structure exactly:
{
    "language": "csharp", // or typescript, sql, etc.
    "label": "Snippet 1: Example description",
    "file_name": "Program.cs", // only if contextually relevant
    "code": "var x = 1;\\nconsole.log(x);", // the actual code
    "inject_after": "the exact short text snippet from Technical Explanation to render this snippet after"
}
Output ONLY the JSON array. Do NOT wrap it in markdown.`;

        try {
            const snippets = await callGeminiApi(prompt);
            
            if (snippets && Array.isArray(snippets) && snippets.length > 0) {
                answer.code_snippets = snippets;

                // Inject placeholders into technical_explanation
                let updatedExplanation = answer.technical_explanation;
                if (updatedExplanation) {
                   snippets.forEach((snippet, index) => {
                       if (snippet.inject_after && updatedExplanation.includes(snippet.inject_after)) {
                           const placeholder = `\n\n[[code_snippet_${index + 1}]]\n\n`;
                           updatedExplanation = updatedExplanation.replace(snippet.inject_after, snippet.inject_after + placeholder);
                       }
                   });
                   answer.technical_explanation = updatedExplanation;
                }
            }
        } catch (error) {
            console.error(`Error processing ${answer.question_id}:`, error.message);
        }

        processedCount++;
            
        if (!dryRun && processedCount % 10 === 0) {
             fs.writeFileSync(backupPath, JSON.stringify(answersData, null, 2), 'utf8');
             console.log(`Saved progress. Processed ${processedCount} answers.`);
        }

        // Rate limit pause for both success and error
        await new Promise(r => setTimeout(r, 2000)); // Increased to 2 seconds to avoid 429s
    }

    if (!dryRun) {
        fs.writeFileSync(backupPath, JSON.stringify(answersData, null, 2), 'utf8');
        console.log("Processing complete!");
    }
}

processAnswers();
