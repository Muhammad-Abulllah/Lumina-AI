# ✨ Lumina AI

> **A Next-Gen Multimodal Code Assistant focused on "Vibe Coding."**
> *Built for the Google Gemini Hackathon.*

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)


---

## 💡 Inspiration
"Vibe Coding" is the future of development—where you don't just write syntax, you communicate intent. I wanted to build an assistant that bridges the gap between **visual design** and **code**. Lumina AI isn't just a chatbot; it's an engineering partner that can "see" an animation or UI interaction and instantly write the code to replicate it.

## 🚀 What It Does
Lumina AI is a React-based intelligent assistant powered by the **Google Gemini API**.

* **Multimodal "Vision"**: You can upload images or **video clips** (mp4), and Lumina analyzes them frame-by-frame.
* **Video-to-Code**: Show Lumina a video of a complex UI animation (like a Tinder swipe or a bouncy button), and it generates the **React + Framer Motion** code to recreate it pixel-perfectly.
* **Smart Context**: Remembers your conversation history for iterative coding.
* **Developer Experience**: Features full syntax highlighting, dark/light mode toggles, and mobile responsiveness.

## 🛠️ Tech Stack
* **Frontend:** React (Vite), TypeScript
* **Styling:** Tailwind CSS
* **Animations:** Framer Motion
* **AI Model:** Google Gemini 1.5 Pro / Gemini 3 Pro (via Google AI Studio)
* **Icons:** Lucide React

## ✨ Key Features Implemented
* ✅ **Real-time Streaming Responses**
* ✅ **Video Analysis** (Multimodal inputs)
* ✅ **Syntax Highlighting** for code blocks (supports JS, React, Python, etc.)
* ✅ **Dark/Light Mode** Theme Toggle
* ✅ **Responsive Sidebar** & Mobile Layout

## 📸 Showcase: The "Tinder Swipe" Test
To prove the "Vibe Coding" capabilities, I fed Lumina a video of a card stack interaction. It successfully generated the complex physics code using `useTransform` and `dragConstraints`.

*(Optional: Add a GIF here of your card stack in action)*

## ⚙️ How to Run Locally

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/yourusername/lumina-ai.git](https://github.com/yourusername/lumina-ai.git)
    cd lumina-ai
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**
    Create a `.env` file in the root directory and add your Google Gemini API key:
    ```env
    VITE_GEMINI_API_KEY=your_api_key_here
    ```

4.  **Run the App**
    ```bash
    npm run dev
    ```

## 🤝 Contributing
Feedback and contributions are welcome! This project was built as a submission for the Gemini API Developer Competition.

## 📄 License
MIT License
