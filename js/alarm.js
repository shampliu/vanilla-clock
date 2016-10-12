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

// API
var Alarm = function(name, time, am_pm, ringtone) {
	var active = true; 
	var n = name;
	var rt = new Audio("ringtones/" + ringtone);
	var t = time;
	var ap = am_pm; 

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

	this.getAMPM = function() { return ap; }
	this.getRingtone = function() { return rt; }
	this.getTime = function() { return t; }
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
		var am_pm = hr >= 12 ? "PM" : "AM";
		time_info.children[0].innerHTML = am_pm;
		hr = hr % 12;
		hr = hr || 12; // handle 0AM == 12AM

		var time = pad(hr) + ":" + pad(min);

		current_time.innerHTML = time;

		time_info.children[1].innerHTML = pad(sec);

		if (alarm_ringing) return;

		for (var i = 0; i < alarms.length; i++) {
			if (alarms[i].isActive() && alarms[i].getTime() == time && alarms[i].getAMPM() == am_pm && sec == "00") {
				alarms[i].ring(); 
				return; // first alarm plays, ringtone has priority
			}
		}
	}

	this.createAlarm = function(name, time, am_pm, ringtone) {
		var li = document.createElement("li");
		var span1 = document.createElement("span");
		span1.className = 'time'
		var span2 = document.createElement("span");

		name = name == "" ? "Alarm " + alarm_count : name; // default alarm name if empty
		alarm_count++; 

		var alarm_name = document.createTextNode(name);
		var alarm_time = document.createTextNode(time + am_pm);
		var delete_button = document.createElement("button");
		var delete_button_text = document.createTextNode("X");

		var active = document.createElement("a");
		active.className = 'toggle';


		var alarm = new Alarm(name, time, am_pm, ringtone);
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

			var name = document.getElementById('alarm-name').value;
			var hr = Number(document.getElementById('alarm-hours').value);
			var min = Number(document.getElementById('alarm-minutes').value);
			var time = pad(hr) + ":" + pad(min);
			var ringtone = document.getElementById('alarm-ringtone').value;
			toggle_am_pm.innerHTML == "PM" ? that.createAlarm(name, time, "PM", ringtone) : that.createAlarm(name, time, "AM", ringtone)

			return false;
		})

		return that;
	}
}
