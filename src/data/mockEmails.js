const mockEmails = [
  {
    id: 1,
    sender: {
      name: "Sarah Chen",
      email: "sarah.chen@company.com",
      initials: "SC",
      avatarColor: "blue",
    },
    subject: "Q3 Product Review",
    preview:
      "I've attached the latest version of the Q3 product review following yesterday's discussion.",
    body: `
Hi team,

I've attached the latest version of the Q3 product review following yesterday's discussion.

The main changes include the updated onboarding flow, improvements to the dashboard experience, and the new notification system.

Please take a look and share your feedback before Friday so we can finalize the changes.

Thanks,
Sarah
    `,
    timestamp: "10:42 AM",
    date: "Today, 10:42 AM",
    read: false,
    starred: true,
    labels: ["Work"],
    attachments: [
      {
        name: "Q3-review.pdf",
        size: "2.4 MB",
        type: "PDF",
      },
    ],
    threadCount: 3,
  },

  {
    id: 2,
    sender: {
      name: "Michael Johnson",
      email: "michael.johnson@company.com",
      initials: "MJ",
      avatarColor: "purple",
    },
    subject: "Meeting Tomorrow",
    preview:
      "Just confirming that we're still on for the meeting tomorrow at 11 AM.",
    body: `
Hi Tirthankar,

Just confirming that we're still on for the meeting tomorrow at 11 AM.

We'll go through the frontend progress and discuss the remaining tasks.

Please let me know if you need to reschedule.

Best,
Michael
    `,
    timestamp: "9:18 AM",
    date: "Today, 9:18 AM",
    read: false,
    starred: false,
    labels: ["Work"],
    attachments: [],
    threadCount: 2,
  },

  {
    id: 3,
    sender: {
      name: "HR Team",
      email: "hr@company.com",
      initials: "HR",
      avatarColor: "green",
    },
    subject: "Updated Leave Policy",
    preview:
      "Please review the updated leave policy effective from next month.",
    body: `
Hello everyone,

Please review the updated leave policy that will come into effect from September 1.

The updated policy includes changes to annual leave, work-from-home requests, and holiday procedures.

Please contact HR if you have any questions.

Regards,
HR Team
    `,
    timestamp: "Yesterday",
    date: "Yesterday, 4:35 PM",
    read: true,
    starred: false,
    labels: ["Important"],
    attachments: [
      {
        name: "leave-policy.pdf",
        size: "1.1 MB",
        type: "PDF",
      },
    ],
    threadCount: 1,
  },

  {
    id: 4,
    sender: {
      name: "Alex Johnson",
      email: "alex.johnson@company.com",
      initials: "AJ",
      avatarColor: "orange",
    },
    subject: "Frontend Migration",
    preview:
      "I wanted to share some thoughts about the frontend migration we've been discussing.",
    body: `
Hey team,

I wanted to share some thoughts about the frontend migration we've been discussing.

I think we should move forward with the new component architecture gradually rather than migrating everything at once.

I've added a few suggestions in the attached document.

Let me know what you think.

Alex
    `,
    timestamp: "Yesterday",
    date: "Yesterday, 2:12 PM",
    read: true,
    starred: false,
    labels: ["Work"],
    attachments: [
      {
        name: "migration-notes.docx",
        size: "640 KB",
        type: "DOCX",
      },
    ],
    threadCount: 4,
  },

  {
    id: 5,
    sender: {
      name: "Finance Team",
      email: "finance@company.com",
      initials: "FT",
      avatarColor: "blue",
    },
    subject: "Expense Report Approved",
    preview:
      "Your expense report for August has been reviewed and approved.",
    body: `
Hi Tirthankar,

Your expense report for August has been reviewed and approved.

The reimbursement will be processed with the next payroll cycle.

Regards,
Finance Team
    `,
    timestamp: "Aug 12",
    date: "Aug 12, 3:20 PM",
    read: true,
    starred: true,
    labels: ["Finance"],
    attachments: [],
    threadCount: 1,
  },

  {
    id: 6,
    sender: {
      name: "David Wilson",
      email: "david.wilson@company.com",
      initials: "DW",
      avatarColor: "purple",
    },
    subject: "API Integration Update",
    preview:
      "The API integration is almost complete. There are two remaining endpoints.",
    body: `
Hi team,

The API integration is almost complete.

There are two remaining endpoints that need to be connected before we can finish the frontend integration.

I'll push the latest changes this evening.

Thanks,
David
    `,
    timestamp: "Aug 12",
    date: "Aug 12, 11:45 AM",
    read: true,
    starred: false,
    labels: ["Development"],
    attachments: [],
    threadCount: 5,
  },

  {
    id: 7,
    sender: {
      name: "Product Team",
      email: "product@company.com",
      initials: "PT",
      avatarColor: "green",
    },
    subject: "User Feedback Summary",
    preview:
      "We've compiled the feedback received from users during the last sprint.",
    body: `
Hello team,

We've compiled the feedback received from users during the last sprint.

The biggest requests were improved search, faster loading times, and better mobile support.

We'll discuss the roadmap during Friday's product meeting.

Product Team
    `,
    timestamp: "Aug 11",
    date: "Aug 11, 5:10 PM",
    read: true,
    starred: false,
    labels: ["Product"],
    attachments: [
      {
        name: "user-feedback.pdf",
        size: "3.8 MB",
        type: "PDF",
      },
    ],
    threadCount: 2,
  },

  {
    id: 8,
    sender: {
      name: "Jessica Lee",
      email: "jessica.lee@company.com",
      initials: "JL",
      avatarColor: "orange",
    },
    subject: "Welcome to the Project",
    preview:
      "Welcome aboard! I've shared some resources that should help you get started.",
    body: `
Hi Tirthankar,

Welcome to the project!

I've shared some resources that should help you understand the current architecture and development workflow.

Feel free to reach out if you have any questions.

Best,
Jessica
    `,
    timestamp: "Aug 10",
    date: "Aug 10, 9:30 AM",
    read: true,
    starred: false,
    labels: ["General"],
    attachments: [],
    threadCount: 1,
  },
];

export default mockEmails;