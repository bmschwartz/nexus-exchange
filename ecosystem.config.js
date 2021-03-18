module.exports = {
    apps: [
        {
            name: "nexus-exchange-1",
            cmd: "npm run start",
            autorestart: true,
            env: {
                PORT: 4001,
                APP_ENV: "staging"
            }
        },
        {
            name: "nexus-exchange-2",
            cmd: "npm run start",
            autorestart: true,
            env: {
                PORT: 4002,
                APP_ENV: "staging"
            }
        },
        {
            name: "nexus-exchange-3",
            cmd: "npm run start",
            autorestart: true,
            env: {
                PORT: 4003,
                APP_ENV: "staging"
            }
        },
        {
            name: "nexus-exchange-4",
            cmd: "npm run start",
            autorestart: true,
            env: {
                PORT: 4004,
                APP_ENV: "staging"
            }
        }
    ]
}
