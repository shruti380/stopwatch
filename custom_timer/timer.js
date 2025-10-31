const customTime = {}
var paused = true
var minutes
var timerDate
var remainingTime = 0
var darkTheme = false
var totalTime = 0

// Variables for Picture-in-Picture (PiP)
let pipWindow = null;
let pipRequestInProgress = false;

const audio = new Audio();
audio.src = "../audio/sound_trim.mp3";

function $id(id) {
    return document.getElementById(id);
}

// 🎉 Confetti Animation
function startCelebration() {
    const root = document.getElementById('confetti');
    if (!root) return;
    root.innerHTML = '';
    const colors = ['#FFD166', '#06D6A0', '#EF476F', '#118AB2', '#8338EC', '#FB5607'];
    const pieceCount = 100; // Optimized count for smooth performance
    const durationMin = 2000;
    const durationMax = 4000;
    for (let i = 0; i < pieceCount; i++) {
        const s = document.createElement('span');
        s.className = 'confetti';
        const left = Math.random() * 100;
        const size = 6 + Math.random() * 8;
        const delay = Math.random() * 300;
        const dur = durationMin + Math.random() * (durationMax - durationMin);
        s.style.left = `${left}vw`;
        s.style.background = colors[i % colors.length];
        s.style.width = `${size}px`;
        s.style.height = `${size * 1.4}px`;
        s.style.animationDuration = `${dur}ms`;
        s.style.animationDelay = `${delay}ms`;
        root.appendChild(s);
        setTimeout(() => s.remove(), dur + delay + 100);
    }
}

function stopCelebration() {
    const root = document.getElementById('confetti');
    if (root) root.innerHTML = '';
    document.title = "Custom Timer";
}

function onTimerComplete() {
    paused = true;
    clearInterval(interval);
    closePipWindow(); // Close PiP window on complete
    $id('timer-control').innerHTML = '<i class="fas fa-play-circle"></i> Start';
    // Hide focus text when timer completes
    $id('focus').classList.add('hide');
    $id('stop-alarm').classList.remove('hidden');
    audio.loop = true;
    audio.currentTime = 0;
    audio.play().catch(error => {
        console.log('Error playing alarm sound:', error);
    });
    startCelebration();
}

function stopAlarm() {
    audio.pause();
    audio.currentTime = 0;
    audio.loop = false;
    $id('stop-alarm').classList.add('hidden');
    stopCelebration();
}

// Updates progress bar based on remaining time
function updateProgressBar() {
    if (totalTime <= 0) {
        $id("progress-bar").style.width = "0%";
        return;
    }
    // Calculate percentage with bounds checking to prevent overflow
    const percent = Math.max(0, Math.min(100, ((totalTime - customTime.seconds) / totalTime) * 100));
    $id("progress-bar").style.width = percent + "%";
}

// Sets up custom timer with user input validation
const setCustomTime = (hours = 0, minutes = 0, seconds = 0) => {
    hours = Number(hours);
    minutes = Number(minutes);
    seconds = Number(seconds);

    if (hours < 0 || minutes < 0 || seconds < 0) {
        alert("⛔ Please enter positive numbers only!");
        return;
    }

    if (hours === 0 && minutes === 0 && seconds === 0) {
        alert("⛔ Please enter at least one value greater than zero!");
        return;
    }

    paused = true;
    $id('hours').innerHTML = String(hours).padStart(2, '0');
    $id('minutes').innerHTML = String(minutes).padStart(2, '0');
    $id('seconds').innerHTML = String(seconds).padStart(2, '0');
    remainingTime = 0;
    $id('timer-control').innerHTML = '<i class="fas fa-play-circle"></i> Start';
    $id('focus').classList.add('hide');
    customTime.seconds = (hours * 3600) + (minutes * 60) + seconds;
    totalTime = customTime.seconds;
    updateProgressBar();

    $id('secondsInput').value = "";
    $id('minutesInput').value = "";
    $id('hoursInput').value = "";
}

// Resets timer to initial state
const reset = () => {
    stopAlarm();
    closePipWindow(); // Close PiP window on reset
    // Hide focus message
    $id('focus').classList.add('hide');
    clearInterval(interval);

    $id('hours').innerHTML = '00';
    $id('minutes').innerHTML = '00';
    $id('seconds').innerHTML = '00';

    $id('hoursInput').value = '';
    $id('minutesInput').value = '';
    $id('secondsInput').value = '';

    customTime.seconds = 0;
    totalTime = 0;

    $id("progress-bar").style.width = "0%";

    const confettiElem = $id('confetti');
    if (confettiElem) confettiElem.innerHTML = '';

    paused = true;
    $id('timer-control').innerHTML = '<i class="fas fa-play-circle"></i> Start';

    document.title = 'Custom Timer';

    $id('stop-alarm').classList.add('hidden');
}

// Timer interval reference
let interval = 0;

// Main timer control function - starts/pauses countdown
const startCustomTimerCounter = () => {
    clearInterval(interval);
    paused = !paused;
    $id('timer-control').innerHTML = paused ? '<i class="fas fa-play-circle"></i> Start' : '<i class="fas fa-pause-circle"></i> Pause';

    if (!paused) {
        $id('focus').classList.remove('hide');
    } else {
        $id('focus').classList.add('hide');
    }

    // Timer update logic executed every second
    const updateTimer = () => {
        if (!paused && customTime.seconds > 0) {
            customTime.seconds--;
            const hours = Math.floor(customTime.seconds / (60 * 60));
            const minutes = Math.floor(customTime.seconds / 60) % 60;
            const seconds = customTime.seconds % 60;
            
            // Capture padded strings
            const hoursString = String(hours).padStart(2, '0');
            const minutesString = String(minutes).padStart(2, '0');
            const secondsString = String(seconds).padStart(2, '0');

            // Update main page display
            $id('hours').innerHTML = hoursString;
            $id('minutes').innerHTML = minutesString;
            $id('seconds').innerHTML = secondsString;
            
            // --- ADDED FOR PiP ---
            // If the PiP window is open, send it the new time
            if (pipWindow) {
                pipWindow.postMessage({
                    hours: hoursString,
                    minutes: minutesString,
                    seconds: secondsString
                });
            }
            // --- END PiP ---

            updateProgressBar();
            
            // Update document title to show remaining time
            document.title = `${hoursString}:${minutesString}:${secondsString} - Custom Timer`;
            
            // Check if timer is almost complete to prepare for completion
            if (customTime.seconds <= 3) {
                $id('time').style.color = '#ff4757';
            }
        }

        if (customTime.seconds === 0) {
            document.title = "Time's Up! - Custom Timer";
            onTimerComplete();
        }
    }
    interval = setInterval(updateTimer, 1000);
}

function setLightTheme() {
    darkTheme = false;
    
    // Remove dark mode class from body
    $('body').removeClass('dark-mode');
    
    // Set checkbox state
    $('#light').prop("checked", false);
}

function setDarkTheme() {
    darkTheme = true;
    
    // Add dark mode class to body
    $('body').addClass('dark-mode');
    
    // Set checkbox state
    $('#light').prop("checked", true);
}

// System theme detection
const prefersDarkThemeMql = window.matchMedia("(prefers-color-scheme: dark)");

// Listen for system theme changes
prefersDarkThemeMql.addEventListener("change", function (mql) {
    if (localStorage.getItem("darkmode") === null && mql.matches) {
        setDarkTheme();
    } else {
        setLightTheme();
    }
})

$(document).ready(function () {
    // Set initial theme based on user preference or system setting
    if (
        localStorage.getItem("darkmode") == "true" ||
        (localStorage.getItem("darkmode") === null && prefersDarkThemeMql.matches)
    ) {
        setDarkTheme();
    }

    $('#light').on("change paste keyup", function (e) {
        if (!e.target.checked) {
            setLightTheme();
            localStorage.setItem("darkmode", "false");
        }
        else {
            setDarkTheme();
            localStorage.setItem("darkmode", "true");
        }
    });

    // Enable Enter key to start timer from input fields
    const inputs = ['hoursInput', 'minutesInput', 'secondsInput'];
    inputs.forEach(id => {
        $id(id).addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                setCustomTime(
                    $id('hoursInput').value,
                    $id('minutesInput').value,
                    $id('secondsInput').value
                );
            }
        });
    });

    // Mobile navbar auto-close functionality
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            const navbarCollapse = document.getElementById('navbarSupportedContent');
            if (navbarCollapse.classList.contains('show')) {
                navbarCollapse.classList.remove('show');
            }
        });
    });
});

// ============================================
// PICTURE-IN-PICTURE (PiP) WIDGET FUNCTIONS
// ============================================

// Tries to open the PiP widget window
async function openPipWindow() {
    // Return if a window is already open or a request is in progress
    if (pipWindow || pipRequestInProgress) {
        return;
    }
    pipRequestInProgress = true;
    try {
        // Request a new PiP window
        pipWindow = await documentPictureInPicture.requestWindow({
            width: 320,  // Set a good width
            height: 120, // Set a good height
            url: 'widget.html' // The new file we created
        });

        // Add an event listener to know when the user closes it
        pipWindow.addEventListener("pagehide", (e) => {
            pipWindow = null;
        });

    } catch (err) {
        console.error("PiP Error: ", err);
    } finally {
        pipRequestInProgress = false;
    }
}

// Closes the PiP window
function closePipWindow() {
    if (pipWindow) {
        pipWindow.close();
        pipWindow = null;
    }
}

// This function runs every time you switch tabs
function handleVisibilityChange() {
    // If the tab is hidden AND the timer is running...
    if (document.hidden && !paused) {
        openPipWindow(); // ...open the widget
    } 
    // If the tab is visible...
    else {
        closePipWindow(); // ...close the widget
    }
}

// Listen for tab switching
document.addEventListener("visibilitychange", handleVisibilityChange);


// Date display functionality
setInterval(() => {
  var d = new Date();
  var year = d.getFullYear();

  var month;
  switch (d.getMonth()) {
    case 0:
      month = "Jan";
      break;
    case 1:
      month = "Feb";
      break;
    case 2:
      month = "Mar";
      break;
    case 3:
      month = "Apr";
      break;
    case 4:
      month = "May";
      break;
    case 5:
      month = "Jun";
      break;
    case 6:
      month = "Jul";
      break;
    case 7:
      month = "Aug";
      break;
    case 8:
      month = "Sep";
      break;
    case 9:
      month = "Oct";
      break;
    case 10:
      month = "Nov";
      break;
    case 11:
      month = "Dec";
      break;
  }

  var dayn = d.getDate();
  var dateStr = dayn + " " + month + " , " + year;

  if ($id("d1")) $id("d1").innerHTML = dateStr;
}, 1000);

// --- Duplicate Function ---
// // Add event listeners for Enter key in input fields
// document.addEventListener('DOMContentLoaded', function() {
//   const inputs = ['hoursInput', 'minutesInput', 'secondsInput'];
  
//   inputs.forEach(id => {
//     $id(id).addEventListener('keypress', function(e) {
//       if (e.key === 'Enter') {
//         e.preventDefault();
//         setCustomTime(
//           $id('hoursInput').value,
//           $id('minutesInput').value,
//           $id('secondsInput').value
//         );
//       }
//     });
//   });
// });