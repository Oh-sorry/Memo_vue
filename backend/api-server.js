const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser');
const database = require('./database');
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')

const jwtKey = "abc123456789";

const members = [ 
    {
        id: 3,
        name: "홍길동",
        loginId: "a",
        loginPw: "1"
    },
    {
        id: 4,
        name: "박보검",
        loginId: "b",
        loginPw: "2"
    }
]

// app.use(bodyParser.json());    //express를 사용하면 bodyParser 사용안해도된다.
app.use(express.json())
app.use(cookieParser());

app.get('/api/memos', async  (req, res) => {
    const result = await database.run("SELECT * FROM memos");
    res.send(result)
});

app.post("/api/memos", async (req, res)=> {
    await database.run(`INSERT INTO memos (content) VALUES (?)`, [req.body.content]);
    const result = await database.run("SELECT * FROM memos");
    res.send(result)
});

app.put("/api/memos/:id", async (req, res)=> {
    await database.run(`UPDATE memos SET content = ? WHERE id = ?`, [req.body.content, req.params.id]);
    const result = await database.run("SELECT * FROM memos");
    res.send(result)
});

//login
app.get('/api/account', (req, res) => {
    if(req.cookies && req.cookies.token) {
        jwt.verify(req.cookies.token, jwtKey, (err,decoded)=> {
            if(err) {
                return res.sendStatus(401);
            }
            res.send(decoded);
        })
    }
    else {
        res.sendStatus(401);
    }
})

app.post('/api/account', (req, res) => {
    const loginId = req.body.loginId;
    const loginPw = req.body.loginPw;
    
    const member = members.find(m=> m.loginId === loginId && m.loginPw === loginPw);

    if(member) {
        const options = {
            domain:"localhost",
            path:"/",
            httpOnly:true
        };

        const token = jwt.sign({
            id:  member.id,
            name:  member.name,
        }, jwtKey, {
            expiresIn: "15m",
            issuer : 'a1'
        });
        res.cookie("token", token, options);
        res.send(member);
    }
    else { 
        res.sendStatus(404);
    }
})

app.delete('/api/account', (req, res) => {
    if(req.cookies && req.cookies.token) {
        res.clearCookie("token");
    }

    res.sendStatus(200); 
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});