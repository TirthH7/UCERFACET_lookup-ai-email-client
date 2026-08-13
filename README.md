# LOOKUP — AI-Powered Email Client

LOOKUP is a modern AI-assisted email client built for the Userfacet assessment.

The goal of the project is to combine the everyday workflow of an email client with practical AI capabilities that help users understand, organize, reply to, and compose emails more efficiently.

---

## Features

### Email Management

- Inbox
- Starred emails
- Drafts
- Sent emails
- Spam folder
- Trash
- Search emails
- Open and read emails
- Mark emails as read/unread
- Star/unstar emails
- Select individual emails
- Select all emails
- Bulk email actions
- Move emails to Trash
- Restore deleted emails
- Permanently delete emails
- Spam / unspam workflow
- Previous/next email navigation

### Compose

- Compose new emails
- To field
- CC/BCC support
- Subject
- Rich text formatting
- File attachments
- Attachment removal
- Draft saving
- Send emails
- Discard drafts

### AI Features

LOOKUP integrates AI directly into the email workflow.

#### 1. AI Email Summary

Summarizes the currently opened email into a concise form so users can understand long messages quickly.

#### 2. AI Key Details

Extracts useful information from an email, including important:

- Dates
- Times
- Deadlines
- Meetings
- Tasks
- Other relevant information

#### 3. Smart Reply

Generates short, context-aware reply suggestions based on the current email.

Users can select a suggested response and use it while replying.

#### 4. AI Compose

Users can provide a natural-language instruction describing the email they want to write.

Example:

> Write a professional email requesting a meeting with my professor next week.

LOOKUP generates an appropriate email draft from the instruction.

#### 5. AI Auto Categorization

Emails can be automatically categorized using AI based on their content.

#### 6. AI Next-Word Prediction

LOOKUP includes an optional next-word prediction feature while composing an email.

Because prediction can result in frequent API calls, it can be enabled or disabled by the user.

#### 7. Voice AI Prompt

Users can provide an AI Compose instruction through voice input where supported.

### AI Experience

AI operations have independent loading states so that running one AI feature does not incorrectly show another feature as loading.

LOOKUP also includes a custom animated AI processing experience to provide visual feedback while an AI request is being processed.

---

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- JSX
- CSS

### AI

- Userfacet AI API

### Development

- Node.js
- npm
- Git
- GitHub

---

## Project Structure

```text
lookup-ai-email-client/
│
├── public/
│
├── src/
│   ├── assets/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── .env
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
