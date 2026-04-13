// 🔑 إعدادات الاتصال بذكاء Gemini الاصطناعي
const API_KEY = "AIzaSyDo-cLAGEWao8Ug4cBdkQFjNephJl-tLoM";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

async function getGeminiResponse(userPrompt) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: userPrompt
                    }]
                }]
            })
        });

        const data = await response.json();
        
        // التحقق من وجود رد من الذكاء الاصطناعي
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "عذراً، لم أستطع فهم الطلب بشكل صحيح.";
        }
    } catch (error) {
        console.error("خطأ في الاتصال:", error);
        return "حدث خطأ في الاتصال. تأكد من الإنترنت أو صلاحية المفتاح.";
    }
}
