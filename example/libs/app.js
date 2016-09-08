#!/usr/bin/env node
'use strict';

var STATIC_OPTIONS = { maxAge: 3600000 };

var express = require('express'),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override');

var libs = process.cwd() + '/libs/',
    config = require('./config'),
    log = require('./log')(module),
    date = require('./date');

var test = require('./routes/test'),
    upload = require('./routes/upload'),
    imagedatas = require('./routes/imagedatas'),
    voicedatas = require('./routes/voicedatas'),
    nouns = require('./routes/nouns'),
    photos = require('./routes/photos'),
    torrents = require('./routes/torrents'),
    uploads = require('./routes/uploads'),
    voice = require('./routes/voice');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride());

app.use('/test', test);
app.use('/api/upload', upload);
app.use('/imagedatas', imagedatas);
app.use('/voicedatas', voicedatas);

app.use('/nouns', nouns);
app.use('/photos', photos);
app.use('/torrents', torrents);
app.use('/upload', uploads);
app.use('/voice', voice);

app.use(express.static(path.join(__dirname, '../dist'), STATIC_OPTIONS));
app.use(express.static(path.join(__dirname, '../.tmp'), STATIC_OPTIONS));
app.use(express.static(path.join(__dirname, '../app'), STATIC_OPTIONS));
app.use('/', express.static(path.join(__dirname, '../view'), STATIC_OPTIONS));

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'OPTIONS, POST, GET, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// catch 404 and forward to error handler
app.use(function(req, res, next){
    res.status(404);
    log.debug(date + '%s %d %s', req.method, res.statusCode, req.url);
    res.json({
        error: 'Not found'
    });
    return;
});

// error handlers
app.use(function(err, req, res, next){
    res.status(err.status || 500);
    log.error(date + '%s %d %s', req.method, res.statusCode, err.message);
    res.json({
        error: err.message
    });
    return;
});



module.exports = app;
