# Gemini AI PR Review

A Node.js tool that uses Google's Gemini AI to automatically review GitHub pull requests. The tool fetches PR diffs, analyzes them for bugs, security issues, performance concerns, code quality, and best practices, then posts AI-generated reviews as comments.

## Features

- 🤖 Automated code review using Gemini AI
- 🔍 Focuses on bugs, security, performance, and code quality
- 📝 Posts reviews as GitHub PR comments
- 🧪 Dry run mode for testing
- 📋 Model listing functionality
- ⚙️ Configurable via environment variables

## Prerequisites

- Node.js (v14 or higher)
- GitHub Personal Access Token with repo permissions
- Google Gemini API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/devashishkumar/gemini-ai-pr-review.git
cd gemini-ai-pr-review
```

2. Install dependencies:
```bash
npm install
```

3. **Get a Gemini AI API Key**:
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key


4. Create a `.env` file in the root directory:
```env
GITHUB_TOKEN=your_github_personal_access_token
GEMINI_API_KEY=your_gemini_api_key
```

## Configuration

Set the following environment variables:

- `GITHUB_TOKEN`: Your GitHub Personal Access Token
- `GEMINI_API_KEY`: Your Google Gemini API key

## Usage

### Basic Review

Run the main script to review a PR:

```bash
node pr-review.js
```

This will:
1. Fetch the PR diff from the configured repository and PR number
2. Send it to Gemini AI for analysis
3. Post the review as a comment on the PR

### Dry Run

Test the review generation without posting:

```bash
node pr-review.js --dry
```

### List Available Models

Check available Gemini models:

```bash
node pr-review.js --list-models
```

## Configuration Options

Currently, the repository and PR number are hardcoded in the script. To review different PRs, modify these variables in `pr-review.js`:

```javascript
const OWNER = "your-github-username";
const REPO = "your-repository-name";
const PR_NUMBER = 123; // Your PR number
```

## Dependencies

- `@google/generative-ai`: Google Gemini AI SDK
- `@octokit/rest`: GitHub API client
- `axios`: HTTP client
- `dotenv`: Environment variable management
- `node-fetch`: Fetch API for Node.js

## How It Works

1. **Fetch PR Diff**: Uses GitHub API to get the diff of the pull request
2. **AI Analysis**: Sends the diff to Gemini AI with a prompt focusing on code quality aspects
3. **Review Generation**: AI generates a review with severity labels and suggestions
4. **Post Comment**: Publishes the review as a comment on the GitHub PR

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with dry run mode
5. Submit a pull request

## License

This project is for educational purposes. Check Google's terms of service for AI usage.