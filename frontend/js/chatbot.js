// ============================================================
// chatbot.js — UZHAVU KAAPPAAN AI with Full Voice Chat & Speech
// ============================================================

(function() {
  let isOpen = false;
  let chatHistory = [];
  let currentLang = (window.i18n && window.i18n.getLanguage() === 'en') ? 'en' : 'ta'; // Default to Tamil
  let voiceEnabled = true; // Auto-speak enabled
  let isListening = false;
  let continuousVoice = false;
  let recognition = null;
  let synth = window.speechSynthesis;
  let activeUtterance = null;

  // 1. Create HTML Structure with Full Voice Chat Controls
  const chatHtml = `
    <!-- Floating Chat Launcher Button -->
    <div id="kisan-chat-toggle" class="kisan-chat-fab" onclick="toggleKisanChat()">
      <div class="kisan-fab-pulse"></div>
      <span class="kisan-fab-icon">🌱</span>
      <span class="kisan-fab-label" id="kisan-fab-label">உழவு காப்பான்</span>
    </div>

    <!-- Chat Modal Window -->
    <div id="kisan-chat-modal" class="kisan-chat-modal" style="display: none;">
      
      <!-- Chat Header -->
      <div class="kisan-chat-header">
        <div class="kisan-header-title">
          <span class="kisan-icon-circle">🌱</span>
          <div>
            <h4 id="kisan-modal-title">UZHAVU KAAPPAAN AI (உழவு காப்பான்)</h4>
            <span class="kisan-online-status">
              <span class="online-dot"></span>
              <span id="kisan-online-text">தமிழ் குரல் சேவை இயங்குகிறது (Voice Active)</span>
            </span>
          </div>
        </div>
        
        <div class="kisan-header-actions">
          <!-- Language Selector -->
          <button id="kisan-lang-btn" class="kisan-action-btn active" onclick="toggleChatLanguage()" title="Switch Language">
            🌐 <span id="kisan-lang-text">தமிழ்</span>
          </button>
          <!-- Voice Toggle -->
          <button id="kisan-voice-btn" class="kisan-action-btn active" onclick="toggleVoiceAudio()" title="Toggle Voice Audio">
            <span id="kisan-voice-icon">🔊</span>
          </button>
          <!-- Close -->
          <button class="kisan-close-btn" onclick="toggleKisanChat()" title="Close">✕</button>
        </div>
      </div>

      <!-- Live Voice Chat Banner -->
      <div class="kisan-voice-banner">
        <button type="button" id="kisan-voice-banner-btn" class="kisan-voice-banner-btn" onclick="toggleSpeechRecognition()">
          <span>🎙️</span> <span id="kisan-voice-banner-text">குரல் மூலம் பேச (Tap to Speak)</span>
        </button>
        <div id="kisan-audio-wave" class="kisan-audio-wave">
          <div class="kisan-audio-bar"></div>
          <div class="kisan-audio-bar"></div>
          <div class="kisan-audio-bar"></div>
          <div class="kisan-audio-bar"></div>
          <div class="kisan-audio-bar"></div>
        </div>
      </div>

      <!-- Listening Overlay Modal -->
      <div id="kisan-listening-overlay" class="kisan-listening-overlay" onclick="toggleSpeechRecognition()">
        <div class="kisan-listening-mic-circle">🎙️</div>
        <div class="kisan-listening-title" id="kisan-listening-title">உங்கள் கேள்வியை தமிழில் பேசுங்கள்…</div>
        <div class="kisan-listening-hint" id="kisan-listening-hint">பேசி முடித்ததும் தானாக AI பதிலளிக்கும் (குரலை நிறுத்த தட்டவும்)</div>
        <div class="kisan-audio-wave active" style="margin-top:10px">
          <div class="kisan-audio-bar"></div>
          <div class="kisan-audio-bar"></div>
          <div class="kisan-audio-bar"></div>
          <div class="kisan-audio-bar"></div>
          <div class="kisan-audio-bar"></div>
        </div>
      </div>

      <!-- Chat Messages Container -->
      <div id="kisan-chat-messages" class="kisan-chat-messages">
        <!-- Messages rendered here -->
      </div>

      <!-- Suggestion Chips Container -->
      <div id="kisan-chat-suggestions" class="kisan-chat-suggestions">
        <!-- Chips rendered dynamically -->
      </div>

      <!-- Chat Input Form -->
      <form id="kisan-chat-form" class="kisan-chat-input-row" onsubmit="sendKisanChatMessage(event)">
        <!-- Speech Microphone Button -->
        <button type="button" id="kisan-mic-btn" class="kisan-mic-btn" onclick="toggleSpeechRecognition()" title="குரல் மூலம் பேச (Speak in Tamil)">
          🎙️
        </button>

        <input 
          type="text" 
          id="kisan-user-input" 
          class="kisan-chat-input" 
          placeholder="பயிர், மண் வளம், உரங்கள் பற்றி கேட்கவும்…" 
          autocomplete="off"
        />

        <button type="submit" class="kisan-send-btn" title="Send message">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>

    </div>
  `;

  // Append widget to body
  const wrap = document.createElement('div');
  wrap.id = 'kisan-ai-widget';
  wrap.innerHTML = chatHtml;
  document.body.appendChild(wrap);

  // Belt-and-suspenders Enter-to-send: the <form onsubmit> already handles
  // a plain Enter keypress via the browser's native implicit submission,
  // but that can silently fail to fire when the keypress is instead
  // consumed by an IME composing Tamil text (very common for this app's
  // audience) — isComposing / keyCode 229 marks that case, which we skip
  // so we don't send a message mid-composition.
  const kisanInputEl = document.getElementById('kisan-user-input');
  if (kisanInputEl) {
    kisanInputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.isComposing && e.keyCode !== 229) {
        e.preventDefault();
        sendKisanChatMessage();
      }
    });
  }

  // Initialize Speech Recognition (Web Speech API)
  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = (currentLang === 'ta') ? 'ta-IN' : 'en-IN';

      recognition.onstart = function() {
        isListening = true;
        updateListeningVisuals(true);
      };

      recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        const input = document.getElementById('kisan-user-input');
        if (input) {
          input.value = transcript;
          sendKisanChatMessage();
        }
      };

      recognition.onerror = function(event) {
        console.warn('Speech recognition error:', event.error);
        stopSpeechRecognition();
      };

      recognition.onend = function() {
        stopSpeechRecognition();
      };
    }
  }

  function updateListeningVisuals(listening) {
    const micBtn = document.getElementById('kisan-mic-btn');
    const bannerBtn = document.getElementById('kisan-voice-banner-btn');
    const wave = document.getElementById('kisan-audio-wave');
    const overlay = document.getElementById('kisan-listening-overlay');
    const bannerText = document.getElementById('kisan-voice-banner-text');

    if (listening) {
      if (micBtn) micBtn.classList.add('listening');
      if (bannerBtn) bannerBtn.classList.add('listening');
      if (wave) wave.classList.add('active');
      if (overlay) overlay.classList.add('active');
      if (bannerText) bannerText.textContent = (currentLang === 'ta') ? '🎙️ குரலை கேட்கிறது…' : '🎙️ Listening to voice…';
    } else {
      if (micBtn) micBtn.classList.remove('listening');
      if (bannerBtn) bannerBtn.classList.remove('listening');
      if (wave) wave.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
      if (bannerText) bannerText.textContent = (currentLang === 'ta') ? 'குரல் மூலம் பேச (Tap to Speak)' : 'Tap to Speak (Voice Chat)';
    }
  }

  function toggleSpeechRecognition() {
    // Unlock speech synthesis on user interaction for mobile browsers
    if (synth && synth.resume) {
      synth.resume();
    }

    if (!recognition) initSpeechRecognition();
    if (!recognition) {
      alert(currentLang === 'ta' ? 'உங்கள் உலாவியில் மைக்ரோஃபோன் வசதி ஆதரிக்கப்படவில்லை. Chrome அல்லது Edge உலாவியை பயன்படுத்தவும்.' : 'Speech recognition not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognition.stop();
      stopSpeechRecognition();
    } else {
      try {
        recognition.lang = (currentLang === 'ta') ? 'ta-IN' : 'en-IN';
        recognition.start();
      } catch(e) {
        recognition.stop();
        stopSpeechRecognition();
      }
    }
  }

  function stopSpeechRecognition() {
    isListening = false;
    updateListeningVisuals(false);
  }

  // Text to Speech (Tamil Voice Synthesis)
  function speakTamilText(rawText, btnElement) {
    if (!synth) return;
    try {
      synth.cancel(); // Stop any previous speech
    } catch(e){}

    // Clean markdown and technical symbols for clean spoken Tamil
    const cleanText = rawText
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/[#🌱🧪⚠️✅💡📈•✓]/g, '')
      .replace(/₹\s*([0-9,]+)/g, '$1 ரூபாய் ')
      .replace(/kg\/ha/g, 'கிலோகிராம் ஒரு ஹெக்டேருக்கு')
      .replace(/Score:\s*([0-9]+)/g, 'மதிப்பெண் $1')
      .replace(/\n+/g, '. ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = (currentLang === 'ta') ? 'ta-IN' : 'en-IN';
    utterance.rate = 0.95; // Natural spoken tempo
    utterance.pitch = 1.0;

    // Pick best available Tamil or Indian voice
    const voices = synth.getVoices ? synth.getVoices() : [];
    const taVoice = voices.find(v => v.lang.startsWith('ta') || v.name.toLowerCase().includes('tamil') || v.lang === 'ta-IN');
    if (taVoice) {
      utterance.voice = taVoice;
    }

    if (btnElement) {
      btnElement.classList.add('speaking');
      utterance.onend = () => btnElement.classList.remove('speaking');
      utterance.onerror = () => btnElement.classList.remove('speaking');
    }

    activeUtterance = utterance;
    try {
      synth.speak(utterance);
    } catch (sErr) {
      console.warn('Speech synthesis call failed:', sErr);
    }
  }

  function toggleVoiceAudio() {
    voiceEnabled = !voiceEnabled;
    const btn = document.getElementById('kisan-voice-btn');
    const icon = document.getElementById('kisan-voice-icon');
    if (btn) btn.classList.toggle('active', voiceEnabled);
    if (icon) icon.textContent = voiceEnabled ? '🔊' : '🔇';
    if (!voiceEnabled && synth) {
      try { synth.cancel(); } catch(e){}
    }
  }

  function toggleChatLanguage() {
    currentLang = (currentLang === 'ta') ? 'en' : 'ta';
    const langText = document.getElementById('kisan-lang-text');
    if (langText) langText.textContent = (currentLang === 'ta') ? 'தமிழ்' : 'English';
    updateChatbotLanguage();
    showWelcomeGreeting();
  }

  function toggleKisanChat() {
    isOpen = !isOpen;
    const modal = document.getElementById('kisan-chat-modal');
    const fab = document.getElementById('kisan-chat-toggle');
    if (!modal) return;

    if (isOpen) {
      modal.style.display = 'flex';
      modal.classList.add('open');
      fab.classList.add('active');
      document.getElementById('kisan-user-input').focus();
      
      if (chatHistory.length === 0) {
        showWelcomeGreeting();
      }
    } else {
      modal.style.display = 'none';
      modal.classList.remove('open');
      fab.classList.remove('active');
      if (synth) {
        try { synth.cancel(); } catch(e){}
      }
      stopSpeechRecognition();
    }
  }

  function showWelcomeGreeting() {
    const isTa = (currentLang === 'ta');
    const greetingText = isTa
      ? `வணக்கம்! நான் உங்கள் **UZHAVU KAAPPAAN (உழவு காப்பான் AI)** 🌱\n\nஉங்கள் நிலத்தின் மண் வளம் (மதிப்பெண்: 63, தழைச்சத்து: 42 kg/ha), 3-பருவ தக்காளி சாகுபடி வரலாறு மற்றும் 23,000+ மண்டி சந்தை விலைகளின் அடிப்படையில் நான் தமிழில் வழிகாட்டுகிறேன். கேள்விகளை கேட்க மேலே உள்ள **குரல் மூலம் பேச** பொத்தானை அல்லது கீழே உள்ள விருப்பங்களை பயன்படுத்தவும்!`
      : `Hello! I am your **UZHAVU KAAPPAAN AI Agronomist** 🌱\n\nI have full context of your 4.5-acre farm, your current soil test (Score: 63, N: 42 kg/ha), continuous tomato cultivation history, and 23k+ APMC Mandi market quotes. Speak or type below!`;

    const initialSuggestions = isTa
      ? ["அடுத்த பயிர் என்ன நடலாம்?", "என் மண் வளம் ஏன் குறைந்துள்ளது?", "சைலேஜ் தரம் & மாட்டு தீவனம்", "மண்டி சந்தை விலைகள் என்ன?"]
      : ["What crop to plant next?", "Explain my soil test", "Silage quality & Dairy Feed", "Why avoid continuous Tomato?"];

    // Clear previous chat when language switches
    const msgBox = document.getElementById('kisan-chat-messages');
    if (msgBox) msgBox.innerHTML = '';
    chatHistory = [];

    appendMessage('bot', greetingText);
    renderSuggestions(initialSuggestions);

    if (voiceEnabled) {
      speakTamilText(greetingText);
    }
  }

  function renderSuggestions(chips) {
    const box = document.getElementById('kisan-chat-suggestions');
    if (!box) return;
    if (!chips || !chips.length) {
      box.innerHTML = '';
      return;
    }
    box.innerHTML = chips.map(chip => `
      <button type="button" class="kisan-chip" onclick="submitQuickSuggestion('${chip.replace(/'/g, "\\'")}')">
        💬 ${chip}
      </button>
    `).join('');
  }

  function formatMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>')
      .replace(/• /g, '&bull; ');
  }

  function appendMessage(sender, text) {
    chatHistory.push({ sender, text });
    const msgBox = document.getElementById('kisan-chat-messages');
    if (!msgBox) return;

    const div = document.createElement('div');
    div.className = `kisan-msg ${sender}`;

    const msgId = 'kmsg-' + Math.random().toString(36).substring(2, 9);
    
    div.innerHTML = `
      <div class="kisan-msg-bubble-wrap">
        <div class="kisan-msg-bubble ${sender}" id="${msgId}">
          ${formatMarkdown(text)}
        </div>
        ${sender === 'bot' ? `
          <div class="kisan-msg-footer">
            <button class="kisan-speak-btn" onclick="speakMessageById('${msgId}', this)" title="குரல் மூலம் கேட்க (Listen in Tamil)">
              🔊 <span>${currentLang === 'ta' ? 'தமிழில் கேட்க' : 'Listen'}</span>
            </button>
          </div>
        ` : ''}
      </div>
    `;
    msgBox.appendChild(div);
    msgBox.scrollTop = msgBox.scrollHeight;
  }

  window.speakMessageById = function(id, btn) {
    const el = document.getElementById(id);
    if (el) {
      speakTamilText(el.innerText || el.textContent, btn);
    }
  };

  function appendTypingIndicator() {
    const msgBox = document.getElementById('kisan-chat-messages');
    const id = 'kisan-typing-indicator';
    const div = document.createElement('div');
    div.id = id;
    div.className = 'kisan-msg bot';
    div.innerHTML = `
      <div class="kisan-msg-bubble bot typing">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    msgBox.appendChild(div);
    msgBox.scrollTop = msgBox.scrollHeight;
    return id;
  }

  function removeTypingIndicator() {
    const el = document.getElementById('kisan-typing-indicator');
    if (el) el.remove();
  }

  async function sendKisanChatMessage(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('kisan-user-input');
    const msg = input.value.trim();
    if (!msg) return;

    input.value = '';
    appendMessage('user', msg);
    appendTypingIndicator();
    renderSuggestions([]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          farm_id: window.state?.farm_id || 101,
          lang: currentLang
        })
      });

      removeTypingIndicator();

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const reply = data.reply || (currentLang === 'ta' ? 'விவசாய ஆலோசனைகளை வழங்க தயாராக உள்ளேன்.' : 'I am ready to assist with your crops and soil health.');
      appendMessage('bot', reply);
      renderSuggestions(data.suggestions || []);

      // Speak automatically if voice audio is enabled
      if (voiceEnabled) {
        speakTamilText(reply);
      }
    } catch (err) {
      removeTypingIndicator();
      console.error('Chat error:', err);
      appendMessage('bot', currentLang === 'ta'
        ? '⚠️ உழவு காப்பான் AI சேவையுடன் இணைக்க முடியவில்லை. தயவுசெய்து சேவையகத்தை சரிபார்க்கவும்.'
        : '⚠️ Could not connect to Kisan AI service. Please ensure the backend is running.');
    }
  }

  function submitQuickSuggestion(text) {
    const input = document.getElementById('kisan-user-input');
    if (input) {
      input.value = text;
      sendKisanChatMessage();
    }
  }

  function updateChatbotLanguage(siteLang) {
    // Called from i18n.js whenever the site-wide language toggle changes,
    // as well as internally after the chat widget's own language button.
    // Only re-derive currentLang when a siteLang is actually passed in —
    // the internal toggle calls this with no args after setting currentLang
    // itself, and re-deriving here would stomp that.
    if (siteLang) currentLang = (siteLang === 'en') ? 'en' : 'ta';

    const isTa = (currentLang === 'ta');
    const fabLabel = document.getElementById('kisan-fab-label');
    const title = document.getElementById('kisan-modal-title');
    const status = document.getElementById('kisan-online-text');
    const input = document.getElementById('kisan-user-input');
    const bannerText = document.getElementById('kisan-voice-banner-text');

    if (fabLabel) fabLabel.textContent = isTa ? 'உழவு காப்பான்' : 'UZHAVU KAAPPAAN';
    if (title) title.textContent = isTa ? 'UZHAVU KAAPPAAN (உழவு காப்பான்)' : 'UZHAVU KAAPPAAN AI';
    if (status) status.textContent = isTa ? 'தமிழ் குரல் சேவை இயங்குகிறது (Voice Active)' : 'Online · Farm Agronomist';
    if (input) input.placeholder = isTa ? 'பயிர், மண் வளம், உரங்கள் பற்றி கேட்கவும்…' : 'Ask about crops, soil test, mandi prices…';
    if (bannerText) bannerText.textContent = isTa ? 'குரல் மூலம் பேச (Tap to Speak)' : 'Tap to Speak (Voice Chat)';
  }

  // Pre-load synthesis voices
  if (synth && synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = () => {};
  }

  // Expose methods globally
  window.toggleKisanChat = toggleKisanChat;
  window.sendKisanChatMessage = sendKisanChatMessage;
  window.submitQuickSuggestion = submitQuickSuggestion;
  window.toggleSpeechRecognition = toggleSpeechRecognition;
  window.toggleVoiceAudio = toggleVoiceAudio;
  window.toggleChatLanguage = toggleChatLanguage;
  window.updateChatbotLanguage = updateChatbotLanguage;
})();
