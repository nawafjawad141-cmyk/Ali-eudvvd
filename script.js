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
    
    // عرض رسالة المستخدم
    addMessage(userMessage, 'user');
    inputField.value = '';
    
    // عرض مؤشر الكتابة
    const typingDiv = addTypingIndicator();
    
    try {
        const response = await callGeminiAPI(userMessage);
        removeTypingIndicator(typingDiv);
        addMessage(response, 'bot');
    } catch (error) {
        removeTypingIndicator(typingDiv);
        addMessage('❌ عذراً، حدث خطأ في الاتصال. تأكد من مفتاح API أو اتصال الإنترنت.', 'bot');
        console.error(error);
    }
}

async function callGeminiAPI(userMessage) {
    const prompt = `أنت مساعد صيانة محترف خبير في جميع أنواع الصيانة (سيارات، أجهزة منزلية، كهرباء، هواتف، كمبيوتر). أجب بدقة واحترافية عن مشكلة العميل التالية:

المشكلة: ${userMessage}

قدم الحل خطوة بخطوة بطريقة واضحة ومفيدة.`;

    const requestBody = {
        contents: [{
            parts: [{ text: prompt }]
        }]
    };

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

function addMessage(text, sender) {
    const chatBox = document.getElementById('chatBox');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    // تحويل Markdown إلى HTML (للردود الجميلة)
    if (sender === 'bot') {
        text = marked.parse(text);
        messageDiv.innerHTML = text;
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
    typingDiv.innerHTML = '🤖 جاري التفكير';
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return typingDiv;
}

function removeTypingIndicator(typingDiv) {
    if (typingDiv && typingDiv.remove) {
        typingDiv.remove();
    }
}