#!/bin/env node
/**
 * Module dependencies.
 */
var config = require('./config');
var express = require('express');
var http = require('http');
var path = require('path');

var app = express();
// global.host = "http://localhost";
// global.host = "http://www.aliapp.com";

// all environments
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1");
app.set('port', process.env.APP_PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
// app.use(express.favicon("/favicon.png"));
app.use(express.logger('dev'));
app.use(express.bodyParser({
	uploadDir: config.uploadPath
}));
app.use(express.methodOverride());
app.use(express.cookieParser('osnode-site'));
app.use(express.session());
// 管理员中间件
app.use("/admin", require("./lib/mware-admin.js")());

app.use(app.router);
app.use("/public", express.static(path.join(__dirname, 'public'), {
	maxAge: 0
}));
app.use("/upload", express.static(path.join(__dirname, 'upload'), {
	maxAge: 10240000000
}));

// development only
if('development' == app.get('env')) {
	app.use(express.errorHandler());
}

/* 登录页面 */
var index = require('./routes/index.js');
app.get('/login.html', index.login);
app.post('/login.html', index.login);
app.get('/logout.html', index.logout);

/* 前台页面 */
var front = require('./routes/front');
app.get('/about.html', front.about);
app.get('/album.html', front.album);

app.get('/', front.index);
app.get('/index.html', front.index);
app.get('/index-:catg-:page.html', front.index);
app.get('/index-:catg.html', front.index);

app.get('/topic-:catg-:id.html', front.topic);

app.post("/topic-reply", front.reply)

/* 用户页面 */
var user = require('./routes/user');
app.get('/admin/user-manage.html', user.manage);

/* 文件配置 */
var file = require('./routes/file');
app.get('/file/select', file.select);
app.post('/file/upload', file.upload);

/* 后台管理 */
var admin = require('./routes/admin');
app.get('/admin', admin.index);
app.get('/admin/index.html', admin.index);
app.get('/admin/topic-create.html', admin.create);
app.post('/admin/topic-store.html', admin.store);

app.get('/admin/topic-view-:id.html', admin.view);
app.get('/admin/topic-update-:id.html', admin.update);
app.get('/admin/topic-manage.html', admin.manage);

var album = require('./routes/album');
app.get('/admin/album-create.html', album.create);
app.post('/admin/album-create.html', album.create);

app.get('/admin/album-update-:id.html', album.update);
app.post('/admin/album-update-:id.html', album.update);

app.post('/admin/image-create-:id.html', album.addImg);

// 创建服务端
http.createServer(app).listen(app.get('port'), app.get('ip'), function() {	
	console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++');
	var env = process.env;
	for(key in env) {
		if(!(typeof (env[key]) == "function")) {
			console.log(key + '\t\t= ' + env[key]);
		}
	}
	
	console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++');
	for(key in config) {
		if(!(typeof (config[key]) == "function")) {
			console.log(key + '\t\t= ' + config[key]);
		}
	}
	
	console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++');
	console.log('启动服务器完成，IP: '+ app.get('ip') +', Web端口: ' + app.get('port'));
	console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++');
});
