import TelegramBot from "node-telegram-bot-api"

const token = process.env.TELEGRAMBOT;
const bot = new TelegramBot(token, { polling: true });

let text = {
    "ar": {
        "hello": "اهلا كيف يمكننا مساعدتك ؟",
        "callAction": "اخبرنا بمشكلتك أو استفسارك هنا، وسيقوم المطورون بالرد عليك في أقرب وقت ممكن. 🛠️✨"
    },
    "en": {
        "hello": "Hello, how can we help you?",
        "callAction": "Please send your issue or inquiry here, and our developers will get back to you as soon as possible. 🛠️✨"
    }
};

bot.onText(/\/start/, async (msg) => {
    try {
        const lan = msg.from.language_code || "en";
        const ID = msg.from.id;
        switch (lan) {
            case 'ar':
                bot.sendMessage(ID, text['ar']['hello']);
                await sleep(2);
                bot.sendMessage(ID, text['ar']['callAction']);
                break;
            default:
                bot.sendMessage(ID, text['en']['hello']);
                await sleep(2);
                bot.sendMessage(ID, text['en']['callAction']);
                break;
                break;
        }
    } catch (error) {
        console.log(error)
    }
});

function sleep(time) {
    return new Promise((resolve) => { setTimeout(() => { resolve(); }, time * 1000); });
};

console.log('Bot is running...');