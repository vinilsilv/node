const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session')

const users = [];
const port = 3000;

const app = express();

app.use(express.json());
app.use(session({
  secret: 'secretHash',
  cookie: {
    sameSite: 'strict',
    resave: true,
    saveUnitialized: true
  }
}));

app.listen(port);

app.get('/users', (req, res) => {
  if (!req.session.authorized) return res.sendStatus(401);
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
    
    req.session.user = user;
    req.session.authorized = true;
    res.status(200).send(req.session);


  } catch (error) {
    return res.status(400).send(error);
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.sendStatus(200);
})