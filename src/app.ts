import initApp from './server';
import { Express } from 'express';
import https from "https"
import fs from "fs"

const port = process.env.PORT || 4000;

const runApp = async () => {
    try {
        const app: Express = await initApp();
        if (process.env.NODE_ENV != "production") {
            app.listen(port, () => {
                console.log(`Example app listening at http://localhost:${port}`);
            });
        } else {
            const prop = {
                key: fs.readFileSync("/home/st111/Backend/client-key.pem"),
                cert: fs.readFileSync("/home/st111/Backend/client-cert.pem")
            }
            console.log(port);
            https.createServer(prop, app).listen(port)
        }
    } catch (error) {
        console.error("Failed to initialize the app: ", error);
    }
};

runApp();