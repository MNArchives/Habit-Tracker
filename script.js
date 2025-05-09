class HabitTracker {
    constructor() {
        this.habitName = '';
        this.startDate = null;
        this.daysCompleted = 0;
        this.daysLeft = 21;
        this.currentStreak = 0;
        this.badges = [];
        this.initializeEventListeners();
        this.loadFromLocalStorage();
    }

    initializeEventListeners() {
        document.getElementById('start-habit').addEventListener('click', () => this.startHabit());
        document.getElementById('mark-completed').addEventListener('click', () => this.markDay('completed'));
        document.getElementById('mark-missed').addEventListener('click', () => this.markDay('missed'));
        document.getElementById('habit-name').addEventListener('input', (e) => this.habitName = e.target.value);
    }

    startHabit() {
        if (!this.habitName.trim()) {
            alert('Please enter a habit name');
            return;
        }

        this.startDate = new Date();
        this.initializeCalendar();
        this.updateStats();
        this.saveToLocalStorage();
    }

    initializeCalendar() {
        const calendarGrid = document.querySelector('.calendar-grid');
        calendarGrid.innerHTML = '';

        for (let i = 0; i < 21; i++) {
            const day = document.createElement('div');
            day.className = 'calendar-day';
            day.textContent = i + 1;
            calendarGrid.appendChild(day);
        }

        this.updateCalendar();
    }

    updateCalendar() {
        const days = document.querySelectorAll('.calendar-day');
        days.forEach((day, index) => {
            if (index < this.daysCompleted) {
                day.classList.add('completed');
            } else if (index === this.daysCompleted) {
                day.classList.add('current');
            }
        });
    }

    markDay(status) {
        if (!this.startDate) {
            alert('Please start a habit first');
            return;
        }

        if (this.daysCompleted >= 21) {
            alert('Congratulations! You completed the 21-day challenge!');
            return;
        }

        if (status === 'completed') {
            this.daysCompleted++;
            this.currentStreak++;
            this.checkBadges();
        } else {
            this.currentStreak = 0;
        }

        this.daysLeft = 21 - this.daysCompleted;
        this.updateCalendar();
        this.updateStats();
        this.saveToLocalStorage();
    }

    checkBadges() {
        const badges = [
            { name: 'Starter', threshold: 1 },
            { name: 'Streaker', threshold: 5 },
            { name: 'Consistent', threshold: 10 },
            { name: 'Master', threshold: 21 }
        ];

        badges.forEach(badge => {
            if (this.daysCompleted >= badge.threshold && !this.badges.includes(badge.name)) {
                this.badges.push(badge.name);
                this.showBadgeNotification(badge.name);
            }
        });

        this.updateBadges();
    }

    showBadgeNotification(badgeName) {
        const notification = document.createElement('div');
        notification.className = 'badge-notification';
        notification.innerHTML = `
            <i class="fas fa-badge-check"></i>
            <span>Congratulations! You earned the "${badgeName}" badge!</span>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    updateBadges() {
        const badgesContainer = document.getElementById('badges');
        badgesContainer.innerHTML = this.badges.map(badge => `
            <div class="badge">
                <i class="fas fa-badge-check"></i>
                <span>${badge}</span>
            </div>
        `).join('');
    }

    updateStats() {
        document.getElementById('days-completed').textContent = this.daysCompleted;
        document.getElementById('days-left').textContent = this.daysLeft;
        document.getElementById('streak').textContent = this.currentStreak;
    }

    saveToLocalStorage() {
        localStorage.setItem('habitTracker', JSON.stringify({
            habitName: this.habitName,
            startDate: this.startDate,
            daysCompleted: this.daysCompleted,
            currentStreak: this.currentStreak,
            badges: this.badges
        }));
    }

    loadFromLocalStorage() {
        const savedData = JSON.parse(localStorage.getItem('habitTracker'));
        if (savedData) {
            this.habitName = savedData.habitName;
            this.startDate = new Date(savedData.startDate);
            this.daysCompleted = savedData.daysCompleted;
            this.currentStreak = savedData.currentStreak;
            this.badges = savedData.badges;
            
            if (this.startDate) {
                this.initializeCalendar();
                this.updateStats();
                this.updateBadges();
            }
        }
    }
}

// Initialize the habit tracker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new HabitTracker();
});
