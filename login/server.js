const express = require('express');
const bcrypt = require('bcrypt');

const users = [];
const port = 3000;

const app = express();

app.use(express.json())

app.listen(port);

app.get('/users', (req, res) => {
  res.json(users)
});

app.post('/register', async (req, res) => {
  try {
    const {username, password, email} = req.body;
    if(!username || !password || !email) throw error

    if(users.find(({username}) => username))
      return res.status(400).send("Username already exists")

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = {
      id: Date.now().toString(),
      email,
      username,
      password: hashedPassword
    };

    users.push(user);
    res.sendStatus(204);
    
  } catch (error) {
    return res.sendStatus(400)
  }
})

app.post('/login', async (req, res) => {
  const user = users.find(user => user.username === req.body.username);
  if (user == null) return res.status(400).send("Username or password are invalid.");

  try {
    if(await !bcrypt.compare(req.body.password, user.password))
      return res.status(400).send("Username or password are invalid.")
    
    res.sendStatus(200);


  } catch {
    return res.sendStatus(400)
  }
})