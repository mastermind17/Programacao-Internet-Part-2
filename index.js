'use strict';

//node.js modules
const path = require('path');

//express stuff related
const express = require('express');
const app = exports.app = express();
const bodyParser = require('body-parser');

const handlebarsHelperMethods = require('./utils/helpers');
const handlebars = require('express-handlebars').create({
    defaultLayout: 'main',
    helpers: handlebarsHelperMethods
});

//routing
const leaguesRouter = require('./routes/leagues');
const groupsRouter = require('./routes/groups');


//if its not defined, we take 3000
const port = process.env.PORT || 3000;

app.set('port', port);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(__dirname + '/public'));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));


app.use(function (req, res, next) {
    console.log('%s %s — %s', (new Date()).toString(), req.method, req.url);
    return next();
});

app.get('/', function (req, res) {
    let context = {
        title: 'PI - ISEL - 15/16',
        description: 'Projeto nº 2 de PI realizado pelo grupo 1',
        author: 'Pedro Gabriel (38209) e Henrique Calhó (38245)'
    };

    res.render('index_layout.handlebars', context);
});

app.use('/leagues', leaguesRouter);
app.use('/groups', groupsRouter);


app.use((err, req, resp, next) => {
    //TODO change to a view that display the message
	/*resp.statusCode = 500;
	resp.setHeader('Content-type', 'text/plain');
	resp.end('Server Error  ------   ' + err.message);*/
  next();
});

app.use((req, resp) => {
    let ctx = {
        title: '404 - Page Not Found',
        url: req.path,
        use404Styles: true
    };
    resp.status(404).render('404.handlebars', ctx);
});

app.listen(port, (err) => {
    if (err){
        throw err;
    }
    console.log("Listening at port " + port);
});
