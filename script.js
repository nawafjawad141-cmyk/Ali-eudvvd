let conversationHistory = [];

document.getElementById('sendBtn').addEventListener('click', sendMessage);
document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

async function sendMessage() {
    const inputField = document.getElementById('userInput');
    const userMessage = inputField.value.trim();
    
    if (!userMessage) return;
    
    addMessage(userMessage, 'user');
    inputField.value = '';
    
    const typingDiv = addTypingIndicator();
    
    try {
        const response = await callGeminiAPI(userMessage);
        removeTypingIndicator(typingDiv);
        addMessage(response, 'bot');
    } catch (error) {
        removeTypingIndicator(typingDiv);
        addMessage('❌ عذراً، حدث خطأ في الاتصال. تأكد من تشغيل الـ VPN أو صلاحية المفتاح.', 'bot');
        console.error("Error Details:", error);
    }
}

async function callGeminiAPI(userMessage) {
    // تجهيز النص الموجه للذكاء الاصطناعي
    const promptText = `أنت مساعد صيانة محترف خبير في جميع أنواع الصيانة (سيارات، أجهزة منزلية، كهرباء، هواتف، كمبيوتر). أجب بدقة واحترافية عن مشكلة العميل التالية:
المشكلة: ${userMessage}
قدم الحل خطوة بخطوة بطريقة واضحة ومفيدة.`;

    const requestBody = {
        contents: [{
            parts: [{ text: promptText }]
        }]
    };

    // التصحيح هنا: نستخدم API_URL مباشرة لأنه يحتوي على المفتاح من ملف config
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Response:", errorData);
        throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

function addMessage(text, sender) {
    const chatBox = document.getElementById('chatBox');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    if (sender === 'bot') {
        // تأكد من وجود مكتبة marked في ملف HTML لتنسيق الكلام
        try {
            messageDiv.innerHTML = marked.parse(text);
        } catch (e) {
            messageDiv.textContent = text;
        }
    } else {
        messageDiv.textContent = text;
    }
    
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function addTypingIndicator() {
    const chatBox = document.getElementById('chatBox');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = '🤖 جاري التفكير في الحل...';
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return typingDiv;
}

function removeTypingIndicator(typingDiv) {
    if (typingDiv) {
        typingDiv.remove();
    }
}
