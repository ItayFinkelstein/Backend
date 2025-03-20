import initApp from './server';
import { Express } from 'express';
import https from "https"
import fs from "fs"
import path from "path";

const port = process.env.PORT || 4000;
const domain = process.env.DOMAIN_BASE || "localhost";

const runApp = async () => {
    try {
        const app: Express = await initApp();
        if (process.env.NODE_ENV != "production") {
            app.listen(port, () => {
                console.log(`Food app listening at http://localhost:${port}`);
            });
        } else {
            const keyPath = path.resolve(__dirname, '../../client-key.pem');
            const certPath = path.resolve(__dirname, '../../client-cert.pem');
            const prop = {
                key: fs.readFileSync(keyPath),
                cert: fs.readFileSync(certPath)
            };
            https.createServer(prop, app).listen(port, () => {
                console.log(`Food app listening at https://${domain}:${port}`);
            });
        }
    } catch (error) {
        console.error("Failed to initialize the app: ", error);
    }
};

runApp();