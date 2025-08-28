# FRIEND AI 🤖

**Your Best Friend for Study and Work**

FRIEND AI is a comprehensive AI-powered web application that combines multiple tools to assist with various tasks including chat interactions, image generation, and mathematical problem solving.

## ✨ Features

- **Interactive Chat Interface** - Clean, modern chat UI with real-time messaging
- **AI Image Generator** - Convert text descriptions into images instantly
- **Math Problem Solver** - Upload math problems and get detailed solutions
- **Multi-tool Integration** - Seamlessly switch between different AI tools
- **Responsive Design** - Works perfectly on desktop and mobile devices
- **Dark/Light Mode Toggle** - Customizable theme preferences
- **File Upload Support** - Upload images and documents for processing

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (optional but recommended)

### Installation

1. **Clone or Download** the project files
```bash
git clone [your-repository-url]
cd friend-ai
```

2. **File Structure** - Ensure your project has this structure:
```
friend-ai/
├── chat.html          # Main chat interface
├── image.html         # AI Image Generator
├── maths.html         # Math Problem Solver
├── pink.css           # Main stylesheet
├── pink.js            # Main JavaScript file
├── maths.css          # Math tool stylesheet
├── maths.js           # Math tool JavaScript
├── style.css          # Image generator stylesheet
├── script.js          # Image generator JavaScript
├── loading.gif        # Loading animation
└── img/
    ├── logo/
    │   └── ChatGPT Image Mar 29, 2025, 06_22_42 AM.png
    ├── Droid@1-1536x776.png
    ├── res.svg
    ├── back.jpg
    └── images/
        └── img-1.jpg
```

3. **Launch the Application**
   - **Option A**: Open `chat.html` directly in your browser
   - **Option B**: Use a local server (recommended)
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (if you have live-server installed)
   npx live-server
   ```

4. **Access the Application**
   - Direct: `file:///path/to/your/chat.html`
   - Local server: `http://localhost:8000/chat.html`

## 🎯 Usage Guide

### Main Chat Interface (`chat.html`)
- **Start Chatting**: Type in the input field at the bottom
- **Quick Actions**: Use the shortcut buttons for common tasks
- **File Upload**: Click the paperclip icon to upload files
- **Voice Input**: Click the microphone icon (if implemented)
- **Tools Access**: Click the tools button in the top-right corner

### Keyboard Shortcuts
- **`/`** - Focus on input field
- **`Enter`** - Send message / Start chatting
- **`Ctrl + ?`** - Reset chat (new conversation)

### AI Image Generator (`image.html`)
1. Enter a detailed description of the image you want
2. Click "Generate" button
3. Wait for the AI to create your image
4. Download or save the generated image

### Math Problem Solver (`maths.html`)
1. Upload an image of your math problem
2. Click "Answer" to process
3. View the detailed solution provided by AI

## 🛠️ Customization

### Themes
- Toggle between light and dark modes using the sun/moon icon
- Modify colors in `pink.css` for custom themes

### Adding New Tools
1. Create a new HTML file for your tool
2. Add navigation links in `chat.html`
3. Update the tools dropdown menu
4. Include necessary CSS and JavaScript files

### Styling
- **Main Interface**: Edit `pink.css`
- **Image Generator**: Edit `style.css`
- **Math Solver**: Edit `maths.css`

## 🔧 Configuration

### API Integration
To enable full functionality, you may need to configure API endpoints:

1. **Image Generation**: Update API endpoint in `script.js`
2. **Math Solving**: Configure OCR and AI services in `maths.js`
3. **Chat Features**: Add your preferred AI chat API

### Environment Variables
Create a `.env` file for sensitive configurations:
```env
AI_API_KEY=your_api_key_here
IMAGE_API_URL=your_image_api_url
MATH_API_URL=your_math_api_url
```

## 📱 Browser Compatibility

| Browser | Version | Status |
|---------|---------|---------|
| Chrome  | 80+     | ✅ Full Support |
| Firefox | 75+     | ✅ Full Support |
| Safari  | 13+     | ✅ Full Support |
| Edge    | 80+     | ✅ Full Support |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Box Icons** - For beautiful icons throughout the app
- **AOS Library** - For smooth animations
- **Font Awesome** - Additional icon support
- **Spline Viewer** - For 3D elements integration

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) section
2. Create a new issue with detailed description
3. Contact: sathish024@gmail.com

## 🔄 Updates

### Version 1.0.0
- Initial release with chat interface
- Image generation tool
- Math problem solver
- Responsive design implementation

---

**Made with ❤️ by the FRIEND AI Team**

*"Your best friend for study and work!"*