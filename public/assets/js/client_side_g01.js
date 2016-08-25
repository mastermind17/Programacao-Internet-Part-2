"use strict";

var globalHandlers = (function() {

  const parentesisCodePattern = /\(([^)]+)\)/; //regex to match stuff inside '(..)'

  function extractPattern(str, pattern) {
    return $.trim(str.match(pattern)[0]).replace('(', '').replace(')', '');
  }

  function excludePattern(str, pattern) {
    return $.trim(str.split(pattern)[0]);
  }


  let teamsHolder = [];


  function getTeamsToBeAdded() {
    let selectedTeam = $.trim($("#team_selector option:selected").text());
    let teamsArray = $('#selected_teams').val().trim().split(",");
    // on the first run, the text is empty and adds an empty string to th array
    if (teamsArray[0] === '') {
      teamsArray.shift();
    }
    if (teamsArray.indexOf(selectedTeam) === -1) {
      teamsArray.push(selectedTeam);
    }

    return teamsArray.toString();
  }

  return {
    'getTeamsToBeAdded': getTeamsToBeAdded,
    'excludePattern': excludePattern,
    'extractPattern': extractPattern,
    'parentesisCodePattern': parentesisCodePattern,
    'teamsHolder': teamsHolder
  };
})();


$(document).ready(function() {
  //set navbar button active accordingly with the relative path
  var navbar = document.getElementById('nav_with_active_buttons');
  var navbar_children = Array.from(navbar.children);
  navbar_children.forEach((node) => {
    //Each node (li) has a child anchor
    //Get that child and look at it's href property. If its equal to the url
    //of the current document, set it active with bootstrap css class.

    var anchor = node.firstElementChild;
    var anchorUrl = parseUrl(anchor.href);
    anchorUrl = (anchorUrl.pathname.split('/')[1]); //#0 resolves to blank char
    //first element of the relative path from the document's url
    var pathnameGoodPart = parseUrl(document.URL).pathname.split('/')[1];

    if (anchorUrl === pathnameGoodPart) {
      if (!anchor.parentElement.classList.contains('active')) {
        //append. some other class might already be there. dont be rude to others!
        anchor.parentElement.className += 'active';
      }
    } else {
      if (anchor.parentElement.classList.contains('active')) {
        //remove if exists.
        anchor.parentElement.classList.remove('active');
      }
    }
  });


  //parse url
  /*
  Example:
  var parser = document.createElement('a');
  parser.href = "http://example.com:3000/pathname/?search=test#hash";

  parser.protocol; // => "http:"
  parser.hostname; // => "example.com"
  parser.port;     // => "3000"
  parser.pathname; // => "/pathname/"
  parser.search;   // => "?search=test"
  parser.hash;     // => "#hash"
  parser.host;     // => "example.com:3000"
   */
  function parseUrl(url) {
    var parser = document.createElement('a');
    parser.href = url;
    return parser;
  }


  //disable stuff
  $("#team_selector").attr('disabled', 'disabled');
  $("#selected_teams").attr('disabled', 'disabled');


  /*
   * After a league is selected, an http request his issued to get the teams
   */
  $("#league_selector").change(function(evt) {
    evt.preventDefault();
    //enable stuff again
    $("#team_selector").removeAttr('disabled');
    //get the selected value
    var selectedLeague = $.trim($("#league_selector option:selected").text());
    //get info accordingly with the selected info.
    let leagueCode = globalHandlers.extractPattern(selectedLeague, globalHandlers.parentesisCodePattern);
    $.getJSON(`/leagues/${leagueCode}/teams`,
        null,
        function(data) {
          //what to do when response is well and good
          $('#team_selector').empty();
          let defaultOption = $('<option selected disabled></option>').text("choose a team");
          $('#team_selector').append(defaultOption);
          data.forEach((eachTeam) => {
            var newOption = $('<option></option>').text(eachTeam.name);
            $('#team_selector').append(newOption);
          });
        })
      .error(function() {
        //what to do when things like 404 and so happen
        alert("error");
      });
  });
});


/*
 * Handles the click on the button for adding the desired teams.
 */
$('.btn-add').click(function() {

  if ($('#team_selector option:selected').text() === "choose a team") {
    return;
  }
  let teams = globalHandlers.getTeamsToBeAdded();

  var newTeamObj = {};
  let leagueFullDescription = $.trim($('#league_selector option:selected').text());
  newTeamObj.league = globalHandlers.excludePattern(leagueFullDescription, globalHandlers.parentesisCodePattern);
  newTeamObj.leagueCode = globalHandlers.extractPattern(leagueFullDescription, globalHandlers.parentesisCodePattern);
  newTeamObj.team = teams.split(',').pop();
  globalHandlers.teamsHolder.push(newTeamObj);


  $('#selected_teams').val(teams);
  return;
});


/**
 * Erases all the teams saved until now on the selected teams element
 */
$('.btn-remove').click(function() {
  $('#selected_teams').val("");
});


function buildCodename(name) {
  return (name !== undefined) ? name.replace(/\s/g, "") : name;
}


function getTeamToBeDeleted(target) {
  // dom element of the group name
  return $(target).parents('#group_div:first').find('#group').text();
}


$('.btn-remove-team').click(function(evt) {
  evt.preventDefault();
  let teamId = buildCodename(getTeamToBeDeleted(evt.target));

  $.ajax({
    url: '/groups/' + teamId,
    type: 'DELETE',
    success: function(result) {
      window.location = result;
    }
  });
});


/**
 * /groups/:group/edit
 *
 * Handles the click on the 'x' button, removing the team from the group
 */
$('.btn-edit-remove-team').click(function(evt) {
  evt.preventDefault();
  $(evt.target).parents('#team_div:first').remove();
});


/**
 * /groups/:group/edit
 *
 * Handles the click on team button, doing nothing
 */
$('.btn-edit-team').click(function(evt) {
  evt.preventDefault();
});


/**
 * /groups/new
 *
 * new group form submit button
 */
$('#btSubmit').click(function(evt) {
  // check if the user as filled a name for the group
  if ($('#group').val().length === 0) {
    return;
  }
  evt.preventDefault();

  let name = $.trim($('#group').val());
  let teams = globalHandlers.teamsHolder;

  $.ajax({
    type: "POST",
    url: '/groups/new',
    data: {
      'name': name,
      'teams': JSON.stringify(teams)
    },
    success: function(result) {
      //only works if status code is 200
      window.location.assign(result);
    },
    error: function() {
      globalHandlers.teamsHolder.clear();
    }
  });
});


/**
 * /groups/:group/edit
 *
 * edit group form submit button
 */
$('#bt_group_edit_submit').click(function(evt) {
  evt.preventDefault();
  handleAlreadyExistingTeams();

  let oldName = $.trim($('#old_group_name').text());
  // ids imutáveis
  let groupId = oldName.replace(/\s/g, "");
  let teams = globalHandlers.teamsHolder;

  $.ajax({
    type: "POST",
    url: '/groups/' + groupId + '/edit',
    data: {
      'name': oldName,
      'teams': JSON.stringify(teams)
    },
    success: function(result) {
      console.log("sucess")
        //only works if status code is 200
      window.location.assign(result);
    },
    error: function(data) {
      // clean array
      globalHandlers.teamsHolder.splice(0, globalHandlers.teamsHolder.length);
    }
  });
  return;

  /**
   * Teams that were already present on the group and weren't deleted by the user
   * are obtained through the dom elements hierarchy and added to teamsHolder
   */
  function handleAlreadyExistingTeams() {
    $.each($('.btn-edit-remove-team'), function() {
      let elemText = $(this).parents('#team_div').find('.btn-edit-team').text().trim();
      console.log(elemText)

      var newTeamObj = {};
      let leagueFullDescription = elemText.substring(elemText.indexOf(' - ') + 6, elemText.length);
      newTeamObj.league = globalHandlers.excludePattern(leagueFullDescription, globalHandlers.parentesisCodePattern);
      newTeamObj.leagueCode = globalHandlers.extractPattern(leagueFullDescription, globalHandlers.parentesisCodePattern);
      newTeamObj.team = elemText.substr(0, elemText.indexOf(' - '))
//      if(globalHandlers.teamsHolder.indexOf(newTeamObj) != -1)
        globalHandlers.teamsHolder.push(newTeamObj);
    })
  }
});


//show fixtures when a certain team from a group is clicked


function alreadyClicked(evt){
  return ($(evt.target).parent().attr('clicked'));
}

function createTableOfLastFixtures(data){
  let toAppend;
  if (data.last){
    toAppend = $('<span></span>');
    var tableTitleLast = $('<p></p>').text("Last Fixtures:");
    var tableLast = $('<table/>').addClass('center_content table table-striped table-bordered table-condensed');
    tableLast.append('<thead><tr><th class="text-center">Date</th><th class="text-center">Home</th><th class="text-center">Score</th><th class="text-center">Away</th></tr></thead><tbody>');
    //ciclo 'for..of' não funcionou, não percebi porquê..
    data.last.forEach((val) => {
      console.log(val)
      let newRow = $('<tr></tr>').addClass('text-center')
        .append(`<td>${val.date}</td><td>${val.home_team_name}</td><td>${val.result.goalsHomeTeam} - ${val.result.goalsAwayTeam}</td><td>${val.away_team_name}</td>`);
      tableLast.append(newRow);
    });
    toAppend.append(tableTitleLast).append(tableLast);
  }
  return toAppend;
}

function createTableOfNextFixtures(data){
  let toAppend;
  if (data.next){
    toAppend = $('<span></span>');
    var tableTitleNext = $('<p></p>').text("Next Fixtures:");
    var tableNext = $('<table/>').addClass('center_content table table-striped table-bordered table-condensed');
    tableNext.append('<thead><tr><th class="text-center">Date</th><th class="text-center">Home</th><th class="text-center">Score</th><th class="text-center">Away</th></tr></thead><tbody>');
    //ciclo 'for..of' não funcionou, não percebi porquê..
    data.next.forEach((val) => {
      console.log(val)
      let newRow = $('<tr></tr>').addClass('text-center')
        .append(`<td>${val.date}</td><td>${val.home_team_name}</td><td>${val.result.goalsHomeTeam} - ${val.result.goalsAwayTeam}</td><td>${val.away_team_name}</td>`);
      tableNext.append(newRow);
    });
    toAppend.append(tableTitleNext).append(tableNext);
  }
  return toAppend;
}


function createFixturesTable(evt, data) {
  if(alreadyClicked(evt)){
    return;
  }
  var span;
  span = createTableOfNextFixtures(data);
  if (span){
    span.append(createTableOfLastFixtures(data));
  }else{
    span = createTableOfLastFixtures(data);
  }
  return span;
}

$('.group_team').click(function(evt) {
  evt.preventDefault(); //se tirar isto, o click faz com que naveguemos para os detalhes da equipa

  //extract code from html label
  let leagueCode = globalHandlers.extractPattern($(this).text(), globalHandlers.parentesisCodePattern);
  let teamCode = buildCodename(globalHandlers.excludePattern($(this).text(), globalHandlers.parentesisCodePattern));
  //ask for fixtures for that league
  //get info from template
  let nextAmount = $('#next_amount_of_fixtures').text().split(' ')[1];
  let lastAmount = $('#last_amount_of_fixtures').text().split(' ')[1];
  //build the http request
  $.ajax({
    type: "GET",
    url: "/leagues/" + leagueCode + "/fixtures/" + teamCode,
    data: {
      'next': (nextAmount === '') ? null : nextAmount,
      'last': (lastAmount === '') ? null : lastAmount
    },
    contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
    dataType: 'json',
    success: function(data) {
      console.log(evt.target);
      console.log($(evt.target).parent());
      $(evt.target).parent().after().append($(createFixturesTable(evt, data)));
      $(evt.target).parent().attr('clicked', 'true');
    },
    error: function() {
      console.log('Error trying to get all the fixtures of a certain league');
    }
  });


});
