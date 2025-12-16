require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// APIキーの確認
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error("エラー: .envファイルに GEMINI_API_KEY が設定されていません。");
    console.error("1. Google AI Studio (https://aistudio.google.com/) でAPIキーを取得してください。");
    console.error("2. .env ファイルを作成し、GEMINI_API_KEY=あなたのAPIキー を記述してください。");
    process.exit(1);
}

// Gemini APIの初期化
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// ランダムプロンプトの部品
const roles = [
    "古代ギリシャの哲学者",
    "未来から来たロボット",
    "大阪のおばちゃん",
    "熱血な松岡修造風のテニスコーチ",
    "冷静沈着な探偵",
    "中二病の高校生",
    "猫",
    "超一流の寿司職人"
];

const topics = [
    "AIの未来について",
    "完璧な目玉焼きの作り方について",
    "なぜ空は青いのかについて",
    "人生における最大の幸福とは何かについて",
    "プログラミングの楽しさについて",
    "今晩の夕食の献立について",
    "宇宙人の存在について",
    "最近の若者について"
];

const styles = [
    "簡潔に3行以内で答えてください。",
    "情熱的に、多くの感嘆符を使って語ってください。",
    "俳句形式（5-7-5）で答えてください。",
    "絵文字をふんだんに使って可愛らしく答えてください。",
    "専門用語を多用して難解に説明してください。",
    "すべてひらがなで答えてください。",
    "皮肉たっぷりに答えてください。",
    "物語を聞かせるように答えてください。"
];

// ランダムな要素を取得するヘルパー関数
function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

const MAX_RETRIES = 5;
const BASE_DELAY = 2000;

async function generateContentWithRetry(model, prompt) {
    let lastError;
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            return await model.generateContent(prompt);
        } catch (error) {
            lastError = error;
            console.warn(`Attempt ${i + 1} failed: ${error.message}`);

            // Check for 503 Service Unavailable or other retryable errors
            if (error.message.includes('503') || error.status === 503) {
                const delay = BASE_DELAY * Math.pow(2, i); // Exponential backoff
                console.log(`Server overloaded. Retrying in ${delay / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                // If it's not a retryable error, rethrow immediately
                throw error;
            }
        }
    }
    throw new Error(`Failed after ${MAX_RETRIES} attempts. Last error: ${lastError.message}`);
}

async function run() {
    try {
        // ランダムにプロンプトを組み立てる
        const role = getRandomElement(roles);
        const topic = getRandomElement(topics);
        const style = getRandomElement(styles);

        const prompt = `あなたは${role}です。${topic}、${style}`;

        console.log("--- 生成されたプロンプト ---");
        console.log(prompt);
        console.log("--------------------------\n");
        console.log("Geminiにリクエスト中...");

        // コンテンツ生成のリクエスト (リトライ付き)
        const result = await generateContentWithRetry(model, prompt);
        const response = await result.response;
        // response.text() is synchronous according to docs but let's keep it standard
        const text = response.text();

        console.log("\n--- Geminiの回答 ---");
        console.log(text);
        console.log("-------------------");

    } catch (error) {
        console.error("エラーが発生しました:", error);
    }
}

run();
