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

// Utility
function pad(t) {
	if (typeof t == 'number') {
		return t < 10 ? "0" + t : t; 
	}
}

// Alarm UI
function AlarmUI(alarm, document) {
	this.alarm = alarm; 
	var li = document.createElement('li');
	var span1 = document.createElement("span");
	span1.className = 'time'
	var span2 = document.createElement("span");

	var alarm_name = document.createTextNode(this.alarm.name);
	var alarm_time = document.createTextNode(this.alarm.time + this.alarm.am_pm);
	var delete_button = document.createElement("button");
	var delete_button_text = document.createTextNode("X");

	var active = document.createElement("a");
	active.className = 'toggle';

	active.onclick = this.toggleActive.bind(this); 

	this.element = li; 

	delete_button.onclick = function() {
		this.alarm.destroy(this.alarm);
		this.element.parentNode.removeChild(this.element);
	}.bind(this);

	delete_button.appendChild(delete_button_text);

	span1.appendChild(alarm_time);
	span2.appendChild(alarm_name);
	li.appendChild(active);
	li.appendChild(span1);
	li.appendChild(span2);
	li.appendChild(delete_button);

	alarms_list.appendChild(li);
}

AlarmUI.prototype.updateDOM = function() {

}

AlarmUI.prototype.toggleActive = function() {
	alarm.toggleActive();

	if(alarm.active) {
		this.element.children[0].style.background = "#54a754";
	} else {
		this.element.children[0].style.background = "lightgrey";
	}


}

function Alarm(name, time, am_pm, ringtone, parent) {
	this.active = true; 
	this.name = name == "" ? "Alarm " + (parent.alarms.length + 1) : name; // default alarm name if empty
	this.ringtone = new Audio("ringtones/" + ringtone);
	this.time = time;
	this.am_pm = am_pm; 
	this.parent = parent; 

	if (typeof this.ringtone == 'boolean') { 
		this.ringtone.loop = true; 
	} else {
		this.ringtone.addEventListener('ended', function() {
      this.currentTime = 0;
      this.play();
    }, false);
	}

	document.getElementById('stop-alarm').onclick = function() {
		modal.style.display = "none";
		this.ringtone.pause();
		this.parent.alarm_ringing = false;
	}.bind(this); 
}

Alarm.prototype.toggleActive = function() {
	this.active = !this.active; 
}

Alarm.prototype.ring = function() {
	this.parent.alarm_ringing = true; 
	this.ringtone.play();
	document.getElementById('alarm-modal-text').innerHTML = this.name;
	modal.style.display = "block";
}

Alarm.prototype.destroy = function(alarm) {
	var that = this; 
	this.parent.alarms.forEach(function(value, i) {
		if (value == alarm) {
			that.parent.alarms.splice(i, 1);
			return;
		}
	});
}

var AlarmClock = function() {
	this.alarms = []; 
	this.alarm_ringing = false;

	this.updateTime = function() {
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

		if (this.alarm_ringing) return;

		for (var i = 0; i < this.alarms.length; i++) {
			if (this.alarms[i].active && this.alarms[i].time == time && this.alarms[i].am_pm == am_pm && sec == "00") {
				this.alarms[i].ring(); 
				return; // first alarm plays, ringtone has priority
			}
		}
	}

	this.createAlarm = function(name, time, am_pm, ringtone) {
		var alarm = new Alarm(name, time, am_pm, ringtone, this);
		var alarm_ui = new AlarmUI(alarm, document); 
		this.alarms.push(alarm);
	}

	this.init = function() {
		this.updateTime(); // called so the alarm clock doesn't wait refresh_rate until it appears in HTML
		var that = this;
		setInterval(function() {
			that.updateTime(); 
		}, refresh_rate)

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
