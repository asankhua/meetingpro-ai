# MeetingPro AI 🤖

**Transform your meeting notes into actionable insights with AI-powered analysis**

[![GitHub stars](https://img.shields.io/github/stars/asankhua/meetingpro-ai?style=social)](https://github.com/asankhua/meetingpro-ai)
[![GitHub forks](https://img.shields.io/github/forks/asankhua/meetingpro-ai?style=social)](https://github.com/asankhua/meetingpro-ai)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## ✨ Features

### 🎯 AI-Powered Analysis
- **Configurable AI APIs**: Support for OpenAI (GPT-4), Google Gemini (Gemini-Pro), and Groq (Llama-3.3)
- **Smart Extraction**: Automatically identifies user stories, test cases, and technical requirements
- **Title Simplification**: Removes verbose prefixes for clean, concise story titles
- **Quality Scoring**: Automated quality assessment (0-100)

### 📋 Smart Content Generation
- **User Stories**: Structured with acceptance criteria, priority, and story points
- **Test Cases**: Linked to user stories with comprehensive test scenarios
- **Technical Blueprint**: Architecture diagrams, API specs, and database schema
- **Business Insights**: Key findings, recommendations, and risk assessment

### 🎨 Enhanced User Experience
- **Collapse/Expand Controls**: Individual and global controls for stories and test cases
- **User Story Labels**: Clear linking between test cases and parent stories
- **Simplified Titles**: Clean, concise story titles (50-character limit)
- **Professional UI**: Modern, responsive design with smooth animations

### 💾 Data Management
- **Local Storage**: Save analyses to browser storage
- **Export Options**: Excel, PDF, Word, JSON, CSV formats
- **History Tracking**: Access previous analyses with timestamps
- **No Backend Required**: Everything runs client-side

---

## 🚀 Quick Start

### Option 1: Use with AI Assistant (Recommended)

1. **Get API Key**:
   - **OpenAI**: https://platform.openai.com/api-keys
   - **Google Gemini**: https://makersuite.google.com/app/apikey
   - **Groq**: https://console.groq.com/keys

2. **Configure API Key**:
   - Click the yellow "API Key" button (🔑) in header
   - Select your AI provider (OpenAI, Gemini, or Groq)
   - Enter your API key
   - Click "Save Key"

3. **Start Analyzing**:
   - Select "AI Assistant (recommended best for refined results)" mode
   - Paste your meeting notes
   - Click "Analyze Notes"
   - Wait for AI-powered analysis ✨

### Option 2: Use Rule-Based Analysis

1. Select "Rule Based" analysis mode
2. Paste meeting notes
3. Click "Analyze Notes"
4. Get instant results without API key

---

## 🌐 Live Demo

**Local Development Server:** http://localhost:8000/

```bash
# Clone the repository
git clone https://github.com/asankhua/meetingpro-ai.git
cd meetingpro-ai

# Start local server
python3 -m http.server 8000

# Open in browser
open http://localhost:8000/
```

---

## 📱 Supported Meeting Types

### 🏃‍♂️ Agile Meetings
- **Sprint Planning**: User stories with story points and priorities
- **Retrospective**: Action items and improvement suggestions
- **Daily Standup**: Progress updates and blockers

### 💼 Business Meetings
- **Client Meetings**: Requirements gathering and specifications
- **Stakeholder Meetings**: Business objectives and success metrics
- **Requirements Gathering**: Detailed feature specifications

### 🔧 Technical Meetings
- **Technical Review**: Architecture decisions and implementation plans
- **Brainstorming**: Feature ideas and technical solutions
- **Design Discussions**: UI/UX requirements and technical constraints

---

## 🎯 Example Usage

### Input: Sprint Planning Meeting
```
Sprint Planning - User Authentication System
Team discussed Google OAuth integration
Need password reset functionality
Mobile responsive design required
Should support social login (Facebook, Twitter)
Two-factor authentication for security
Remember me option
Session management
```

### Output: Complete Analysis
- **8 User Stories** with simplified titles and acceptance criteria
- **15 Test Cases** linked to user stories with priority levels
- **Technical Blueprint** with architecture diagrams
- **Business Insights** with recommendations and risk assessment

---

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic structure
- **CSS3** - Modern styling with CSS variables, animations, flexbox, grid
- **Vanilla JavaScript (ES6+)** - Core application logic, no frameworks
- **Font Awesome 6.4.0** - Icon library
- **Google Fonts (Inter)** - Typography

### AI Integration
- **OpenAI GPT-4** - Advanced natural language processing
- **Google Gemini** - Google's AI model
- **Groq Llama-3.3** - High-performance open-source model
- **Fallback System** - Rule-based analysis when AI unavailable

---

## 📊 Architecture

### Core Components
```
┌─────────────────────────────────────────────────┐
│                 Header Component                │
│  Logo | Navigation | API Key | Settings | Help │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│              Main Content Area                  │
│  ┌──────────────┐ ┌──────────────────────────┐  │
│  │ Input Panel  │ │    Results Panel         │  │
│  │              │ │  ┌────────────────────┐  │  │
│  │ - Templates  │ │  │ User Stories Tab   │  │  │
│  │ - Editor     │ │  ├────────────────────┤  │  │
│  │ - API Mode   │ │  │ Test Cases Tab     │  │  │
│  │ - Analyze    │ │  ├────────────────────┤  │  │
│  │   Button     │ │  │ Blueprint Tab      │  │  │
│  │              │ │  ├────────────────────┤  │  │
│  │              │ │  │ Insights Tab       │  │  │
│  │              │ │  └────────────────────┘  │  │
│  └──────────────┘ └──────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Key Methods
- **`analyzeMeetingNotes()`** - Main analysis entry point
- **`analyzeWithAI(notes)`** - AI-powered analysis with configurable APIs
- **`processMeetingNotes(notes)`** - Rule-based fallback analysis
- **`displayResults(analysis)`** - Orchestrates result display
- **`exportAsExcel()`** - Excel export with full data structure

---

## 🔧 Configuration

### API Key Setup
```javascript
// API keys are stored in browser localStorage
localStorage.setItem('openai_api_key', 'sk-...');
localStorage.setItem('gemini_api_key', 'AIza...');
localStorage.setItem('selected_api_type', 'openai');
```

### Analysis Modes
- **Rule Based**: Pattern matching, no API required
- **AI Assistant**: Configurable AI analysis with OpenAI/Gemini/Groq

---

## 📦 File Structure

```
meetingpro-ai/
├── index.html           # Main HTML structure
├── script.js           # Application logic (2000+ lines)
├── architecture.md      # Technical documentation
└── README.md          # This file
```

---

## 🌟 Key Features

### 🎯 Smart Analysis
- **Title Simplification**: Removes verbose prefixes automatically
- **Quality Scoring**: 0-100 quality assessment for each user story
- **Test Case Generation**: Comprehensive test scenarios linked to stories
- **Technical Blueprint**: Architecture diagrams and API specifications

### 🎨 User Experience
- **Collapse/Expand**: Individual and global controls for better navigation
- **User Story Labels**: Clear linking between test cases and parent stories
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Professional UI**: Modern design with smooth animations

### 💾 Data Management
- **Local Storage**: Analyses saved to browser storage
- **Export Options**: Excel, PDF, Word, JSON, CSV formats
- **History Tracking**: Access previous analyses with timestamps
- **Privacy-Focused**: All processing happens client-side

---

## 🔒 Security & Privacy

### Data Protection
- **Client-Side Only**: No server-side processing
- **Secure API Storage**: API keys stored in browser localStorage
- **Data Privacy**: All processing happens locally in your browser
- **No Tracking**: Zero analytics or telemetry

### API Key Security
- **Local Storage**: Keys stored securely in browser
- **Masked Display**: Shows only first 8 and last 4 characters
- **Easy Rotation**: Simple key update and removal
- **Provider Choice**: Use your preferred AI service

---

## 🎯 Use Cases

### Product Owners
- **Requirements Analysis**: Extract user stories from meeting notes
- **Prioritization**: Automatic priority assignment and story points
- **Documentation**: Generate comprehensive feature specifications

### Development Teams
- **Test Planning**: Generate test cases linked to user stories
- **Technical Architecture**: Get system design recommendations
- **Implementation Guidance**: Clear acceptance criteria and metrics

### Project Managers
- **Meeting Insights**: Extract key decisions and action items
- **Risk Assessment**: Identify potential project risks
- **Progress Tracking**: Monitor story completion and test coverage

---

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Optional: API key for AI analysis (OpenAI, Gemini, or Groq)

### Installation
1. **Clone Repository**
   ```bash
   git clone https://github.com/asankhua/meetingpro-ai.git
   cd meetingpro-ai
   ```

2. **Start Local Server**
   ```bash
   python3 -m http.server 8000
   ```

3. **Open Browser**
   ```
   http://localhost:8000/
   ```

4. **Configure API Key** (optional)
   - Click "API Key" button in header
   - Select your AI provider
   - Enter your API key
   - Click "Save"

### First Analysis
1. Paste meeting notes in the editor
2. Select analysis mode (Rule-based or AI Assistant)
3. Click "Analyze Notes"
4. Review generated user stories, test cases, and insights
5. Export results in your preferred format

---

## 📈 Performance

### Analysis Speed
- **Rule-Based**: Instant (under 1 second)
- **AI Assistant**: 5-15 seconds depending on content length
- **Large Documents**: Optimized for 200-500 word meetings

### Storage Limits
- **Local Storage**: Up to 10 saved analyses
- **History**: Automatic tracking with timestamps
- **Export**: Unlimited file downloads

---

## 🤝 Contributing

### Development Setup
```bash
# Clone repository
git clone https://github.com/asankhua/meetingpro-ai.git
cd meetingpro-ai

# Start development server
python3 -m http.server 8000

# Make changes and refresh browser
```

### Code Style
- ES6+ arrow functions
- Template literals for strings
- Async/await for promises
- Consistent naming: camelCase for variables/functions

### Testing Checklist
- [ ] All buttons clickable
- [ ] Navigation works
- [ ] Analysis completes
- [ ] Results display correctly
- [ ] Export functions work
- [ ] Responsive on mobile
- [ ] Console has no errors

---

## 🐛 Troubleshooting

### Common Issues

**"API Key Required"**
- Click "API Key" button
- Enter valid key for selected provider
- Try analysis again

**"Analysis Not Showing Results"**
- Check console for errors (F12)
- Verify API key is set
- Ensure meeting notes are substantial (>20 words)
- Check network connection

**"Buttons Not Clicking"**
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- Check console for JavaScript errors

### Support
- Check browser console (F12) for detailed logs
- Review [architecture.md](architecture.md) for technical details
- Open an issue on GitHub for bug reports

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🌟 Acknowledgments

- **OpenAI** for GPT-4 API
- **Google** for Gemini API
- **Groq** for Llama models
- **Font Awesome** for icons
- **Google Fonts** for Inter typography

---

## 📞 Contact

For issues or questions:
- 🐛 [Report Issues](https://github.com/asankhua/meetingpro-ai/issues)
- 💬 [Discussions](https://github.com/asankhua/meetingpro-ai/discussions)
- 📧 Check browser console for detailed logs

---

**Built with ❤️ using Vanilla JavaScript, HTML5, and CSS3**

**Version**: 2.1 - Production Ready  
**Status**: ✅ All features tested and working  
**Features**: 15+ major features implemented  
**Total Lines**: ~2000+ lines

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

© 2026 Ashish Kumar Sankhua. All rights reserved.
