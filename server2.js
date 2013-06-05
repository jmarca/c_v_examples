var http = require('http');
var querystring = require('querystring');
var env = process.env;
var cas_host = 'auth.ctmlabs.net'
var casservice = 'https://'+cas_host+'/'
var casurl = casservice + 'cas/login'

var testhost = env.SERVER_HOST  // required
var testport = env.SERVER_PORT || 8080

var express = require('express')
var RedisStore = require('connect-redis')(express);

var cas_validate = require('cas_validate')

var app,server;

function create_server(done){
    var app = express()
              .use(express.favicon())
              .use(express.logger({buffer:5000}))
              .use(express.cookieParser('barley Waterloo Napoleon'))
              .use(express.session({ store: new RedisStore }))
              .use('/',cas_validate.ssoff())
              .use('/',cas_validate.ticket({'cas_host':cas_host}))

    
                                           //,'service':'http://'+testhost+':'+testport}))
              .use('/',cas_validate.check_or_redirect({'cas_host':cas_host
                                                  ,'service':'http://'+testhost+':'+testport}))

              .use('/',function(req, res, next){
                  res.end('hello world')
                  return null
              });
    server =app.listen(testport,testhost,done)
}

create_server( function(e){
    if(e){
        // problems
        console.log('cannot start server')
        throw new Error(e)
    }
    console.log("Express server listening to "+ testhost +" on port " + testport);
    console.log('Current gid: ' + process.getgid());
    try {
        process.setgid(65533);
        console.log('New gid: ' + process.getgid());
    }
    catch (err) {
        console.log('Failed to set gid: ' + err);
        if(process.getgid() === 0) throw(err);
    }
    console.log('Current uid: ' + process.getuid());
    try {
        process.setuid(65534);
        console.log('New uid: ' + process.getuid());
    }
    catch (err) {
        console.log('Failed to set uid: ' + err);
        if(process.getuid() === 0) throw(err);
    }
})
