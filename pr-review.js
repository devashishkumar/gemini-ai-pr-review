import fetch from "node-fetch";
import { Octokit } from "@octokit/rest";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();
const ACCESS_TOKEN = process.env.GITHUB_TOKEN;

// ---- CONFIG ----
const OWNER = "devashishkumar";
const REPO = "gemini-ai-pr-review";
const PR_NUMBER = 1;
// ---- CLIENTS ----
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Use a supported, fully-qualified model name by default
const model = genAI.getGenerativeModel({ model: "models/gemini-pro-latest" });

// ---- FETCH PR DIFF ----
async function getPRDiff() {
    const response = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/pulls/${PR_NUMBER}`,
        {
            headers: {
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                Accept: "application/vnd.github.v3.diff",
            },
        }
    );

    return await response.text();
}


// ---- GEMINI REVIEW ----
async function reviewWithGemini(diff) {
    const prompt = `
You are a senior developer.
Review the following GitHub Pull Request.

Focus on:
- Bugs
- Security issues
- Performance
- Code quality
- Best practices

Provide:
- Severity labels
- Clear suggestions
- Short summary

DIFF:
${diff}
`;

    // Try a few generation methods depending on SDK/model support
    let result;
    if (model && typeof model.generateContent === "function") {
        result = await model.generateContent(prompt);
    } else if (model && typeof model.generate === "function") {
        // some SDK versions expose `generate` and expect an object
        result = await model.generate({ input: prompt });
    } else if (genAI && typeof genAI.generate === "function") {
        result = await genAI.generate({ model: "models/gemini-1.5-pro", input: prompt });
    } else if (genAI && typeof genAI.generateText === "function") {
        result = await genAI.generateText({ model: "models/gemini-1.5-pro", input: prompt });
    } else {
        throw new Error("No supported generation method found on Gemini client/model");
    }

    // Robustly extract text from different response shapes
    if (result && typeof result.response?.text === "function") {
        return result.response.text();
    }
    if (result && result.output && Array.isArray(result.output) && result.output[0]) {
        // some responses contain outputs array with content or text
        return result.output[0].content ?? result.output[0].text ?? JSON.stringify(result.output[0]);
    }
    if (result && typeof result.text === "string") {
        return result.text;
    }
    if (result && typeof result === "string") {
        return result;
    }
    return JSON.stringify(result);
}


// ---- LIST MODELS ----
async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models${apiKey ? `?key=${apiKey}` : ''}`;
    const headers = apiKey ? { Accept: 'application/json' } : { Authorization: `Bearer ${process.env.GEMINI_API_KEY}`, Accept: 'application/json' };

    const res = await fetch(url, { headers });
    let body;
    try {
        body = await res.json();
    } catch (e) {
        throw new Error(`ListModels returned non-JSON response: ${e.message}`);
    }

    if (!res.ok) {
        throw new Error(`ListModels failed: ${res.status} ${JSON.stringify(body)}`);
    }

    const models = body.models || [];
    console.log('Found', models.length, 'models:');
    for (const m of models) {
        console.log('-', m.name, m.displayName ? `(${m.displayName})` : '');
        if (m.supportedGenerationMethods) console.log('  supportedGenerationMethods:', JSON.stringify(m.supportedGenerationMethods));
        if (m.supportedMethods) console.log('  supportedMethods:', JSON.stringify(m.supportedMethods));
        if (m.metadata) console.log('  metadata keys:', Object.keys(m.metadata).join(', '));
    }

    return models;
}

// ---- POST PR COMMENT ----
async function shareReview(comment) {
    await octokit.issues.createComment({
        owner: OWNER,
        repo: REPO,
        issue_number: PR_NUMBER,
        body: `## 🤖 Gemini AI Code Review\n\n${comment}`,
    });
}

// ---- MAIN ----
async function main() {
    try {
        // CLI helper: `--list-models` will call the API and exit
        if (process.argv.includes('--list-models')) {
            await listModels();
            return;
        }
        // `--dry` will run generation but not post the comment (prints to stdout)
        const isDry = process.argv.includes('--dry');
        const diff = await getPRDiff();
        if (isDry) {
            console.log('--- DRY RUN: Generated review (not posted) ---\n');
            console.log(diff)
        } else {
            const review = await reviewWithGemini(diff);
            await shareReview(review);
            console.log("Review posted successfully.");
        }
    } catch (error) {
        console.error("Error", error);
    }
}

main();
