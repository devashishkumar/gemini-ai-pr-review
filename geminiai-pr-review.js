import { Octokit } from "@octokit/rest";
import axios from "axios";
import dotenv from 'dotenv';
dotenv.config();

const GITHUB_ACCESS_TOKEN = process.env.GITHUB_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OWNER = "devashishkumar";
const REPO = "gemini-ai-pr-review";
const PR_NUMBER = 1;
const octokit = new Octokit({ auth: GITHUB_ACCESS_TOKEN });

async function getPRDiff(owner, repo, pull_number) {
    const response = await octokit.pulls.get({
        owner,
        repo,
        pull_number,
        mediaType: { format: "diff" }
    });
    return response.data;
}

async function analyzeWithGemini(diff) {
    const response = await axios.post("https://api.gemini.ai/v1/analyze", {
        prompt: `Review this PR diff:\n${diff}`
    }, {
        headers: { Authorization: `Bearer ${GEMINI_API_KEY}` }
    });
    return response.data;
}

async function postReview(owner, repo, pull_number, body) {
    await octokit.pulls.createReview({
        owner,
        repo,
        pull_number,
        event: "COMMENT",
        body
    });
}


(async () => {
    const diff = await getPRDiff(OWNER, REPO, PR_NUMBER);
    console.log(diff);
})();


