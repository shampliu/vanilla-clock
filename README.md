## Squarespace Alarm Clock
##### Features
* All done in vanilla JS and SCSS, on a 15" Macbook optimized for Chrome
* Responsive, but the elements differ on mobile
* Click the AM / PM box to toggle AM / PM for inputting a new alarm clock
* Newly created alarms will appear in a scrollable list at the bottom
* The alarms can be deleted by clicking the X or turned off by clicking the green box next to their name
* Can choose between a couple songs for a ringtone; the app also loops the audio so it plays continuously until explicitly stopped
* Two custom themes, day and night to toggle the colors

##### Edge Cases
* Setting two or more alarms for the same time will only play the first one that was added. No two sounds will overlap and if you dismiss the alarm, you, dismiss all the alarms that were set for the time period that it rang. 
* Empty alarm names will result in a default name being applied
* Inputting only 1 digit is okay for the hours or minutes of the alarm
* Assumes the user will not use military time

##### Next Steps
* Implement snooze feature
* Handle more edge cases for alarm time input (make sure hours / minutes are in the correct range, don't allow alpha / other types of characters)
* Fancy animations
* Implement backend to allow users to upload custom sounds
* Use cookies / localStorage to save preferences on color scheme and alarms that were created
* Add keyboard shortcuts to increment / decrement alarm times
* Separate the active alarms from the inactive ones in the list
* Cross browser compatibility 

