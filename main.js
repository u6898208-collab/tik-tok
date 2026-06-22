import http from "node:http";
import * as cheerio from "cheerio";
import 'dotenv/config';

import "./telegramBot.js";

const keyHeader = process.env.KEY;

const Server = http.createServer(async (req, res) => {
    try {
        if (req.url != "/") return res.end();

        const key = req.headers.key;
        if (key != keyHeader) return res.end("undefined");

        const username = req.headers['username'];
        let data = await getData(username);

        while (!data) {
            data = await getData(username);
        };

        if (data.error) data = undefined;

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json")
        res.end(JSON.stringify(data));

    } catch (error) {
        console.log(error);
        res.statusCode = 400;
        res.end("error Server");
    };
});

const userAgentData = {
    android: {
        versions: ["11.0", "12.0", "13.0", "14.0"],
        devices: [
            { name: "Pixel 7", build: "TQ3A.230605.012" },
            { name: "Samsung Galaxy S23", build: "TP1A.220624.014" },
            { name: "Xiaomi 13", build: "TKQ1.221114.001" }
        ],
        locales: ["en-US", "en-GB", "ar-EG"]
    },
    iphone: {
        iosVersions: ["15_7", "16_5", "17_2", "17_4"],
        models: ["iPhone", "iPhone; CPU iPhone OS"]
    },
    desktop: {
        windowsVersions: ["NT 10.0; Win64; x64", "NT 11.0; Win64; x64"],
        macVersions: ["Intel Mac OS X 10_15_7", "Intel Mac OS X 13_4", "Intel Mac OS X 14_0"],
        chromeVersions: ["114.0.0.0", "120.0.0.0", "122.0.0.0"],
        safariVersions: ["605.1.15", "537.36"]
    }
};

function generateRandomUserAgent() {
    const types = ["android", "iphone", "windows", "mac"];
    const randomType = types[Math.floor(Math.random() * types.length)];

    const chromeVer = userAgentData.desktop.chromeVersions[Math.floor(Math.random() * userAgentData.desktop.chromeVersions.length)];
    const safariVer = userAgentData.desktop.safariVersions[Math.floor(Math.random() * userAgentData.desktop.safariVersions.length)];

    switch (randomType) {
        case "android": {
            const version = userAgentData.android.versions[Math.floor(Math.random() * userAgentData.android.versions.length)];
            const locale = userAgentData.android.locales[Math.floor(Math.random() * userAgentData.android.locales.length)];
            const device = userAgentData.android.devices[Math.floor(Math.random() * userAgentData.android.devices.length)];
            return `Mozilla/5.0 (Linux; Android ${version}; ${locale}; ${device.name} Build/${device.build}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVer} Mobile Safari/537.36`;
        };

        case "iphone": {
            const iosVer = userAgentData.iphone.iosVersions[Math.floor(Math.random() * userAgentData.iphone.iosVersions.length)];
            return `Mozilla/5.0 (iPhone; CPU iPhone OS ${iosVer} like Mac OS X) AppleWebKit/${safariVer} (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/${safariVer}`;
        };

        case "windows": {
            const winVer = userAgentData.desktop.windowsVersions[Math.floor(Math.random() * userAgentData.desktop.windowsVersions.length)];
            return `Mozilla/5.0 (Windows ${winVer}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVer} Safari/537.36`;
        };

        case "mac": {
            const macVer = userAgentData.desktop.macVersions[Math.floor(Math.random() * userAgentData.desktop.macVersions.length)];
            return `Mozilla/5.0 (Macintosh; ${macVer}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVer} Safari/537.36`;
        };
    };
};

async function getData(username) {
    try {
        const res = await fetch(`https://www.tiktok.com/@${username}`, {
            headers: {
                "User-Agent": generateRandomUserAgent()
            }
        });

        const html = await res.text();

        const match = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">(.*?)<\/script>/);

        if (!match) {
            return undefined;
        };

        const data = JSON.parse(match[1]);

        const user = data.__DEFAULT_SCOPE__["webapp.user-detail"].userInfo.user;
        const stats = data.__DEFAULT_SCOPE__["webapp.user-detail"].userInfo.stats;

        return {
            username: user.uniqueId,
            name: user.nickname,
            avatar: user.avatarLarger,
            followers: stats.followerCount
        };

    } catch (err) {
        return {
            "error": "error",
            "errors": err
        };
    };
};

const PORT = process.env.PORT;

Server.listen(PORT, () => {
    console.log(`server is url:http://localhost:${PORT}`);
});