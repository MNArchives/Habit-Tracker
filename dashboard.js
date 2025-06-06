// Remove help button from FullCalendar when it appears
function removeHelpButton() {
    // Look for any elements with buttons or links in bottom right
    const possibleButtons = document.querySelectorAll('a[role="button"], button, div.fc button, div.fc a, div[style*="position: fixed"], div[style*="bottom: 0"], div[style*="right: 0"]');
    
    possibleButtons.forEach(el => {
        // Check if it's in the bottom right area
        const rect = el.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // If it's in the bottom right quarter of the screen
        if (rect.bottom > viewportHeight * 0.75 && rect.right > viewportWidth * 0.75) {
            // Hide it
            if (el.classList.contains('fc-button') || 
                el.parentElement?.classList.contains('fc-button-group') ||
                el.getAttribute('aria-label') === 'About the calendar' ||
                el.getAttribute('title') === 'About the calendar') {
                el.style.display = 'none';
                el.style.visibility = 'hidden';
                el.style.opacity = '0';
                el.style.pointerEvents = 'none';
            }
        }
    });
    
    // Set a timeout to run again after a delay in case calendar is still loading
    setTimeout(removeHelpButton, 500);
}

// Helper function to get habit count for a specific day
function getHabitCountForDay(date) {
    // In a real app, this would query your backend
    // For demo, we'll return random data
    const day = date.getDate();
    if (day % 7 === 0) return 0; // No habits on every 7th day
    return Math.floor(Math.random() * 4) + 1; // 1-4 habits on other days
}

// Get habits for a specific day
function getHabitsForDay(date) {
    // In a real app, this would query your backend
    // For demo, we'll return random data
    const habits = [
        { name: 'Morning Meditation', status: 'completed', notes: 'Felt peaceful today' },
        { name: 'Exercise', status: 'completed', notes: '30 minutes of cardio' },
        { name: 'Read Book', status: 'completed', notes: 'Read for 20 minutes' },
        { name: 'Drink Water', status: 'missed', notes: 'Forgot water bottle' },
        { name: 'Journal Writing', status: 'pending', notes: '' },
        { name: 'Learn Something New', status: 'completed', notes: 'Learned about React hooks' }
    ];
    
    // Get a random subset of habits
    const count = getHabitCountForDay(date);
    const shuffled = [...habits].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Format date as a readable string
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', { 
        month: 'long', day: 'numeric', year: 'numeric' 
    }).format(date);
}

// Function to show popup with habits completed on a specific day
function showDayDetails(date) {
    const habits = getHabitsForDay(date);
    const popup = document.getElementById('habit-popup');
    const overlay = document.getElementById('habit-popup-overlay');
    const list = document.getElementById('habit-popup-list');
    const dateElement = document.getElementById('habit-popup-date');
    
    // Format and set the date
    dateElement.textContent = formatDate(date);
    
    // Clear existing list items
    list.innerHTML = '';
    
    // If no habits, show a message
    if (habits.length === 0) {
        const noHabitsItem = document.createElement('li');
        noHabitsItem.className = 'habit-popup-item';
        noHabitsItem.innerHTML = '<div class="habit-popup-item-content"><p>No habits tracked for this day.</p></div>';
        list.appendChild(noHabitsItem);
    } else {
        // Add each habit to the list
        habits.forEach(habit => {
            const item = document.createElement('li');
            item.className = 'habit-popup-item';
            
            // Determine the status class
            let statusClass = 'bg-secondary';
            if (habit.status === 'completed') statusClass = 'bg-success';
            if (habit.status === 'missed') statusClass = 'bg-danger';
            if (habit.status === 'pending') statusClass = 'bg-warning';
            
            item.innerHTML = `
                <div class="habit-popup-item-header">
                    <h6 class="habit-popup-item-title">${habit.name}</h6>
                    <span class="badge ${statusClass}">${habit.status.charAt(0).toUpperCase() + habit.status.slice(1)}</span>
                </div>
                ${habit.notes ? `<p class="habit-popup-item-notes">${habit.notes}</p>` : ''}
            `;
            
            list.appendChild(item);
        });
    }
    
    // Show the popup and overlay
    overlay.classList.add('show');
    popup.classList.add('show');
}

// Initialize calendar
let currentMonth = new Date();

// Update time every second
function updateTime() {
    const timeElement = document.getElementById('time');
    if (!timeElement) return;
    
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    timeElement.textContent = `${hours}:${minutes}:${seconds}`;
    
    // Update date as well
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.textContent = formatDate(now);
    }
}

// Update calendar display
function updateCalendar() {
    const daysContainer = document.querySelector('.calendar-days');
    const monthNameElement = document.getElementById('month-name');
    const yearElement = document.getElementById('year');
    
    if (!daysContainer || !monthNameElement || !yearElement) return;
    
    // Clear existing days
    daysContainer.innerHTML = '';
    
    // Update month and year display
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    monthNameElement.textContent = months[currentMonth.getMonth()];
    yearElement.textContent = currentMonth.getFullYear();
    
    // Get the first day of the month
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    // Calculate the starting day (0 = Sunday, 1 = Monday, etc.)
    const startingDay = firstDay.getDay();
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        daysContainer.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const today = new Date();
        
        // Check if this day is today
        if (date.getDate() === today.getDate() && 
            date.getMonth() === today.getMonth() && 
            date.getFullYear() === today.getFullYear()) {
            dayElement.classList.add('today');
        }
        
        // Add habit count indicator if there are habits for this day
        const habitCount = getHabitCountForDay(date);
        let habitClass = '';
        if (habitCount > 0) {
            habitClass = ' has-habits';
        }
        
        dayElement.innerHTML = `
            <span class="calendar-day-number${habitClass}">${day}</span>
            ${habitCount > 0 ? `<span class="habit-count">${habitCount}</span>` : ''}
        `;
        
        // Add click event to show habits for this day
        dayElement.addEventListener('click', () => {
            showDayDetails(date);
        });
        
        daysContainer.appendChild(dayElement);
    }
}

// Load user profile data
function loadUserProfile() {
    // In a real app, this would fetch from your backend API
    // For demonstration, we'll use static data
    
    // Set user name in welcome message
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
        userNameElement.textContent = 'Mufaro';
    }
    
    // Set profile details
    const profileNameElement = document.getElementById('profile-name');
    const profileAvatarElement = document.getElementById('profile-avatar');
    const memberSinceElement = document.getElementById('member-since');
    
    if (profileNameElement) {
        profileNameElement.textContent = 'Mufaro Nyabeze';
    }
    
    if (profileAvatarElement) {
        profileAvatarElement.src = 'https://ui-avatars.com/api/?name=Mufaro+Nyabeze&background=10b981&color=fff&size=128';
    }
    
    if (memberSinceElement) {
        memberSinceElement.textContent = 'Member since May 25, 2025';
    }
}

// Load and display user's selected habits
function loadUserHabits(selectedHabits) {
    const habitsGrid = document.getElementById('user-habits-grid');
    if (!habitsGrid || !selectedHabits || !selectedHabits.length) return;
    
    // Clear existing content
    habitsGrid.innerHTML = '';
    
    // Map of habit IDs to their display properties
    const habitMap = {
        'exercise': {
            name: 'Daily Exercise',
            icon: 'fas fa-dumbbell',
            target: '30 minutes',
            progress: Math.floor(Math.random() * 101) // Random progress for demo
        },
        'meditation': {
            name: 'Meditation',
            icon: 'fas fa-spa',
            target: '15 minutes',
            progress: Math.floor(Math.random() * 101)
        },
        'reading': {
            name: 'Reading',
            icon: 'fas fa-book',
            target: '20 pages',
            progress: Math.floor(Math.random() * 101)
        },
        'water': {
            name: 'Drink Water',
            icon: 'fas fa-tint',
            target: '8 glasses',
            progress: Math.floor(Math.random() * 101)
        },
        'sleep': {
            name: 'Better Sleep',
            icon: 'fas fa-moon',
            target: '8 hours',
            progress: Math.floor(Math.random() * 101)
        },
        'journaling': {
            name: 'Journaling',
            icon: 'fas fa-pen-fancy',
            target: '15 minutes',
            progress: Math.floor(Math.random() * 101)
        },
        'nutrition': {
            name: 'Healthy Eating',
            icon: 'fas fa-apple-alt',
            target: '3 healthy meals',
            progress: Math.floor(Math.random() * 101)
        },
        'gratitude': {
            name: 'Gratitude Practice',
            icon: 'fas fa-heart',
            target: '3 items',
            progress: Math.floor(Math.random() * 101)
        }
    };
    
    // Create habit cards for each selected habit
    selectedHabits.forEach(habitId => {
        const habitInfo = habitMap[habitId];
        if (!habitInfo) return;
        
        // Determine status based on progress
        let status = 'Pending';
        let statusClass = 'bg-warning';
        
        if (habitInfo.progress === 0) {
            status = 'Not Started';
            statusClass = 'bg-secondary';
        } else if (habitInfo.progress === 100) {
            status = 'Completed';
            statusClass = 'bg-success';
        } else if (habitInfo.progress > 0) {
            status = 'In Progress';
            statusClass = 'bg-primary';
        }
        
        // Create habit card
        const habitCard = document.createElement('div');
        habitCard.className = 'habit-card bg-dark text-white mb-3';
        habitCard.innerHTML = `
            <div class="habit-header d-flex justify-content-between align-items-center mb-2">
                <h6 class="mb-0"><i class="${habitInfo.icon} me-2"></i>${habitInfo.name}</h6>
                ${status === 'Pending' ?
                    `<button type="button" class="badge ${statusClass} pending-habit-btn" data-habit-id="${habitId}" data-habit-name="${habitInfo.name.replace(/'/g, "\\'")}" onclick="handlePendingClick('${habitId}', '${habitInfo.name.replace(/'/g, "\\'")}', this)">${status}</button>` :
                    `<span class="badge ${statusClass}">${status}</span>`
                }
            </div>
            <div class="habit-progress">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="text-secondary">Today's Progress</span>
                    <span class="${habitInfo.progress === 100 ? 'text-success' : 'text-primary'}">${habitInfo.progress}%</span>
                </div>
                <div class="progress bg-secondary">
                    <div class="progress-bar ${habitInfo.progress === 100 ? 'bg-success' : 'bg-primary'}" role="progressbar" style="width: ${habitInfo.progress}%"></div>
                </div>
            </div>
            <div class="habit-notes mt-2">
                <p class="text-secondary mb-0">Target: ${habitInfo.target}</p>
            </div>
        `;
        
        habitsGrid.appendChild(habitCard);
    });
}

// Function to close the habit popup
function closeHabitPopup() {
    document.getElementById('habit-popup-overlay').classList.remove('show');
    document.getElementById('habit-popup').classList.remove('show');
    document.getElementById('habit-confirmation-popup').classList.remove('show');
    document.getElementById('habit-note-popup').classList.remove('show'); // Also hide note popup
}

// Function to show the habit completion confirmation popup
function showCompletionConfirmation(habitId, habitName) {
    // Set the habit name in the confirmation popup
    document.getElementById('confirmation-habit-name').textContent = habitName;
    
    // Store the habit ID for later use
    document.getElementById('confirm-completion-btn').setAttribute('data-habit-id', habitId);
    
    // Show the popup and overlay
    document.getElementById('habit-popup-overlay').classList.add('show');
    document.getElementById('habit-confirmation-popup').classList.add('show');
}

// Function to mark a habit as completed
function markHabitAsCompleted(habitId) {
    // In a real application, you would send this to your backend API
    console.log('Marking habit as completed:', habitId);
    
    // For demonstration, we'll update the UI directly
    const pendingButton = document.querySelector(`[data-habit-id="${habitId}"] .badge.bg-warning`);
    if (pendingButton) {
        pendingButton.classList.remove('bg-warning');
        pendingButton.classList.add('bg-success');
        pendingButton.textContent = 'Completed';
        pendingButton.removeEventListener('click', pendingButtonClickHandler);
    }
    
    // Close the confirmation popup
    closeHabitPopup();
}

// New function to handle click on 'Pending' button
function handlePendingClick(habitId, habitName, buttonElement) {
    // Change button text and style
    buttonElement.textContent = 'Complete';
    buttonElement.classList.remove('bg-warning'); // Assuming 'Pending' uses bg-warning
    buttonElement.classList.add('bg-success');   // 'Complete' uses bg-success
    buttonElement.disabled = true;

    // In a real app, you might call markHabitAsCompleted(habitId) here or after note submission
    console.log('Habit marked as complete (UI only):', habitId, habitName);

    // Show popup for quick note
    showHabitNotePopup(habitId, habitName);
}

// New function to show the habit note popup
function showHabitNotePopup(habitId, habitName) {
    console.log('Showing note popup for:', habitId, habitName);
    const notePopup = document.getElementById('habit-note-popup');
    const overlay = document.getElementById('habit-popup-overlay');
    if (notePopup && overlay) {
        document.getElementById('note-popup-habit-name').textContent = habitName;
        document.getElementById('habit-note-textarea').value = ''; // Clear previous note
        document.getElementById('save-habit-note-btn').setAttribute('data-habit-id', habitId);
        
        overlay.classList.add('show');
        notePopup.classList.add('show');
        document.getElementById('habit-note-textarea').focus();
    } else {
        console.error('Note popup or overlay element not found! Ensure habit-note-popup HTML is present.');
        alert(`Popup for notes on "${habitName}" is not yet implemented.`);
    }
}

// Function to close the habit note popup
function closeHabitNotePopup() {
    const notePopup = document.getElementById('habit-note-popup');
    const overlay = document.getElementById('habit-popup-overlay');
    if (notePopup && overlay) {
        notePopup.classList.remove('show');
        // Only hide overlay if no other popups are active (e.g., confirmation popup)
        if (!document.getElementById('habit-confirmation-popup').classList.contains('show') && 
            !document.getElementById('habit-popup').classList.contains('show')) {
            overlay.classList.remove('show');
        }
    }
}

// Function to save the habit note
function saveHabitNote() {
    const habitId = document.getElementById('save-habit-note-btn').getAttribute('data-habit-id');
    const noteText = document.getElementById('habit-note-textarea').value;
    
    // In a real application, you would send this to your backend API
    console.log('Saving note for habit:', habitId, 'Note:', noteText);
    // You might want to call markHabitAsCompleted(habitId) here if it wasn't called earlier

    // For demonstration, we'll just close the popup
    closeHabitNotePopup();
    
    // Optionally, provide some feedback to the user
    // alert('Note saved!');
}

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    // Run immediately
    removeHelpButton();
    
    // Set up event listeners for popups
    document.getElementById('habit-popup-close').addEventListener('click', closeHabitPopup);
    
    // Set up event listener for confirmation buttons
    document.getElementById('confirm-completion-btn').addEventListener('click', function() {
        const habitId = this.getAttribute('data-habit-id');
        markHabitAsCompleted(habitId);
    });
    
    document.getElementById('cancel-completion-btn').addEventListener('click', closeHabitPopup);
    
    // Set up keyboard event for escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeHabitPopup();
        }
    });
    
    // Load user profile
    loadUserProfile();
    
    // Load user's selected habits (in a real app, these would come from backend)
    const selectedHabits = ['exercise', 'meditation', 'reading', 'water', 'sleep', 'journaling'];
    loadUserHabits(selectedHabits);
    
    // Initialize and update calendar
    updateCalendar();
    
    // Setup the static Read Book pending button
    const readBookPendingBtn = document.getElementById('read-book-pending-btn');
    if (readBookPendingBtn) {
        readBookPendingBtn.addEventListener('click', function() {
            // Use the same handlePendingClick function as dynamic buttons
            handlePendingClick('read-book-habit', 'Read Book', this);
        });
    }
    
    // Month navigation setup
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', function() {
            currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
            updateCalendar();
        });
    }
    
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', function() {
            currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
            updateCalendar();
        });
    }
    
    // Update time initially and then every second
    updateTime();
    setInterval(updateTime, 1000);
});
