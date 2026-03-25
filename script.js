// MeetingPro AI - Main Application Script
const MAX_HISTORY = 10;

class MeetingNotesAnalyzer {
    constructor() {
        this.currentAnalysis = null;
        this.analysisHistory = [];
        this.savedAnalyses = {};
        this.lastAnalysisTime = null;
        this.currentTestCases = [];
        this.originalTestCases = [];
    }

    getApiKey() {
        const apiKeyType = localStorage.getItem('selected_api_type') || 'openai';
        const apiKey = localStorage.getItem(`${apiKeyType}_api_key`);
        return { type: apiKeyType, key: apiKey };
    }

    getApiUrl() {
        const apiKeyType = localStorage.getItem('selected_api_type') || 'gemini';
        const { key: apiKey } = this.getApiKey();
        
        console.log('getApiUrl called:', { apiKeyType, hasKey: !!apiKey });
        
        switch (apiKeyType) {
            case 'openai':
                return 'https://api.openai.com/v1/chat/completions';
            case 'gemini':
                // Gemini 2.5 Flash stable model endpoint
                return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
            default:
                return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        }
    }

    getApiModel() {
        const apiKeyType = localStorage.getItem('selected_api_type') || 'gemini';
        switch (apiKeyType) {
            case 'openai':
                return 'gpt-4';
            case 'gemini':
                return 'gemini-2.5-flash';
            default:
                return 'gemini-2.5-flash';
        }
    }

    initializeApp() {
        console.log('Initializing MeetingPro AI...');
        this.initializeTemplates();
        this.initializeEventListeners();
        this.initializeNavigation();
        this.initializeWordCounter();
        this.initializeToolbar();
        this.loadFromStorage();
        this.updateSettingsPanel();
        console.log('Application initialized!');
    }

    initializeTemplates() {
        this.templates = {
            'sprint-planning': `Sprint Planning Meeting\nDate: [Date]\nAttendees: [Team Members]\n\nAgenda:\n- Review sprint goal\n- Discuss user stories\n- Estimate effort\n- Assign tasks\n\nDiscussion Points:\n[Add your notes here]`,
            'retrospective': `Sprint Retrospective\nDate: [Date]\nAttendees: [Team Members]\n\nWhat Went Well:\n- \n- \n\nWhat Could Be Improved:\n- \n- \n\nAction Items:\n- \n-`,
            'client-meeting': `Client Meeting\nClient: [Client Name]\nDate: [Date]\nAttendees: [Names]\n\nObjectives:\n- Understand client requirements\n- Discuss project timeline\n- Address concerns\n\nKey Requirements Discussed:\n[Add notes here]`,
            'technical-review': `Technical Review Meeting\nDate: [Date]\nReviewers: [Names]\n\nSystem Components Reviewed:\n- Architecture\n- Code quality\n- Performance\n- Security\n\nFindings:\n[Add findings here]\n\nRecommendations:\n[Add recommendations here]`,
            'brainstorming': `Brainstorming Session\nTopic: [Topic]\nDate: [Date]\nParticipants: [Names]\n\nIdeas Generated:\n- \n- \n\nPrioritized Ideas:\n1. \n2. \n\nNext Steps:\n- `,
            'requirements-gathering': `Requirements Gathering\nProject: [Project Name]\nDate: [Date]\nStakeholders: [Names]\n\nFunctional Requirements:\n- \n- \n\nNon-Functional Requirements:\n- Performance\n- Security\n- Scalability\n\nUser Roles:\n- \n-`,
            'stakeholder-meeting': `Stakeholder Meeting\nProject: [Project Name]\nDate: [Date]\nStakeholders: [Names]\n\nProject Status:\n- Current progress\n- Upcoming milestones\n\nKey Decisions:\n- \n- \n\nConcerns Raised:\n- \n-`
        };
    }

    initializeEventListeners() {
        document.getElementById('analyzeBtn').addEventListener('click', () => this.analyzeMeetingNotes());
        document.getElementById('templateSelect').addEventListener('change', (e) => this.loadTemplate(e.target.value));
        document.getElementById('importBtn').addEventListener('click', () => this.importFile());
        document.getElementById('quickExportBtn').addEventListener('click', () => this.showExportOptions());
        document.getElementById('historyBtn').addEventListener('click', () => this.showHistory());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveCurrentAnalysis());
        document.getElementById('apiKeyBtn').addEventListener('click', () => this.showApiKeyModal());
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettingsModal());
        document.getElementById('helpBtn').addEventListener('click', () => this.showHelpModal());
        document.getElementById('profileBtn').addEventListener('click', () => this.showToast('Profile feature coming soon!', 'info'));
        document.getElementById('saveApiKeyBtn').addEventListener('click', () => this.saveApiKey());
        document.getElementById('clearDataBtn').addEventListener('click', () => this.clearAllData());
        document.getElementById('linkBtn').addEventListener('click', () => this.insertLink());
        
        // Analysis Mode radio button listener
        document.querySelectorAll('input[name="analysisMode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'ai') {
                    const { key: apiKey } = this.getApiKey();
                    if (!apiKey) {
                        this.showToast('Please configure API key for AI Assistant mode', 'warning');
                        this.showApiKeyModal();
                    }
                }
            });
        });
        
        document.querySelectorAll('.modal-close, .ModalClose').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });
        
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.closeModals();
            });
        });
    }

    initializeNavigation() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.switchSection(section);
            });
        });
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchResultTab(tab);
            });
        });
    }

    initializeWordCounter() {
        const textarea = document.getElementById('meetingNotes');
        textarea.addEventListener('input', () => {
            const text = textarea.value;
            const words = text.trim() ? text.trim().split(/\s+/).length : 0;
            const chars = text.length;
            document.getElementById('wordCount').textContent = words;
            document.getElementById('charCount').textContent = chars;
        });
    }

    initializeToolbar() {
        document.querySelectorAll('.toolbar-btn[data-command]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const command = e.currentTarget.dataset.command;
                const value = e.currentTarget.dataset.value || null;
                document.execCommand(command, false, value);
            });
        });
    }

    switchSection(sectionName) {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
        document.querySelector(`[data-section="${sectionName}"]`)?.classList.add('active');
        document.getElementById(`${sectionName}-section`)?.classList.add('active');
        
        if (sectionName === 'export') {
            this.displayExportOptions();
        }
        
        this.showToast(`Switched to ${sectionName}`, 'success');
    }

    switchResultTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('[data-tab-content]').forEach(content => content.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
        document.querySelector(`[data-tab-content="${tabName}"]`)?.classList.add('active');
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (show) overlay.classList.add('active');
        else overlay.classList.remove('active');
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
        toast.innerHTML = `<div class="toast-icon ${type}"><i class="fas ${icons[type]}"></i></div><div class="toast-message">${message}</div>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    closeModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => modal.classList.remove('active'));
    }

    loadTemplate(templateName) {
        if (!templateName) return;
        const template = this.templates[templateName];
        if (template) {
            document.getElementById('meetingNotes').value = template;
            document.getElementById('meetingNotes').dispatchEvent(new Event('input'));
            this.showToast('Template loaded!', 'success');
        }
    }

    importFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt,.doc,.docx';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    document.getElementById('meetingNotes').value = event.target.result;
                    document.getElementById('meetingNotes').dispatchEvent(new Event('input'));
                    this.showToast('File imported!', 'success');
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    insertLink() {
        const url = prompt('Enter URL:');
        if (url) document.execCommand('createLink', false, url);
    }

    async analyzeMeetingNotes() {
        const notes = document.getElementById('meetingNotes').value.trim();
        const analysisMode = document.querySelector('input[name="analysisMode"]:checked')?.value || 'fallback';
        
        if (!notes) {
            this.showToast('Please enter meeting notes!', 'error');
            return;
        }
        if (notes.split(/\s+/).length < 20) {
            this.showToast('Meeting notes too short (min 20 words)', 'warning');
            return;
        }

        this.showLoading(true);
        const btn = document.getElementById('analyzeBtn');
        btn.classList.add('loading');
        btn.disabled = true;

        try {
            let analysis;
            
            if (analysisMode === 'fallback') {
                // Force fallback mode
                this.showToast('Using rule-based analysis', 'info');
                analysis = this.processMeetingNotes(notes);
            } else if (analysisMode === 'ai') {
                const { type: apiKeyType, key: apiKey } = this.getApiKey();
                
                if (!apiKey) {
                    this.showToast('Please configure API key for AI Assistant mode', 'warning');
                    this.showApiKeyModal();
                    this.showLoading(false);
                    btn.classList.remove('loading');
                    btn.disabled = false;
                    return;
                }
                
                // Try AI mode
                try {
                    console.log('Starting AI analysis with mode:', analysisMode);
                    analysis = await this.analyzeWithAI(notes);
                    this.showToast(`${apiKeyType.charAt(0).toUpperCase() + apiKeyType.slice(1)} analysis completed!`, 'success');
                } catch (error) {
                    console.error('AI failed with error:', error);
                    this.showToast(`AI failed: ${error.message}. Using fallback analysis`, 'warning');
                    analysis = this.processMeetingNotes(notes);
                }
            } else {
                // No API key or AI not available
                this.showToast('Please select analysis mode', 'warning');
                analysis = this.processMeetingNotes(notes);
            }

            this.currentAnalysis = analysis;
            this.lastAnalysisTime = new Date();
            this.displayResults(analysis);
            this.saveToHistory(analysis);
            this.updateFooter();
            this.updateDashboard();
            
            this.showLoading(false);
            btn.classList.remove('loading');
            btn.disabled = false;
        } catch (error) {
            console.error('Analysis error:', error);
            this.showLoading(false);
            btn.classList.remove('loading');
            btn.disabled = false;
            this.showToast('Analysis failed: ' + error.message, 'error');
        }
    }

    async analyzeWithAI(notes) {
        const { type: apiKeyType, key: apiKey } = this.getApiKey();
        
        if (!apiKey) {
            throw new Error('No API key configured');
        }

        let prompt, requestConfig, responseParser;

        if (apiKeyType === 'gemini') {
            prompt = `Analyze meeting notes and return ONLY valid JSON with this structure:
{
  "userStories": [{"id":"US-001","title":"Title","description":"As a [role], I want [feature], so that [benefit]","userRole":"role","benefit":"benefit","businessObjective":"objective","priority":"High|Medium|Low","storyPoints":5,"effort":"High|Medium|Low","risk":"High|Medium|Low","complexity":"High|Medium|Low","category":"category","epic":"epic name","acceptanceCriteria":["c1"],"dependencies":[],"successMetrics":["m1"],"assumptions":[],"qualityScore":85}],
  "testCases": [{"id":"TC-001","title":"Title","type":"Functional","priority":"High|Medium|Low","relatedStory":"US-001","preconditions":["p1"],"steps":["s1"],"expectedResults":["r1"]}],
  "technicalBlueprint": {"components":[{"name":"Component","type":"Frontend|Backend|Database","description":"Desc","technologies":["t1"],"responsibilities":["r1"]}],"architecture":{"type":"Type","diagram":"graph TB\\nA-->B"},"apiSpecs":[{"endpoint":"/api","method":"GET","description":"Desc"}],"databaseSchema":{"tables":[{"name":"table","columns":[{"name":"col","type":"VARCHAR","constraints":["PRIMARY KEY"]}]}]},
  "insights": {"keyFindings":["f1"],"recommendations":["r1"],"risks":["risk1"],"successMetrics":["m1"]}
}

Meeting Notes:
${notes}`;

            requestConfig = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            };

            responseParser = (data) => {
                const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!content) throw new Error('No content in Gemini response');
                
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (!jsonMatch) throw new Error('No JSON found in Gemini response');
                return JSON.parse(jsonMatch[0]);
            };

        } else {
            // OpenAI compatible format
            prompt = `Analyze meeting notes and return ONLY valid JSON with this structure:
{
  "userStories": [{"id":"US-001","title":"Title","description":"As a [role], I want [feature], so that [benefit]","userRole":"role","benefit":"benefit","businessObjective":"objective","priority":"High|Medium|Low","storyPoints":5,"effort":"High|Medium|Low","risk":"High|Medium|Low","complexity":"High|Medium|Low","category":"category","epic":"epic name","acceptanceCriteria":["c1"],"dependencies":[],"successMetrics":["m1"],"assumptions":[],"qualityScore":85}],
  "testCases": [{"id":"TC-001","title":"Title","type":"Functional","priority":"High|Medium|Low","relatedStory":"US-001","preconditions":["p1"],"steps":["s1"],"expectedResults":["r1"]}],
  "technicalBlueprint": {"components":[{"name":"Component","type":"Frontend|Backend|Database","description":"Desc","technologies":["t1"],"responsibilities":["r1"]}],"architecture":{"type":"Type","diagram":"graph TB\\nA-->B"},"apiSpecs":[{"endpoint":"/api","method":"GET","description":"Desc"}],"databaseSchema":{"tables":[{"name":"table","columns":[{"name":"col","type":"VARCHAR","constraints":["PRIMARY KEY"]}]}]},
  "insights": {"keyFindings":["f1"],"recommendations":["r1"],"risks":["risk1"],"successMetrics":["m1"]}
}

Meeting Notes:
${notes}`;

            requestConfig = {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.getApiModel(),
                    messages: [
                        { role: 'system', content: 'You are an expert business analyst. Extract user stories, test cases, and technical requirements from meeting notes. Always respond with valid JSON only.' },
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: 4000,
                    temperature: 0.7
                })
            };

            responseParser = (data) => {
                const content = data.choices?.[0]?.message?.content;
                if (!content) throw new Error('No content in API response');
                
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (!jsonMatch) throw new Error('No JSON found in API response');
                return JSON.parse(jsonMatch[0]);
            };
        }

        const response = await fetch(this.getApiUrl(), requestConfig);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return responseParser(data);
    }

    generateStepsForAC(ac, storyTitle) {
        const a = ac.toLowerCase();
        if (/\b(?:login|sign.?in|log.?in|authenticate)\b/.test(a))
            return [`Navigate to the login/authentication page for "${storyTitle}"`, 'Enter valid credentials (username/email and password)', 'Submit the authentication form', 'Verify the system authenticates and grants the correct access'];
        if (/\b(?:register|sign.?up|create account|onboard)\b/.test(a))
            return [`Navigate to the registration page for "${storyTitle}"`, 'Fill in all required registration fields with valid data', 'Submit the registration form', 'Verify account is created and a confirmation is shown'];
        if (/\b(?:search|filter|sort|query|find|browse)\b/.test(a))
            return [`Navigate to the search/filter section for "${storyTitle}"`, 'Enter valid search terms or set filter criteria', 'Execute the search or apply the filter', 'Verify the displayed results match the entered criteria'];
        if (/\b(?:upload|import|attach|file|document)\b/.test(a))
            return [`Navigate to the upload/import section for "${storyTitle}"`, 'Select a valid file in the supported format', 'Initiate the upload or import operation', 'Verify the file is processed and a success confirmation is shown'];
        if (/\b(?:download|export|generate|report|extract)\b/.test(a))
            return [`Navigate to the export/download section for "${storyTitle}"`, 'Select the desired format or report options', 'Trigger the export or download action', 'Verify the file is generated and downloads successfully'];
        if (/\b(?:notif|email|sms|alert|remind|push message)\b/.test(a))
            return [`Set up the triggering condition for the notification in "${storyTitle}"`, 'Trigger the event that should send the notification', 'Wait for the notification to be delivered', 'Verify the notification is received with the correct content and format'];
        if (/\b(?:payment|checkout|purchase|billing|invoice)\b/.test(a))
            return [`Navigate to the payment/checkout section for "${storyTitle}"`, 'Enter valid payment details', 'Submit the payment', 'Verify the payment is processed and a confirmation receipt is displayed'];
        if (/\b(?:error|invalid|validat|reject|block|fail|prevent|unauthori)\b/.test(a))
            return [`Navigate to the relevant section for "${storyTitle}"`, 'Enter or trigger the condition that should cause the validation/error', 'Attempt to proceed with the invalid state', 'Observe the error message and feedback provided to the user'];
        if (/\b(?:permission|role|access|authoriz)\b/.test(a))
            return [`Log in as a user with the relevant role/permission for "${storyTitle}"`, 'Attempt to access the protected feature or perform the action', 'Verify access is granted or denied correctly based on role', 'Confirm that unauthorised users see the appropriate access-denied response'];
        if (/\b(?:dashboard|analytics|report|chart|graph|statistic|metric)\b/.test(a))
            return [`Navigate to the dashboard/analytics section for "${storyTitle}"`, 'Ensure there is sufficient data available to display', 'Observe the rendered charts, graphs, or statistics', 'Verify the displayed data accurately matches the underlying source data'];
        if (/\b(?:password|reset|forgot|change password)\b/.test(a))
            return [`Navigate to the password reset/change page for "${storyTitle}"`, 'Enter the required information (email or current password)', 'Submit the reset or change request', 'Verify the password is updated and a confirmation is shown'];
        if (/\b(?:profile|setting|preference|account detail)\b/.test(a))
            return [`Navigate to the profile/settings section for "${storyTitle}"`, 'Modify the relevant profile or setting fields', 'Save the changes', 'Verify the changes are persisted and reflected immediately in the UI'];
        return [
            `Navigate to the "${storyTitle}" feature and set up the required initial state`,
            `Perform the action described by: "${ac.substring(0, 70)}"`,
            'Submit or confirm the action',
            'Verify the outcome matches the acceptance criterion exactly',
        ];
    }

    calculateStoryPoints(title, acCount, priority) {
        // Complexity factors
        const complexityKeywords = {
            high: ['integrate', 'automation', 'workflow', 'machine learning', 'ai', 'algorithm', 'real-time', 'sync', 'multiple', 'complex', 'advanced'],
            medium: ['dashboard', 'report', 'filter', 'search', 'notification', 'email', 'export', 'import', 'batch'],
            low: ['view', 'display', 'show', 'basic', 'simple', 'static', 'page', 'button', 'link']
        };
        
        const titleLower = title.toLowerCase();
        let complexityScore = 0;
        
        complexityKeywords.high.forEach(kw => { if (titleLower.includes(kw)) complexityScore += 3; });
        complexityKeywords.medium.forEach(kw => { if (titleLower.includes(kw)) complexityScore += 2; });
        complexityKeywords.low.forEach(kw => { if (titleLower.includes(kw)) complexityScore += 1; });
        
        // Base points by priority
        let basePoints = priority === 'High' ? 5 : priority === 'Medium' ? 3 : 2;
        
        // Adjust for AC count (more ACs = more complex)
        const acFactor = Math.min(acCount * 0.5, 3);
        
        // Calculate final points using modified Fibonacci
        const totalScore = basePoints + (complexityScore * 0.5) + acFactor;
        const fibonacci = [1, 2, 3, 5, 8, 13, 21];
        const points = fibonacci.find(f => f >= totalScore) || 8;
        
        return points;
    }

    categorizeToEpic(line) {
        const lower = line.toLowerCase();
        const epicMap = [
            { re: /auth|login|logout|register|password|sign.?in|sign.?up|otp|2fa|sso/, epic: 'Authentication & Access' },
            { re: /user|profile|account|preference|avatar/, epic: 'User Management' },
            { re: /search|filter|sort|find|query|browse|discover/, epic: 'Search & Discovery' },
            { re: /report|analytics|dashboard|chart|graph|metric|statistic|kpi/, epic: 'Analytics & Reporting' },
            { re: /notif|alert|remind|email|sms|push|message|inbox/, epic: 'Notifications' },
            { re: /payment|billing|invoice|subscription|checkout|purchase|refund/, epic: 'Payments & Billing' },
            { re: /upload|import|export|download|file|document|attach|media|image/, epic: 'File Management' },
            { re: /admin|manage|moderate|role|permission|access control/, epic: 'Administration' },
            { re: /api|integration|webhook|connect|sync|third.?party|oauth/, epic: 'Integrations' },
            { re: /security|encrypt|protect|privacy|gdpr|audit|compliance/, epic: 'Security & Privacy' },
            { re: /mobile|responsive|app|device|ios|android/, epic: 'Mobile Experience' },
            { re: /performance|speed|optim|cache|scalab/, epic: 'Performance' },
        ];
        for (const { re, epic } of epicMap) {
            if (re.test(lower)) return epic;
        }
        return 'Core Features';
    }

    processMeetingNotes(notes) {
        const lines = notes.split('\n').filter(l => l.trim());
        const stories = [];
        const testCases = [];
        const seen = new Set();

        const storyPatterns = [
            // Classic "As a ... I want to ..." format
            { re: /(?:as an?)\s+([^,]+),?\s*(?:i\s+)?(?:want to|need to|would like to|should be able to)\s+(.+)/i, titleIdx: 2, roleIdx: 1 },
            // "[User type] should/must/can/wants to"
            { re: /(?:user|admin|customer|manager|team|client|employee|operator|developer)\s+(?:should|must|needs? to|can|wants? to|has to)\s+(.+)/i, titleIdx: 1, roleIdx: null },
            // "We need/want/should/must"
            { re: /(?:we need|we want|we should|we must|we will|we plan to|we would like to)\s+(?:to\s+)?(.+)/i, titleIdx: 1, roleIdx: null },
            // Action verbs at sentence start
            { re: /(?:implement|add|create|build|develop|enable|allow|support|introduce|provide|integrate|design|configure|automate)\s+(.+)/i, titleIdx: 1, roleIdx: null },
            // "The system/app/platform should/must/shall"
            { re: /(?:the system|the app|the platform|the application|the service|the tool)\s+(?:should|must|shall|will|needs? to|has to)\s+(.+)/i, titleIdx: 1, roleIdx: null },
            // Labelled features
            { re: /(?:feature|functionality|requirement|capability|user story|story|module|component):\s*(.+)/i, titleIdx: 1, roleIdx: null },
            // Meeting action items
            { re: /(?:action item|action:|ai:|todo:|task:|follow.?up:|deliverable:)\s*(.+)/i, titleIdx: 1, roleIdx: null },
            // Decisions and agreements
            { re: /(?:agreed to|decided to|decision:|we agreed that|we decided|we will be)\s+(?:to\s+)?(.+)/i, titleIdx: 1, roleIdx: null },
            // Client/stakeholder requests
            { re: /(?:client|customer|stakeholder|product owner|po)\s+(?:wants?|requests?|asked for|needs?|expects?|requires?)\s+(.+)/i, titleIdx: 1, roleIdx: null },
            // Questions implying features
            { re: /(?:can we|could we|should we|is it possible to|how about)\s+(.+?)(?:\?|$)/i, titleIdx: 1, roleIdx: null },
            // "It is required/necessary to"
            { re: /(?:it is|it's|it should be)\s+(?:required|necessary|important|essential|critical)\s+(?:that\s+|for\s+[\w\s]+\s+)?(?:to\s+)?(.+)/i, titleIdx: 1, roleIdx: null },
            // Numbered requirement lines ("1. Login should ...")
            { re: /^\d+\.\s+(.+(?:should|must|needs?|will|shall|can|has to).+)/i, titleIdx: 1, roleIdx: null },
            // Requirement ID labels (REQ-1:, FR-2:, BR-3:)
            { re: /^(?:req|fr|nfr|br|ar|ur|sr)\s*[-_]?\d+[.:]\s*(.+)/i, titleIdx: 1, roleIdx: null },
            // "Need to / Have to / Going to"
            { re: /(?:need to|have to|has to|going to|plan to|expected to)\s+(.+)/i, titleIdx: 1, roleIdx: null },
            // Generic "should/must" sentences (last resort)
            { re: /(?:should|must|required to|needs? to)\s+(?:be able to\s+)?(?:have\s+|provide\s+|include\s+)?(.+)/i, titleIdx: 1, roleIdx: null },
        ];

        // Helper: skip obvious meeting headers
        const isMeetingMeta = (l) => /^(?:date|time|attendees?|participants?|location|meeting|sprint|agenda|topic|subject|project|team|prepared by|version|objective|goal|summary|minutes|recap)\s*:/i.test(l);

        for (let idx = 0; idx < lines.length && stories.length < 20; idx++) {
            const line = lines[idx];
            if (isMeetingMeta(line)) continue;

            for (const { re, titleIdx, roleIdx } of storyPatterns) {
                const match = line.match(re);
                if (!match) continue;

                const rawTitle = (match[titleIdx] || line).trim().replace(/[.!?,;:]+$/, '');
                if (rawTitle.length < 8) break;
                
                // Simplify title by removing common prefixes and making it more concise
                let simplifiedTitle = rawTitle
                    .replace(/^(?:we need|we want|we should|we must|we will|we plan to|we would like to)\s+/i, '')
                    .replace(/^(?:the system|the app|the platform|the application|the service|the tool)\s+(?:should|must|shall|will|needs? to|has to)\s+/i, '')
                    .replace(/^(?:user|admin|customer|manager|team|client|employee|operator|developer)\s+(?:should|must|needs? to|can|wants? to|has to)\s+/i, '')
                    .replace(/^(?:feature|functionality|requirement|capability|user story|story|module|component):\s*/i, '')
                    .replace(/^(?:action item|action:|ai:|todo:|task:|follow.?up:|deliverable:)\s*/i, '')
                    .replace(/^(?:agreed to|decided to|decision:|we agreed that|we decided|we will be)\s+/i, '')
                    .replace(/^(?:client|customer|stakeholder|product owner|po)\s+(?:wants?|requests?|asked for|needs?|expects?|requires?)\s+/i, '')
                    .replace(/^(?:can we|could we|should we|is it possible to|how about)\s+/i, '')
                    .replace(/^(?:it is|it's|it should be)\s+(?:required|necessary|important|essential|critical)\s+(?:that\s+|for\s+[\w\s]+\s+)?(?:to\s+)?/i, '')
                    .replace(/^(?:need to|have to|has to|going to|plan to|expected to)\s+/i, '')
                    .replace(/^\d+\.\s*/, '') // Remove numbered prefixes
                    .replace(/^(?:req|fr|nfr|br|ar|ur|sr)\s*[-_]?\d+[.:]\s*/i, '') // Remove requirement IDs
                    .trim();
                
                // If simplification made it too short, use original but shorter
                if (simplifiedTitle.length < 10) {
                    simplifiedTitle = rawTitle.length > 60 ? rawTitle.substring(0, 60) + '...' : rawTitle;
                } else {
                    // Limit simplified title length
                    simplifiedTitle = simplifiedTitle.length > 50 ? simplifiedTitle.substring(0, 50) + '...' : simplifiedTitle;
                }
                
                const title = simplifiedTitle;
                const key = title.toLowerCase().replace(/\s+/g, ' ').substring(0, 35);
                if (seen.has(key)) break;
                seen.add(key);

                const role = roleIdx ? (match[roleIdx]?.trim().split(/\s+/).slice(0, 3).join(' ') || 'User') : 'User';
                const storyNum = stories.length;
                const priority = storyNum < 3 ? 'High' : storyNum < 7 ? 'Medium' : 'Low';

                // --- Extract ACs from lines AFTER the story (stop at next story) ---
                const criteria = [];
                for (let ci = idx + 1; ci < Math.min(lines.length, idx + 9) && criteria.length < 5; ci++) {
                    const cl = lines[ci].trim();
                    if (!cl || isMeetingMeta(cl)) continue;
                    // Stop if this line matches another story pattern
                    let isNext = false;
                    for (const { re: pr } of storyPatterns) { if (pr.test(cl)) { isNext = true; break; } }
                    if (isNext) break;
                    // Accept as AC: GWT, bullet point, short must/should, or verify statement
                    const isGWT = /^(?:given|when|then)\b/i.test(cl);
                    const isBullet = /^[-*•]\s+\S/.test(cl);
                    const isVerify = /^(?:verify|ensure|confirm|validate|check)\s+(?:that\s+)?\S/i.test(cl);
                    const isShort = /\b(?:should|must|shall)\b/i.test(cl) && cl.length < 130 && !isMeetingMeta(cl);
                    if (isGWT || isBullet || isVerify || isShort) {
                        const c = cl.replace(/^[-*•]\s*/, '').replace(/^(?:given|when|then)\s*/i, '').trim().substring(0, 130);
                        if (c.length > 12 && !criteria.includes(c)) criteria.push(c);
                    }
                }
                // Fallback ACs when none extracted from notes
                if (criteria.length === 0) {
                    criteria.push(`User can successfully ${title.toLowerCase()} without encountering errors or system failures`);
                    criteria.push('All required input fields are validated with clear, descriptive error messages');
                    criteria.push('A success confirmation is shown to user upon completion');
                    criteria.push('The feature behaves consistently across desktop and mobile browsers');
                } else if (criteria.length < 2) {
                    // Only add generic ACs if we have at least one specific one
                    criteria.push('All required input fields are validated with clear error messages');
                    criteria.push('A success confirmation is shown to user upon completion');
                }

                stories.push({
                    id: `US-${String(storyNum + 1).padStart(3, '0')}`,
                    title,
                    description: `As a ${role}, I want to ${title.toLowerCase()} so that I can achieve my goal efficiently.`,
                    userRole: role,
                    benefit: 'Improved efficiency and user experience',
                    businessObjective: 'Deliver measurable value to end users',
                    priority,
                    storyPoints: this.calculateStoryPoints(title, criteria.length, priority),
                    estimationFramework: 'Complexity-Based',
                    effort: priority,
                    risk: 'Medium',
                    complexity: priority === 'High' ? 'High' : 'Medium',
                    category: 'Feature',
                    epic: this.categorizeToEpic(line),
                    acceptanceCriteria: criteria.slice(0, 5),
                    dependencies: [],
                    successMetrics: [`"${title}" adopted by > 80% of target users`],
                    assumptions: ['User has appropriate access rights and permissions'],
                    qualityScore: priority === 'High' ? 88 : priority === 'Medium' ? 78 : 70
                });
                break;
            }
        }

        if (stories.length === 0) {
            stories.push({
                id: 'US-001', title: 'Core Application Feature',
                description: 'As a user, I want the core feature so that I can use the system effectively',
                userRole: 'User', benefit: 'Use system', businessObjective: 'Deliver value',
                priority: 'High', storyPoints: 5, effort: 'Medium', risk: 'Low', complexity: 'Medium',
                category: 'Core', epic: 'Core Features',
                acceptanceCriteria: ['Feature works without errors', 'System validates inputs correctly', 'User receives confirmation on success', 'Feature is responsive on all devices'],
                dependencies: [], successMetrics: ['Usage rate > 80%'], assumptions: [], qualityScore: 75
            });
        }

        // --- Generate test cases: 1 per AC + 1 negative + 1 edge case per story ---
        const priorityMap = { High: 'P1', Medium: 'P2', Low: 'P3' };
        stories.forEach(story => {
            const storyPrio = priorityMap[story.priority] || 'P2';

            // One functional test case per acceptance criterion
            story.acceptanceCriteria.forEach((ac, acIdx) => {
                const tcPriority = acIdx === 0 ? storyPrio : (story.priority === 'High' ? 'P2' : storyPrio);
                testCases.push({
                    id: `TC-${String(testCases.length + 1).padStart(3, '0')}`,
                    title: `[AC-${acIdx + 1}] ${story.title}`,
                    scenario: `Verify acceptance criterion ${acIdx + 1}: "${ac}"`,
                    type: 'Functional',
                    priority: tcPriority,
                    acIndex: acIdx,
                    relatedStory: story.id,
                    preconditions: [
                        'User is authenticated and has required permissions',
                        'Application is running and accessible',
                        ...(acIdx > 0 ? [`Prior AC 1\u2013${acIdx} have been verified and passed`] : []),
                    ],
                    steps: this.generateStepsForAC(ac, story.title),
                    expectedResults: [
                        ac,
                        'No errors or unexpected system behaviour occur',
                        'System state is consistent and reflects the action taken',
                    ]
                });
            });

            // Always one negative test per story
            testCases.push({
                id: `TC-${String(testCases.length + 1).padStart(3, '0')}`,
                title: `[Negative] ${story.title} \u2013 Invalid Input`,
                scenario: `Verify the system handles invalid, missing, or malformed input gracefully for "${story.title}".`,
                type: 'Negative',
                priority: story.priority === 'High' ? 'P1' : 'P2',
                acIndex: null,
                relatedStory: story.id,
                preconditions: ['User is authenticated', 'Application is running'],
                steps: [
                    `Navigate to the "${story.title}" feature`,
                    'Enter invalid, incomplete, or out-of-range data (e.g. empty required fields, wrong data type, special characters, SQL injection attempt)',
                    'Attempt to submit or trigger the action',
                    'Observe the error handling and feedback provided',
                ],
                expectedResults: [
                    'System displays a clear, descriptive validation error message',
                    'Action is blocked until valid input is provided',
                    'User is guided on how to correct the issue',
                    'No data is corrupted, partially saved, or lost',
                ]
            });

            // Edge case for High/Medium priority
            if (story.priority !== 'Low') {
                testCases.push({
                    id: `TC-${String(testCases.length + 1).padStart(3, '0')}`,
                    title: `[Edge Case] ${story.title} \u2013 Boundary Conditions`,
                    scenario: `Verify boundary values, special characters, and unusual conditions for "${story.title}".`,
                    type: 'Edge Case',
                    priority: story.priority === 'High' ? 'P2' : 'P3',
                    acIndex: null,
                    relatedStory: story.id,
                    preconditions: ['User is authenticated', 'System is in a known, clean state'],
                    steps: [
                        `Set up the boundary/edge condition for "${story.title}" (e.g. max-length input, minimum value, rapid repeated actions)`,
                        'Test with maximum allowed values, then with values just exceeding the limit',
                        'Test with special characters, unicode, and unexpected data types',
                        'Repeat the action concurrently or in rapid succession and observe stability',
                    ],
                    expectedResults: [
                        'Boundary values at the limit are processed correctly',
                        'Values exceeding limits are rejected with an appropriate message',
                        'Special characters are sanitised or rejected without system errors',
                        'System remains stable \u2014 no crash, timeout, or data corruption',
                    ]
                });
            }
        });

        return {
            userStories: stories,
            testCases,
            technicalBlueprint: {
                components: [
                    { name: 'Frontend UI', type: 'Frontend', description: 'User-facing interface layer', technologies: ['HTML', 'CSS', 'JavaScript'], responsibilities: ['Render UI components', 'Handle user interactions', 'Validate client-side input'] },
                    { name: 'Backend API', type: 'Backend', description: 'Business logic and request handling layer', technologies: ['Node.js', 'Express'], responsibilities: ['Process API requests', 'Apply business rules', 'Manage authentication & authorisation'] },
                    { name: 'Database', type: 'Database', description: 'Persistent data storage layer', technologies: ['PostgreSQL'], responsibilities: ['Store and retrieve data', 'Maintain data integrity', 'Optimise query performance'] },
                ],
                apiSpecs: [
                    { endpoint: '/api/data', method: 'GET', description: 'Retrieve a list of records' },
                    { endpoint: '/api/data/:id', method: 'GET', description: 'Retrieve a single record by ID' },
                    { endpoint: '/api/data', method: 'POST', description: 'Create a new record' },
                    { endpoint: '/api/data/:id', method: 'PUT', description: 'Update an existing record' },
                    { endpoint: '/api/data/:id', method: 'DELETE', description: 'Delete a record by ID' },
                ],
                databaseSchema: {
                    tables: [
                        { name: 'users', columns: [{ name: 'id', type: 'INT', constraints: ['PRIMARY KEY', 'AUTO_INCREMENT'] }, { name: 'name', type: 'VARCHAR(255)', constraints: ['NOT NULL'] }, { name: 'email', type: 'VARCHAR(255)', constraints: ['NOT NULL', 'UNIQUE'] }, { name: 'created_at', type: 'TIMESTAMP', constraints: ['DEFAULT NOW()'] }] },
                        { name: 'items', columns: [{ name: 'id', type: 'INT', constraints: ['PRIMARY KEY', 'AUTO_INCREMENT'] }, { name: 'user_id', type: 'INT', constraints: ['FOREIGN KEY → users(id)'] }, { name: 'title', type: 'VARCHAR(255)', constraints: ['NOT NULL'] }, { name: 'status', type: 'ENUM', constraints: ["DEFAULT 'active'"] }] },
                    ]
                }
            },
            insights: {
                keyFindings: [
                    `${stories.length} user stories extracted across ${new Set(stories.map(s => s.epic)).size} epics`,
                    `${stories.filter(s => s.priority === 'High').length} high-priority items requiring immediate attention`,
                    `${testCases.length} test cases generated covering happy path, negative, and edge case scenarios`,
                ],
                recommendations: [
                    'Prioritise high-priority stories for the first sprint',
                    'Review extracted acceptance criteria with stakeholders for completeness',
                    'Ensure test coverage includes both functional and non-functional requirements',
                    'Consider security and performance implications for all identified features',
                ],
                risks: [
                    'Scope creep if requirements are not baselined with stakeholders',
                    'Insufficient test coverage for edge and boundary conditions',
                    'Dependency risks between stories within the same epic',
                ],
                successMetrics: [
                    'All P1 test cases pass before release',
                    'User acceptance rate > 85% in UAT',
                    'Zero critical defects in production within 30 days of release',
                ]
            }
        };
    }

    displayResults(analysis) {
        this.displayUserStories(analysis.userStories);
        this.displayTestCases(analysis.testCases);
        this.displayTechnicalBlueprint(analysis.technicalBlueprint);
        this.displayInsights(analysis.insights);
        this.displayFeatureTree(analysis.userStories);
    }

    displayUserStories(stories) {
        const container = document.getElementById('userStoriesContent');
        if (!stories || stories.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-clipboard-list"></i></div><div class="empty-state-title">No User Stories</div><p>Analyze meeting notes to generate stories</p></div>';
            return;
        }

        container.innerHTML = `
            <div class="collapse-controls">
                <button class="collapse-all-btn" onclick="analyzer.collapseAllStories()" title="Collapse All Stories">
                    <i class="fas fa-compress-alt"></i> Collapse All
                </button>
                <button class="expand-all-btn" onclick="analyzer.expandAllStories()" title="Expand All Stories">
                    <i class="fas fa-expand-alt"></i> Expand All
                </button>
            </div>
            <div class="stories-grid">${stories.map((story, idx) => `
            <div class="story-card priority-${story.priority?.toLowerCase() || 'medium'}" id="story-card-${idx}">
                <div class="story-header">
                    <span class="story-id">${story.id}</span>
                    <div class="story-header-actions">
                        <div class="story-tags">
                            <span class="tag tag-epic">${story.epic || 'General'}</span>
                            <span class="tag tag-priority">${story.priority || 'Medium'}</span>
                        </div>
                        <button class="story-collapse-btn" data-idx="${idx}" title="Collapse/Expand">
                            <i class="fas fa-chevron-up" id="story-icon-${idx}"></i>
                        </button>
                    </div>
                </div>
                <div class="story-content" id="story-content-${idx}">
                    <div class="story-title">${story.title || 'Untitled'}</div>
                    <div class="story-description">${story.description || ''}</div>
                    <div class="story-meta">
                        <div class="meta-item"><i class="fas fa-user"></i> ${story.userRole || 'User'}</div>
                        <div class="meta-item"><i class="fas fa-coins"></i> ${story.storyPoints || 0} pts</div>
                        <div class="meta-item"><i class="fas fa-chart-line"></i> ${story.effort || 'Medium'}</div>
                        <div class="meta-item"><i class="fas fa-star"></i> ${story.qualityScore || 0}%</div>
                        ${story.estimationFramework ? `<div class="meta-item framework-label"><i class="fas fa-calculator"></i> ${story.estimationFramework}</div>` : ''}
                    </div>
                    ${story.acceptanceCriteria?.length ? `
                    <div class="acceptance-criteria">
                        <div class="ac-header"><i class="fas fa-check-double"></i> Acceptance Criteria</div>
                        <ul class="ac-list">
                            ${story.acceptanceCriteria.map((c, acIdx) => `<li><span class="ac-text">${c}</span></li>`).join('')}
                        </ul>
                    </div>` : ''}
                </div>
            </div>
        `).join('')}</div>`;

        // Add event listeners to collapse buttons
        container.querySelectorAll('.story-collapse-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const idx = btn.getAttribute('data-idx');
                console.log('Collapse button clicked for idx:', idx);
                this.toggleStoryCard(parseInt(idx));
            });
        });
    }

    toggleStoryCard(idx) {
        console.log('toggleStoryCard called with idx:', idx);
        const content = document.getElementById(`story-content-${idx}`);
        const icon = document.getElementById(`story-icon-${idx}`);
        console.log('Content element:', content);
        console.log('Icon element:', icon);
        
        if (!content || !icon) {
            console.error('Elements not found for idx:', idx);
            return;
        }
        
        if (content.classList.contains('collapsed')) {
            content.classList.remove('collapsed');
            icon.className = 'fas fa-chevron-up';
            console.log('Expanded story card:', idx);
        } else {
            content.classList.add('collapsed');
            icon.className = 'fas fa-chevron-down';
            console.log('Collapsed story card:', idx);
        }
    }

    collapseAllStories() {
        console.log('Collapsing all stories');
        document.querySelectorAll('.story-content').forEach((content, idx) => {
            content.classList.add('collapsed');
            const icon = document.getElementById(`story-icon-${idx}`);
            if (icon) {
                icon.className = 'fas fa-chevron-down';
            }
        });
        this.showToast('All stories collapsed', 'info');
    }

    expandAllStories() {
        console.log('Expanding all stories');
        document.querySelectorAll('.story-content').forEach((content, idx) => {
            content.classList.remove('collapsed');
            const icon = document.getElementById(`story-icon-${idx}`);
            if (icon) {
                icon.className = 'fas fa-chevron-up';
            }
        });
        this.showToast('All stories expanded', 'info');
    }

    displayTestCases(testCases) {
        const container = document.getElementById('testCasesContent');
        if (!testCases || testCases.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-vial"></i></div><div class="empty-state-title">No Test Cases</div><p>Generate from user stories</p></div>';
            return;
        }

        // Group test cases by user story
        const groupedTestCases = {};
        testCases.forEach(tc => {
            const storyId = tc.relatedStory || 'Unknown';
            if (!groupedTestCases[storyId]) {
                groupedTestCases[storyId] = [];
            }
            groupedTestCases[storyId].push(tc);
        });

        let html = `
            <div class="collapse-controls">
                <div class="action-controls">
                    <button class="collapse-all-btn" onclick="analyzer.collapseAllTestCases()" title="Collapse All Test Cases">
                        <i class="fas fa-compress-alt"></i> Collapse All
                    </button>
                    <button class="expand-all-btn" onclick="analyzer.expandAllTestCases()" title="Expand All Test Cases">
                        <i class="fas fa-expand-alt"></i> Expand All
                    </button>
                </div>
            </div>
            <div class="test-cases-by-story" id="testCasesContainer">`;
        
        Object.keys(groupedTestCases).forEach((storyId, idx) => {
            const storyTCs = groupedTestCases[storyId];
            const functionalCount = storyTCs.filter(tc => tc.type === 'Functional').length;
            const negativeCount = storyTCs.filter(tc => tc.type === 'Negative').length;
            const edgeCount = storyTCs.filter(tc => tc.type === 'Edge Case').length;
            
            html += `
            <div class="story-test-case-group">
                <div class="story-tc-header" data-story-id="${storyId}">
                    <div class="story-tc-title">
                        <i class="fas fa-folder-open" id="folder-${storyId}"></i>
                        <span>${storyId}</span>
                        <span class="story-tc-name">${functionalCount} Functional, ${negativeCount} Negative, ${edgeCount} Edge</span>
                    </div>
                    <i class="fas fa-chevron-down" id="tc-expand-${storyId}"></i>
                </div>
                <div class="story-tc-content" id="tc-content-${storyId}">
                    <div class="test-cases-grid">
                        ${storyTCs.map(tc => `
                            <div class="test-case-card ${tc.type?.toLowerCase().replace(' ', '-')}">
                                <div class="test-case-header">
                                    <span class="test-case-id">${tc.id}</span>
                                    ${tc.relatedStory ? `<span class="user-story-label">${tc.relatedStory}</span>` : ''}
                                    <span class="type-badge ${tc.type?.toLowerCase().replace(' ', '-')}">${tc.type || 'Functional'}</span>
                                    <span class="priority-badge ${tc.priority?.toLowerCase().replace('p1', 'high').replace('p2', 'medium').replace('p3', 'low')}">${tc.priority || 'P2'}</span>
                                </div>
                                <div class="test-case-title">${tc.title || 'Untitled Test'}</div>
                                <div class="test-case-scenario">${tc.scenario || ''}</div>
                                <div class="test-case-steps">
                                    <strong>Steps:</strong>
                                    <ol>${(tc.steps || []).map(step => `<li>${step}</li>`).join('')}</ol>
                                </div>
                                <div class="test-case-expected">
                                    <strong>Expected Results:</strong>
                                    <ul>${(tc.expectedResults || []).map(result => `<li>${result}</li>`).join('')}</ul>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>`;
        });
        
        html += '</div>';
        container.innerHTML = html;

        // Store original test cases for reference
        this.currentTestCases = testCases;

        // Add event listeners to test case collapse headers
        container.querySelectorAll('.story-tc-header').forEach(header => {
            header.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const storyId = header.getAttribute('data-story-id');
                console.log('Test case header clicked for storyId:', storyId);
                this.toggleStoryTC(storyId);
            });
        });
    }

    toggleStoryTC(storyId) {
        console.log('toggleStoryTC called with storyId:', storyId);
        const content = document.getElementById(`tc-content-${storyId}`);
        const icon = document.getElementById(`tc-expand-${storyId}`);
        const folder = document.getElementById(`folder-${storyId}`);
        console.log('Content element:', content);
        console.log('Icon element:', icon);
        console.log('Folder element:', folder);
        
        if (!content || !icon || !folder) {
            console.error('Elements not found for storyId:', storyId);
            return;
        }
        
        if (content.classList.contains('collapsed')) {
            content.classList.remove('collapsed');
            icon.classList.remove('collapsed');
            folder.className = 'fas fa-folder-open';
            console.log('Expanded test cases for story:', storyId);
        } else {
            content.classList.add('collapsed');
            icon.classList.add('collapsed');
            folder.className = 'fas fa-folder';
            console.log('Collapsed test cases for story:', storyId);
        }
    }

    collapseAllTestCases() {
        console.log('Collapsing all test cases');
        document.querySelectorAll('.story-tc-content').forEach(content => {
            content.classList.add('collapsed');
        });
        document.querySelectorAll('[id^="tc-expand-"]').forEach(icon => {
            icon.classList.add('collapsed');
        });
        document.querySelectorAll('[id^="folder-"]').forEach(folder => {
            folder.className = 'fas fa-folder';
        });
        this.showToast('All test cases collapsed', 'info');
    }

    expandAllTestCases() {
        console.log('Expanding all test cases');
        document.querySelectorAll('.story-tc-content').forEach(content => {
            content.classList.remove('collapsed');
        });
        document.querySelectorAll('[id^="tc-expand-"]').forEach(icon => {
            icon.classList.remove('collapsed');
        });
        document.querySelectorAll('[id^="folder-"]').forEach(folder => {
            folder.className = 'fas fa-folder-open';
        });
        this.showToast('All test cases expanded', 'info');
    }

    displayTechnicalBlueprint(blueprint) {
        const container = document.getElementById('blueprintContent');
        if (!blueprint) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-sitemap"></i></div><div class="empty-state-title">No Blueprint</div></div>';
            return;
        }

        let html = '';

        if (blueprint.components?.length) {
            html += '<div class="blueprint-section"><h3 class="blueprint-section-title">System Components</h3><div class="component-list">';
            html += blueprint.components.map(comp => `
                <div class="component-card">
                    <div class="component-name">${comp.name}</div>
                    <span class="component-type">${comp.type}</span>
                    <div>${comp.description || ''}</div>
                    ${comp.technologies?.length ? `<div style="margin-top:0.5rem;font-size:0.8125rem;color:var(--text-secondary)"><strong>Tech:</strong> ${comp.technologies.join(', ')}</div>` : ''}
                </div>
            `).join('');
            html += '</div></div>';
        }

        if (blueprint.apiSpecs?.length) {
            html += '<div class="blueprint-section"><h3 class="blueprint-section-title">API Specifications</h3><div class="api-specs-list">';
            html += blueprint.apiSpecs.map(spec => `
                <div class="api-spec-item">
                    <span class="api-method method-${(spec.method || 'get').toLowerCase()}">${spec.method || 'GET'}</span>
                    <span class="api-endpoint">${spec.endpoint}</span>
                    <span class="api-desc">${spec.description || ''}</span>
                </div>
            `).join('');
            html += '</div></div>';
        }

        if (blueprint.databaseSchema?.tables?.length) {
            html += '<div class="blueprint-section"><h3 class="blueprint-section-title">Database Schema</h3><div class="db-schema-list">';
            html += blueprint.databaseSchema.tables.map(table => `
                <div class="db-table-card">
                    <div class="db-table-name"><i class="fas fa-table"></i> ${table.name}</div>
                    <table class="test-cases-table">
                        <thead><tr><th>Column</th><th>Type</th><th>Constraints</th></tr></thead>
                        <tbody>${(table.columns || []).map(col => `
                            <tr>
                                <td>${col.name}</td>
                                <td><code>${col.type}</code></td>
                                <td>${col.constraints?.join(', ') || ''}</td>
                            </tr>
                        `).join('')}</tbody>
                    </table>
                </div>
            `).join('');
            html += '</div></div>';
        }

        container.innerHTML = html || '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-sitemap"></i></div><div class="empty-state-title">No Blueprint Data</div></div>';
    }

    displayInsights(insights) {
        const container = document.getElementById('insightsContent');
        if (!insights) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-lightbulb"></i></div><div class="empty-state-title">No Insights</div></div>';
            return;
        }

        const cards = [];
        if (insights.keyFindings?.length) cards.push({ type: 'success', title: 'Key Findings', items: insights.keyFindings });
        if (insights.recommendations?.length) cards.push({ type: 'warning', title: 'Recommendations', items: insights.recommendations });
        if (insights.risks?.length) cards.push({ type: 'danger', title: 'Risks', items: insights.risks });

        container.innerHTML = `<div class="insights-grid">${cards.map(card => `
            <div class="insight-card ${card.type}">
                <div class="insight-header">
                    <div class="insight-icon ${card.type}"><i class="fas ${card.type === 'success' ? 'fa-check' : card.type === 'warning' ? 'fa-lightbulb' : 'fa-exclamation-triangle'}"></i></div>
                    <div class="insight-title">${card.title}</div>
                </div>
                <div class="insight-content">${card.items.map(i => `• ${i}`).join('<br>')}</div>
            </div>
        `).join('')}</div>`;
    }

    displayFeatureTree(stories) {
        const container = document.getElementById('featureTreeContent');
        if (!stories || stories.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-project-diagram"></i></div><div class="empty-state-title">No Feature Tree</div><p>Analyze notes to see features</p></div>';
            return;
        }

        const epics = {};
        stories.forEach(story => {
            const epic = story.epic || 'General';
            if (!epics[epic]) epics[epic] = [];
            epics[epic].push(story);
        });

        const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
        
        let html = '<div class="feature-tree-container"><div class="tree-controls">';
        html += '<button class="quick-action-btn" onclick="analyzer.expandAllEpics()"><i class="fas fa-expand"></i> Expand All</button>';
        html += '<button class="quick-action-btn" onclick="analyzer.collapseAllEpics()"><i class="fas fa-compress"></i> Collapse All</button>';
        html += '</div>';

        Object.keys(epics).forEach((epic, idx) => {
            const epicStories = epics[epic].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
            const totalPoints = epicStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
            const avgQuality = Math.round(epicStories.reduce((sum, s) => sum + (s.qualityScore || 0), 0) / epicStories.length);
            const highPriorityCount = epicStories.filter(s => s.priority === 'High').length;

            html += `
            <div class="tree-node epic-node" data-epic="${idx}">
                <div class="epic-header" onclick="analyzer.toggleEpic(${idx})">
                    <div class="epic-title">
                        <div class="epic-icon"><i class="fas fa-layer-group"></i></div>
                        ${epic}
                    </div>
                    <div class="epic-stats">
                        <span class="stat-badge">${epicStories.length} stories</span>
                        <span class="stat-badge">${totalPoints} pts</span>
                        <span class="stat-badge">${avgQuality}% qual</span>
                        ${highPriorityCount > 0 ? `<span class="stat-badge" style="background:#fee2e2;color:#ef4444">${highPriorityCount} high</span>` : ''}
                        <i class="fas fa-chevron-down expand-icon" id="expand-icon-${idx}"></i>
                    </div>
                </div>
                <div class="epic-content" id="epic-content-${idx}">
                    <div class="story-list">
                        ${epicStories.map(story => `
                            <div class="story-node">
                                <div class="story-node-header">
                                    <div class="story-node-title">${story.title}</div>
                                    <div class="priority-indicator ${story.priority?.toLowerCase() || 'medium'}"></div>
                                </div>
                                <div style="font-size:0.8125rem;color:var(--text-secondary)">${story.userRole || 'User'} • ${story.storyPoints || 0} pts</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>`;
        });

        html += '</div></div>';
        container.innerHTML = html;
    }

    toggleEpic(idx) {
        const content = document.getElementById(`epic-content-${idx}`);
        const icon = document.getElementById(`expand-icon-${idx}`);
        if (content.classList.contains('collapsed')) {
            content.classList.remove('collapsed');
            icon.classList.remove('collapsed');
        } else {
            content.classList.add('collapsed');
            icon.classList.add('collapsed');
        }
    }

    expandAllEpics() {
        document.querySelectorAll('.epic-content').forEach(c => c.classList.remove('collapsed'));
        document.querySelectorAll('.expand-icon').forEach(i => i.classList.remove('collapsed'));
    }

    collapseAllEpics() {
        document.querySelectorAll('.epic-content').forEach(c => c.classList.add('collapsed'));
        document.querySelectorAll('.expand-icon').forEach(i => i.classList.add('collapsed'));
    }

    saveToHistory(analysis) {
        this.analysisHistory.unshift({
            timestamp: new Date().toISOString(),
            storyCount: analysis.userStories?.length || 0,
            testCaseCount: analysis.testCases?.length || 0,
            analysis: analysis
        });
        
        if (this.analysisHistory.length > MAX_HISTORY) {
            this.analysisHistory = this.analysisHistory.slice(0, MAX_HISTORY);
        }
        
        localStorage.setItem('meetingPro_history', JSON.stringify(this.analysisHistory));
    }

    saveCurrentAnalysis() {
        if (!this.currentAnalysis) {
            this.showToast('No analysis to save!', 'error');
            return;
        }

        const id = Date.now().toString();
        this.savedAnalyses[id] = {
            timestamp: new Date().toISOString(),
            analysis: this.currentAnalysis
        };

        const keys = Object.keys(this.savedAnalyses);
        if (keys.length > 10) {
            delete this.savedAnalyses[keys[0]];
        }

        localStorage.setItem('meetingPro_saved', JSON.stringify(this.savedAnalyses));
        this.showToast('Analysis saved!', 'success');
        this.updateSettingsPanel();
    }

    loadFromStorage() {
        try {
            this.analysisHistory = JSON.parse(localStorage.getItem('meetingPro_history') || '[]');
            this.savedAnalyses = JSON.parse(localStorage.getItem('meetingPro_saved') || '{}');
            const { type: apiKeyType, key: apiKey } = this.getApiKey();
            if (apiKey) {
                this.updateApiKeyDisplay(apiKey);
            }
        } catch (e) {
            console.error('Storage error:', e);
        }
    }

    updateFooter() {
        if (this.lastAnalysisTime) {
            document.getElementById('lastAnalysisTime').textContent = this.lastAnalysisTime.toLocaleTimeString();
        }
        document.getElementById('statusText').textContent = 'Analysis complete';
    }

    updateDashboard() {
        const container = document.getElementById('dashboardContent');
        if (!this.currentAnalysis) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-chart-bar"></i></div><div class="empty-state-title">No Data</div><p>Complete an analysis first</p></div>';
            return;
        }

        const stories = this.currentAnalysis.userStories || [];
        const testCases = this.currentAnalysis.testCases || [];
        
        const highPriority = stories.filter(s => s.priority === 'High').length;
        const mediumPriority = stories.filter(s => s.priority === 'Medium').length;
        const lowPriority = stories.filter(s => s.priority === 'Low').length;
        const totalPoints = stories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
        const avgQuality = stories.length > 0 ? Math.round(stories.reduce((sum, s) => sum + (s.qualityScore || 0), 0) / stories.length) : 0;

        container.innerHTML = `
            <div class="insights-grid" style="margin-bottom:2rem;">
                <div class="insight-card success">
                    <div class="insight-header">
                        <div class="insight-icon success"><i class="fas fa-clipboard-list"></i></div>
                        <div class="insight-title">Total Stories</div>
                    </div>
                    <div class="insight-content" style="font-size:2rem;font-weight:700;">${stories.length}</div>
                </div>
                <div class="insight-card warning">
                    <div class="insight-header">
                        <div class="insight-icon warning"><i class="fas fa-vial"></i></div>
                        <div class="insight-title">Test Cases</div>
                    </div>
                    <div class="insight-content" style="font-size:2rem;font-weight:700;">${testCases.length}</div>
                </div>
                <div class="insight-card">
                    <div class="insight-header">
                        <div class="insight-icon" style="background:rgba(99,102,241,0.1);color:var(--primary-color)"><i class="fas fa-coins"></i></div>
                        <div class="insight-title">Story Points</div>
                    </div>
                    <div class="insight-content" style="font-size:2rem;font-weight:700;">${totalPoints}</div>
                </div>
                <div class="insight-card success">
                    <div class="insight-header">
                        <div class="insight-icon success"><i class="fas fa-star"></i></div>
                        <div class="insight-title">Avg Quality</div>
                    </div>
                    <div class="insight-content" style="font-size:2rem;font-weight:700;">${avgQuality}%</div>
                </div>
            </div>
            
            <div class="insights-grid">
                <div class="insight-card">
                    <div class="insight-header">
                        <div class="insight-icon" style="background:rgba(239,68,68,0.1);color:var(--danger-color)"><i class="fas fa-flag"></i></div>
                        <div class="insight-title">Priority Distribution</div>
                    </div>
                    <div class="insight-content">
                        <div style="margin-bottom:0.5rem"><i class="fas fa-circle" style="color:var(--danger-color);font-size:0.5rem;"></i> High: ${highPriority}</div>
                        <div style="margin-bottom:0.5rem"><i class="fas fa-circle" style="color:var(--warning-color);font-size:0.5rem;"></i> Medium: ${mediumPriority}</div>
                        <div><i class="fas fa-circle" style="color:var(--success-color);font-size:0.5rem;"></i> Low: ${lowPriority}</div>
                    </div>
                </div>
            </div>
        `;
    }

    showApiKeyModal() {
        const modal = document.getElementById('apiKeyModal');
        const { type: keyType, key: currentKey } = this.getApiKey();
        const display = document.getElementById('currentApiKeyDisplay');
        
        if (currentKey) {
            const masked = currentKey.substring(0, 8) + '...' + currentKey.substring(currentKey.length - 4);
            display.innerHTML = `Current Key: <strong>${masked}</strong>`;
        } else {
            display.innerHTML = `Current Key: <strong>Not Set</strong>`;
        }
        
        document.getElementById('apiKeyInput').value = '';
        modal.classList.add('active');
    }

    saveApiKey() {
        const typeSelect = document.getElementById('apiTypeSelect');
        const input = document.getElementById('apiKeyInput');
        const keyValue = input.value.trim();
        const keyType = typeSelect ? typeSelect.value : 'openai';
        
        if (keyValue) {
            localStorage.setItem('selected_api_type', keyType);
            localStorage.setItem(`${keyType}_api_key`, keyValue);
            this.showToast(`${keyType.charAt(0).toUpperCase() + keyType.slice(1)} API key saved!`, 'success');
            this.closeModals();
            this.updateSettingsPanel();
        } else {
            this.showToast('Please enter a valid API key', 'error');
        }
    }

    updateApiKeyDisplay(key) {
        const display = document.getElementById('currentApiKeyDisplay');
        if (display) {
            const masked = key.substring(0, 8) + '...' + key.substring(key.length - 4);
            display.innerHTML = `Current API Key: <strong>${masked}</strong>`;
        }
    }

    showSettingsModal() {
        this.updateSettingsPanel();
        document.getElementById('settingsModal').classList.add('active');
    }

    updateSettingsPanel() {
        const { type: apiKeyType, key: apiKey } = this.getApiKey();
        const indicator = document.getElementById('apiKeyStatusIndicator');
        const statusText = document.getElementById('apiKeyStatusText');
        
        if (apiKey) {
            indicator.className = 'status-indicator configured';
            statusText.textContent = `${apiKeyType.charAt(0).toUpperCase() + apiKeyType.slice(1)} API Key Configured`;
        } else {
            indicator.className = 'status-indicator not-configured';
            statusText.textContent = 'No API Key Configured';
        }
        
        document.getElementById('savedAnalysesCount').textContent = `${Object.keys(this.savedAnalyses).length}/10`;
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all saved data? This cannot be undone.')) {
            localStorage.removeItem('meetingPro_history');
            localStorage.removeItem('meetingPro_saved');
            localStorage.removeItem('selected_api_type');
            localStorage.removeItem('openai_api_key');
            localStorage.removeItem('gemini_api_key');
            this.analysisHistory = [];
            this.savedAnalyses = {};
            this.showToast('All data cleared!', 'success');
            this.updateSettingsPanel();
            this.closeModals();
        }
    }

    showHistory() {
        const modal = document.getElementById('historyModal');
        const list = document.getElementById('historyList');
        
        if (this.analysisHistory.length === 0) {
            list.innerHTML = '<div class="empty-state" style="padding:2rem;"><p>No history available</p></div>';
        } else {
            list.innerHTML = this.analysisHistory.map((item, idx) => `
                <div class="history-item" onclick="analyzer.loadHistoryItem(${idx})">
                    <div class="history-timestamp">${new Date(item.timestamp).toLocaleString()}</div>
                    <div class="history-stats">
                        <span><i class="fas fa-clipboard-list"></i> ${item.storyCount} stories</span>
                        <span><i class="fas fa-vial"></i> ${item.testCaseCount} tests</span>
                    </div>
                </div>
            `).join('');
        }
        
        modal.classList.add('active');
    }

    loadHistoryItem(idx) {
        const item = this.analysisHistory[idx];
        if (item) {
            this.currentAnalysis = item.analysis;
            this.lastAnalysisTime = new Date(item.timestamp);
            this.displayResults(item.analysis);
            this.updateFooter();
            this.updateDashboard();
            this.closeModals();
            this.showToast('History loaded!', 'success');
            this.switchSection('analyze');
        }
    }

    showExportOptions() {
        if (!this.currentAnalysis) {
            this.showToast('No analysis to export!', 'error');
            return;
        }

        const formats = [
            { name: 'JSON', ext: 'json', mime: 'application/json', generator: () => JSON.stringify(this.currentAnalysis, null, 2) },
            { name: 'CSV', ext: 'csv', mime: 'text/csv', generator: () => this.exportToCSV() },
            { name: 'Markdown', ext: 'md', mime: 'text/markdown', generator: () => this.exportToMarkdown() }
        ];

        const container = document.createElement('div');
        container.style.cssText = 'display:flex;flex-direction:column;gap:0.75rem;';
        
        formats.forEach(format => {
            const btn = document.createElement('button');
            btn.className = 'btn-primary';
            btn.style.cssText = 'width:100%;margin-top:0;';
            btn.innerHTML = `<i class="fas fa-file-download"></i> Export as ${format.name}`;
            btn.onclick = () => {
                try {
                    const content = format.generator();
                    this.downloadFile(content, `meeting-analysis.${format.ext}`, format.mime);
                    this.showToast(`${format.name} exported!`, 'success');
                    this.closeModals();
                } catch (error) {
                    this.showToast(`Export failed: ${error.message}`, 'error');
                }
            };
            container.appendChild(btn);
        });

        this.showCustomModal('Export Options', container);
    }

    exportToCSV() {
        const stories = this.currentAnalysis.userStories || [];
        if (stories.length === 0) return '';
        
        const headers = ['ID', 'Title', 'Description', 'Priority', 'Story Points', 'Epic', 'User Role'];
        const rows = stories.map(s => [s.id, s.title, s.description, s.priority, s.storyPoints, s.epic, s.userRole]);
        
        return [headers.join(','), ...rows.map(r => r.map(cell => `"${cell || ''}"`).join(','))].join('\n');
    }

    exportToMarkdown() {
        const analysis = this.currentAnalysis;
        let md = '# Meeting Analysis Report\n\n';
        
        if (analysis.userStories?.length) {
            md += '## User Stories\n\n';
            analysis.userStories.forEach(s => {
                md += `### ${s.id}: ${s.title}\n`;
                md += `**Priority:** ${s.priority} | **Points:** ${s.storyPoints} | **Epic:** ${s.epic}\n\n`;
                md += `${s.description}\n\n`;
                if (s.acceptanceCriteria?.length) {
                    md += '**Acceptance Criteria:**\n';
                    s.acceptanceCriteria.forEach(c => md += `- ${c}\n`);
                    md += '\n';
                }
            });
        }
        
        return md;
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    displayExportOptions() {
        const container = document.getElementById('exportContent');
        if (!this.currentAnalysis) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-download"></i></div><div class="empty-state-title">No Analysis to Export</div><p>Complete an analysis first to export results</p></div>';
            return;
        }

        const stories = this.currentAnalysis.userStories || [];
        const testCases = this.currentAnalysis.testCases || [];
        const blueprint = this.currentAnalysis.technicalBlueprint || {};
        
        container.innerHTML = `
            <div class="export-summary">
                <div class="export-summary-stat">
                    <div class="export-stat-num">${stories.length}</div>
                    <div class="export-stat-label">Stories</div>
                </div>
                <div class="export-summary-stat">
                    <div class="export-stat-num">${testCases.length}</div>
                    <div class="export-stat-label">Test Cases</div>
                </div>
                <div class="export-summary-stat">
                    <div class="export-stat-num">${blueprint.components?.length || 0}</div>
                    <div class="export-stat-label">Components</div>
                </div>
                <div class="export-summary-stat">
                    <div class="export-stat-num">${blueprint.apiSpecs?.length || 0}</div>
                    <div class="export-stat-label">APIs</div>
                </div>
            </div>
            
            <div class="export-formats-grid">
                <div class="export-format-card">
                    <div class="export-format-icon" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white;">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <div class="export-format-name">JSON</div>
                    <div class="export-format-desc">Complete analysis data</div>
                    <div class="export-format-detail">Export all user stories, test cases, and technical specifications in JSON format for integration with other tools.</div>
                    <button class="btn-primary export-download-btn" onclick="analyzer.exportAsJSON()">
                        <i class="fas fa-download"></i> Download JSON
                    </button>
                </div>
                
                <div class="export-format-card">
                    <div class="export-format-icon" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white;">
                        <i class="fas fa-file-excel"></i>
                    </div>
                    <div class="export-format-name">Excel</div>
                    <div class="export-format-desc">Spreadsheet format</div>
                    <div class="export-format-detail">Export user stories and test cases in Excel format for easy editing and sharing with stakeholders.</div>
                    <button class="btn-primary export-download-btn" onclick="analyzer.exportAsExcel()">
                        <i class="fas fa-download"></i> Download Excel
                    </button>
                </div>
                
                <div class="export-format-card">
                    <div class="export-format-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white;">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <div class="export-format-name">PDF</div>
                    <div class="export-format-desc">Formatted report</div>
                    <div class="export-format-detail">Generate a comprehensive PDF report with all analysis results for documentation and presentations.</div>
                    <button class="btn-primary export-download-btn" onclick="analyzer.exportAsPDF()">
                        <i class="fas fa-download"></i> Download PDF
                    </button>
                </div>
                
                <div class="export-format-card">
                    <div class="export-format-icon" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white;">
                        <i class="fas fa-file-word"></i>
                    </div>
                    <div class="export-format-name">Word</div>
                    <div class="export-format-desc">Document format</div>
                    <div class="export-format-detail">Export as a formatted Word document for business documentation and review.</div>
                    <button class="btn-primary export-download-btn" onclick="analyzer.exportAsWord()">
                        <i class="fas fa-download"></i> Download Word
                    </button>
                </div>
            </div>
        `;
    }

    exportAsJSON() {
        this.downloadFile(JSON.stringify(this.currentAnalysis, null, 2), 'meeting-analysis.json', 'application/json');
    }

    exportAsExcel() {
        const analysis = this.currentAnalysis;
        const stories = analysis.userStories || [];
        const testCases = analysis.testCases || [];
        const blueprint = analysis.technicalBlueprint || {};
        const insights = analysis.insights || {};
        
        // Generate CSV content for Excel compatibility
        let csvContent = '';
        
        // User Stories Section
        csvContent += 'User Stories\n';
        csvContent += 'ID,Title,Description,User Role,Benefit,Business Objective,Priority,Story Points,Effort,Risk,Complexity,Category,Epic,Acceptance Criteria,Dependencies,Success Metrics,Assumptions,Quality Score,Estimation Framework\n';
        stories.forEach(s => {
            csvContent += `"${s.id || ''}","${s.title || ''}","${(s.description || '').replace(/"/g, '""')}","${s.userRole || ''}","${s.benefit || ''}","${(s.businessObjective || '').replace(/"/g, '""')}","${s.priority || ''}","${s.storyPoints || ''}","${s.effort || ''}","${s.risk || ''}","${s.complexity || ''}","${s.category || ''}","${s.epic || ''}","${(s.acceptanceCriteria || []).join('; ').replace(/"/g, '""')}","${(s.dependencies || []).join('; ').replace(/"/g, '""')}","${(s.successMetrics || []).join('; ').replace(/"/g, '""')}","${(s.assumptions || []).join('; ').replace(/"/g, '""')}","${s.qualityScore || ''}","${s.estimationFramework || ''}"\n`;
        });
        csvContent += '\n';
        
        // Test Cases Section
        csvContent += 'Test Cases\n';
        csvContent += 'ID,Title,Type,Priority,Related Story,Scenario,Preconditions,Steps,Expected Results,AC Index\n';
        testCases.forEach(tc => {
            csvContent += `"${tc.id || ''}","${tc.title || ''}","${tc.type || ''}","${tc.priority || ''}","${tc.relatedStory || ''}","${(tc.scenario || '').replace(/"/g, '""')}","${(tc.preconditions || []).join('; ').replace(/"/g, '""')}","${(tc.steps || []).join('; ').replace(/"/g, '""')}","${(tc.expectedResults || []).join('; ').replace(/"/g, '""')}","${tc.acIndex !== undefined ? tc.acIndex : ''}"\n`;
        });
        csvContent += '\n';
        
        // Technical Blueprint - Components
        if (blueprint.components?.length) {
            csvContent += 'Technical Blueprint - Components\n';
            csvContent += 'Name,Type,Description,Technologies,Responsibilities\n';
            blueprint.components.forEach(comp => {
                csvContent += `"${comp.name || ''}","${comp.type || ''}","${(comp.description || '').replace(/"/g, '""')}","${(comp.technologies || []).join('; ').replace(/"/g, '""')}","${(comp.responsibilities || []).join('; ').replace(/"/g, '""')}"\n`;
            });
            csvContent += '\n';
        }
        
        // Technical Blueprint - API Specs
        if (blueprint.apiSpecs?.length) {
            csvContent += 'Technical Blueprint - API Specifications\n';
            csvContent += 'Endpoint,Method,Description\n';
            blueprint.apiSpecs.forEach(spec => {
                csvContent += `"${spec.endpoint || ''}","${spec.method || ''}","${(spec.description || '').replace(/"/g, '""')}"\n`;
            });
            csvContent += '\n';
        }
        
        // Technical Blueprint - Database Schema
        if (blueprint.databaseSchema?.tables?.length) {
            csvContent += 'Technical Blueprint - Database Schema\n';
            blueprint.databaseSchema.tables.forEach(table => {
                csvContent += `Table: ${table.name || ''}\n`;
                csvContent += 'Column,Type,Constraints\n';
                (table.columns || []).forEach(col => {
                    csvContent += `"${col.name || ''}","${col.type || ''}","${(col.constraints || []).join('; ').replace(/"/g, '""')}"\n`;
                });
                csvContent += '\n';
            });
        }
        
        // Insights Section
        csvContent += 'Insights\n';
        csvContent += 'Type,Content\n';
        
        if (insights.keyFindings?.length) {
            insights.keyFindings.forEach(finding => {
                csvContent += `"Key Finding","${finding.replace(/"/g, '""')}"\n`;
            });
        }
        if (insights.recommendations?.length) {
            insights.recommendations.forEach(rec => {
                csvContent += `"Recommendation","${rec.replace(/"/g, '""')}"\n`;
            });
        }
        if (insights.risks?.length) {
            insights.risks.forEach(risk => {
                csvContent += `"Risk","${risk.replace(/"/g, '""')}"\n`;
            });
        }
        if (insights.successMetrics?.length) {
            insights.successMetrics.forEach(metric => {
                csvContent += `"Success Metric","${metric.replace(/"/g, '""')}"\n`;
            });
        }
        
        // Create BOM for proper UTF-8 handling in Excel
        const BOM = '\uFEFF';
        const csvWithBOM = BOM + csvContent;
        
        this.downloadFile(csvWithBOM, 'meeting-analysis.csv', 'text/csv;charset=utf-8');
        this.showToast('Excel file downloaded as CSV format', 'success');
    }

    exportAsPDF() {
        const analysis = this.currentAnalysis;
        const stories = analysis.userStories || [];
        const testCases = analysis.testCases || [];
        const blueprint = analysis.technicalBlueprint || {};
        const insights = analysis.insights || {};
        
        // Create PDF using browser print to PDF approach
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            this.showToast('Please allow popups to generate PDF', 'error');
            return;
        }
        
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Meeting Analysis Report</title>
            <style>
                @media print {
                    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                }
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; color: #333; }
                h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
                h2 { color: #1e40af; margin-top: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; page-break-before: auto; }
                h3 { color: #374151; margin-top: 20px; font-size: 14pt; }
                .meta { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
                table { width: 100%; border-collapse: collapse; margin: 15px 0; page-break-inside: auto; }
                tr { page-break-inside: avoid; }
                th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; font-size: 10pt; vertical-align: top; }
                th { background: #f9fafb; font-weight: bold; }
                .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: bold; }
                .high { background: #fee2e2; color: #991b1b; }
                .medium { background: #fef3c7; color: #92400e; }
                .low { background: #dbeafe; color: #1e40af; }
                .section { margin: 20px 0; page-break-inside: avoid; }
                ul { margin: 10px 0; }
                li { margin: 5px 0; }
                .print-btn { 
                    position: fixed; top: 20px; right: 20px; 
                    padding: 12px 24px; background: #2563eb; color: white; 
                    border: none; border-radius: 8px; cursor: pointer; 
                    font-size: 14px; font-weight: 600; box-shadow: 0 4px 12px rgba(37,99,235,0.3);
                }
                .print-btn:hover { background: #1d4ed8; }
                .close-hint { 
                    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
                    background: #374151; color: white; padding: 10px 20px;
                    border-radius: 20px; font-size: 12px;
                }
            </style>
        </head>
        <body>
            <button class="print-btn" onclick="window.print()">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" style="vertical-align:middle;margin-right:6px" viewBox="0 0 16 16">
                    <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5z"/>
                </svg>
                Print / Save as PDF
            </button>
            
            <div class="close-hint">After saving PDF, you can close this window</div>
            
            <h1>Meeting Analysis Report</h1>
            <div class="meta">
                <strong>Generated:</strong> ${new Date().toLocaleString()}<br>
                <strong>User Stories:</strong> ${stories.length}<br>
                <strong>Test Cases:</strong> ${testCases.length}
            </div>
            
            <h2>User Stories</h2>
            <table>
                <tr><th>ID</th><th>Title</th><th>Description</th><th>User Role</th><th>Benefit</th><th>Priority</th><th>Story Points</th><th>Epic</th><th>Framework</th></tr>
                ${stories.map(s => `
                    <tr>
                        <td>${s.id || ''}</td>
                        <td>${s.title || ''}</td>
                        <td>${s.description || ''}</td>
                        <td>${s.userRole || ''}</td>
                        <td>${s.benefit || ''}</td>
                        <td><span class="badge ${s.priority?.toLowerCase()}">${s.priority}</span></td>
                        <td>${s.storyPoints || ''}</td>
                        <td>${s.epic || ''}</td>
                        <td>${s.estimationFramework || ''}</td>
                    </tr>
                `).join('')}
            </table>
            
            <h2>User Stories - Detailed View</h2>
            ${stories.map(s => `
                <div class="section">
                    <h3>${s.id} - ${s.title}</h3>
                    <p><strong>Priority:</strong> <span class="badge ${s.priority?.toLowerCase()}">${s.priority}</span> | 
                       <strong>Story Points:</strong> ${s.storyPoints} | 
                       <strong>Role:</strong> ${s.userRole} |
                       <strong>Framework:</strong> ${s.estimationFramework || 'Standard'}</p>
                    <p><strong>Description:</strong> ${s.description}</p>
                    <p><strong>Business Objective:</strong> ${s.businessObjective || ''}</p>
                    <p><strong>Epic:</strong> ${s.epic || ''}</p>
                    ${s.acceptanceCriteria?.length ? `
                        <p><strong>Acceptance Criteria:</strong></p>
                        <ul>${s.acceptanceCriteria.map(ac => `<li>${ac}</li>`).join('')}</ul>
                    ` : ''}
                    ${s.dependencies?.length ? `
                        <p><strong>Dependencies:</strong></p>
                        <ul>${s.dependencies.map(dep => `<li>${dep}</li>`).join('')}</ul>
                    ` : ''}
                    ${s.successMetrics?.length ? `
                        <p><strong>Success Metrics:</strong></p>
                        <ul>${s.successMetrics.map(metric => `<li>${metric}</li>`).join('')}</ul>
                    ` : ''}
                </div>
            `).join('')}
            
            <h2>Test Cases</h2>
            <table>
                <tr><th>ID</th><th>Title</th><th>Type</th><th>Priority</th><th>Related Story</th><th>Scenario</th></tr>
                ${testCases.map(tc => `
                    <tr>
                        <td>${tc.id || ''}</td>
                        <td>${tc.title || ''}</td>
                        <td>${tc.type || 'Functional'}</td>
                        <td><span class="badge ${(tc.priority || '').toLowerCase().replace('p1', 'high').replace('p2', 'medium').replace('p3', 'low')}">${tc.priority}</span></td>
                        <td>${tc.relatedStory || ''}</td>
                        <td>${tc.scenario || ''}</td>
                    </tr>
                `).join('')}
            </table>
            
            <h2>Test Cases - Detailed View</h2>
            ${testCases.map(tc => `
                <div class="section">
                    <h3>${tc.id} - ${tc.title}</h3>
                    <p><strong>Type:</strong> ${tc.type || 'Functional'} | 
                       <strong>Priority:</strong> <span class="badge ${(tc.priority || '').toLowerCase().replace('p1', 'high').replace('p2', 'medium').replace('p3', 'low')}">${tc.priority}</span> |
                       <strong>Related Story:</strong> ${tc.relatedStory || ''}</p>
                    <p><strong>Scenario:</strong> ${tc.scenario || ''}</p>
                    ${tc.preconditions?.length ? `
                        <p><strong>Preconditions:</strong></p>
                        <ul>${tc.preconditions.map(pre => `<li>${pre}</li>`).join('')}</ul>
                    ` : ''}
                    ${tc.steps?.length ? `
                        <p><strong>Steps:</strong></p>
                        <ol>${tc.steps.map(step => `<li>${step}</li>`).join('')}</ol>
                    ` : ''}
                    ${tc.expectedResults?.length ? `
                        <p><strong>Expected Results:</strong></p>
                        <ul>${tc.expectedResults.map(result => `<li>${result}</li>`).join('')}</ul>
                    ` : ''}
                </div>
            `).join('')}
            
            ${blueprint.components?.length ? `
                <h2>Technical Blueprint - Components</h2>
                <table>
                    <tr><th>Name</th><th>Type</th><th>Description</th><th>Technologies</th></tr>
                    ${blueprint.components.map(comp => `
                        <tr>
                            <td>${comp.name || ''}</td>
                            <td>${comp.type || ''}</td>
                            <td>${comp.description || ''}</td>
                            <td>${(comp.technologies || []).join(', ')}</td>
                        </tr>
                    `).join('')}
                </table>
            ` : ''}
            
            ${blueprint.apiSpecs?.length ? `
                <h2>Technical Blueprint - API Specifications</h2>
                <table>
                    <tr><th>Endpoint</th><th>Method</th><th>Description</th></tr>
                    ${blueprint.apiSpecs.map(spec => `
                        <tr>
                            <td>${spec.endpoint || ''}</td>
                            <td>${spec.method || ''}</td>
                            <td>${spec.description || ''}</td>
                        </tr>
                    `).join('')}
                </table>
            ` : ''}
            
            ${insights.keyFindings?.length || insights.recommendations?.length || insights.risks?.length ? `
                <h2>Insights</h2>
                ${insights.keyFindings?.length ? `
                    <h3>Key Findings</h3>
                    <ul>${insights.keyFindings.map(f => `<li>${f}</li>`).join('')}</ul>
                ` : ''}
                ${insights.recommendations?.length ? `
                    <h3>Recommendations</h3>
                    <ul>${insights.recommendations.map(r => `<li>${r}</li>`).join('')}</ul>
                ` : ''}
                ${insights.risks?.length ? `
                    <h3>Risks</h3>
                    <ul>${insights.risks.map(r => `<li>${r}</li>`).join('')}</ul>
                ` : ''}
            ` : ''}
        </body>
        </html>`;
        
        printWindow.document.write(html);
        printWindow.document.close();
        this.showToast('PDF window opened. Click Print button to save as PDF.', 'success');
    }

    exportAsWord() {
        const analysis = this.currentAnalysis;
        const stories = analysis.userStories || [];
        const testCases = analysis.testCases || [];
        const blueprint = analysis.technicalBlueprint || {};
        const insights = analysis.insights || {};
        
        let html = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset="UTF-8">
            <title>Meeting Analysis Report</title>
            <style>
                body { font-family: 'Calibri', sans-serif; font-size: 11pt; line-height: 1.5; }
                h1 { color: #2E74B5; font-size: 16pt; margin-bottom: 10pt; }
                h2 { color: #2E74B5; font-size: 14pt; margin-top: 20pt; margin-bottom: 10pt; page-break-before: auto; }
                h3 { color: #1F4E79; font-size: 12pt; margin-top: 15pt; margin-bottom: 8pt; }
                table { border-collapse: collapse; width: 100%; margin: 10pt 0; }
                th, td { border: 1px solid #000; padding: 6pt; vertical-align: top; }
                th { background: #D9E2F3; font-weight: bold; }
                .priority-high { color: #C00000; font-weight: bold; }
                .priority-medium { color: #ED7D31; }
                .priority-low { color: #70AD47; }
                ul, ol { margin: 5pt 0; padding-left: 20pt; }
                li { margin: 3pt 0; }
                .section { margin: 15pt 0; }
            </style>
        </head>
        <body>
            <h1>Meeting Analysis Report</h1>
            <p><b>Generated:</b> ${new Date().toLocaleString()}</p>
            <p><b>Total User Stories:</b> ${stories.length} | <b>Total Test Cases:</b> ${testCases.length}</p>
            
            <h2>User Stories Summary</h2>
            <table>
                <tr><th>ID</th><th>Title</th><th>Description</th><th>User Role</th><th>Priority</th><th>Story Points</th><th>Epic</th><th>Framework</th></tr>
                ${stories.map(s => `
                    <tr>
                        <td>${s.id || ''}</td>
                        <td>${s.title || ''}</td>
                        <td>${s.description || ''}</td>
                        <td>${s.userRole || ''}</td>
                        <td class="priority-${s.priority?.toLowerCase()}">${s.priority || ''}</td>
                        <td>${s.storyPoints || ''}</td>
                        <td>${s.epic || ''}</td>
                        <td>${s.estimationFramework || ''}</td>
                    </tr>
                `).join('')}
            </table>
            
            <h2>User Stories - Detailed View</h2>
            ${stories.map(s => `
                <div class="section">
                    <h3>${s.id} - ${s.title}</h3>
                    <p><b>Priority:</b> <span class="priority-${s.priority?.toLowerCase()}">${s.priority}</span> | 
                       <b>Story Points:</b> ${s.storyPoints} | 
                       <b>Role:</b> ${s.userRole} |
                       <b>Framework:</b> ${s.estimationFramework || 'Standard'}</p>
                    <p><b>Description:</b> ${s.description}</p>
                    <p><b>Business Objective:</b> ${s.businessObjective || ''}</p>
                    <p><b>Benefit:</b> ${s.benefit || ''}</p>
                    <p><b>Epic:</b> ${s.epic || ''}</p>
                    <p><b>Effort:</b> ${s.effort || ''} | <b>Risk:</b> ${s.risk || ''} | <b>Complexity:</b> ${s.complexity || ''}</p>
                    <p><b>Quality Score:</b> ${s.qualityScore || ''}%</p>
                    ${s.acceptanceCriteria?.length ? `
                        <p><b>Acceptance Criteria:</b></p>
                        <ul>${s.acceptanceCriteria.map(ac => `<li>${ac}</li>`).join('')}</ul>
                    ` : ''}
                    ${s.dependencies?.length ? `
                        <p><b>Dependencies:</b></p>
                        <ul>${s.dependencies.map(dep => `<li>${dep}</li>`).join('')}</ul>
                    ` : ''}
                    ${s.successMetrics?.length ? `
                        <p><b>Success Metrics:</b></p>
                        <ul>${s.successMetrics.map(metric => `<li>${metric}</li>`).join('')}</ul>
                    ` : ''}
                    ${s.assumptions?.length ? `
                        <p><b>Assumptions:</b></p>
                        <ul>${s.assumptions.map(assumption => `<li>${assumption}</li>`).join('')}</ul>
                    ` : ''}
                </div>
            `).join('')}
            
            <h2>Test Cases Summary</h2>
            <table>
                <tr><th>ID</th><th>Title</th><th>Type</th><th>Priority</th><th>Related Story</th><th>Scenario</th></tr>
                ${testCases.map(tc => `
                    <tr>
                        <td>${tc.id || ''}</td>
                        <td>${tc.title || ''}</td>
                        <td>${tc.type || 'Functional'}</td>
                        <td class="priority-${tc.priority?.toLowerCase().replace('p1', 'high').replace('p2', 'medium').replace('p3', 'low')}">${tc.priority || ''}</td>
                        <td>${tc.relatedStory || ''}</td>
                        <td>${tc.scenario || ''}</td>
                    </tr>
                `).join('')}
            </table>
            
            <h2>Test Cases - Detailed View</h2>
            ${testCases.map(tc => `
                <div class="section">
                    <h3>${tc.id} - ${tc.title}</h3>
                    <p><b>Type:</b> ${tc.type || 'Functional'} | 
                       <b>Priority:</b> <span class="priority-${tc.priority?.toLowerCase().replace('p1', 'high').replace('p2', 'medium').replace('p3', 'low')}">${tc.priority}</span> |
                       <b>Related Story:</b> ${tc.relatedStory || ''}</p>
                    <p><b>Scenario:</b> ${tc.scenario || ''}</p>
                    ${tc.preconditions?.length ? `
                        <p><b>Preconditions:</b></p>
                        <ul>${tc.preconditions.map(pre => `<li>${pre}</li>`).join('')}</ul>
                    ` : ''}
                    ${tc.steps?.length ? `
                        <p><b>Steps:</b></p>
                        <ol>${tc.steps.map(step => `<li>${step}</li>`).join('')}</ol>
                    ` : ''}
                    ${tc.expectedResults?.length ? `
                        <p><b>Expected Results:</b></p>
                        <ul>${tc.expectedResults.map(result => `<li>${result}</li>`).join('')}</ul>
                    ` : ''}
                </div>
            `).join('')}
            
            ${blueprint.components?.length ? `
                <h2>Technical Blueprint - Components</h2>
                <table>
                    <tr><th>Name</th><th>Type</th><th>Description</th><th>Technologies</th><th>Responsibilities</th></tr>
                    ${blueprint.components.map(comp => `
                        <tr>
                            <td>${comp.name || ''}</td>
                            <td>${comp.type || ''}</td>
                            <td>${comp.description || ''}</td>
                            <td>${(comp.technologies || []).join(', ')}</td>
                            <td>${(comp.responsibilities || []).join(', ')}</td>
                        </tr>
                    `).join('')}
                </table>
            ` : ''}
            
            ${blueprint.apiSpecs?.length ? `
                <h2>Technical Blueprint - API Specifications</h2>
                <table>
                    <tr><th>Endpoint</th><th>Method</th><th>Description</th></tr>
                    ${blueprint.apiSpecs.map(spec => `
                        <tr>
                            <td>${spec.endpoint || ''}</td>
                            <td>${spec.method || ''}</td>
                            <td>${spec.description || ''}</td>
                        </tr>
                    `).join('')}
                </table>
            ` : ''}
            
            ${blueprint.databaseSchema?.tables?.length ? `
                <h2>Technical Blueprint - Database Schema</h2>
                ${blueprint.databaseSchema.tables.map(table => `
                    <div class="section">
                        <h3>Table: ${table.name || ''}</h3>
                        <table>
                            <tr><th>Column</th><th>Type</th><th>Constraints</th></tr>
                            ${(table.columns || []).map(col => `
                                <tr>
                                    <td>${col.name || ''}</td>
                                    <td>${col.type || ''}</td>
                                    <td>${(col.constraints || []).join(', ')}</td>
                                </tr>
                            `).join('')}
                        </table>
                    </div>
                `).join('')}
            ` : ''}
            
            ${insights.keyFindings?.length || insights.recommendations?.length || insights.risks?.length ? `
                <h2>Insights</h2>
                ${insights.keyFindings?.length ? `
                    <h3>Key Findings</h3>
                    <ul>${insights.keyFindings.map(f => `<li>${f}</li>`).join('')}</ul>
                ` : ''}
                ${insights.recommendations?.length ? `
                    <h3>Recommendations</h3>
                    <ul>${insights.recommendations.map(r => `<li>${r}</li>`).join('')}</ul>
                ` : ''}
                ${insights.risks?.length ? `
                    <h3>Risks</h3>
                    <ul>${insights.risks.map(r => `<li>${r}</li>`).join('')}</ul>
                ` : ''}
                ${insights.successMetrics?.length ? `
                    <h3>Success Metrics</h3>
                    <ul>${insights.successMetrics.map(m => `<li>${m}</li>`).join('')}</ul>
                ` : ''}
            ` : ''}
        </body>
        </html>`;
        
        this.downloadFile(html, 'meeting-analysis.doc', 'application/msword');
    }

    exportAsCSV() {
        this.showToast('CSV export not available. Use Excel export instead.', 'info');
    }

    exportAsMarkdown() {
        this.showToast('Markdown export not available.', 'info');
    }

    convertToCSV(data, headers) {
        const csv = [headers.join(',')];
        data.forEach(row => {
            const values = headers.map(h => {
                const val = row[h] || '';
                return `"${String(val).replace(/"/g, '""')}"`;
            });
            csv.push(values.join(','));
        });
        return csv.join('\n');
    }

    showHelpModal() {
        document.getElementById('helpModal').classList.add('active');
    }

    showCustomModal(title, content) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body"></div>
            </div>
        `;
        overlay.querySelector('.modal-body').appendChild(content);
        document.body.appendChild(overlay);
        
        overlay.querySelector('.modal-close').addEventListener('click', () => {
            overlay.remove();
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });
    }
}

// Initialize application
const analyzer = new MeetingNotesAnalyzer();
document.addEventListener('DOMContentLoaded', () => analyzer.initializeApp());
