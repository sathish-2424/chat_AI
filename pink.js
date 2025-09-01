/**
 * @file Main JavaScript for the Pink AI Assistant application.
 * @description This file handles UI interactions, API communications, state management, and all core functionalities.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Element Selection ---
    const dom = {
        chatForm: document.getElementById('chat-form'),
        inarea: document.querySelector(".inarea input"),
        sendBtn: document.querySelector(".send-btn"),
        chatArea: document.querySelector(".chat-area"),
        resultArea: document.getElementById('chat-result'),
        helloText: document.querySelector(".hello-text"),
        micBtn: document.getElementById('phone'),
        settingsToggle: document.getElementById('settings-toggle'),
        settingsMenu: document.getElementById('settings-menu'),
        toolsToggle: document.getElementById('tools-toggle'),
        toolsMenu: document.getElementById('tools-menu'),
        userToggle: document.getElementById('user-toggle'),
        userMenu: document.getElementById('user-menu'),
        themeToggleBtn: document.getElementById('theme-toggle-btn'),
        clearChatBtn: document.getElementById('clear-chat-btn'),
        exportChatBtn: document.getElementById('export-chat-btn')
    };

    // --- Configuration ---
    const CONFIG = {
        // WARNING: Do NOT expose API keys in client-side code for production applications.
        // Use a backend proxy server to protect your keys.
        GEMINI_API_KEY: 'AIzaSyCiMMMghZmGr1uj2McJvd6JbzlyZlsI5KU',
        HUGGINGFACE_API_KEY: 'your_huggingface_api_key_here',
        MAX_CHAT_HISTORY: 50,
        TYPING_SPEED: 20, // Faster typing speed for better UX
        THEME: localStorage.getItem('chatTheme') || 'dark'
    };
    
    // --- Application State ---
    let isAIGenerating = false;

    /**
     * Manages chat history, including saving to and loading from localStorage.
     */
    class ChatHistoryManager {
        // ... (The class from your original code is excellent and can be used here as is)
        constructor() {
            this.history = JSON.parse(localStorage.getItem('chatHistory')) || [];
            this.maxHistory = CONFIG.MAX_CHAT_HISTORY;
        }
    
        addMessage(type, content, timestamp = new Date()) {
            this.history.push({ type, content, timestamp, id: Date.now().toString() });
            if (this.history.length > this.maxHistory) {
                this.history = this.history.slice(-this.maxHistory);
            }
            this.saveToStorage();
        }
    
        saveToStorage() {
            localStorage.setItem('chatHistory', JSON.stringify(this.history));
        }
    
        clearHistory() {
            this.history = [];
            this.saveToStorage();
            dom.resultArea.innerHTML = '';
            dom.helloText.classList.remove('hidden');
        }
    
        exportHistory() {
            const dataStr = JSON.stringify(this.history, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `chat-history-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
        }
    }

    /**
     * Manages theme switching (light/dark) and persists the setting.
     */
    class ThemeManager {
        constructor() {
            this.currentTheme = CONFIG.THEME;
            this.applyTheme();
        }
    
        toggleTheme() {
            this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
            this.applyTheme();
            localStorage.setItem('chatTheme', this.currentTheme);
        }
    
        applyTheme() {
            document.body.className = `theme-${this.currentTheme}`;
        }
    }

    /**
     * Provides a typing animation effect for text content.
     */
    class TypingEffect {
        static async typeText(element, text, speed = CONFIG.TYPING_SPEED) {
            // Immediately set the full HTML to ensure proper rendering of complex content
            element.innerHTML = text; 
            smoothScrollToBottom();
            
            // The typing effect below is a visual-only enhancement and can be complex
            // to get right with nested HTML. For professional apps, a simpler loading
            // state (like the indicator) is often more robust.
            // For a simpler typing effect that works with plain text:
            /*
            element.innerHTML = '';
            for (let i = 0; i < text.length; i++) {
                element.innerHTML += text.charAt(i);
                await new Promise(resolve => setTimeout(resolve, speed));
                smoothScrollToBottom();
            }
            */
        }
    }

    /**
     * Handles natural language understanding for canned responses and special commands.
     */
    class NLModule {
        // ... (The class from your original code is great, with the crucial `eval` replacement)
        constructor() {
            this.questionPatterns = {
                'greeting': [/\b(hello|hi|hey)\b/i],
                'goodbye': [/\b(bye|goodbye)\b/i],
                'image': [/\b(create|make|generate|draw).*(image|picture|photo)\b/i],
                'thanks': [/\b(thank you|thanks)\b/i],
                'math': [/\b(calculate|math|solve|what is|compute)\s+[\d.+\-*/()^]+/i],
            };
        }

        recognizeQuestion(text) {
            for (const key in this.questionPatterns) {
                if (this.questionPatterns[key].some(pattern => pattern.test(text))) {
                    return key;
                }
            }
            return 'unknown';
        }

        generateResponse(questionType, originalQuestion) {
            const responses = {
                'greeting': ["Hello! How can I help you today? 😊", "Hi there! What's on your mind? 👋"],
                'goodbye': ["Goodbye! Have a great day! 👋", "See you later! 😸"],
                'thanks': ["You're welcome! 😊", "Happy to help!"],
            };

            if (responses[questionType]) {
                const randomResponse = responses[questionType][Math.floor(Math.random() * responses[questionType].length)];
                displayAIResponse(randomResponse);
            } else if (questionType === "math") {
                this.handleMathCalculation(originalQuestion);
            } else {
                fetchGeminiResponse(originalQuestion);
            }
        }
        
        /**
         * Safely calculates mathematical expressions using the math.js library.
         * @param {string} question - The user's question containing a math problem.
         */
        handleMathCalculation(question) {
            try {
                // Sanitize and extract the expression
                const expression = question.replace(/[^0-9.+\-*/()^\s]/g, '').trim();
                if (expression) {
                    const result = math.evaluate(expression);
                    displayAIResponse(`The result is: **${result}** 🔢`);
                } else {
                    fetchGeminiResponse(question); // Fallback if expression is invalid
                }
            } catch (error) {
                console.error("Math calculation error:", error);
                displayAIResponse("I couldn't solve that math problem. It seems to be invalid. 🤔");
            }
        }
    }

    // --- Initializations ---
    const chatHistory = new ChatHistoryManager();
    const themeManager = new ThemeManager();
    const nLModule = new NLModule();

    // --- Core Functions ---

    /**
     * Main function to handle user input and orchestrate the AI response.
     * @param {string} question - The user's input text.
     */
    const handleUserRequest = (question) => {
        if (!question || isAIGenerating) return;
        
        isAIGenerating = true;
        dom.helloText.classList.add('hidden');
        displayUserMessage(question);
        chatHistory.addMessage('user', question);
        showTypingIndicator();
        
        dom.inarea.value = "";
        dom.sendBtn.style.display = 'none';

        const questionType = nLModule.recognizeQuestion(question);
        nLModule.generateResponse(questionType, question);
    };

    /**
     * Fetches a response from the Gemini AI API.
     * @param {string} question - The user's prompt.
     */
    const fetchGeminiResponse = async (question) => {
        const AI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.GEMINI_API_KEY}`;
        
        try {
            const response = await fetch(AI_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: question }] }] }),
            });

            if (!response.ok) throw new Error(`API error: ${response.status}`);
            
            const data = await response.json();
            const responseText = data.candidates[0]?.content?.parts[0]?.text;
            
            if (!responseText) throw new Error("Invalid API response format.");

            displayAIResponse(responseText);

        } catch (error) {
            console.error("Error fetching AI response:", error);
            displayError("Sorry, I'm having trouble connecting. Please try again later.");
        }
    };
    
    // --- UI Display Functions ---
    
    const displayUserMessage = (text) => {
        const userHtml = `
            <div class="resultTitle">
                <p>${text}</p>
                <img src="img/chat.jpg" alt="User Icon">
            </div>`;
        dom.resultArea.innerHTML += userHtml;
        smoothScrollToBottom();
    };

    const displayAIResponse = (text) => {
        removeTypingIndicator();
        const formattedText = formatResponseText(text);
        chatHistory.addMessage('ai', formattedText);
        
        const aiHtml = `
            <div class="resultres">
                <img src="img/chat.jpg" alt="AI Icon">
                <div class="response-text"></div>
            </div>`;
        dom.resultArea.insertAdjacentHTML('beforeend', aiHtml);
        
        const responseElement = dom.resultArea.querySelector('.resultres:last-child .response-text');
        TypingEffect.typeText(responseElement, formattedText);
        isAIGenerating = false;
    };
    
    const displayError = (message) => {
        removeTypingIndicator();
        const errorHtml = `<div class="error"><p>${message}</p></div>`;
        dom.resultArea.innerHTML += errorHtml;
        smoothScrollToBottom();
        isAIGenerating = false;
    };
    
    const showTypingIndicator = () => {
        const indicatorHtml = `
            <div class="resultres typing-indicator">
                 <img src="img/chat.jpg" alt="AI Icon">
                 <span></span><span></span><span></span>
            </div>`;
        dom.resultArea.innerHTML += indicatorHtml;
        smoothScrollToBottom();
    };

    const removeTypingIndicator = () => {
        const indicator = dom.resultArea.querySelector('.typing-indicator');
        if (indicator) indicator.remove();
    };
    
    const smoothScrollToBottom = () => {
        dom.resultArea.scrollTo({ top: dom.resultArea.scrollHeight, behavior: 'smooth' });
    };

    const formatResponseText = (text) => {
        // Basic Markdown-like formatting
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\*(.*?)\*/g, '<em>$1</em>')       // Italics
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>') // Code blocks
            .replace(/`(.*?)`/g, '<code>$1</code>')       // Inline code
            .replace(/\n/g, '<br>');                      // Newlines
    };

    // --- Event Listeners ---

    dom.chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleUserRequest(dom.inarea.value.trim());
    });
    
    dom.inarea.addEventListener('keyup', () => {
        dom.sendBtn.style.display = dom.inarea.value.trim().length > 0 ? 'inline' : 'none';
    });
    
    dom.themeToggleBtn.addEventListener('click', () => themeManager.toggleTheme());
    
    dom.clearChatBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the entire chat history?')) {
            chatHistory.clearHistory();
        }
    });

    dom.exportChatBtn.addEventListener('click', () => chatHistory.exportHistory());

    // Dropdown toggle logic
    const setupDropdown = (toggle, menu) => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('open');
        });
    };
    setupDropdown(dom.settingsToggle, dom.settingsMenu);
    setupDropdown(dom.toolsToggle, dom.toolsMenu);
    setupDropdown(dom.userToggle, dom.userMenu);
    
    // Close dropdowns if clicking outside
    document.addEventListener('click', () => {
        dom.settingsMenu.classList.remove('open');
        dom.toolsMenu.classList.remove('open');
        dom.userMenu.classList.remove('open');
    });
});