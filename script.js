class AttendanceTracker {
    constructor() {
        this.members = ['Saurabh', 'Dhruv', 'Divyansh', 'Suraj', 'Raja'];
        this.attendanceData = {};
        this.selectedDate = null;
        this.selectedMember = null;
        this.currentBulkMember = null;
        this.memberMonthOffsets = {};
        this.members.forEach(member => {
            this.memberMonthOffsets[member] = 0;
        });
        
        // Firebase reference
        this.attendanceRef = database.ref('attendance');
        
        this.init();
    }

    init() {
        this.showLoading(true);
        this.loadDataFromFirebase();
        this.bindEvents();
    }

    showLoading(show) {
        const indicator = document.getElementById('loadingIndicator');
        if (indicator) {
            indicator.style.display = show ? 'block' : 'none';
        }
    }

    loadDataFromFirebase() {
        // Listen for real-time updates
        this.attendanceRef.on('value', (snapshot) => {
            this.attendanceData = snapshot.val() || {};
            this.renderAllMembers();
            this.showLoading(false);
        }, (error) => {
            console.error('Firebase read error:', error);
            alert('Error connecting to Firebase. Please check your configuration.');
            this.showLoading(false);
        });
    }

    saveDataToFirebase() {
        this.showLoading(true);
        this.attendanceRef.set(this.attendanceData)
            .then(() => {
                this.showLoading(false);
            })
            .catch((error) => {
                console.error('Firebase write error:', error);
                alert('Error saving data to Firebase.');
                this.showLoading(false);
            });
    }

    bindEvents() {
        document.getElementById('downloadReport').addEventListener('click', () => {
            this.downloadTeamReport();
        });

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

        const bulkModal = document.getElementById('bulkModal');
        const closeBulkBtn = document.querySelector('.close-bulk');
        
        closeBulkBtn.addEventListener('click', () => {
            bulkModal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === bulkModal) {
                bulkModal.style.display = 'none';
            }
        });

        document.querySelectorAll('.btn-attendance').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const status = e.target.dataset.status;
                this.markAttendance(status);
            });
        });

        document.querySelectorAll('.btn-bulk-apply').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const status = e.target.dataset.status;
                this.applyBulkAttendance(status);
            });
        });
    }

    renderAllMembers() {
        const container = document.getElementById('calendarContainer');
        container.innerHTML = '';

        this.members.forEach(member => {
            const memberSection = this.createMemberSection(member);
            container.appendChild(memberSection);
        });
    }

    createMemberSection(member) {
        const section = document.createElement('div');
        section.className = 'member-section';

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

        const bulkContainer = document.createElement('div');
        bulkContainer.className = 'bulk-select-container';
        const bulkBtn = document.createElement('button');
        bulkBtn.className = 'btn-bulk-select';
        bulkBtn.textContent = '📋 Bulk Mark Dates';
        bulkBtn.addEventListener('click', () => {
            this.openBulkModal(member);
        });
        bulkContainer.appendChild(bulkBtn);
        section.appendChild(bulkContainer);

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

        const title = document.createElement('div');
        title.className = 'month-title';
        title.textContent = monthData.name;
        calendar.appendChild(title);

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

        const daysGrid = document.createElement('div');
        daysGrid.className = 'days-grid';

        const datesByWeek = this.getWeekdaysByWeek(monthData.year, monthData.month);
        
        datesByWeek.forEach(week => {
            week.forEach(date => {
                if (date) {
                    const dayCell = this.createDayCell(member, date);
                    daysGrid.appendChild(dayCell);
                } else {
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
        let currentWeek = [null, null, null, null, null];
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay();
            
            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                currentWeek[dayOfWeek - 1] = date;
                if (dayOfWeek === 5) {
                    weeks.push([...currentWeek]);
                    currentWeek = [null, null, null, null, null];
                }
            }
        }
        
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

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (date > today) {
            cell.classList.add('future');
            cell.title = 'Future date';
        } else {
            const status = this.attendanceData[cellKey];
            
            if (status === 'wfh') {
                cell.classList.add('wfh');
                cell.title = 'Work From Home';
            } else if (status === 'office') {
                cell.classList.add('office');
                cell.title = 'In Office';
            } else if (status === 'meeting') {
                cell.classList.add('meeting');
                cell.title = 'External Meeting';
            } else if (status === 'leave') {
                cell.classList.add('leave');
                cell.title = 'On Leave';
            } else {
                cell.title = 'Not marked - Click to set status';
            }
            
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
        
        if (status === 'clear') {
            delete this.attendanceData[cellKey];
        } else {
            this.attendanceData[cellKey] = status;
        }
        
        this.saveDataToFirebase();
        document.getElementById('attendanceModal').style.display = 'none';
    }

    openBulkModal(member) {
        this.currentBulkMember = member;
        const modal = document.getElementById('bulkModal');
        const datesList = document.getElementById('bulkDatesList');
        datesList.innerHTML = '';

        const months = this.get3MonthsForMember(member);
        const allDates = [];

        months.forEach(monthData => {
            const weekdays = this.getWeekdaysInMonth(monthData.year, monthData.month);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            weekdays.forEach(date => {
                if (date <= today) {
                    allDates.push(date);
                }
            });
        });

        allDates.forEach(date => {
            const item = document.createElement('div');
            item.className = 'bulk-date-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `bulk-${this.formatDateKey(date)}`;
            checkbox.value = this.formatDateKey(date);

            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = date.toLocaleDateString('en-US', { 
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

            item.appendChild(checkbox);
            item.appendChild(label);
            datesList.appendChild(item);
        });

        modal.style.display = 'block';
    }

    applyBulkAttendance(status) {
        if (!this.currentBulkMember) return;

        const checkboxes = document.querySelectorAll('#bulkDatesList input[type="checkbox"]:checked');
        
        if (checkboxes.length === 0) {
            alert('Please select at least one date');
            return;
        }

        checkboxes.forEach(checkbox => {
            const dateKey = checkbox.value;
            const cellKey = `${this.currentBulkMember}-${dateKey}`;
            this.attendanceData[cellKey] = status;
        });

        this.saveDataToFirebase();
        document.getElementById('bulkModal').style.display = 'none';
    }

    downloadTeamReport() {
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
            
            const weekdays = this.getWeekdaysInMonth(monthData.year, monthData.month);
            
            weekdays.forEach(date => {
                csvContent += `${date.getDate()},`;
            });
            csvContent += 'WFH Days,Office Days,Meeting Days,Leave Days,Not Marked\n';
            
            this.members.forEach(member => {
                csvContent += `${member},`;
                let wfhDays = 0;
                let officeDays = 0;
                let meetingDays = 0;
                let leaveDays = 0;
                let notMarked = 0;
                
                weekdays.forEach(date => {
                    const checkToday = new Date();
                    checkToday.setHours(0, 0, 0, 0);
                    if (date > checkToday) {
                        csvContent += '-,';
                        return;
                    }
                    
                    const dateKey = this.formatDateKey(date);
                    const cellKey = `${member}-${dateKey}`;
                    const status = this.attendanceData[cellKey];
                    
                    if (status === 'wfh') {
                        csvContent += 'WFH,';
                        wfhDays++;
                    } else if (status === 'office') {
                        csvContent += 'Office,';
                        officeDays++;
                    } else if (status === 'meeting') {
                        csvContent += 'Meeting,';
                        meetingDays++;
                    } else if (status === 'leave') {
                        csvContent += 'Leave,';
                        leaveDays++;
                    } else {
                        csvContent += 'Not Marked,';
                        notMarked++;
                    }
                });
                
                csvContent += `${wfhDays},${officeDays},${meetingDays},${leaveDays},${notMarked}\n`;
            });
            
            csvContent += '\n';
        });
        
        csvContent += `\nYear-to-Date Summary (${today.getFullYear()})\n`;
        csvContent += 'Member,Total WFH Days,Total Office Days,Total Meeting Days,Total Leave Days,Total Not Marked\n';
        
        this.members.forEach(member => {
            const stats = this.calculateMemberStats(member, months);
            csvContent += `${member},${stats.wfh},${stats.office},${stats.meeting},${stats.leave},${stats.notMarked}\n`;
        });
        
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
        let wfh = 0;
        let office = 0;
        let meeting = 0;
        let leave = 0;
        let notMarked = 0;
        
        months.forEach(monthData => {
            const weekdays = this.getWeekdaysInMonth(monthData.year, monthData.month);
            
            weekdays.forEach(date => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (date > today) return;
                
                const dateKey = this.formatDateKey(date);
                const cellKey = `${member}-${dateKey}`;
                const status = this.attendanceData[cellKey];
                
                if (status === 'wfh') {
                    wfh++;
                } else if (status === 'office') {
                    office++;
                } else if (status === 'meeting') {
                    meeting++;
                } else if (status === 'leave') {
                    leave++;
                } else {
                    notMarked++;
                }
            });
        });
        
        return { wfh, office, meeting, leave, notMarked };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AttendanceTracker();
});
