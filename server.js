const express = require('express')
const db = require('./db/db')
const app = express()
const path = require('path')
const http = require('http').Server(app)
var cookieParser = require('cookie-parser');
var session = require('express-session')
var io = require('socket.io')(http)

var loginRouter = require('./routes/login');
var registerRouter = require('./routes/register');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');//设置模板引擎
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(session({
	secret: 'zymmcode',
	resave: false,
	saveUninitialized: true,
	cookie: {
		maxAge: 1000 * 60 * 3
	}
}))

var counts = 0
app.use(function(req, res, next){
	if(req.session.userInfo && req.session.userInfo.username !== "") {
		app.locals['userInfo'] = req.session.userInfo
		next()
	} else {
		next()
	}
	
})
console.log(__dirname)
app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html')
})
app.get('/login', function(req, res){
	res.sendFile(__dirname + '/views/login.html')
})
app.get('/register', function(req, res){
	res.sendFile(__dirname + '/views/register.html')
})
app.use('/login', loginRouter);
app.use('/register', registerRouter);
io.on('connection', function(socket){
	counts++ ;
	socket.emit('users',counts)
	socket.broadcast.emit('users',counts)
	
	socket.on('join', function(name){		
		socket.emit('join', {name:name+' 加入群聊'})
		socket.broadcast.emit('join', {name:name+' 加入群聊'})
	})
	socket.on('message', function(data){
		socket.emit('message', {
			msg:data.text,
			sign:"me"
		})
		socket.broadcast.emit('message', {
			msg:data.text,
			sign:"other"
		})
	})
	socket.on('disconnect', function(){
		counts--
		socket.broadcast.emit('user', counts)
	})
})

http.listen(3000, function(){
	console.log('listen: http://127.0.0.1:3000')
})