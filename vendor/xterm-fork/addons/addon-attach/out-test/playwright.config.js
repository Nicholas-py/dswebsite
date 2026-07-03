"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    testDir: '.',
    timeout: 10000,
    projects: [
        {
            name: 'ChromeStable',
            use: {
                browserName: 'chromium',
                channel: 'chrome'
            }
        },
        {
            name: 'FirefoxStable',
            use: {
                browserName: 'firefox'
            }
        },
        {
            name: 'WebKit',
            use: {
                browserName: 'webkit'
            }
        }
    ],
    reporter: 'list',
    webServer: {
        command: 'npm run start',
        port: 3000,
        timeout: 120000,
        reuseExistingServer: !process.env.CI
    }
};
exports.default = config;
//# sourceMappingURL=playwright.config.js.map