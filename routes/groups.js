'use strict';


const express = require('express');
const groupMapper = require('./../group_mapper');
const utils = require('./../utils/utils');

let router = express.Router();
var bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({
  extended: false
}));
router.use(bodyParser.json());

//request module
const requestResource = require('../utils/request').requestEndpoint;

/**
 * When requesting all seasons/leagues, use this url.
 */
const mainApiEndpoint = require('../utils/utils').mainUrlEndpoint;

/*
 * Contains the caption of all the leagues available
 */
let leaguesCache = [];


function Group(name, teams) {
  this._id = utils.buildCodename(name);
  this.name = name;
  this.teams = teams;
}


/**
 * The handler function for the route '/groups'.
 * Displays all the groups saved.
 */
function rootHandler(req, res, next) {
  groupMapper.getAll((err, groups) => {
    if (err) {
      return next(err);
    }
    res.render('groups_layouts/groups_list_layout', {
      groups: groups
    });
  });
}
router.get('/', rootHandler);


/**
 * Handler function for the route '/groups/new'.
 * Displays a new group form.
 */
function newGroupHandler(req, resp, next) {
  if (leaguesCache.length === 0) {
    requestResource(mainApiEndpoint, function(err, allLeagues) {
      if (err) {
        return next(err);
      }

      allLeagues = allLeagues.sort(utils.predicateByCaption);
      for (let league of allLeagues) {
        leaguesCache.push({
          caption: league.caption,
          leagueCode: league.league
        });
      }
      resp.render('groups_layouts/group_form', {
        'leagueCaption': leaguesCache
      });
    });
  }
  else {
    resp.render('groups_layouts/group_form', {
      'leagueCaption': leaguesCache
    });
  }
}
router.get('/new', newGroupHandler);


router.use(function(req, res, next) {
  if (req.body.teams) {
    req.body.teams = JSON.parse(req.body.teams);
  }
  next();
});


/**
 * The handler function for the route '/groups/new'.
 * Handles the form submit.
 */
router.post('/new', (req, resp, next) => {
  let newG = new Group(req.body.name, req.body.teams);
  groupMapper.insert(newG, (err, id) => {
    if (err) {
      return next(err);
    }
    console.log(`Inserted a new document with the id ${id}`);
    resp.status(200).end("/groups/");
  });
});

router.param('group_name', function(req, res, next, param) {
  req.groupName = param;
  next();
});


/**
 * Delete a group from the database
 */
router.delete('/:group_name', (req, resp, next) => {
  let teamId = utils.buildCodename(req.groupName);
  groupMapper.delete(teamId, (err) => {
    if (err) {
      next(err);
    }
    else {
      resp.status(200).end("/groups/");
    }
  });
});


/**
 * Middleware to handle que query parameters that specify what fixtures
 * to show while presenting the details of a certain team.
 */
router.use(function(req, res, next) {
  if (req.query !== '') {
    //expect parameters 'next' and 'last'
    if (req.query.next) {
      req.nextFixtures = req.query.next;
    }
    if (req.query.last) {
      req.lastFixtures = req.query.last;
    }
  }
  next();
});


/**
 * The handler function for the route '/groups/:group_name'
 * Displays a group details
 */
function groupHandler(req, res, next) {
  groupMapper.get(req.groupName, (err, group) => {
    if (err) {
      return next(err);
    }
    res.render('groups_layouts/group_detail', {
      groupName: group.name,
      teams: group.teams,
      nextFixturesAmount: req.nextFixtures,
      lastFixturesAmount: req.lastFixtures
    });
  });
}
router.get('/:group_name', groupHandler);


/**
 * The handler function for the route '/groups/:group_name/edit'.
 * Displays an edit page for the desired group.
 */
function editGroupHandler(req, res, next) {
  groupMapper.get(req.groupName, (err, group) => {
    if (err) {
      return next(err);
    }

    if (leaguesCache.length === 0) {
      requestResource(mainApiEndpoint, function(err, allLeagues) {
        if (err) {
          return next(err);
        }

        allLeagues = allLeagues.sort(utils.predicateByCaption);
        for (let league of allLeagues) {
          leaguesCache.push({
            caption: league.caption,
            leagueCode: league.league
          });
        }
        res.render('groups_layouts/group_edit', {
          'leagueCaption': leaguesCache,
          groupName: group.name,
          teams: group.teams
        });
      });
    }
    else {
      res.render('groups_layouts/group_edit', {
        'leagueCaption': leaguesCache,
        groupName: group.name,
        teams: group.teams
      });
    }
  });
}
router.get('/:group_name/edit', editGroupHandler);


/**
 * The handler function for the route '/groups/:group_name/edit'.
 * Handles the form submit for the edited group
 */
function editGroupPostHandler(req, res, next) {
  let newG = new Group(req.body.name, req.body.teams);
  groupMapper.update(newG, (err, id) => {
    if (err) {
      return next(err);
    }
    console.log(`Inserted a new document with the id ${id}`);
    res.status(200).end("/groups/");
  });
}
router.post('/:group_name/edit', editGroupPostHandler);


/**
 * Handles the resources not found related to this route.
 */
router.use((req, resp) => {
  let ctx = {
    title: 'Booooom',
    url: req.path,
    use404Styles: true
  };
  resp.status(404).render('groups_layouts.handlebars', ctx);
});


/**
 * What to export.
 */
module.exports = router;
