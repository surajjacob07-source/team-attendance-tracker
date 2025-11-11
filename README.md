# Amazon Pay Channel Partner - SMB Team Attendance Tracker

A professional dark-themed attendance tracking system for Amazon Pay Channel Partner SMB Team, designed to match Amazon's official style guidelines.

## 🚀 Quick Start - GitHub Pages Hosting

### Step 1: Upload to GitHub

1. Create a new repository on GitHub
2. Upload these files to your repository:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `README.md`

### Step 2: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings**
3. Scroll down to **Pages** section (left sidebar)
4. Under **Source**, select **main** branch
5. Select **/ (root)** folder
6. Click **Save**

### Step 3: Access Your Website

- Your website will be available at: `https://your-username.github.io/repository-name/`
- It may take a few minutes to deploy

## 📋 Features

### Team Management
- **5 Team Members**: Saurabh, Dhruv, Divyansh, Suraj, Raja
- Individual sections for each member with navigation controls
- Independent month navigation per member

### Calendar View
- **3-Month Display**: Shows current month and previous 2 months
- **Weekdays Only**: Monday to Friday (weekends automatically excluded)
- **Month Navigation**: Previous/Next buttons to view historical data
- **Color-Coded Status**:
  - 🟢 Green (#067D62) = In Office (Default)
  - 🔵 Blue (#007EB9) = External Meeting
  - 🔴 Red (#C7511F) = On Leave

### Attendance Marking
- **Default Status**: All weekdays automatically marked as "In Office"
- **Simple Updates**: Click any day to mark exceptions
- **Future Protection**: Future dates are disabled
- **Quick Actions**: Modal popup for easy status changes

### Report Generation
- **CSV Download**: Single-click download for all team members
- **Comprehensive Data**: Year-to-date attendance records
- **Statistics**: Office days, meeting days, and leave days per member
- **Date-Stamped**: Files include generation date

### Amazon Design System
- **Official Colors**: Uses Amazon's exact color palette
- **Dark Theme**: Professional appearance with reduced eye strain
- **Amazon Orange**: Signature #FF9900 brand color
- **Typography**: Amazon Ember font family

## 🎨 Design Specifications

### Color Palette (Amazon Official)
```css
Background:          #0F1111
Surface/Cards:       #131A22
Navigation:          #232F3E
Primary Orange:      #FF9900
Orange Hover:        #FFB347
Success Green:       #067D62
Info Blue:           #007EB9
Warning Red:         #C7511F
Borders:             #3a4553
Text:                #ffffff
```

## 💾 Data Storage

- **LocalStorage**: All attendance data saved in browser
- **Persistent**: Data remains until manually cleared
- **Automatic**: Saves on every update
- **Backup**: Download CSV reports regularly for backup

## 📱 Responsive Design

- **Desktop**: Optimized for 1200px+ screens
- **Tablet**: Stacked layout for 768px-1199px
- **Mobile**: Single column for <768px
- **Print-Friendly**: Optimized print stylesheet

## 🔧 Customization

### Adding Team Members

Edit `script.js`, line 3:
```javascript
this.members = ['Saurabh', 'Dhruv', 'Divyansh', 'Suraj', 'Raja', 'NewMember'];
```

### Changing Colors

Edit `styles.css` to modify color scheme:
```css
.day-cell {
    background: #067D62;  /* Change green office color */
}
```

## 📖 Usage Guide

### For Team Members

1. **Access the Website**
   - Open the GitHub Pages URL in your browser
   - Bookmark for easy access

2. **Mark Today's Attendance**
   - Find your name section
   - Click on today's date
   - Select status (External Meeting or On Leave)
   - Office attendance is automatic (no action needed)

3. **View Past Months**
   - Use ◀ Previous button to go back 3 months
   - Use Next ▶ button to return to recent months

4. **Download Reports**
   - Click "📊 Download Report" at the top
   - Opens CSV file with all attendance data
   - Can be opened in Excel for analysis

### For Managers

1. **Monitor Team Attendance**
   - Scroll through all 5 member sections
   - View color-coded calendars for quick insights
   - Green = Present, Blue = Meeting, Red = Leave

2. **Generate Reports**
   - Download comprehensive CSV reports
   - Includes daily attendance and statistics
   - Suitable for monthly reviews

## 🔒 Security & Privacy

- **No Backend**: Pure client-side application
- **No Login**: Open access for team members
- **Local Storage**: Data stored in browser only
- **No Cloud**: No external data transmission

## 🌐 Browser Compatibility

- **Chrome**: Recommended (Latest version)
- **Firefox**: Fully supported
- **Safari**: Fully supported
- **Edge**: Fully supported
- **Mobile Browsers**: iOS Safari, Chrome Mobile

## 📊 Technical Stack

- **HTML5**: Semantic structure
- **CSS3**: Modern styling with animations
- **JavaScript**: Vanilla JS (no frameworks)
- **LocalStorage API**: Data persistence
- **Date API**: Calendar calculations

## 🛠️ Troubleshooting

### Data Not Saving
- Check if browser allows localStorage
- Ensure you're not in incognito/private mode
- Clear browser cache and reload

### Calendar Not Showing
- Check JavaScript console for errors (F12)
- Ensure all 3 files are uploaded to GitHub
- Verify files are in repository root

### GitHub Pages Not Working
- Wait 5-10 minutes after enabling
- Check repository is public
- Verify branch and folder settings

## 📞 Support

For issues or questions:
1. Check browser console (F12) for errors
2. Verify all files are present
3. Clear browser cache and reload
4. Test in different browser

## 📝 Version History

### Version 3.0 (Current)
- Amazon official color palette
- Enhanced dark theme
- Month navigation controls
- GitHub Pages ready

### Version 2.0
- 5-member section layout
- 3-month calendar view
- Weekdays only display
- Month navigation

### Version 1.0
- Initial release
- Basic attendance marking
- Report generation

## 📄 License

Free to use and modify for internal team purposes.

---

**Built with ❤️ for Amazon Pay Channel Partner - SMB Team**

**Color Palette**: Amazon Official Design System  
**Theme**: Professional Dark Mode  
**Font**: Amazon Ember
