module.exports = {
  removeSpaces: function(name) {
    'use strict';
    if (name !== undefined){
      return name.replace(/\s/g, "");
    }
    return name;
  },
  dateHandler: function(rawdate) {
    'use strict';
    //expecting -> 2015-08-1T18:30:00Z
    if (!rawdate){
      return "";
    }
    let readableDate = "";
    //if (rawdate.length == 20){
        readableDate = rawdate.slice(0, 10);
        readableDate += ' ';
        readableDate += rawdate.slice(10, 16);
    /*}else{
      readableDate = rawdate.slice(0, 9);
      readableDate += ' ';
      readableDate += rawdate.slice(11, 16);
    }*/
    return readableDate;
  },
  validateGoals: function(goals) {
    'use strict';
    if (goals && goals >= 0) {
      return '' + goals;
    } else{
      return '0';
    }
  }
};
