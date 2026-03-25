# MeetingPro AI 🤖

**Transform meeting notes into actionable insights with AI-powered analysis**

---

## 🎯 What is MeetingPro AI?

MeetingPro AI is an intelligent meeting analysis platform that automatically converts your meeting notes into structured user stories, test cases, and technical blueprints. It saves hours of manual documentation work and helps teams move from discussion to action faster.

---

## 🌟 Key Features

### 🤖 AI-Powered Analysis
- **Smart Extraction**: Automatically identifies user stories, requirements, and action items
- **Multiple AI Providers**: Support for OpenAI (GPT-4), Google Gemini, and Groq
- **Rule-Based Fallback**: Works without API keys using pattern matching
- **Quality Scoring**: Automated assessment of story completeness (0-100)

### 📋 Smart Content Generation
- **User Stories**: Structured with acceptance criteria, priorities, and story points
- **Test Cases**: Comprehensive test scenarios linked to user stories
- **Technical Blueprint**: Architecture diagrams, API specs, and database schema
- **Business Insights**: Key findings, recommendations, and risk assessment

### 🎨 Professional Experience
- **Simplified Titles**: Clean, concise story titles (50-character limit)
- **Smart Organization**: Stories grouped by epics with collapse/expand controls
- **User Story Labels**: Clear linking between test cases and parent stories
- **Modern UI**: Responsive design with smooth animations

---

## � Who Benefits?

### 🎯 Product Owners
- **Requirements Clarity**: Transform vague discussions into structured user stories
- **Priority Management**: Automatic priority assignment and story points
- **Stakeholder Communication**: Professional documentation for reviews

### 💻 Development Teams
- **Test Planning**: Generate comprehensive test cases automatically
- **Technical Guidance**: Get architecture recommendations and API specifications
- **Implementation Ready**: Clear acceptance criteria and success metrics

### � Project Managers
- **Meeting Efficiency**: Extract actionable items from discussions
- **Risk Assessment**: Identify potential project risks early
- **Documentation**: Generate professional project documentation instantly

### 🏢 Business Teams
- **Decision Tracking**: Capture key decisions and action items
- **Strategic Insights**: Business value and impact analysis
- **Time Savings**: Reduce documentation time by 80%

---

## � Quick Start

### Step-by-Step Usage Guide

#### 1. Input Your Meeting Notes
**Option A - Copy & Paste:**
- Copy your meeting transcript or notes
- Paste directly into the left-side text editor

**Option B - Upload File:**
- Click the **"Import"** button in the toolbar
- Select your meeting transcript file (.txt, .doc, or .docx)
- File content will automatically load into the editor

#### 2. Select Analysis Mode
Choose your preferred analysis approach:
- **"AI Assistant"** (Recommended) - Uses Google Gemini AI for intelligent analysis with comprehensive test coverage
- **"Rule Based"** - Uses pattern matching without API key (faster but less detailed)

#### 3. Configure API Key (For AI Assistant Mode)
If using AI Assistant mode for the first time:
1. Click **"API Key"** button in the header
2. Select **Google Gemini** as the provider
3. Enter your Gemini API key
4. Click **"Save Key"**

#### 4. Analyze Meeting
- Click the **"Analyze Notes"** button
- Wait for processing (usually 10-30 seconds)
- System will automatically generate results

#### 5. Review Generated Results
Navigate through the tabs on the right panel to verify:
- **📋 User Stories** - Structured stories with acceptance criteria and story points
- **🧪 Test Cases** - Comprehensive test scenarios (functional, negative, edge cases)
- **🏗️ Technical Blueprint** - Architecture, API specs, and database schema
- **💡 Insights** - Key findings, recommendations, and risk assessment
- **🌳 Feature Tree** - Visual hierarchy of all identified features

#### 6. Export Results
- Click **"Export"** button to save results in your preferred format
- Options: JSON, Markdown, or copy to clipboard

---

## �🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic structure and accessibility
- **CSS3** - Modern styling with animations and responsive design
- **Vanilla JavaScript (ES6+)** - Core application logic, no dependencies
- **Font Awesome** - Professional icons and visual elements

### AI Integration
- **OpenAI GPT-4** - Advanced natural language processing
- **Google Gemini** - Google's powerful AI model
- **Groq Llama-3.3** - High-performance open-source model
- **Smart Fallback** - Rule-based analysis when AI unavailable

---

## � Quick Start

### 1. Get API Key (Optional)
Choose your preferred AI provider:
- **OpenAI**: https://platform.openai.com/api-keys
- **Google Gemini**: https://makersuite.google.com/app/apikey
- **Groq**: https://console.groq.com/keys

### 2. Configure Application
1. Click "API Key" button in header
2. Select your AI provider
3. Enter your API key
4. Click "Save Key"

### 3. Analyze Meeting
1. Paste meeting notes in editor
2. Select "AI Assistant" (recommended) or "Rule Based"
3. Click "Analyze Notes"
4. Review generated insights and export results

---

## � How It Helps

### 📈 Productivity Gains
- **80% Time Savings**: Automate documentation tasks
- **Instant Results**: Get structured output in seconds
- **Consistent Quality**: Standardized story and test case formats

### � Better Planning
- **Complete Coverage**: Ensure no requirements are missed
- **Test Readiness**: Generate comprehensive test scenarios
- **Technical Clarity**: Clear architecture and API specifications

### 🤝 Team Alignment
- **Shared Understanding**: Consistent documentation format
- **Action Tracking**: Clear action items and responsibilities
- **Stakeholder Visibility**: Professional documentation for reviews

---

## � Example Results

### Input: Sprint Planning Meeting
```
Team discussed user authentication system
Need Google OAuth integration
Password reset functionality required
Mobile responsive design
Two-factor authentication for security
```

### Output: Complete Analysis
- **5 User Stories** with acceptance criteria and story points
- **12 Test Cases** covering functional and edge scenarios
- **Technical Blueprint** with API endpoints and database schema
- **Business Insights** with implementation recommendations

---

## � Setup & Installation

### Prerequisites
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)
- Optional: API key for AI analysis

### Installation
```bash
# Clone repository
git clone https://github.com/asankhua/meetingpro-ai.git
cd meetingpro-ai

# Start local server
python3 -m http.server 8000

# Open in browser
open http://localhost:8000/
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

© 2026 Ashish Kumar Sankhua. All rights reserved.
