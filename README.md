
<div align="center">

# 🤖 HireMe AI Interviews  
### **AI-powered voice interview system for candidates**

An interactive interview platform where candidates speak naturally and get real-time conversational feedback from an AI interviewer.

🎤 Voice-based | 🧠 AI-driven | 🛰 Real-time Communication

---

### 🚀 Tech Stack

| Category | Technologies |
|----------|--------------|
| Framework | **Next.js (App Router), TypeScript** |
| UI/UX | **TailwindCSS, ShadCN UI** |
| Backend Services | **Supabase (DB + Auth), PostgreSQL** |
| Realtime | **WebSockets, WebRTC** |
| AI Stack | **Retell AI, Google Gemini** |
| Auth | **Clerk Authentication** |

</div>

---

## 🌟 Features

✔ **Voice-based real-time AI interview**  
✔ **Emotion-based scoring + performance tracking** *(if enabled)*  
✔ **Safe candidate environment with tab-switch detection**  
✔ **Anonymous interview support**  
✔ **Dynamic share link + embed for interview forms**  
✔ **Admin dashboard for reviewing responses & analytics**  
✔ **Smart camera & mic permission handling**

---

## 📂 Project Folder Structure

```
HireMe
├─ README.md
├─ public                 → assets
│  ├─ audio               → voices
│  ├─ interviewers        → avatars
├─ src                    → source
│  ├─ actions             → parsing
│  ├─ app                 → routes
│  │  ├─ (client)         → dashboard
│  │  ├─ (user)           → candidate
│  │  ├─ api              → backend
│  ├─ components          → ui
│  │  ├─ call             → calling
│  │  ├─ dashboard        → dashboard
│  │  ├─ loaders          → spinners
│  │  └─ ui               → shadcn
│  ├─ contexts            → states
│  ├─ lib                 → utils
│  │  ├─ prompts          → ai
│  ├─ services            → database
│  ├─ types               → models
│  └─ middleware.ts       → auth
└─ supabase_schema.sql    → schema

```

---

## 🔌 System Architecture

```

```
                    ┌─────────────────────┐
                    │    Candidate UI     │
                    │  (Next.js + ShadCN) │
                    └─────────┬───────────┘
                              │
                           Mic Access
                              │
                    ┌─────────▼───────────┐
                    │  WebRTC + WebSocket │
                    └─────────┬───────────┘
                              │
                     Real-time Voice Stream
                              │
                  ┌───────────▼────────────┐
                  │  Retell AI + Gemini    │
                  │  (Speech + Reasoning)  │
                  └───────────┬────────────┘
                   Response + │ Scoring
                  ┌───────────▼────────────┐
                  │  Supabase + PostgreSQL │
                  │ (Responses + History)  │
                  └────────────────────────┘

---

## 🔑 Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up 
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard 
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard 
NEXT_PUBLIC_LIVE_URL=localhost:3000

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Retell AI
RETELL_API_KEY=

# Gemini Api
GEMINI_API_KEY=
````

---

## 🛠 Running Locally

```bash
# Install dependencies
npm install

# Start the application
npm run dev
```

> App runs on: **[http://localhost:3000](http://localhost:3000)**

---

## 🛡 Permissions & Candidate Safety

* 🔐 **No data stored without consent**
* 🎙️ Secure mic usage via browser permissions
* 🚫 **Tab-switch detection** helps maintain integrity
* 🙈 Anonymous interview mode available

---

## 📌 Roadmap

* [ ] Multi-language interview support
* [ ] Interview difficulty levels
* [ ] Recruiter scoring dashboard
* [ ] Candidate progress tracker

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Fork this repo & open a PR. ⚡


<div align="center">

### 💙 Built with code & coffee by **Tomkndn**

</div>
