"use strict"; 

// Configurations
var refresh_rate = 1000; 

// DOM Elements
var alarms_list = document.getElementById('alarms');
var current_time = document.getElementById('current-time');
var form = document.getElementById('create-alarm-form');
var modal = document.getElementById('alarm-modal');
var time_info = document.getElementById('current-time-info');
var toggle_am_pm = document.getElementById('alarm-am-pm');
toggle_am_pm.addEventListener('click', function(e) {
	e.preventDefault();
	(this.innerHTML == "AM") ? this.innerHTML = "PM" : this.innerHTML = "AM";
})

// Globals
var alarm_ringing = false; 
var alarm_count = 1; 

function changeTheme(css_file) {
	var old_link = document.getElementsByTagName("link").item(0); // 0 is the index of the css file

  var new_link = document.createElement("link");
  new_link.setAttribute("rel", "stylesheet");
  new_link.setAttribute("type", "text/css");
  new_link.setAttribute("href", "css/" + css_file);

  document.getElementsByTagName("head").item(0).replaceChild(new_link, old_link);
}

function pad(t) {
	if (typeof t == 'number') {
		return t < 10 ? "0" + t : t; 
	}
}

function formatTime(hr, min, show_am_pm) {
	if (show_am_pm) {
		return hr > 12 ? pad(hr - 12) + ":" + pad(min) + "PM" : pad(hr) + ":" + pad(min) + "AM";
	}
	return hr > 12 ? pad(hr - 12) + ":" + pad(min) : pad(hr) + ":" + pad(min);
}

// API
var Alarm = function(name, hr, min, ringtone) {
	var active = true; 
	var n = name;
	var time = pad(hr) + pad(min) + "00";
	var rt = new Audio("ringtones/" + ringtone);

	if (typeof rt == 'boolean') { 
		rt.loop = true; 
	} else {
		rt.addEventListener('ended', function() {
      this.currentTime = 0;
      this.play();
    }, false);
	}

	document.getElementById('stop-alarm').addEventListener('click', function() {
		modal.style.display = "none";
		rt.pause(); 
		alarm_ringing = false; 
	})

	this.getRingtone = function() { return rt; }
	this.getTime = function() { return time; }
	this.getName = function() { return n; }
	this.isActive = function() { return active; }
	this.toggleActive = function() { 
		active = !active; 
		if (active) {
			this["dom_ref"].children[0].style.background = "#54a754";
		} else {
			this["dom_ref"].children[0].style.background = "lightgrey";
		}
	}
}

Alarm.prototype.ring = function() {
	alarm_ringing = true; 
	this.getRingtone().play();
	document.getElementById('alarm-modal-text').innerHTML = this.getName();
	modal.style.display = "block";
}

var AlarmClock = function() {
	var alarms = []; 

	function updateTime() {
		var today = new Date(); 
		var hr = today.getHours();
		var min = today.getMinutes();
		var sec = today.getSeconds();

		var time = pad(hr) + pad(min) + pad(sec);

		hr > 12 ? time_info.children[0].innerHTML = "PM" : time_info.children[0].innerHTML = "AM";
		current_time.innerHTML = formatTime(hr, min, false);

		time_info.children[1].innerHTML = pad(today.getSeconds());

		if (alarm_ringing) return;

		for (var i = 0; i < alarms.length; i++) {
			if (alarms[i].isActive() && alarms[i].getTime() == time) {
				alarms[i].ring(); 
				return; 
			}
		}
	}

	this.createAlarm = function(name, hr, min, ringtone) {
		var li = document.createElement("li");
		var span1 = document.createElement("span");
		span1.className = 'time'
		var span2 = document.createElement("span");

		alarm_count++; 
		name = name == "" ? "Alarm " + alarm_count : name; // default alarm name if empty

		var alarm_name = document.createTextNode(name);
		var alarm_time = document.createTextNode(formatTime(hr, min, true));
		var delete_button = document.createElement("button");
		var delete_button_text = document.createTextNode("X");

		var active = document.createElement("a");
		active.className = 'toggle';


		var alarm = new Alarm(name, hr, min, ringtone);
		alarm["dom_ref"] = li; 
		alarms.push(alarm);

		var toggleAlarm = function() {
			this.toggleActive(); 
		}

		var deleteAlarm = function() {
			alarm_count--; 
			var that = this; 
			var child = this["dom_ref"];
			child.parentNode.removeChild(child);

			alarms.forEach(function(value, i) {
				if (value == that) {
					alarms.splice(i, 1);
					return;
				}
			})
		}

		active.onclick = toggleAlarm.bind(alarm);

		delete_button.onclick = deleteAlarm.bind(alarm);
		delete_button.appendChild(delete_button_text);

		span1.appendChild(alarm_time);
		span2.appendChild(alarm_name);
		li.appendChild(active);
		li.appendChild(span1);
		li.appendChild(span2);
		li.appendChild(delete_button);

		alarms_list.appendChild(li);
	}

	this.init = function() {
		updateTime(); // called so the alarm clock doesn't wait refresh_rate until it appears in HTML
		setInterval(function() {
			updateTime(); 
		}, refresh_rate)

		var that = this;

		form.addEventListener('submit', function(e) {
			e.preventDefault();

			var alarm_name = document.getElementById('alarm-name').value;
			var h = Number(document.getElementById('alarm-hours').value);
			var m = Number(document.getElementById('alarm-minutes').value);
			if (toggle_am_pm.innerHTML == "PM") { h += 12; }

			var alarm_ringtone = document.getElementById('alarm-ringtone').value;


			that.createAlarm(alarm_name, h, m, alarm_ringtone);

			return false;
		})

		return that;
	}
}