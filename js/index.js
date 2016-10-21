"use strict";

function changeTheme(css_file) {
	var old_link = document.getElementsByTagName("link").item(0); // 0 is the index of the css file

  var new_link = document.createElement("link");
  new_link.setAttribute("rel", "stylesheet");
  new_link.setAttribute("type", "text/css");
  new_link.setAttribute("href", "css/" + css_file);

  document.getElementsByTagName("head").item(0).replaceChild(new_link, old_link);
}

document.addEventListener("DOMContentLoaded", function() {
	
  var alarmClock = new AlarmClock().init();
});