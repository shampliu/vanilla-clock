"use strict"; 

function changeTheme(cssFile, cssLinkIndex) {
	var oldlink = document.getElementsByTagName("link").item(cssLinkIndex);

  var newlink = document.createElement("link");
  newlink.setAttribute("rel", "stylesheet");
  newlink.setAttribute("type", "text/css");
  newlink.setAttribute("href", "css/" + cssFile);

  document.getElementsByTagName("head").item(0).replaceChild(newlink, oldlink);
}

// Configurations
var snooze = 15000; 
var refresh_rate = 1000; 

// DOM Elements
var alarms_list = document.getElementById('alarms');
var current_time = document.getElementById('current-time');
var form = document.getElementById('create-alarm-form');
var modal = document.getElementById('alarm-modal');
var time_of_day = document.getElementById('alarm-am-pm');
time_of_day.addEventListener('click', function(e) {
	e.preventDefault();
	(this.innerHTML == "AM") ? this.innerHTML = "PM" : this.innerHTML = "AM";
})

// Globals
var alarmRinging = false; 

// API
var Alarm = function(name, time, ringtone) {
	var active = true; 
	var n = name;
	var t = time; 
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
		alarmRinging = false; 
	})

	this.getRingtone = function() { return rt; }
	this.getTime = function() { return t; }
	this.getName = function() { return n; }
	this.isActive = function() { return active; }
	this.toggleActive = function() { 
		active = !active; 
		if (active) {
			this["dom_ref"].children[0].style.background = "green";
		} else {
			this["dom_ref"].children[0].style.background = "grey";
		}
	}
}

Alarm.prototype.ring = function() {
	alarmRinging = true; 
	this.getRingtone().play();
	modal.style.display = "block";
}

var AlarmClock = function() {
	var alarms = []; 

	function pad(t) {
		if (typeof t == 'number') {
			return t < 10 ? "0" + t : t; 
		} else {
			return (t.length === 1) ? "0" + t : t; 

		}
	}

	function getCurrentTimeString() {
		var today = new Date(); 
		return pad(today.getHours()) + ":" + pad(today.getMinutes()) + ":" + pad(today.getSeconds()); 
	}

	function updateTime() {
		var time = getCurrentTimeString(); 
		current_time.innerHTML = time;

		if (alarmRinging) return;

		for (var i = 0; i < alarms.length; i++) {
			var t = alarms[i].getTime()

			if (alarms[i].isActive() && alarms[i].getTime() == time) {
				alarms[i].ring(); 
				return; 
			}
		}
	}

	this.createAlarm = function(name, time, ringtone) {
		var li = document.createElement("li");
		var span1 = document.createElement("span");
		var span2 = document.createElement("span");
		var alarm_name = document.createTextNode(name);
		var alarm_time = document.createTextNode(time);
		var delete_button = document.createElement("button");
		var delete_button_text = document.createTextNode("X");

		var active = document.createElement("a");
		active.className = 'toggle';


		var alarm = new Alarm(name, time, ringtone);
		alarm["dom_ref"] = li; 
		alarms.push(alarm);

		var toggleAlarm = function() {
			this.toggleActive(); 
		}

		var deleteAlarm = function() {
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
			var h = document.getElementById('alarm-hours').value;
			var m = document.getElementById('alarm-minutes').value;
			var alarm_time = pad(h) + ":" + pad(m) + ":00";

			var alarm_ringtone = document.getElementById('alarm-ringtone').value;


			that.createAlarm(alarm_name, alarm_time, alarm_ringtone);

			return false;
		})

		return that;
	}
}