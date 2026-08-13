import { useRef, useState } from "react";
import "./App.css";
import mockEmails from "./data/mockEmails";
import { callAI } from "./api/ai";

/* =========================================================
   HELPERS
========================================================= */

function formatFileSize(bytes) {
  if (!bytes) return "";

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* =========================================================
   APP
========================================================= */

function App() {
  /* =======================================================
     EMAIL DATA
  ======================================================= */

  const [emails, setEmails] = useState(mockEmails);
  const [drafts, setDrafts] = useState([]);
  const [sent, setSent] = useState([]);
  const [trash, setTrash] = useState([]);
  const [spam, setSpam] = useState([]);

  /* =======================================================
     GENERAL UI
  ======================================================= */

  const [activeFolder, setActiveFolder] =
    useState("inbox");

  const [selectedEmail, setSelectedEmail] =
    useState(null);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [darkMode, setDarkMode] =
    useState(true);

  const [selectMode, setSelectMode] =
    useState(false);

  const [selectedIds, setSelectedIds] =
    useState([]);

  const [showActionMenu, setShowActionMenu] =
    useState(false);

  const [showReaderMenu, setShowReaderMenu] =
    useState(false);

  const [showCompose, setShowCompose] =
    useState(false);

  const [showCcBcc, setShowCcBcc] =
    useState(false);

  const [toast, setToast] =
    useState("");

  const [editingDraftId, setEditingDraftId] =
    useState(null);

  /* =======================================================
     AI
  ======================================================= */

  // null
  // "summary"
  // "reply"
  // "details"
  // "categorize"
  // "compose"

  const [aiOperation, setAiOperation] =
    useState(null);

  const [aiSummary, setAiSummary] =
    useState("");

  const [smartReplies, setSmartReplies] =
    useState([]);

  const [keyDetails, setKeyDetails] =
    useState([]);

  const [wordSuggestion, setWordSuggestion] =
    useState("");

  // AI next-word prediction is OFF by default to conserve API calls.
  const [wordPredictionEnabled, setWordPredictionEnabled] =
    useState(false);

  const predictionTimerRef = useRef(null);
  const lastPredictionAtRef = useRef(0);
  const composeBodyRef = useRef("");

  const [showAIPrompt, setShowAIPrompt] =
    useState(false);

  const [aiPrompt, setAiPrompt] =
    useState("");

  const [isListening, setIsListening] =
    useState(false);

  const [showAccountMenu, setShowAccountMenu] =
    useState(false);

  /* =======================================================
     COMPOSE
  ======================================================= */

  const [composeData, setComposeData] =
    useState({
      to: "",
      cc: "",
      bcc: "",
      subject: "",
      body: "",
      attachments: [],
    });

  /* =======================================================
     TOAST
  ======================================================= */

  function showToast(message) {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2200);
  }

  /* =======================================================
     CURRENT FOLDER
  ======================================================= */

  function getCurrentEmails() {
    switch (activeFolder) {
      case "starred":
        return emails.filter(
          (email) => email.starred
        );

      case "drafts":
        return drafts;

      case "sent":
        return sent;

      case "trash":
        return trash;

      case "spam":
        return spam;

      default:
        return emails;
    }
  }

  const currentFolderEmails =
    getCurrentEmails();

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredEmails =
    currentFolderEmails.filter((email) => {
      const search =
        searchTerm
          .toLowerCase()
          .trim();

      if (!search) return true;

      const senderName =
        email.sender?.name || "";

      const senderEmail =
        email.sender?.email || "";

      const subject =
        email.subject || "";

      const preview =
        email.preview || "";

      const body =
        email.body || "";

      const labels =
        email.labels || [];

      return (
        senderName
          .toLowerCase()
          .includes(search) ||
        senderEmail
          .toLowerCase()
          .includes(search) ||
        subject
          .toLowerCase()
          .includes(search) ||
        preview
          .toLowerCase()
          .includes(search) ||
        body
          .toLowerCase()
          .includes(search) ||
        labels.some((label) =>
          label
            .toLowerCase()
            .includes(search)
        )
      );
    });

  /* =======================================================
     FOLDER CHANGE
  ======================================================= */

  function changeFolder(folder) {
    setActiveFolder(folder);

    setSelectedEmail(null);

    setSelectedIds([]);

    setSelectMode(false);

    setShowActionMenu(false);

    setShowReaderMenu(false);

    setSearchTerm("");

    setAiSummary("");

    setSmartReplies([]);

    setKeyDetails([]);
    setWordSuggestion("");

    setAiOperation(null);
  }

  /* =======================================================
     OPEN EMAIL
  ======================================================= */

  function openEmail(email) {
    if (selectMode) {
      toggleSelection(email.id);
      return;
    }

    if (activeFolder === "drafts") {
      openDraft(email);
      return;
    }

    setSelectedEmail(email);

    setAiSummary("");

    setSmartReplies([]);

    setKeyDetails([]);
    setWordSuggestion("");

    setAiOperation(null);

    setShowReaderMenu(false);

    /*
      Inbox emails become read when opened.
    */

    if (
      activeFolder === "inbox" &&
      !email.read
    ) {
      markSingleRead(email.id);

      setSelectedEmail({
        ...email,
        read: true,
      });
    }
  }

  /* =======================================================
     EMAIL NAVIGATION
  ======================================================= */

  function navigateEmail(direction) {
    if (!selectedEmail) return;

    const currentIndex =
      filteredEmails.findIndex(
        (email) =>
          email.id ===
          selectedEmail.id
      );

    if (currentIndex === -1) return;

    let newIndex =
      currentIndex + direction;

    /*
      Wrap around when reaching
      the first / last email.
    */

    if (newIndex < 0) {
      newIndex =
        filteredEmails.length - 1;
    }

    if (
      newIndex >=
      filteredEmails.length
    ) {
      newIndex = 0;
    }

    const nextEmail =
      filteredEmails[newIndex];

    setSelectedEmail(nextEmail);

    setAiSummary("");

    setSmartReplies([]);

    setKeyDetails([]);
    setWordSuggestion("");

    setAiOperation(null);

    setShowReaderMenu(false);

    if (
      activeFolder === "inbox" &&
      !nextEmail.read
    ) {
      markSingleRead(nextEmail.id);

      setSelectedEmail({
        ...nextEmail,
        read: true,
      });
    }
  }

  /* =======================================================
     SELECTION
  ======================================================= */

  function toggleSelection(id) {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        const updated =
          current.filter(
            (item) => item !== id
          );

        if (updated.length === 0) {
          setSelectMode(false);
        }

        return updated;
      }

      return [...current, id];
    });

    setSelectMode(true);
  }

  function toggleSelectAll() {
    const visibleIds =
      filteredEmails.map(
        (email) => email.id
      );

    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) =>
        selectedIds.includes(id)
      );

    if (allSelected) {
      setSelectedIds((current) =>
        current.filter(
          (id) =>
            !visibleIds.includes(id)
        )
      );
    } else {
      setSelectedIds((current) => [
        ...new Set([
          ...current,
          ...visibleIds,
        ]),
      ]);
    }
  }

  function exitSelectMode() {
    setSelectMode(false);

    setSelectedIds([]);

    setShowActionMenu(false);
  }

  const allVisibleSelected =
    filteredEmails.length > 0 &&
    filteredEmails.every((email) =>
      selectedIds.includes(email.id)
    );

  /* =======================================================
     READ / UNREAD
  ======================================================= */

  function markSingleRead(id) {
    setEmails((current) =>
      current.map((email) =>
        email.id === id
          ? {
              ...email,
              read: true,
            }
          : email
      )
    );
  }

  function toggleSingleRead(id) {
    const toggle = (list) =>
      list.map((email) =>
        email.id === id
          ? {
              ...email,
              read: !email.read,
            }
          : email
      );

    setEmails(toggle);
    setSent(toggle);
    setDrafts(toggle);

    setSelectedEmail((current) =>
      current?.id === id
        ? {
            ...current,
            read: !current.read,
          }
        : current
    );
  }

  /* =======================================================
     STAR
  ======================================================= */

  function toggleStar(id) {
    const toggle = (list) =>
      list.map((email) =>
        email.id === id
          ? {
              ...email,
              starred: !email.starred,
            }
          : email
      );

    setEmails(toggle);
    setSent(toggle);
    setDrafts(toggle);

    setSelectedEmail((current) =>
      current?.id === id
        ? {
            ...current,
            starred: !current.starred,
          }
        : current
    );
  }

  /* =======================================================
     MOVE TO TRASH
  ======================================================= */

  function moveToTrash(id) {
    let item = null;

    if (
      activeFolder === "inbox" ||
      activeFolder === "starred"
    ) {
      item = emails.find(
        (email) => email.id === id
      );

      if (item) {
        setEmails((current) =>
          current.filter(
            (email) => email.id !== id
          )
        );
      }
    }

    if (activeFolder === "sent") {
      item = sent.find(
        (email) => email.id === id
      );

      if (item) {
        setSent((current) =>
          current.filter(
            (email) => email.id !== id
          )
        );
      }
    }

    if (activeFolder === "drafts") {
      item = drafts.find(
        (draft) => draft.id === id
      );

      if (item) {
        setDrafts((current) =>
          current.filter(
            (draft) => draft.id !== id
          )
        );
      }
    }

    if (activeFolder === "spam") {
      item = spam.find(
        (email) => email.id === id
      );

      if (item) {
        setSpam((current) =>
          current.filter(
            (email) => email.id !== id
          )
        );
      }
    }

    if (item) {
      const mailbox =
        activeFolder === "starred"
          ? "inbox"
          : activeFolder;

      setTrash((current) => [
        ...current,
        {
          ...item,
          mailbox,
          deletedAt:
            new Date().toISOString(),
        },
      ]);
    }

    setSelectedEmail(null);

    setShowReaderMenu(false);

    showToast("Moved to trash");
  }

  /* =======================================================
     BULK MOVE TO TRASH
  ======================================================= */

  function deleteSelected() {
    if (selectedIds.length === 0) return;

    const ids = selectedIds;

    const itemsToTrash = [
      ...emails.filter((email) =>
        ids.includes(email.id)
      ).map((item) => ({ item, mailbox: "inbox" })),

      ...sent.filter((email) =>
        ids.includes(email.id)
      ).map((item) => ({ item, mailbox: "sent" })),

      ...drafts.filter((email) =>
        ids.includes(email.id)
      ).map((item) => ({ item, mailbox: "drafts" })),

      ...spam.filter((email) =>
        ids.includes(email.id)
      ).map((item) => ({ item, mailbox: "spam" })),
    ];

    setTrash((current) => [
      ...current,
      ...itemsToTrash.map(({ item, mailbox }) => ({
        ...item,
        mailbox,
        deletedAt:
          new Date().toISOString(),
      })),
    ]);

    setEmails((current) =>
      current.filter(
        (email) =>
          !ids.includes(email.id)
      )
    );

    setSent((current) =>
      current.filter(
        (email) =>
          !ids.includes(email.id)
      )
    );

    setDrafts((current) =>
      current.filter(
        (draft) =>
          !ids.includes(draft.id)
      )
    );

    setSpam((current) =>
      current.filter(
        (email) => !ids.includes(email.id)
      )
    );

    exitSelectMode();

    showToast(
      ids.length === 1
        ? "Moved to trash"
        : `${ids.length} messages moved to trash`
    );
  }

  /* =======================================================
     PERMANENT DELETE - SINGLE
  ======================================================= */

  function permanentlyDelete(id) {
    setTrash((current) =>
      current.filter(
        (email) => email.id !== id
      )
    );

    setSelectedEmail(null);

    setShowReaderMenu(false);

    showToast("Deleted permanently");
  }

  /* =======================================================
     PERMANENT DELETE - BULK
  ======================================================= */

  function permanentlyDeleteSelected() {
    if (selectedIds.length === 0) {
      return;
    }

    const count =
      selectedIds.length;

    setTrash((current) =>
      current.filter(
        (email) =>
          !selectedIds.includes(
            email.id
          )
      )
    );

    exitSelectMode();

    showToast(
      count === 1
        ? "Deleted permanently"
        : `${count} messages deleted permanently`
    );
  }

  /* =======================================================
     BULK READ
  ======================================================= */

  function markSelectedRead() {
    const ids = selectedIds;

    const markRead = (list) =>
      list.map((email) =>
        ids.includes(email.id)
          ? {
              ...email,
              read: true,
            }
          : email
      );

    setEmails(markRead);
    setSent(markRead);
    setDrafts(markRead);

    exitSelectMode();

    showToast("Marked as read");
  }

  function markSelectedUnread() {
    const ids = selectedIds;

    const markUnread = (list) =>
      list.map((email) =>
        ids.includes(email.id)
          ? {
              ...email,
              read: false,
            }
          : email
      );

    setEmails(markUnread);
    setSent(markUnread);
    setDrafts(markUnread);

    exitSelectMode();

    showToast("Marked as unread");
  }

  /* =======================================================
     BULK STAR
  ======================================================= */

  function starSelected() {
    const ids = selectedIds;

    const star = (list) =>
      list.map((email) =>
        ids.includes(email.id)
          ? {
              ...email,
              starred: true,
            }
          : email
      );

    setEmails(star);
    setSent(star);
    setDrafts(star);

    exitSelectMode();

    showToast("Starred");
  }

  /* =======================================================
     MARK AS SPAM
  ======================================================= */

  function markAsSpam(id) {
    let item = null;

    if (activeFolder === "inbox" || activeFolder === "starred") {
      item = emails.find((email) => email.id === id);
      if (item) {
        setEmails((current) => current.filter((email) => email.id !== id));
      }
    } else if (activeFolder === "sent") {
      item = sent.find((email) => email.id === id);
      if (item) {
        setSent((current) => current.filter((email) => email.id !== id));
      }
    } else if (activeFolder === "spam") {
      return;
    }

    if (!item) return;

    const spamItem = {
      ...item,
      mailbox: "spam",
      labels: Array.from(new Set([...(item.labels || []).filter((label) => label !== "Spam"), "Spam"])),
    };

    setSpam((current) => [spamItem, ...current]);
    setSelectedEmail(null);
    setShowReaderMenu(false);
    showToast("Moved to spam");
  }

  function markSelectedSpam() {
    if (selectedIds.length === 0) return;

    const ids = selectedIds;
    const items = [
      ...emails.filter((email) => ids.includes(email.id)),
      ...sent.filter((email) => ids.includes(email.id)),
    ];

    if (!items.length) return;

    const spamItems = items.map((item) => ({
      ...item,
      mailbox: "spam",
      labels: Array.from(new Set([...(item.labels || []).filter((label) => label !== "Spam"), "Spam"])),
    }));

    setSpam((current) => [...spamItems, ...current]);
    setEmails((current) => current.filter((email) => !ids.includes(email.id)));
    setSent((current) => current.filter((email) => !ids.includes(email.id)));
    exitSelectMode();
    showToast(ids.length === 1 ? "Moved to spam" : `${ids.length} messages moved to spam`);
  }

  /* =======================================================
     RESTORE FROM TRASH
  ======================================================= */

  function restoreEmail(id) {
    const item = trash.find(
      (email) => email.id === id
    );

    if (!item) return;

    const {
      deletedAt,
      ...restored
    } = item;

    if (restored.mailbox === "spam") {
      setSpam((current) => [restored, ...current]);
    } else if (
      restored.labels?.includes(
        "Draft"
      )
    ) {
      setDrafts((current) => [
        restored,
        ...current,
      ]);
    } else if (
      restored.labels?.includes(
        "Sent"
      )
    ) {
      setSent((current) => [
        restored,
        ...current,
      ]);
    } else {
      setEmails((current) => [
        restored,
        ...current,
      ]);
    }

    setTrash((current) =>
      current.filter(
        (email) => email.id !== id
      )
    );

    setSelectedEmail(null);

    showToast("Restored");
  }

  /* =======================================================
     RESTORE FROM TRASH - BULK
  ======================================================= */

  function restoreSelectedEmails() {
    if (selectedIds.length === 0) return;

    const selectedTrash = trash.filter((email) =>
      selectedIds.includes(email.id)
    );

    if (selectedTrash.length === 0) return;

    const restoredItems = selectedTrash.map((item) => {
      const { deletedAt, ...restored } = item;
      return restored;
    });

    const restoredDrafts = restoredItems.filter((item) =>
      item.labels?.includes("Draft")
    );
    const restoredSent = restoredItems.filter((item) =>
      item.labels?.includes("Sent")
    );
    const restoredSpam = restoredItems.filter((item) =>
      item.mailbox === "spam"
    );
    const restoredInbox = restoredItems.filter(
      (item) =>
        item.mailbox !== "spam" &&
        !item.labels?.includes("Draft") &&
        !item.labels?.includes("Sent")
    );

    if (restoredDrafts.length) {
      setDrafts((current) => [
        ...restoredDrafts,
        ...current,
      ]);
    }

    if (restoredSent.length) {
      setSent((current) => [
        ...restoredSent,
        ...current,
      ]);
    }

    if (restoredInbox.length) {
      setEmails((current) => [
        ...restoredInbox,
        ...current,
      ]);
    }

    if (restoredSpam.length) {
      setSpam((current) => [
        ...restoredSpam,
        ...current,
      ]);
    }

    setTrash((current) =>
      current.filter(
        (email) => !selectedIds.includes(email.id)
      )
    );

    const count = selectedTrash.length;
    exitSelectMode();
    showToast(
      count === 1
        ? "Restored"
        : `${count} messages restored`
    );
  }

  /* =======================================================
     ATTACHMENT DOWNLOAD
  ======================================================= */

  function downloadAttachment(file) {
    if (!file) return;

    /*
      Case 1:
      Real URL supplied by mock data
    */

    if (file.url) {
      const link =
        document.createElement(
          "a"
        );

      link.href = file.url;

      link.download =
        file.name ||
        "attachment";

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      return;
    }

    /*
      Case 2:
      Uploaded File / Blob
    */

    if (
      file.file instanceof Blob
    ) {
      const url =
        URL.createObjectURL(
          file.file
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = url;

      link.download =
        file.name ||
        "attachment";

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

      return;
    }

    /*
      Case 3:
      Base64/data URL
    */

    if (file.dataUrl) {
      const link =
        document.createElement(
          "a"
        );

      link.href =
        file.dataUrl;

      link.download =
        file.name ||
        "attachment";

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      return;
    }

    showToast(
      "Attachment file is not available"
    );
  }

  /* =======================================================
     AI SUMMARY
  ======================================================= */

  async function summarizeEmail() {
    if (!selectedEmail) return;

    try {
      setAiOperation("summary");

      setAiSummary("");

      setSmartReplies([]);

      const result =
        await callAI([
          {
            role: "system",
            content:
              "You are an email assistant. Summarize emails clearly and concisely. Mention important actions, dates, deadlines, people and decisions when present. Keep the summary under 100 words.",
          },

          {
            role: "user",
            content: `
Subject: ${selectedEmail.subject}

From: ${
              selectedEmail.sender?.name ||
              ""
            }

Email:
${selectedEmail.body || ""}
            `,
          },
        ]);

      setAiSummary(
        result.trim()
      );

      showToast(
        "✨ Summary ready"
      );
    } catch (error) {
      showToast(
        error.message ||
          "AI summary failed"
      );
    } finally {
      setAiOperation(null);
    }
  }

  /* =======================================================
     SMART REPLY
  ======================================================= */

  async function generateSmartReplies() {
    if (!selectedEmail) return;

    try {
      setAiOperation("reply");

      setSmartReplies([]);

      setAiSummary("");

      const result =
        await callAI([
          {
            role: "system",
            content:
              "You generate practical email replies. Return exactly 3 reply suggestions. Separate each reply using the delimiter |||. Do not number them. Do not add explanations.",
          },

          {
            role: "user",
            content: `
Subject: ${selectedEmail.subject}

From: ${
              selectedEmail.sender?.name ||
              ""
            }

Email:
${selectedEmail.body || ""}

Generate three natural replies appropriate for this email.
            `,
          },
        ]);

      const replies =
        result
          .split("|||")
          .map((reply) =>
            reply.trim()
          )
          .filter(Boolean)
          .slice(0, 3);

      setSmartReplies(
        replies
      );

      showToast(
        "💬 Replies ready"
      );
    } catch (error) {
      showToast(
        error.message ||
          "Smart reply failed"
      );
    } finally {
      setAiOperation(null);
    }
  }

  /* =======================================================
     KEY DETAILS
  ======================================================= */

  async function autoCategorizeEmail() {
    if (!selectedEmail) return;

    try {
      setAiOperation("categorize");

      const result = await callAI([
        {
          role: "system",
          content:
            "Classify the email into exactly one category: PRIMARY, WORK, PERSONAL, FINANCE, PROMOTIONS, SOCIAL, UPDATES, or SPAM. Return only the category word.",
        },
        {
          role: "user",
          content: `Subject: ${selectedEmail.subject}\n\nFrom: ${selectedEmail.sender?.name || ""} <${selectedEmail.sender?.email || ""}>\n\nEmail:\n${selectedEmail.body || ""}`,
        },
      ]);

      const category = result.trim().toUpperCase().match(/PRIMARY|WORK|PERSONAL|FINANCE|PROMOTIONS|SOCIAL|UPDATES|SPAM/)?.[0] || "PRIMARY";

      if (category === "SPAM") {
        const source = selectedEmail;
        setEmails((current) => current.filter((email) => email.id !== source.id));
        setSent((current) => current.filter((email) => email.id !== source.id));
        setSpam((current) => [
          {
            ...source,
            mailbox: "spam",
            labels: Array.from(new Set([...(source.labels || []).filter((label) => label !== "Spam"), "Spam"])),
          },
          ...current,
        ]);
        setSelectedEmail(null);
        showToast("🤖 AI moved the email to Spam");
      } else {
        const updateCategory = (list) =>
          list.map((email) =>
            email.id === selectedEmail.id
              ? {
                  ...email,
                  category,
                  labels: Array.from(new Set([...(email.labels || []).filter((label) => !["Primary", "Work", "Personal", "Finance", "Promotions", "Social", "Updates"].includes(label)), category.charAt(0) + category.slice(1).toLowerCase()])),
                }
              : email
          );

        setEmails(updateCategory);
        setSent(updateCategory);
        setSpam(updateCategory);
        setSelectedEmail((current) =>
          current ? {
            ...current,
            category,
            labels: Array.from(new Set([...(current.labels || []).filter((label) => !["Primary", "Work", "Personal", "Finance", "Promotions", "Social", "Updates"].includes(label)), category.charAt(0) + category.slice(1).toLowerCase()])),
          } : current
        );
        showToast(`🤖 AI categorized as ${category.charAt(0) + category.slice(1).toLowerCase()}`);
      }
    } catch (error) {
      showToast(error.message || "AI categorization failed");
    } finally {
      setAiOperation(null);
    }
  }

  /* =======================================================
     NEXT WORD PREDICTION
  ======================================================= */

  function scheduleWordPrediction(value) {
    setWordSuggestion("");

    if (predictionTimerRef.current) {
      clearTimeout(predictionTimerRef.current);
    }

    const text = value.trimEnd();
    if (text.length < 18 || !/\s$/.test(value)) return;

    const now = Date.now();
    if (now - lastPredictionAtRef.current < 2500) return;

    predictionTimerRef.current = setTimeout(async () => {
      const currentText = composeBodyRef.current;
      if (currentText !== value) return;

      lastPredictionAtRef.current = Date.now();

      try {
        const result = await callAI([
          {
            role: "system",
            content: "Predict the most natural next word or very short phrase for an email. Return only the prediction, maximum 3 words, no punctuation and no explanation. If no useful prediction is possible, return NONE.",
          },
          {
            role: "user",
            content: value.slice(-300),
          },
        ]);

        const suggestion = result.trim().replace(/^[\"']|[\"']$/g, "");
        if (suggestion && suggestion.toUpperCase() !== "NONE") {
          setWordSuggestion(suggestion);
        }
      } catch {
        // Prediction is optional; don't interrupt writing if it fails.
      }
    }, 650);
  }

  function acceptWordSuggestion() {
    if (!wordSuggestion) return;

    setComposeData((current) => {
      const body = `${current.body}${wordSuggestion}${/\s$/.test(current.body) ? "" : " "}`;
      composeBodyRef.current = body;
      return { ...current, body };
    });
    setWordSuggestion("");
  }

  async function extractKeyDetails() {
    if (!selectedEmail) return;

    try {
      setAiOperation("details");
      setKeyDetails([]);
      setAiSummary("");
      setSmartReplies([]);

      const result =
        await callAI([
          {
            role: "system",
            content:
              "You are an email intelligence assistant. Extract the most useful details from the email. Return exactly five items separated by ||| using this format: PEOPLE::value|||DATES::value|||DEADLINES::value|||ACTIONS::value|||IMPORTANT::value. If a category is not present, write None. Keep each value concise. Do not add markdown, numbering or explanations.",
          },
          {
            role: "user",
            content: `
Subject: ${selectedEmail.subject}

From: ${
              selectedEmail.sender?.name ||
              ""
            }

Email:
${selectedEmail.body || ""}
            `,
          },
        ]);

      const details = result
        .split("|||")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => {
          const [label, ...valueParts] =
            item.split("::");

          return {
            label: label?.trim() || "DETAIL",
            value:
              valueParts.join("::").trim() ||
              "None",
          };
        })
        .filter((item) => item.value);

      setKeyDetails(details.slice(0, 5));
      showToast("🔎 Key details ready");
    } catch (error) {
      showToast(
        error.message ||
          "Key details failed"
      );
    } finally {
      setAiOperation(null);
    }
  }

  /* =======================================================
     AI COMPOSE PROMPT
  ======================================================= */

  function openAIPrompt() {
    setAiPrompt("");
    setShowAIPrompt(true);
  }

  function startVoicePrompt() {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast(
        "Voice input is not supported in this browser"
      );
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () =>
      setIsListening(true);

    recognition.onresult = (event) => {
      const transcript =
        event.results?.[0]?.[0]?.transcript ||
        "";

      setAiPrompt((current) =>
        current
          ? `${current} ${transcript}`
          : transcript
      );
    };

    recognition.onerror = () => {
      setIsListening(false);
      showToast("Couldn't hear that. Try again.");
    };

    recognition.onend = () =>
      setIsListening(false);

    recognition.start();
  }

  async function generateAICompose() {
    const prompt = aiPrompt.trim();

    if (!prompt) {
      showToast("Tell AI what you want to write");
      return;
    }

    try {
      setAiOperation("compose");
      setShowAIPrompt(false);

      const result =
        await callAI([
          {
            role: "system",
            content:
              "You are an expert professional email writer. Write only the email body. Do not include a subject or commentary. Follow the requested tone and intent.",
          },
          {
            role: "user",
            content: prompt,
          },
        ]);

      setComposeData(
        (current) => ({
          ...current,
          body: result.trim(),
        })
      );

      showToast(
        "✨ AI drafted your email"
      );
    } catch (error) {
      showToast(
        error.message ||
          "AI compose failed"
      );
    } finally {
      setAiOperation(null);
    }
  }

  /* =======================================================
     COMPOSE
  ======================================================= */

  function openCompose() {
    setEditingDraftId(null);

    setComposeData({
      to: "",
      cc: "",
      bcc: "",
      subject: "",
      body: "",
      attachments: [],
    });
    composeBodyRef.current = "";
    setWordSuggestion("");

    setShowCcBcc(false);

    setShowCompose(true);
  }

  function openDraft(draft) {
    setEditingDraftId(
      draft.id
    );

    setComposeData({
      to: draft.to || "",
      cc: draft.cc || "",
      bcc: draft.bcc || "",
      subject:
        draft.subject || "",
      body: draft.body || "",

      attachments:
        draft.attachments || [],
    });
    composeBodyRef.current = draft.body || "";
    setWordSuggestion("");

    setShowCcBcc(
      Boolean(
        draft.cc ||
          draft.bcc
      )
    );

    setShowCompose(true);
  }

  /* =======================================================
     SAVE DRAFT
  ======================================================= */

  function saveDraft() {
    const hasContent =
      composeData.to.trim() ||
      composeData.cc.trim() ||
      composeData.bcc.trim() ||
      composeData.subject.trim() ||
      composeData.body.trim() ||
      composeData.attachments
        .length;

    if (!hasContent) {
      setShowCompose(false);

      return;
    }

    const draft = {
      id:
        editingDraftId ||
        `draft-${Date.now()}`,

      sender: {
        name: "Tirthankar Halder",

        email:
          "tirthankar@company.com",

        initials: "TH",

        avatarColor: "blue",
      },

      subject:
        composeData.subject ||
        "(no subject)",

      preview:
        composeData.body.slice(
          0,
          100
        ) ||
        "Draft message",

      body:
        composeData.body,

      timestamp: "Draft",

      date: "Draft",

      read: true,

      starred: false,

      labels: ["Draft"],

      attachments:
        composeData.attachments,

      to: composeData.to,

      cc: composeData.cc,

      bcc: composeData.bcc,
    };

    setDrafts((current) => {
      const exists =
        current.some(
          (item) =>
            item.id ===
            draft.id
        );

      if (exists) {
        return current.map(
          (item) =>
            item.id ===
            draft.id
              ? draft
              : item
        );
      }

      return [
        draft,
        ...current,
      ];
    });

    setShowCompose(false);

    setActiveFolder("drafts");

    showToast(
      editingDraftId
        ? "Draft updated"
        : "Draft saved"
    );
  }

  /* =======================================================
     DELETE DRAFT
  ======================================================= */

  function deleteDraft(id) {
    const draft =
      drafts.find(
        (item) =>
          item.id === id
      );

    if (draft) {
      setTrash((current) => [
        ...current,
        {
          ...draft,
          deletedAt:
            new Date().toISOString(),
        },
      ]);
    }

    setDrafts((current) =>
      current.filter(
        (draft) =>
          draft.id !== id
      )
    );

    setShowCompose(false);

    showToast(
      "Draft moved to trash"
    );
  }

  /* =======================================================
     ATTACHMENTS
  ======================================================= */

  function handleAttachments(
    event
  ) {
    const files =
      Array.from(
        event.target.files
      );

    const attachments =
      files.map((file) => ({
        id:
          `${file.name}-${file.size}-${Date.now()}`,

        name: file.name,

        size:
          formatFileSize(
            file.size
          ),

        type:
          file.type ||
          "application/octet-stream",

        /*
          Keep actual uploaded
          File object.
        */

        file,
      }));

    setComposeData(
      (current) => ({
        ...current,

        attachments: [
          ...current.attachments,
          ...attachments,
        ],
      })
    );

    /*
      Allows selecting the
      same file again later.
    */

    event.target.value = "";
  }

  function removeAttachment(
    id
  ) {
    setComposeData(
      (current) => ({
        ...current,

        attachments:
          current.attachments.filter(
            (file) =>
              file.id !== id
          ),
      })
    );
  }

  /* =======================================================
     SEND
  ======================================================= */

  function sendEmail(event) {
    event.preventDefault();

    if (
      !composeData.to.trim() ||
      !composeData.subject.trim() ||
      !composeData.body.trim()
    ) {
      showToast(
        "Please complete To, Subject and Message"
      );

      return;
    }

    const newEmail = {
      id:
        `sent-${Date.now()}`,

      sender: {
        name: "Tirthankar Halder",

        email:
          "tirthankar@company.com",

        initials: "TH",

        avatarColor: "blue",
      },

      subject:
        composeData.subject,

      preview:
        composeData.body.slice(
          0,
          100
        ),

      body:
        composeData.body,

      timestamp:
        "Just now",

      date:
        "Just now",

      read: true,

      starred: false,

      labels: ["Sent"],

      attachments:
        composeData.attachments,

      to: composeData.to,

      cc: composeData.cc,

      bcc: composeData.bcc,
    };

    setSent((current) => [
      newEmail,
      ...current,
    ]);

    if (editingDraftId) {
      setDrafts((current) =>
        current.filter(
          (draft) =>
            draft.id !==
            editingDraftId
        )
      );
    }

    setComposeData({
      to: "",
      cc: "",
      bcc: "",
      subject: "",
      body: "",
      attachments: [],
    });

    setEditingDraftId(null);

    setShowCompose(false);

    setActiveFolder("sent");

    setSelectedEmail(
      newEmail
    );

    showToast(
      "Message sent"
    );
  }

  /* =======================================================
     FORMATTING
  ======================================================= */

  function insertFormatting(
    type
  ) {
    const textarea =
      document.getElementById(
        "compose-message"
      );

    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? start;
    const selectedText =
      composeData.body.slice(start, end);

    let formatted = selectedText;
    let cursorStart = start;
    let cursorEnd = start;

    if (type === "bold") {
      const inner =
        selectedText || "bold text";
      formatted = `**${inner}**`;
      cursorStart = start + 2;
      cursorEnd = cursorStart + inner.length;
    }

    if (type === "italic") {
      const inner =
        selectedText || "italic text";
      formatted = `_${inner}_`;
      cursorStart = start + 1;
      cursorEnd = cursorStart + inner.length;
    }

    if (type === "bullet") {
      if (selectedText) {
        formatted = selectedText
          .split("\n")
          .map((line) =>
            line.trim()
              ? `• ${line}`
              : line
          )
          .join("\n");
      } else {
        formatted = "• ";
      }

      cursorStart =
        start + formatted.length;
      cursorEnd = cursorStart;
    }

    const newBody =
      composeData.body.slice(0, start) +
      formatted +
      composeData.body.slice(end);

    setComposeData((current) => ({
      ...current,
      body: newBody,
    }));

    requestAnimationFrame(() => {
      const updatedTextarea =
        document.getElementById(
          "compose-message"
        );

      if (!updatedTextarea) return;

      updatedTextarea.focus();
      updatedTextarea.setSelectionRange(
        cursorStart,
        cursorEnd
      );
    });
  }

  /* =======================================================
     COUNTS
  ======================================================= */

  const inboxCount =
    emails.length;

  const starredCount =
    emails.filter(
      (email) =>
        email.starred
    ).length;

  const spamCount = spam.length;

  const folderTitles = {
    inbox: "Inbox",
    starred: "Starred",
    drafts: "Drafts",
    sent: "Sent",
    trash: "Trash",
    spam: "Spam",
  };

  const currentReaderIndex =
    selectedEmail
      ? filteredEmails.findIndex(
          (email) =>
            email.id ===
            selectedEmail.id
        )
      : -1;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className={`app folder-${activeFolder} ${
        darkMode
          ? "dark"
          : ""
      }`}
    >

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="sidebar">

        <div className="logo">

          <span className="logo-icon">
            ✉
          </span>

          <span>
            LOOKUP
          </span>

        </div>


        <button
          className="compose-btn"
          onClick={
            openCompose
          }
        >
          <span>＋</span>
          Compose
        </button>


        <nav className="sidebar-nav">

          <div
            className={`nav-item ${
              activeFolder ===
              "inbox"
                ? "active"
                : ""
            }`}
            onClick={() =>
              changeFolder(
                "inbox"
              )
            }
          >
            <span>📥</span>

            <span>
              Inbox
            </span>

            <span className="count">
              {inboxCount}
            </span>
          </div>


          <div
            className={`nav-item ${
              activeFolder ===
              "starred"
                ? "active"
                : ""
            }`}
            onClick={() =>
              changeFolder(
                "starred"
              )
            }
          >
            <span>⭐</span>

            <span>
              Starred
            </span>

            <span className="count">
              {starredCount}
            </span>
          </div>


          <div
            className={`nav-item ${
              activeFolder ===
              "drafts"
                ? "active"
                : ""
            }`}
            onClick={() =>
              changeFolder(
                "drafts"
              )
            }
          >
            <span>📝</span>

            <span>
              Drafts
            </span>

            <span className="count">
              {drafts.length}
            </span>
          </div>


          <div
            className={`nav-item ${
              activeFolder ===
              "sent"
                ? "active"
                : ""
            }`}
            onClick={() =>
              changeFolder(
                "sent"
              )
            }
          >
            <span>📤</span>

            <span>
              Sent
            </span>

            <span className="count">
              {sent.length}
            </span>
          </div>


          <div
            className={`nav-item ${
              activeFolder ===
              "trash"
                ? "active"
                : ""
            }`}
            onClick={() =>
              changeFolder(
                "trash"
              )
            }
          >
            <span>🗑</span>

            <span>
              Trash
            </span>

            <span className="count">
              {trash.length}
            </span>
          </div>


          <div
            className={`nav-item spam-nav-item ${
              activeFolder ===
              "spam"
                ? "active"
                : ""
            }`}
            onClick={() =>
              changeFolder(
                "spam"
              )
            }
          >
            <span>🚫</span>

            <span>
              Spam
            </span>

            <span className="count">
              {spamCount}
            </span>
          </div>

        </nav>


        <div className="sidebar-bottom">

          <button
            type="button"
            className="account-trigger"
            onClick={() =>
              setShowAccountMenu((current) => !current)
            }
          >
            <div className="user-avatar">
              TH
            </div>

            <div className="user-details">
              <strong>
                Tirthankar
              </strong>

              <small>
                Personal Inbox
              </small>
            </div>
          </button>

          {showAccountMenu && (
            <div className="account-menu">
              <div className="account-menu-header">
                <strong>Tirthankar</strong>
                <span>tirthankar@company.com</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowAccountMenu(false);
                  showToast("Account switching isn't available yet");
                }}
              >
                ⇄ Change account
              </button>

              <button
                type="button"
                className="account-logout"
                onClick={() => {
                  setShowAccountMenu(false);
                  showToast("Logout isn't available in this demo");
                }}
              >
                ↪ Logout
              </button>
            </div>
          )}

          <button
            className="theme-toggle"
            onClick={() =>
              setDarkMode(
                (current) =>
                  !current
              )
            }
            title="Toggle theme"
          >
            {darkMode
              ? "☀"
              : "☾"}
          </button>

        </div>

      </aside>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="main">

        <header className="header">

          <div className="header-title">

            <h1>
              {
                folderTitles[
                  activeFolder
                ]
              }
            </h1>

            <p>
              {
                filteredEmails.length
              }{" "}
              conversations
            </p>

          </div>


          <div className="search-box">

            <span className="search-icon">
              ⌕
            </span>

            <input
              value={
                searchTerm
              }
              onChange={(
                event
              ) =>
                setSearchTerm(
                  event.target
                    .value
                )
              }
              placeholder="Search emails..."
            />

            <span className="shortcut">
              ⌘ K
            </span>

          </div>


          <button
            className="notification-btn"
            onClick={() =>
              showToast(
                "No new notifications"
              )
            }
            title="Notifications"
          >
            ♧
          </button>

        </header>


        {/* =================================================
            EMAIL LIST
        ================================================= */}

        <section className="content">

          <div className="email-list">

            <div className="list-toolbar">

              {!selectMode ? (

                <div className="toolbar-left" />

              ) : (

                <div className="selection-controls">

                  <button
                    className="select-all-btn"
                    onClick={
                      toggleSelectAll
                    }
                  >
                    {
                      allVisibleSelected
                        ? "Deselect all"
                        : "Select all"
                    }
                  </button>


                  <span className="selected-count">
                    {
                      selectedIds.length
                    }{" "}
                    selected
                  </span>


                  <div className="action-dropdown">

                    <button
                      className="actions-btn"
                      onClick={() =>
                        setShowActionMenu(
                          (current) =>
                            !current
                        )
                      }
                      title="Actions"
                    >
                      ☰
                    </button>


                    {showActionMenu && (

                      <div className="action-menu">

                        {/* TRASH ACTION */}

                        {activeFolder ===
                          "trash" && (

                          <>
                            <button
                              className="restore-action"
                              onClick={() => {
                                restoreSelectedEmails();

                                setShowActionMenu(
                                  false
                                );
                              }}
                            >
                              Restore
                            </button>

                            <button
                              className="danger-action"
                              onClick={() => {
                                permanentlyDeleteSelected();

                                setShowActionMenu(
                                  false
                                );
                              }}
                            >
                              Delete permanently
                            </button>
                          </>

                        )}


                        {/* NORMAL ACTIONS */}

                        {activeFolder !==
                          "trash" &&
                          activeFolder !==
                          "spam" && (

                          <>
                            <button
                              onClick={() => {
                                markSelectedRead();

                                setShowActionMenu(
                                  false
                                );
                              }}
                            >
                              Mark as read
                            </button>


                            <button
                              onClick={() => {
                                markSelectedUnread();

                                setShowActionMenu(
                                  false
                                );
                              }}
                            >
                              Mark as unread
                            </button>


                            <button
                              onClick={() => {
                                starSelected();

                                setShowActionMenu(
                                  false
                                );
                              }}
                            >
                              Star
                            </button>


                            <button
                              className="spam-action"
                              onClick={() => {
                                markSelectedSpam();

                                setShowActionMenu(
                                  false
                                );
                              }}
                            >
                              Mark as spam
                            </button>

                            <button
                              className="danger-action"
                              onClick={() => {
                                deleteSelected();

                                setShowActionMenu(
                                  false
                                );
                              }}
                            >
                              Move to trash
                            </button>
                          </>

                        )}

                      </div>

                    )}

                  </div>


                  <button
                    className="cancel-select"
                    onClick={
                      exitSelectMode
                    }
                  >
                    Cancel
                  </button>

                </div>

              )}


              {!selectMode && (

                <div className="toolbar-right">

                  <button
                    onClick={() =>
                      showToast(
                        "Inbox refreshed"
                      )
                    }
                    title="Refresh"
                  >
                    ↻
                  </button>

                </div>

              )}

            </div>


            {/* EMAIL ROWS */}

            {filteredEmails.length >
            0 ? (

              filteredEmails.map(
                (email) => {

                  const isSelected =
                    selectedIds.includes(
                      email.id
                    );

                  return (

                    <div
                      key={
                        email.id
                      }
                      className={`email-row ${
                        !email.read
                          ? "unread"
                          : ""
                      } ${
                        isSelected
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        openEmail(
                          email
                        )
                      }
                    >

                      <div
                        className={`email-check ${
                          isSelected
                            ? "visible"
                            : ""
                        }`}
                        onClick={(
                          event
                        ) =>
                          event.stopPropagation()
                        }
                      >

                        <input
                          type="checkbox"
                          checked={
                            isSelected
                          }
                          onChange={() =>
                            toggleSelection(
                              email.id
                            )
                          }
                        />

                      </div>


                      <div
                        className={`sender-avatar ${
                          email.sender
                            ?.avatarColor ||
                          "blue"
                        }`}
                      >
                        {
                          email
                            .sender
                            ?.initials
                        }
                      </div>


                      <div className="email-info">

                        <div className="email-top">

                          <strong>
                            {
                              email
                                .sender
                                ?.name
                            }
                          </strong>

                          <span>
                            {
                              email.timestamp
                            }
                          </span>

                        </div>


                        <h3>
                          {
                            email.subject
                          }
                        </h3>


                        <p>
                          {
                            email.preview
                          }
                        </p>


                        <div className="email-tags">

                          {(
                            email.labels ||
                            []
                          ).map(
                            (
                              label
                            ) => (

                              <span
                                key={
                                  label
                                }
                                className={
                                  email.category &&
                                  label ===
                                    email.category.charAt(0) +
                                      email.category.slice(1).toLowerCase()
                                    ? "category-tag"
                                    : ""
                                }
                              >
                                {
                                  label
                                }
                              </span>

                            )
                          )}


                          {(
                            email.attachments ||
                            []
                          ).length >
                            0 && (

                            <span>
                              📎{" "}
                              {
                                email
                                  .attachments[0]
                                  .name
                              }
                            </span>

                          )}

                        </div>

                      </div>


                      {activeFolder === "trash" && (
                        <button
                          className="restore-row-button"
                          onClick={(event) => {
                            event.stopPropagation();
                            restoreEmail(email.id);
                          }}
                          title="Restore email"
                        >
                          ↶
                        </button>
                      )}

                      <button
                        className={`star ${
                          email.starred
                            ? "starred"
                            : ""
                        }`}
                        onClick={(
                          event
                        ) => {
                          event.stopPropagation();

                          toggleStar(
                            email.id
                          );
                        }}
                      >
                        {email.starred
                          ? "★"
                          : "☆"}
                      </button>

                    </div>

                  );
                }
              )

            ) : (

              <div className="empty-state">

                <div className="empty-icon">

                  {activeFolder ===
                  "trash"
                    ? "🗑"
                    : activeFolder ===
                      "drafts"
                    ? "📝"
                    : activeFolder ===
                      "starred"
                    ? "☆"
                    : "⌕"}

                </div>

                <p>
                  {searchTerm
                    ? "No emails found"
                    : "Nothing here"}
                </p>

              </div>

            )}

          </div>

        </section>

      </main>


      {/* =================================================
          EMAIL READER
      ================================================= */}

      {selectedEmail &&
        activeFolder !==
          "drafts" && (

          <div
            className="email-reader-overlay"
            onClick={() =>
              setSelectedEmail(
                null
              )
            }
          >

            <div
              className="email-reader"
              onClick={(
                event
              ) =>
                event.stopPropagation()
              }
            >

              {/* READER HEADER */}

              <div className="reader-header">

                <button
                  className="reader-back"
                  onClick={() =>
                    setSelectedEmail(
                      null
                    )
                  }
                  title="Close"
                >
                  ←
                </button>


                <div className="reader-title">

                  <span>
                    {
                      folderTitles[
                        activeFolder
                      ]
                    }
                  </span>

                  <strong>
                    {
                      selectedEmail.subject
                    }
                  </strong>

                </div>


                {/* PREVIOUS / NEXT */}

                <div className="reader-navigation">

                  <button
                    onClick={() =>
                      navigateEmail(
                        -1
                      )
                    }
                    disabled={
                      filteredEmails.length <=
                      1
                    }
                    title="Previous email"
                  >
                    ←
                  </button>


                  <span>
                    {
                      currentReaderIndex +
                      1
                    }{" "}
                    /{" "}
                    {
                      filteredEmails.length
                    }
                  </span>


                  <button
                    onClick={() =>
                      navigateEmail(
                        1
                      )
                    }
                    disabled={
                      filteredEmails.length <=
                      1
                    }
                    title="Next email"
                  >
                    →
                  </button>

                </div>


                {/* MORE */}

                <div className="reader-more">

                  {activeFolder ===
                  "trash" ? (

                    <>

                      <button
                        className="reader-action-button"
                        onClick={() =>
                          restoreEmail(
                            selectedEmail.id
                          )
                        }
                      >
                        Restore
                      </button>


                      <button
                        className="reader-action-button danger-text"
                        onClick={() =>
                          permanentlyDelete(
                            selectedEmail.id
                          )
                        }
                      >
                        Delete permanently
                      </button>

                    </>

                  ) : (

                    <button
                      className="more-icon-button"
                      onClick={() =>
                        setShowReaderMenu(
                          (current) =>
                            !current
                        )
                      }
                      title="More actions"
                    >
                      ☰
                    </button>

                  )}


                  {showReaderMenu && (

                    <div className="reader-menu">

                      <button
                        onClick={() => {
                          toggleSingleRead(
                            selectedEmail.id
                          );

                          setShowReaderMenu(
                            false
                          );
                        }}
                      >
                        {
                          selectedEmail.read
                            ? "Mark unread"
                            : "Mark read"
                        }
                      </button>


                      <button
                        onClick={() => {
                          toggleStar(
                            selectedEmail.id
                          );

                          setShowReaderMenu(
                            false
                          );
                        }}
                      >
                        {
                          selectedEmail.starred
                            ? "Remove star"
                            : "Star email"
                        }
                      </button>


                      {activeFolder !== "spam" && (
                        <button
                          className="spam-menu-item"
                          onClick={() =>
                            markAsSpam(
                              selectedEmail.id
                            )
                          }
                        >
                          Mark as spam
                        </button>
                      )}

                      <button
                        className="danger-menu-item"
                        onClick={() =>
                          moveToTrash(
                            selectedEmail.id
                          )
                        }
                      >
                        Move to trash
                      </button>

                    </div>

                  )}

                </div>

              </div>


              {/* READER CONTENT */}

              <div className="reader-content">

                <div className="reader-subject-row">

                  <h2>
                    {
                      selectedEmail.subject
                    }
                  </h2>


                  <button
                    className={`reader-star ${
                      selectedEmail.starred
                        ? "starred"
                        : ""
                    }`}
                    onClick={() =>
                      toggleStar(
                        selectedEmail.id
                      )
                    }
                  >
                    {
                      selectedEmail.starred
                        ? "★"
                        : "☆"
                    }
                  </button>

                </div>


                <div className="reader-sender">

                  <div
                    className={`sender-avatar ${
                      selectedEmail
                        .sender
                        ?.avatarColor ||
                      "blue"
                    }`}
                  >
                    {
                      selectedEmail
                        .sender
                        ?.initials
                    }
                  </div>


                  <div>

                    <strong>
                      {
                        selectedEmail
                          .sender
                          ?.name
                      }
                    </strong>

                    <p>
                      {
                        selectedEmail
                          .sender
                          ?.email
                      }
                    </p>

                  </div>


                  <span>
                    {
                      selectedEmail.date ||
                      selectedEmail.timestamp
                    }
                  </span>

                </div>


                <div className="reader-message">

                  {(
                    selectedEmail.body ||
                    ""
                  )
                    .split(
                      "\n\n"
                    )
                    .map(
                      (
                        paragraph,
                        index
                      ) => (
                        <p
                          key={
                            index
                          }
                        >
                          {
                            paragraph
                          }
                        </p>
                      )
                    )}

                </div>


                {/* ATTACHMENTS */}

                {(
                  selectedEmail.attachments ||
                  []
                ).length >
                  0 && (

                  <div className="attachment-list">

                    {selectedEmail.attachments.map(
                      (
                        file
                      ) => (

                        <div
                          className="attachment"
                          key={
                            file.id ||
                            file.name
                          }
                        >

                          <div className="file-icon">
                            📄
                          </div>


                          <div className="attachment-info">

                            <strong>
                              {
                                file.name
                              }
                            </strong>

                            <small>
                              {
                                file.size ||
                                "Attachment"
                              }
                            </small>

                          </div>


                          <button
                            className="download-attachment"
                            onClick={() =>
                              downloadAttachment(
                                file
                              )
                            }
                            title="Download attachment"
                          >
                            ↓
                          </button>

                        </div>

                      )
                    )}

                  </div>

                )}


                {/* AI */}

                {activeFolder !==
                  "trash" && (

                  <div className="ai-panel">

                    <div className="ai-header">

                      <div className="ai-brand">

                        <div className="ai-spark">
                          ✦
                        </div>

                        <div>

                          <strong>
                            AI Assistant
                          </strong>

                          <small>
                            Intelligent email help
                          </small>

                        </div>

                      </div>


                      <span className="ai-model">
                        GPT-4o-mini
                      </span>

                    </div>


                    <div className="ai-actions">

                      <button
                        onClick={
                          summarizeEmail
                        }
                        disabled={
                          aiOperation !==
                          null
                        }
                        className={
                          aiOperation ===
                          "summary"
                            ? "ai-active"
                            : ""
                        }
                      >
                        <span>
                          ✦
                        </span>

                        {
                          aiOperation ===
                          "summary"
                            ? "Hold on..."
                            : "Summarize"
                        }

                      </button>


                      <button
                        onClick={
                          generateSmartReplies
                        }
                        disabled={
                          aiOperation !==
                          null
                        }
                        className={
                          aiOperation ===
                          "reply"
                            ? "ai-active"
                            : ""
                        }
                      >
                        <span>
                          ⌁
                        </span>

                        {
                          aiOperation ===
                          "reply"
                            ? "Crafting..."
                            : "Smart Reply"
                        }

                      </button>


                      <button
                        onClick={
                          extractKeyDetails
                        }
                        disabled={
                          aiOperation !==
                          null
                        }
                        className={
                          aiOperation ===
                          "details"
                            ? "ai-active"
                            : ""
                        }
                      >
                        <span>
                          ⊙
                        </span>

                        {
                          aiOperation ===
                          "details"
                            ? "Extracting..."
                            : "Key Details"
                        }
                      </button>


                      <button
                        onClick={
                          autoCategorizeEmail
                        }
                        disabled={
                          aiOperation !==
                          null
                        }
                        className={
                          aiOperation ===
                          "categorize"
                            ? "ai-active"
                            : ""
                        }
                      >
                        <span>
                          ◈
                        </span>

                        {
                          aiOperation ===
                          "categorize"
                            ? "Categorizing..."
                            : "Auto Categorize"
                        }
                      </button>

                    </div>


                    {keyDetails.length > 0 && (
                      <div className="key-details-result">
                        <div className="ai-result-title">
                          <span>
                            ◆
                          </span>
                          Key Details
                        </div>

                        <div className="key-details-grid">
                          {keyDetails.map((detail, index) => (
                            <div
                              className={`key-detail-card ${
                                detail.label === "IMPORTANT"
                                  ? "key-detail-highlight"
                                  : ""
                              }`}
                              key={`${detail.label}-${index}`}
                            >
                              <span>{detail.label}</span>
                              <strong>{detail.value}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}


                    {aiSummary && (

                      <div className="ai-result">

                        <div className="ai-result-title">

                          <span>
                            ✦
                          </span>

                          Summary

                        </div>

                        <p>
                          {
                            aiSummary
                          }
                        </p>

                      </div>

                    )}


                    {smartReplies.length >
                      0 && (

                      <div className="smart-replies">

                        <div className="ai-result-title">

                          <span>
                            ⌁
                          </span>

                          Suggested Replies

                        </div>


                        {smartReplies.map(
                          (
                            reply,
                            index
                          ) => (

                            <button
                              key={
                                index
                              }
                              className="reply-suggestion"
                              onClick={() => {

                                setComposeData(
                                  (
                                    current
                                  ) => ({
                                    ...current,

                                    to:
                                      selectedEmail
                                        .sender
                                        ?.email ||
                                      "",

                                    subject:
                                      `Re: ${selectedEmail.subject}`,

                                    body:
                                      reply,
                                  })
                                );

                                setShowCompose(
                                  true
                                );

                                setAiSummary(
                                  ""
                                );

                                setSmartReplies(
                                  []
                                );

                              }}
                            >

                              <span>
                                {
                                  reply
                                }
                              </span>

                              <span className="reply-arrow">
                                →
                              </span>

                            </button>

                          )
                        )}

                      </div>

                    )}

                  </div>

                )}

              </div>


              {/* =================================================
                  AI GALAXY
              ================================================= */}

              {aiOperation && (

                <div className="ai-working-overlay">

                  <div className="ai-galaxy">

                    <div className="galaxy-orbit orbit-one" />

                    <div className="galaxy-orbit orbit-two" />

                    <div className="galaxy-orbit orbit-three" />

                    <div className="galaxy-core">
                      ✦
                    </div>

                    <div className="galaxy-particle particle-one" />

                    <div className="galaxy-particle particle-two" />

                    <div className="galaxy-particle particle-three" />

                    <div className="galaxy-particle particle-four" />

                    <div className="galaxy-particle particle-five" />

                  </div>


                  <div className="ai-working-text">

                    <strong>

                      {
                        aiOperation ===
                        "summary"
                          ? "Reading your email"
                          : aiOperation ===
                            "reply"
                          ? "Crafting replies"
                          : aiOperation ===
                            "details"
                          ? "Finding key details"
                          : aiOperation ===
                            "categorize"
                          ? "Categorizing your email"
                          : "Writing your email"
                      }

                    </strong>


                    <span>

                      {
                        aiOperation ===
                        "summary"
                          ? "Pulling out the important details..."
                          : aiOperation ===
                            "reply"
                          ? "Finding the best ways to respond..."
                          : aiOperation ===
                            "details"
                          ? "Highlighting dates, people and actions..."
                          : aiOperation ===
                            "categorize"
                          ? "Choosing the most useful mailbox category..."
                          : "Turning your idea into a polished message..."
                      }

                    </span>

                  </div>

                </div>

              )}

            </div>

          </div>

        )}


      {showAIPrompt && (
        <div
          className="ai-prompt-overlay"
          onClick={() => setShowAIPrompt(false)}
        >
          <div
            className="ai-prompt-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="ai-prompt-header">
              <div>
                <span className="ai-prompt-icon">✦</span>
                <div>
                  <strong>AI Compose</strong>
                  <small>Tell LOOKUP what you want to write</small>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAIPrompt(false)}
              >
                ×
              </button>
            </div>

            <textarea
              autoFocus
              className="ai-prompt-input"
              placeholder="e.g. Write a professional email asking my professor for an extension until Monday..."
              value={aiPrompt}
              onChange={(event) =>
                setAiPrompt(event.target.value)
              }
            />

            <div className="ai-prompt-footer">
              <button
                type="button"
                className={`voice-prompt-btn ${
                  isListening ? "listening" : ""
                }`}
                onClick={startVoicePrompt}
              >
                {isListening ? "● Listening..." : "🎙 Voice"}
              </button>

              <div>
                <button
                  type="button"
                  className="ai-prompt-cancel"
                  onClick={() => setShowAIPrompt(false)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="ai-prompt-generate"
                  onClick={generateAICompose}
                  disabled={!aiPrompt.trim()}
                >
                  ✦ Generate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* =================================================
          COMPOSE
      ================================================= */}

      {showCompose && (

        <div
          className="compose-overlay"
          onClick={
            saveDraft
          }
        >

          <div
            className="compose-modal"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            <div className="compose-header">

              <div>

                <strong>
                  {
                    editingDraftId
                      ? "Edit Draft"
                      : "New Message"
                  }
                </strong>

                <span>
                  {
                    editingDraftId
                      ? "Continue writing your draft"
                      : "Create a new message"
                  }
                </span>

              </div>


              <button
                onClick={
                  saveDraft
                }
                title="Save draft"
              >
                ×
              </button>

            </div>


            <form
              onSubmit={
                sendEmail
              }
            >

              <div className="compose-recipient-row">

                <input
                  type="email"
                  placeholder="To"
                  value={
                    composeData.to
                  }
                  onChange={(
                    event
                  ) =>
                    setComposeData(
                      {
                        ...composeData,

                        to: event
                          .target
                          .value,
                      }
                    )
                  }
                />


                <button
                  type="button"
                  className="cc-bcc-btn"
                  onClick={() =>
                    setShowCcBcc(
                      (current) =>
                        !current
                    )
                  }
                >
                  CC / BCC
                </button>

              </div>


              {showCcBcc && (

                <div className="cc-bcc-fields">

                  <input
                    type="text"
                    placeholder="CC"
                    value={
                      composeData.cc
                    }
                    onChange={(
                      event
                    ) =>
                      setComposeData(
                        {
                          ...composeData,

                          cc: event
                            .target
                            .value,
                        }
                      )
                    }
                  />


                  <input
                    type="text"
                    placeholder="BCC"
                    value={
                      composeData.bcc
                    }
                    onChange={(
                      event
                    ) =>
                      setComposeData(
                        {
                          ...composeData,

                          bcc: event
                            .target
                            .value,
                        }
                      )
                    }
                  />

                </div>

              )}


              <input
                className="compose-subject"
                type="text"
                placeholder="Subject"
                value={
                  composeData.subject
                }
                onChange={(
                  event
                ) =>
                  setComposeData(
                    {
                      ...composeData,

                      subject:
                        event
                          .target
                          .value,
                    }
                  )
                }
              />


              <div className="compose-formatting">

                <button
                  type="button"
                  onClick={() =>
                    insertFormatting(
                      "bold"
                    )
                  }
                >
                  <strong>
                    B
                  </strong>
                </button>


                <button
                  type="button"
                  onClick={() =>
                    insertFormatting(
                      "italic"
                    )
                  }
                >
                  <em>
                    I
                  </em>
                </button>


                <button
                  type="button"
                  onClick={() =>
                    insertFormatting(
                      "bullet"
                    )
                  }
                >
                  •
                </button>


                <span className="format-divider" />


                <label className="attachment-button">

                  📎

                  <input
                    type="file"
                    multiple
                    onChange={
                      handleAttachments
                    }
                  />

                </label>

                <span className="format-divider" />

                <button
                  type="button"
                  className={`prediction-toggle ${
                    wordPredictionEnabled ? "enabled" : ""
                  }`}
                  onClick={() => {
                    setWordPredictionEnabled((current) => {
                      const next = !current;

                      if (!next) {
                        setWordSuggestion("");

                        if (predictionTimerRef.current) {
                          clearTimeout(predictionTimerRef.current);
                          predictionTimerRef.current = null;
                        }
                      }

                      return next;
                    });
                  }}
                  title={
                    wordPredictionEnabled
                      ? "Turn off AI next-word prediction"
                      : "Turn on AI next-word prediction"
                  }
                  aria-pressed={wordPredictionEnabled}
                >
                  <span className="prediction-spark">✦</span>
                  <span>AI Predict</span>
                  <span className="prediction-status">
                    {wordPredictionEnabled ? "ON" : "OFF"}
                  </span>
                </button>

              </div>


              <textarea
                id="compose-message"
                placeholder="Write your message... Use the toolbar above for bold, italic and bullet points."
                value={
                  composeData.body
                }
                onChange={(
                  event
                ) => {
                  const value = event.target.value;
                  composeBodyRef.current = value;
                  setComposeData((current) => ({
                    ...current,
                    body: value,
                  }));
                  scheduleWordPrediction(value);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Tab" && wordSuggestion) {
                    event.preventDefault();
                    acceptWordSuggestion();
                  }
                }}
              />

              {wordSuggestion && (
                <button
                  type="button"
                  className="word-prediction"
                  onClick={acceptWordSuggestion}
                  title="Press Tab to accept"
                >
                  <span>AI suggestion</span>
                  <strong>{wordSuggestion}</strong>
                  <kbd>Tab ↹</kbd>
                </button>
              )}


              {composeData.attachments
                .length >
                0 && (

                <div className="compose-attachments">

                  {composeData.attachments.map(
                    (
                      file
                    ) => (

                      <div
                        className="compose-attachment"
                        key={
                          file.id
                        }
                      >

                        <span>
                          📎{" "}
                          {
                            file.name
                          }
                        </span>

                        <small>
                          {
                            file.size
                          }
                        </small>


                        <button
                          type="button"
                          onClick={() =>
                            removeAttachment(
                              file.id
                            )
                          }
                        >
                          ×
                        </button>

                      </div>

                    )
                  )}

                </div>

              )}


              <div className="compose-footer">

                <button
                  type="button"
                  className="ai-compose-btn"
                  onClick={
                    openAIPrompt
                  }
                  disabled={
                    aiOperation !==
                    null
                  }
                >
                  {
                    aiOperation ===
                    "compose"
                      ? "✦ Hold on..."
                      : "✦ AI Assist"
                  }
                </button>


                {editingDraftId && (

                  <button
                    type="button"
                    className="delete-draft-btn"
                    onClick={() =>
                      deleteDraft(
                        editingDraftId
                      )
                    }
                  >
                    Delete draft
                  </button>

                )}


                <button
                  type="submit"
                  className="send-btn"
                >
                  Send

                  <span>
                    ↗
                  </span>
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =================================================
          TOAST
      ================================================= */}

      {toast && (

        <div className="toast">

          <span>
            ✓
          </span>

          {toast}

        </div>

      )}

    </div>
  );
}

export default App;