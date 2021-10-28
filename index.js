import express from "express";
import cors from "cors";
import data from "./data.json"
import dayjs from "dayjs";

const server = express();
server.use(cors());
server.use(express.json());


server.get('/participants', (req,res) => {
    res.send(data.participants)
})

server.post('/participants', (req,res) => {
    const user = req.body;
    const dateNow = Date.now();
    const day = dayjs()
    
    if (!user.name) return res.status(400).send()

    data.participants.push({
        name: user.name,
        lastStatus: dateNow
    })
    data.mensagem.push({
        from: user.name,
        to: "Todos",
        text: 'entra na sala...',
        type: "status",
        time: `${day.hour()}:${day.minute()}:${day.second()}`

    })
    res.status(200).send()
})

server.get('/messages', (req,res) => {
    res.send(data.mensagem)
})

server.post('/messages', (req, res) => {
    const message = req.body;
    const from = req.get('User')
    const day = dayjs()

    const users = []
    for (let i = 0; i < data.participants.length; i++) {
        users.push(data.participants[i].name)
    }

    if (!message.to || !message.text || (message.type != 'message' && message.type != "private_message") || !users.includes(from)) return res.status(400).send()

    data.mensagem.push({
        from: from,
        to: message.to,
        text: message.text,
        type: message.type,
        time: `${day.hour()}:${day.minute()}:${day.second()}`
    })

    res.status(200).send()
})

server.post('/status', (req,res) => {
    const userName = req.get('User');
    const users = []
    for (let i = 0; i < data.participants.length; i++) {
        users.push(data.participants[i].name)
    }
    if (!users.includes(userName)) return res.status(400).send()

    const index = data.participants.findIndex(e => e.name === userName)
    data.participants[index] = {name:userName, lastStatus: Date.now()}
    res.status(200).send()
})

setInterval(() => {
    for (let i = 0; i < data.participants.length; i++) {
        if (10000 < (Date.now() - data.participants[i].lastStatus )) {
            
            let day = dayjs()
            data.mensagem.push({
                from: data.participants[i].name,
                to: "Todos",
                text: "sai da sala...",
                type: "status",
                time: `${day.hour()}:${day.minute()}:${day.second()}`
            })
            data.participants.splice(i,1)
        }
    }
}, 15000)

server.listen(4000);
