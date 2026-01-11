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
