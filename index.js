import http from 'node:http'
import express from 'express'
import path from 'node:path';
import { Server } from 'socket.io';
import { publisher, subscriber, redis } from './redis-connection.js';


const CHECKBOX_SIZE = 100;

const CHECKBOX_STATE_KEY = `checkbox-state:v3`;

const rateLimitingHashMap = new Map();



async function main() {
    const app = express();
    const server = http.createServer(app);

    const io = new Server();
    io.attach(server);

    await subscriber.subscribe('internal-server:checkbox:change');
    subscriber.on('message', (channel, message) => {
        if (channel === 'internal-server:checkbox:change') {
            const { index, checked } = JSON.parse(message);
            io.emit('server:checkbox:change', { index, checked })
        }
    })


    const PORT = process.env.PORT ?? 8000;

    //Socker IO Handlers
    io.on('connection', (socket) => {
        console.log(`Socket connected`, { id: socket.id })

        socket.on('client:checkbox:change', async (data) => {
            console.log(`[Socket:${socket.id}]:client:checkbox:change`, data);


            const lastOperationTime = await redis.get(`rate-limiting:${socket.id}`)

            if (lastOperationTime) {
                const timeElapsed = Date.now() - lastOperationTime;
                if (timeElapsed < 5.5 * 1000) {
                    socket.emit('server:error', { error: `Please Wait` })
                    return
                }
            }

            await redis.set(`rate-limiting:${socket.id}`, Date.now());
            const existingState = await redis.get(CHECKBOX_STATE_KEY);

            if (existingState) {
                const rawData = JSON.parse(existingState);
                rawData[data.index] = data.checked;
                redis.set(CHECKBOX_STATE_KEY, JSON.stringify(rawData))
            }
            else {
                await redis.set(CHECKBOX_STATE_KEY, JSON.stringify(new Array(CHECKBOX_SIZE).fill(false)))

            }
            // io.emit(`server:checkbox:change`, data)
            // state.checkboxes[data.index] = data.checked;
            publisher.publish('internal-server:checkbox:change', JSON.stringify(data))

        })
    });


    //Express
    app.use(express.static(path.resolve('./public')));

    app.get('/health', (req, res) => res.json({ health: true }))

    app.get('/checkboxes', async (req, res) => {
        const existingState = await redis.get(CHECKBOX_STATE_KEY);
        if (existingState) {
            const remoteData = JSON.parse(existingState);
            return res.json({ checkboxes: remoteData })
        }
        return res.json({ checkboxes: new Array(CHECKBOX_SIZE).fill(false) })
    })

    server.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`)
    })

}

main()