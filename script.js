// Global variables
let currentUser = null;
let attendanceData = {};

// Team members
const teamMembers = ['Saurabh', 'Dhruv', 'Divyansh', 'Suraj', 'Raja'];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateTodayDate();
    checkTodayAttendance();
});

// Load data from localStorage
function loadData() {
    const savedData = localStorage.getItem('attendanceData');
    if (savedData) {
        attendanceData = JSON.parse(savedData);
    } else {
        // Initialize empty data structure for all team members
        teamMembers.forEach(member => {
            attendanceData[member] = {};
        });
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
}

// Update today's date display
function updateTodayDate() {
    const today = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    document.getElementById('todayDate').textContent = today.toLocaleDateString('en-US', options);
}

// Login function
function login(username) {
    currentUser = username;
    document.getElementById('currentUser').textContent = `Welcome, ${username}`;
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('dashboardSection').classList.remove('hidden');
    
    // Initialize user data if not exists
    if (!attendanceData[username]) {
        attendanceData[username] = {};
    }
    
    checkTodayAttendance();
    loadAttendanceHistory();
    loadTeamOverview();
}

// Logout function
function logout() {
    currentUser = null;
    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('dashboardSection').classList.add('hidden');
    
    // Clear any selected attendance buttons
    document.querySelectorAll('.attendance-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Clear status display
    document.getElementById('todayStatus').innerHTML = '';
    document.getElementById('todayStatus').className = 'status-display';
}

// Get today's date in YYYY-MM-DD format
function getTodayDateString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Check if user has already marked attendance today
function checkTodayAttendance() {
    if (!currentUser) return;
    
    const today = getTodayDateString();
    const todayAttendance = attendanceData[currentUser][today];
    
    if (todayAttendance) {
        // Show current status
        showAttendanceStatus(todayAttendance);
        
        // Highlight the selected button
        document.querySelectorAll('.attendance-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        const selectedBtn = document.querySelector(`.attendance-btn.${todayAttendance}`);
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
        }
    } else {
        // Clear status if no attendance marked
        document.getElementById('todayStatus').innerHTML = '';
        document.getElementById('todayStatus').className = 'status-display';
    }
}

// Mark attendance for today
function markAttendance(status) {
    if (!currentUser) return;
    
    const today = getTodayDateString();
    
    // Save attendance
    attendanceData[currentUser][today] = status;
    saveData();
    
    // Update UI
    showAttendanceStatus(status);
    
    // Update button selection
    document.querySelectorAll('.attendance-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    const selectedBtn = document.querySelector(`.attendance-btn.${status}`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
    }
    
    // Refresh history
    loadAttendanceHistory();
    loadTeamOverview();
}

// Show attendance status message
function showAttendanceStatus(status) {
    const statusDisplay = document.getElementById('todayStatus');
    const statusMessages = {
        'in-office': 'You are marked as In Office for today',
        'external-meeting': 'You are marked as In External Meeting for today',
        'leave': 'You are marked as On Leave for today'
    };
    
    const statusClasses = {
        'in-office': 'success',
        'external-meeting': 'info',
        'leave': 'info'
    };
    
    statusDisplay.textContent = statusMessages[status];
    statusDisplay.className = `status-display ${statusClasses[status]}`;
}

// Load attendance history for current user
function loadAttendanceHistory() {
    if (!currentUser) return;
    
    const historyContainer = document.getElementById('attendanceHistory');
    const userAttendance = attendanceData[currentUser];
    
    if (!userAttendance || Object.keys(userAttendance).length === 0) {
        historyContainer.innerHTML = `
            <div class="empty-state">
                <h3>No attendance records found</h3>
                <p>Start marking your attendance to see your history here.</p>
            </div>
        `;
        return;
    }
    
    // Sort dates in descending order (newest first)
    const sortedDates = Object.keys(userAttendance).sort((a, b) => new Date(b) - new Date(a));
    
    let historyHTML = '';
    sortedDates.forEach(date => {
        const status = userAttendance[date];
        const formattedDate = new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const statusLabels = {
            'in-office': 'In Office',
            'external-meeting': 'External Meeting',
            'leave': 'On Leave'
        };
        
        historyHTML += `
            <div class="history-item">
                <span class="history-date">${formattedDate}</span>
                <span class="history-status ${status}">${statusLabels[status]}</span>
            </div>
        `;
    });
    
    historyContainer.innerHTML = historyHTML;
}

// Filter history by month
function filterHistory() {
    if (!currentUser) return;
    
    const selectedMonth = document.getElementById('monthFilter').value;
    const historyContainer = document.getElementById('attendanceHistory');
    const userAttendance = attendanceData[currentUser];
    
    if (!userAttendance || Object.keys(userAttendance).length === 0) {
        historyContainer.innerHTML = `
            <div class="empty-state">
                <h3>No attendance records found</h3>
                <p>Start marking your attendance to see your history here.</p>
            </div>
        `;
        return;
    }
    
    let filteredDates = Object.keys(userAttendance);
    
    if (selectedMonth !== '') {
        filteredDates = filteredDates.filter(date => {
            const dateObj = new Date(date);
            return dateObj.getMonth() === parseInt(selectedMonth);
        });
    }
    
    // Sort dates in descending order
    filteredDates.sort((a, b) => new Date(b) - new Date(a));
    
    if (filteredDates.length === 0) {
        historyContainer.innerHTML = `
            <div class="empty-state">
                <h3>No records found for selected month</h3>
                <p>Try selecting a different month or clear the filter.</p>
            </div>
        `;
        return;
    }
    
    let historyHTML = '';
    filteredDates.forEach(date => {
        const status = userAttendance[date];
        const formattedDate = new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const statusLabels = {
            'in-office': 'In Office',
            'external-meeting': 'External Meeting',
            'leave': 'On Leave'
        };
        
        historyHTML += `
            <div class="history-item">
                <span class="history-date">${formattedDate}</span>
                <span class="history-status ${status}">${statusLabels[status]}</span>
            </div>
        `;
    });
    
    historyContainer.innerHTML = historyHTML;
}

// Download individual report
function downloadReport() {
    if (!currentUser) return;
    
    const userAttendance = attendanceData[currentUser];
    if (!userAttendance || Object.keys(userAttendance).length === 0) {
        alert('No attendance data to download');
        return;
    }
    
    // Prepare CSV data
    let csvContent = "Date,Status\n";
    
    const sortedDates = Object.keys(userAttendance).sort((a, b) => new Date(a) - new Date(b));
    
    const statusLabels = {
        'in-office': 'In Office',
        'external-meeting': 'External Meeting',
        'leave': 'On Leave'
    };
    
    sortedDates.forEach(date => {
        const status = userAttendance[date];
        const formattedDate = new Date(date).toLocaleDateString('en-US');
        csvContent += `${formattedDate},${statusLabels[status]}\n`;
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentUser}_Attendance_Report.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Load team overview
function loadTeamOverview() {
    const teamContainer = document.getElementById('teamOverview');
    const today = getTodayDateString();
    
    let teamHTML = '';
    
    teamMembers.forEach(member => {
        const memberData = attendanceData[member];
        const todayStatus = memberData && memberData[today] ? memberData[today] : 'not-marked';
        
        const statusLabels = {
            'in-office': 'In Office',
            'external-meeting': 'External Meeting',
            'leave': 'On Leave',
            'not-marked': 'Not Marked'
        };
        
        const statusClass = todayStatus === 'not-marked' ? 'leave' : todayStatus;
        
        teamHTML += `
            <div class="team-member">
                <h3>${member}</h3>
                <div class="team-member-status">
                    <span class="history-status ${statusClass}">${statusLabels[todayStatus]}</span>
                    <span class="team-member-date">Today</span>
                </div>
            </div>
        `;
    });
    
    teamContainer.innerHTML = teamHTML;
}

// Show team view
function showTeamView() {
    loadTeamOverview();
}

// Download team report
function downloadTeamReport() {
    // Prepare CSV data for all team members
    let csvContent = "Name,Date,Status\n";
    
    const statusLabels = {
        'in-office': 'In Office',
        'external-meeting': 'External Meeting',
        'leave': 'On Leave'
    };
    
    teamMembers.forEach(member => {
        const memberData = attendanceData[member];
        if (memberData && Object.keys(memberData).length > 0) {
            const sortedDates = Object.keys(memberData).sort((a, b) => new Date(a) - new Date(b));
            
            sortedDates.forEach(date => {
                const status = memberData[date];
                const formattedDate = new Date(date).toLocaleDateString('en-US');
                csvContent += `${member},${formattedDate},${statusLabels[status]}\n`;
            });
        }
    });
    
    if (csvContent === "Name,Date,Status\n") {
        alert('No team attendance data to download');
        return;
    }
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Team_Attendance_Report.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}
