import fetch from "node-fetch";
import { Octokit } from "@octokit/rest";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();
const ACCESS_TOKEN = process.env.GITHUB_TOKEN;
console.log("Access Token:", ACCESS_TOKEN);

// ---- CONFIG ----
const OWNER = "devashishkumar";
const REPO = "gemini-ai-pr-review";
const PR_NUMBER = 1;
// ---- CLIENTS ----
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

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
async function geminiPrReview(diff) {
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

    const result = await model.generateContent(prompt);
    return result.response.text();
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
        const diff = await getPRDiff();
        console.log(diff);
    } catch (error) {
        console.error("Error", error);
    }
}

main();
