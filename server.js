let express = require('express');
let path = require('path');
let Message = require('./model').Message;
let app = express();
app.use(express.static(path.resolve('./')));
app.get('/', function (req, res) {
    res.sendFile(path.resolve('chat.html'));
});
//1.创建http服务器
let server = require('http').createServer(app);
//socket.io websocket 是需要依赖http服务来实现握手的
let io = require('socket.io')(server);
let sockets = {};
io.on('connection', function (socket) {
    let username;
    let curRoom;
    //监听此客户端发过来的消息
    socket.on('message', function (msg) {
        /*console.log(msg);
         socket.send("服务器："+msg);*/
        let matchReg = /^@(\S+) (.+)/;
        let result = msg.match(matchReg);
        if (result) {
            let toUser = result[1];
            let content = result[2];
            sockets[toUser] && sockets[toUser].send({username, content});
        } else {
            if (username) {//username有值，代表已经设置过用户名了
                Message.create({username, content: msg}, function (err, doc) {
                    if (err) {
                        socket.send({username: '系统', content: '发言失败'})
                    } else {
                        if(curRoom){
                            io.in(curRoom).emit('message',doc);
                        }else{
                            io.emit('message', doc);
                        }
                    }
                });
            } else {
                username = msg;
                sockets[username] = socket;
                io.emit('message', {username: '系统', content: `欢迎${username}加入聊天室`});
            }
        }
        //io.emit('message',msg);
    });
    socket.on('getAllMessage', function () {
        Message.find({}, function (err, messages) {
            socket.emit('allMessage', messages);
            socket.send({username: '系统', content: '请输入昵称'});
        })
    });
    /*io.emit('message','发广播');
     socket.emit('message','发广播');*/
    socket.on('join', function (roomName) {
        if (curRoom) {
            socket.leave(curRoom);
        }
        socket.join(roomName);//让socket进入该房间
        curRoom = roomName;
    });
});
server.listen(8080);

/*
 * 1.实现匿名聊天
 * 2.实现具名聊天
 * 3.实现把消息进行持久化，保持到mongodb数据库里
 * 4.实现私聊
 * 5.划分房间 （房间内聊天，其余房间看不见）
 * */
