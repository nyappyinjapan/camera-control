/**
 * Module dependencies.
 */

var client = require('socket.io-client');

var socket1 = client.connect('http://camera-control.cloudapp.net:8080');

var express = require('express')
    , routes = require('./routes')
    , path = require('path')
    , serialport = require('serialport');

var app = express()
    , http = require('http')
    , server = http.createServer(app)
    , io = require('socket.io').listen(server);

// Serial Port
//var portName = '/dev/tty.usbmodem1411'; // Mac環境
var portName = '/dev/ttyACM0'

var sp = new serialport.SerialPort(portName, {
    baudRate: 9600,
    dataBits: 8,
    parity: 'none',
//    stopBits: 1,
//    flowControl: false,
//    parser: serialport.parsers.readline("\n")
});


// クライアントの接続を待つ(IPアドレスとポート番号を結びつけます)
server.listen(app.get('port'));

socket1.on('publish', function (data) { 
    console.log(data.value); 
    sp.write(data.value+";",function(err, bytesWritten) {
        console.log('bytes written: ', bytesWritten);
    });
}); 
// クライアントが接続してきたときの処理
io.sockets.on('connection', function(socket) {
    console.log("connection");

    // メッセージを受けたときの処理
    socket.on('message', function(data) {
        console.log(data.value.led);
        // つながっているクライアント全員に送信
//        socket.broadcast.json.emit('message', { value: data.value });

        console.log('Client sent us: ' + data.value.led);
        sp.write("175,150;", function(err, bytesWritten) {
            console.log('bytes written: ', bytesWritten);
        });
    });

    // クライアントが切断したときの処理
    socket.on('disconnect', function(){
        console.log("disconnect");
    });

    // data for Serial port
    socket.on('sendSerial', function(data) {
        var receive = JSON.stringify(data);
        console.log('Client sent us: ' + receive);
//        sp.write(receive, function(err, bytesWritten) {
//            console.log('bytes written: ', bytesWritten);
//        });
    });
});

sp.on('close', function(err) {
    console.log('port closed');
});

sp.on('open', function(err) {
    console.log('port opened');
});
