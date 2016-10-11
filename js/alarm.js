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
	this.setInactive = function() { active = false; }
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
		var span = document.createElement("span");
		var alarm_name = document.createTextNode(name);
		var alarm_time = document.createTextNode(time);
		var button = document.createElement("button");
		var button_text = document.createTextNode("X");

		var alarm = new Alarm(name, time, ringtone);
		alarm["dom_ref"] = li; 
		alarms.push(alarm);

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

		button.onclick = deleteAlarm.bind(alarm);

		button.appendChild(button_text);
		span.appendChild(alarm_time);
		li.appendChild(span);
		li.appendChild(alarm_name);
		li.appendChild(button);

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


			var alarm_name = form.children[0].value;
			var h = document.getElementById('alarm-hours').value;
			var m = document.getElementById('alarm-minutes').value;
			var s = document.getElementById('alarm-seconds').value;
			var alarm_time = pad(h) + ":" + pad(m) + ":" + pad(s);

			var alarm_ringtone = document.getElementById('alarm-ringtone').value;


			that.createAlarm(alarm_name, alarm_time, alarm_ringtone);

			return false;
		})

		return that;
	}
}