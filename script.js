class AttendanceTracker {
    constructor() {
        this.members = ['Saurabh', 'Dhruv', 'Divyansh', 'Suraj', 'Raja'];
        this.attendanceData = this.loadData();
        this.selectedDate = null;
        this.selectedMember = null;
        // Store the current viewing month offset for each member (0 = current month)
        this.memberMonthOffsets = {};
        this.members.forEach(member => {
            this.memberMonthOffsets[member] = 0;
        });
        this.init();
    }

    init() {
        this.renderAllMembers();
        this.bindEvents();
    }

    loadData() {
        const stored = localStorage.getItem('teamAttendanceData');
        return stored ? JSON.parse(stored) : {};
    }

    saveData() {
        localStorage.setItem('teamAttendanceData', JSON.stringify(this.attendanceData));
    }

    bindEvents() {
        // Download report button
        document.getElementById('downloadReport').addEventListener('click', () => {
            this.downloadTeamReport();
        });

        // Modal close
        const modal = document.getElementById('attendanceModal');
        const closeBtn = document.querySelector('.close');
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Attendance buttons
        document.querySelectorAll('.btn-attendance').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const status = e.target.dataset.status;
                this.markAttendance(status);
            });
        });
    }

    renderAllMembers() {
        const container = document.getElementById('membersContainer');
        container.innerHTML = '';

        this.members.forEach(member => {
            const memberSection = this.createMemberSection(member);
            container.appendChild(memberSection);
        });
    }

    createMemberSection(member) {
        const section = document.createElement('div');
        section.className = 'member-section';

        // Member header with navigation
        const headerContainer = document.createElement('div');
        headerContainer.className = 'member-header-container';

        const prevBtn = document.createElement('button');
        prevBtn.className = 'nav-btn';
        prevBtn.innerHTML = '◀ Previous';
        prevBtn.addEventListener('click', () => {
            this.memberMonthOffsets[member] -= 3;
            this.renderMemberCalendars(member, section);
        });

        const header = document.createElement('div');
        header.className = 'member-header';
        header.textContent = member;

        const nextBtn = document.createElement('button');
        nextBtn.className = 'nav-btn';
        nextBtn.innerHTML = 'Next ▶';
        nextBtn.addEventListener('click', () => {
            this.memberMonthOffsets[member] += 3;
            // Don't allow going beyond current month
            const today = new Date();
            const futureCheck = new Date(today.getFullYear(), today.getMonth() + this.memberMonthOffsets[member], 1);
            if (futureCheck > today) {
                this.memberMonthOffsets[member] -= 3;
                return;
            }
            this.renderMemberCalendars(member, section);
        });

        headerContainer.appendChild(prevBtn);
        headerContainer.appendChild(header);
        headerContainer.appendChild(nextBtn);
        section.appendChild(headerContainer);

        // Calendars row (3 months)
        const calendarsRow = document.createElement('div');
        calendarsRow.className = 'calendars-row';
        calendarsRow.id = `calendars-${member}`;
        section.appendChild(calendarsRow);

        this.renderMemberCalendars(member, section);

        return section;
    }

    renderMemberCalendars(member, section) {
        const calendarsRow = section.querySelector(`#calendars-${member}`);
        calendarsRow.innerHTML = '';

        const months = this.get3MonthsForMember(member);
        months.forEach(monthData => {
            const monthCalendar = this.createMonthCalendar(member, monthData);
            calendarsRow.appendChild(monthCalendar);
        });
    }

    get3MonthsForMember(member) {
        const months = [];
        const today = new Date();
        const offset = this.memberMonthOffsets[member];
        
        // Get 3 consecutive months based on offset
        // Offset 0 means current month and 2 previous months
        // Offset -3 means 3 months back, etc.
        for (let i = 2; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() + offset - i, 1);
            months.push({
                year: date.getFullYear(),
                month: date.getMonth(),
                name: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            });
        }
        
        return months;
    }

    createMonthCalendar(member, monthData) {
        const calendar = document.createElement('div');
        calendar.className = 'month-calendar';

        // Month title
        const title = document.createElement('div');
        title.className = 'month-title';
        title.textContent = monthData.name;
        calendar.appendChild(title);

        // Weekday headers (Mon-Fri only)
        const headers = document.createElement('div');
        headers.className = 'weekday-headers';
        const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        weekdays.forEach(day => {
            const header = document.createElement('div');
            header.className = 'weekday-header';
            header.textContent = day;
            headers.appendChild(header);
        });
        calendar.appendChild(headers);

        // Days grid (weekdays only, properly aligned)
        const daysGrid = document.createElement('div');
        daysGrid.className = 'days-grid';

        // Get all dates organized by week rows
        const datesByWeek = this.getWeekdaysByWeek(monthData.year, monthData.month);
        
        datesByWeek.forEach(week => {
            week.forEach(date => {
                if (date) {
                    const dayCell = this.createDayCell(member, date);
                    daysGrid.appendChild(dayCell);
                } else {
                    // Empty cell for alignment
                    const emptyCell = document.createElement('div');
                    emptyCell.className = 'day-cell empty';
                    daysGrid.appendChild(emptyCell);
                }
            });
        });

        calendar.appendChild(daysGrid);
        return calendar;
    }

    getWeekdaysByWeek(year, month) {
        const weeks = [];
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        let currentWeek = [null, null, null, null, null]; // Mon-Fri
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
            
            // Only process weekdays
            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                // dayOfWeek 1=Mon maps to index 0, 2=Tue to index 1, etc.
                currentWeek[dayOfWeek - 1] = date;
                
                // If Friday (dayOfWeek = 5), complete the week
                if (dayOfWeek === 5) {
                    weeks.push([...currentWeek]);
                    currentWeek = [null, null, null, null, null];
                }
            }
        }
        
        // Add any remaining partial week
        if (currentWeek.some(day => day !== null)) {
            weeks.push(currentWeek);
        }
        
        return weeks;
    }
    
    getWeekdaysInMonth(year, month) {
        const weekdays = [];
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay();
            
            // Only include weekdays (1=Monday to 5=Friday)
            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                weekdays.push(date);
            }
        }

        return weekdays;
    }

    createDayCell(member, date) {
        const cell = document.createElement('div');
        cell.className = 'day-cell';
        cell.textContent = date.getDate();

        const dateKey = this.formatDateKey(date);
        const cellKey = `${member}-${dateKey}`;

        // Check if future date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (date > today) {
            cell.classList.add('future');
            cell.title = 'Future date';
        } else {
            // Check attendance status (default is office)
            const status = this.attendanceData[cellKey] || 'office';
            
            if (status === 'meeting') {
                cell.classList.add('meeting');
                cell.title = 'External Meeting';
            } else if (status === 'leave') {
                cell.classList.add('leave');
                cell.title = 'On Leave';
            } else {
                cell.title = 'In Office';
            }
            
            // Add click event
            cell.addEventListener('click', () => {
                this.openAttendanceModal(member, date);
            });
        }

        return cell;
    }

    formatDateKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    openAttendanceModal(member, date) {
        this.selectedMember = member;
        this.selectedDate = date;
        
        const modal = document.getElementById('attendanceModal');
        const selectedInfo = document.getElementById('selectedInfo');
        
        const dateStr = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        selectedInfo.textContent = `${member} - ${dateStr}`;
        modal.style.display = 'block';
    }

    markAttendance(status) {
        if (!this.selectedMember || !this.selectedDate) return;
        
        const dateKey = this.formatDateKey(this.selectedDate);
        const cellKey = `${this.selectedMember}-${dateKey}`;
        
        if (status === 'office') {
            // Remove entry (default is office)
            delete this.attendanceData[cellKey];
        } else {
            // Store meeting or leave
            this.attendanceData[cellKey] = status;
        }
        
        this.saveData();
        this.renderAllMembers();
        
        // Close modal
        document.getElementById('attendanceModal').style.display = 'none';
    }

    downloadTeamReport() {
        // Get all months from January of current year to current month
        const today = new Date();
        const months = [];
        
        for (let month = 0; month <= today.getMonth(); month++) {
            const date = new Date(today.getFullYear(), month, 1);
            months.push({
                year: date.getFullYear(),
                month: date.getMonth(),
                name: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            });
        }
        
        let csvContent = 'Team Attendance Report - ' + today.getFullYear() + '\n\n';
        
        months.forEach(monthData => {
            csvContent += `\n${monthData.name}\n`;
            csvContent += 'Member,';
            
            // Get all weekdays for this month
            const weekdays = this.getWeekdaysInMonth(monthData.year, monthData.month);
            
            // Header row with dates
            weekdays.forEach(date => {
                csvContent += `${date.getDate()},`;
            });
            csvContent += 'Office Days,Meeting Days,Leave Days\n';
            
            // Data rows for each member
            this.members.forEach(member => {
                csvContent += `${member},`;
                let officeDays = 0;
                let meetingDays = 0;
                let leaveDays = 0;
                
                weekdays.forEach(date => {
                    // Skip future dates
                    const checkToday = new Date();
                    checkToday.setHours(0, 0, 0, 0);
                    if (date > checkToday) {
                        csvContent += '-,';
                        return;
                    }
                    
                    const dateKey = this.formatDateKey(date);
                    const cellKey = `${member}-${dateKey}`;
                    const status = this.attendanceData[cellKey] || 'office';
                    
                    if (status === 'meeting') {
                        csvContent += 'Meeting,';
                        meetingDays++;
                    } else if (status === 'leave') {
                        csvContent += 'Leave,';
                        leaveDays++;
                    } else {
                        csvContent += 'Office,';
                        officeDays++;
                    }
                });
                
                csvContent += `${officeDays},${meetingDays},${leaveDays}\n`;
            });
            
            csvContent += '\n';
        });
        
        // Add summary statistics
        csvContent += `\nYear-to-Date Summary (${today.getFullYear()})\n`;
        csvContent += 'Member,Total Office Days,Total Meeting Days,Total Leave Days\n';
        
        this.members.forEach(member => {
            const stats = this.calculateMemberStats(member, months);
            csvContent += `${member},${stats.office},${stats.meeting},${stats.leave}\n`;
        });
        
        // Download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `team-attendance-report-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    calculateMemberStats(member, months) {
        let office = 0;
        let meeting = 0;
        let leave = 0;
        
        months.forEach(monthData => {
            const weekdays = this.getWeekdaysInMonth(monthData.year, monthData.month);
            
            weekdays.forEach(date => {
                // Skip future dates
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (date > today) return;
                
                const dateKey = this.formatDateKey(date);
                const cellKey = `${member}-${dateKey}`;
                const status = this.attendanceData[cellKey] || 'office';
                
                if (status === 'meeting') {
                    meeting++;
                } else if (status === 'leave') {
                    leave++;
                } else {
                    office++;
                }
            });
        });
        
        return { office, meeting, leave };
    }
}

// Initialize the tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AttendanceTracker();
});
