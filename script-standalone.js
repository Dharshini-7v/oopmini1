// Standalone version for GitHub Pages - uses localStorage instead of API
// This version works entirely client-side without a backend

// Utility Functions
function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = message;
    alert.style.position = 'fixed';
    alert.style.top = '20px';
    alert.style.right = '20px';
    alert.style.zIndex = '9999';
    alert.style.minWidth = '300px';
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.style.opacity = '0';
        alert.style.transition = 'opacity 0.3s';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

function setLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = '<span class="loading"></span> Loading...';
    } else {
        button.disabled = false;
        button.innerHTML = button.getAttribute('data-original-text') || button.textContent;
    }
}

// Simple hash function for password (client-side only)
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
}

// Initialize default admin user
function initializeUsers() {
    if (!localStorage.getItem('users')) {
        const users = {
            'admin': { password: hashPassword('1234'), dept: 'Admin' }
        };
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Login Page - Standalone version
if (document.getElementById('loginForm')) {
    initializeUsers();
    
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const button = e.target.querySelector('button[type="submit"]');
        
        button.setAttribute('data-original-text', button.textContent);
        setLoading(button, true);
        
        setTimeout(() => {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            const user = users[username];
            
            if (user && user.password === hashPassword(password)) {
                localStorage.setItem('username', username);
                localStorage.setItem('isLoggedIn', 'true');
                showAlert('Login successful!', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 500);
            } else {
                showAlert('Invalid username or password', 'error');
            }
            setLoading(button, false);
        }, 300);
    });
}

// Signup Page - Standalone version
if (document.getElementById('signupForm')) {
    initializeUsers();
    
    document.getElementById('signupForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('suUser').value;
        const password = document.getElementById('suPass').value;
        const dept = document.getElementById('suDept').value;
        const button = e.target.querySelector('button[type="submit"]');
        
        button.setAttribute('data-original-text', button.textContent);
        setLoading(button, true);
        
        setTimeout(() => {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            
            if (users[username]) {
                showAlert('User already exists', 'error');
            } else {
                users[username] = {
                    password: hashPassword(password),
                    dept: dept || ''
                };
                localStorage.setItem('users', JSON.stringify(users));
                showAlert('Account created successfully!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }
            setLoading(button, false);
        }, 300);
    });
}

// Dashboard Page - Standalone version
if (document.getElementById('resultTable')) {
    // Check authentication
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'index.html';
    }
    
    // Display username
    const username = localStorage.getItem('username');
    if (username) {
        const usernameEl = document.getElementById('username');
        if (usernameEl) {
            usernameEl.textContent = username;
        }
    }
    
    // Load summary data from localStorage
    function loadSummary() {
        const allReports = JSON.parse(localStorage.getItem('reports') || '[]');
        const allStudents = [];
        
        allReports.forEach(report => {
            if (report.students) {
                allStudents.push(...report.students);
            }
        });
        
        if (allStudents.length === 0) {
            document.getElementById('summary').innerHTML = '<p>No data available yet. Create some reports to see statistics.</p>';
            return;
        }
        
        // Calculate summary
        let totalAverage = 0;
        const gradeCounts = {};
        
        allStudents.forEach(student => {
            totalAverage += student.average;
            gradeCounts[student.grade] = (gradeCounts[student.grade] || 0) + 1;
        });
        
        const classAverage = totalAverage / allStudents.length;
        
        displaySummary({ classAverage, gradeCounts });
        loadStudentResults();
    }
    
    function displaySummary(summary) {
        const summaryDiv = document.getElementById('summary');
        summaryDiv.innerHTML = `
            <div class="summary-grid">
                <div class="summary-card">
                    <h3>Class Average</h3>
                    <div class="value">${summary.classAverage.toFixed(2)}%</div>
                </div>
                ${summary.gradeCounts ? Object.entries(summary.gradeCounts).map(([grade, count]) => `
                    <div class="summary-card">
                        <h3>Grade ${grade}</h3>
                        <div class="value">${count}</div>
                    </div>
                `).join('') : ''}
            </div>
        `;
    }
    
    // Load student results from localStorage
    function loadStudentResults() {
        const allReports = JSON.parse(localStorage.getItem('reports') || '[]');
        const allStudents = [];
        
        allReports.forEach(report => {
            if (report.students) {
                allStudents.push(...report.students);
            }
        });
        
        const tbody = document.getElementById('resultTableBody');
        if (!tbody) return;
        
        if (allStudents.length > 0) {
            tbody.innerHTML = allStudents.map(student => `
                <tr>
                    <td><strong>${student.name}</strong></td>
                    <td>${student.average.toFixed(2)}%</td>
                    <td><span class="grade-badge grade-${student.grade.replace('+', '-plus')}">${student.grade}</span></td>
                    <td>${student.bestSubject || 'N/A'}</td>
                    <td>${student.remark || 'N/A'}</td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 20px; color: #666;">
                        No data available yet. Create reports to see results here.
                    </td>
                </tr>
            `;
        }
    }
    
    loadSummary();
}

// Logout function
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
}

// Report Entry Page - Standalone version
if (document.getElementById('studentForm')) {
    // Check authentication
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'index.html';
    }
    
    // Display username
    const username = localStorage.getItem('username');
    if (username) {
        const usernameEl = document.getElementById('username');
        if (usernameEl) {
            usernameEl.textContent = username;
        }
    }
    
    let subjectCount = 3;
    let studentCount = 2;
    
    // Generate form
    document.getElementById('generate').addEventListener('click', (e) => {
        e.preventDefault();
        generateStudentForm();
    });
    
    function generateStudentForm() {
        subjectCount = parseInt(document.getElementById('subjects').value) || 3;
        studentCount = parseInt(document.getElementById('studentCount').value) || 2;
        
        const studentsDiv = document.getElementById('students');
        studentsDiv.innerHTML = '';
        
        if (subjectCount < 1 || subjectCount > 10) {
            showAlert('Number of subjects must be between 1 and 10', 'error');
            return;
        }
        
        if (studentCount < 1 || studentCount > 50) {
            showAlert('Number of students must be between 1 and 50', 'error');
            return;
        }
        
        for (let i = 1; i <= studentCount; i++) {
            const studentBlock = document.createElement('div');
            studentBlock.className = 'student-block';
            studentBlock.innerHTML = `
                <h3>Student ${i}</h3>
                <label>
                    Student Name
                    <input type="text" name="student_${i}_name" required placeholder="Enter student name">
                </label>
                <div class="marks-container">
                    ${Array.from({ length: subjectCount }, (_, j) => `
                        <div class="mark-input">
                            <label>
                                Subject ${j + 1}
                                <input type="number" name="student_${i}_mark_${j}" min="0" max="100" required placeholder="Marks">
                            </label>
                        </div>
                    `).join('')}
                </div>
            `;
            studentsDiv.appendChild(studentBlock);
        }
    }
    
    // Process report locally
    function processReport(students) {
        const results = students.map(student => {
            const marks = student.marks;
            const sum = marks.reduce((a, b) => a + b, 0);
            const average = marks.length > 0 ? sum / marks.length : 0;
            
            // Find best subject
            let bestIdx = 0;
            let best = -1;
            for (let i = 0; i < marks.length; i++) {
                if (marks[i] > best) {
                    best = marks[i];
                    bestIdx = i;
                }
            }
            
            // Calculate grade
            let grade;
            if (average >= 90) grade = 'A+';
            else if (average >= 75) grade = 'A';
            else if (average >= 60) grade = 'B';
            else if (average >= 50) grade = 'C';
            else grade = 'F';
            
            // Remark
            let remark;
            if (average >= 90) remark = 'Outstanding';
            else if (average >= 75) remark = 'Very Good';
            else if (average >= 60) remark = 'Good';
            else if (average >= 50) remark = 'Satisfactory';
            else remark = 'Needs Improvement';
            
            return {
                name: student.name,
                marks: marks,
                average: average,
                grade: grade,
                bestSubject: `Subject ${bestIdx + 1}`,
                remark: remark
            };
        });
        
        // Calculate summary
        const totalAverage = results.reduce((sum, s) => sum + s.average, 0) / results.length;
        const gradeCounts = {};
        results.forEach(s => {
            gradeCounts[s.grade] = (gradeCounts[s.grade] || 0) + 1;
        });
        
        return {
            students: results,
            summary: {
                classAverage: totalAverage,
                gradeCounts: gradeCounts
            }
        };
    }
    
    // Process form
    document.getElementById('studentForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const students = [];
        
        // Collect student data
        for (let i = 1; i <= studentCount; i++) {
            const name = formData.get(`student_${i}_name`);
            if (!name) continue;
            
            const marks = [];
            for (let j = 0; j < subjectCount; j++) {
                const mark = parseInt(formData.get(`student_${i}_mark_${j}`));
                if (!isNaN(mark)) {
                    marks.push(mark);
                }
            }
            
            if (marks.length === subjectCount) {
                students.push({ name, marks });
            }
        }
        
        if (students.length === 0) {
            showAlert('Please fill in at least one student with all marks', 'error');
            return;
        }
        
        const button = e.target.querySelector('button[type="submit"]');
        button.setAttribute('data-original-text', button.textContent);
        setLoading(button, true);
        
        // Process locally
        setTimeout(() => {
            const result = processReport(students);
            
            // Save to localStorage
            const reports = JSON.parse(localStorage.getItem('reports') || '[]');
            reports.push(result);
            localStorage.setItem('reports', JSON.stringify(reports));
            
            setLoading(button, false);
            displayResults(result);
            showAlert('Report processed successfully!', 'success');
        }, 500);
    });
    
    function displayResults(data) {
        const form = document.getElementById('studentForm');
        const resultsDiv = document.createElement('div');
        resultsDiv.id = 'results';
        resultsDiv.innerHTML = `
            <h2>Results</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Average</th>
                        <th>Grade</th>
                        <th>Best Subject</th>
                        <th>Remark</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.students.map(student => `
                        <tr>
                            <td><strong>${student.name}</strong></td>
                            <td>${student.average.toFixed(2)}%</td>
                            <td><span class="grade-badge grade-${student.grade.replace('+', '-plus')}">${student.grade}</span></td>
                            <td>${student.bestSubject}</td>
                            <td>${student.remark}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            ${data.summary ? `
                <div class="summary-grid" style="margin-top: 20px;">
                    <div class="summary-card">
                        <h3>Class Average</h3>
                        <div class="value">${data.summary.classAverage.toFixed(2)}%</div>
                    </div>
                </div>
            ` : ''}
            <div class="actions" style="margin-top: 20px;">
                <button onclick="window.location.href='dashboard.html'">View Dashboard</button>
                <button class="secondary" onclick="document.getElementById('results').remove(); generateStudentForm();">New Entry</button>
            </div>
        `;
        
        form.insertAdjacentElement('afterend', resultsDiv);
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Clear button
    document.getElementById('clear').addEventListener('click', () => {
        document.getElementById('students').innerHTML = '';
        const results = document.getElementById('results');
        if (results) results.remove();
    });
    
    // Initialize with default values
    generateStudentForm();
}

// Profile Page - Standalone version
if (document.getElementById('profileUsername')) {
    // Check authentication
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'index.html';
    }
    
    const username = localStorage.getItem('username');
    if (username) {
        document.getElementById('profileUsername').textContent = username;
        const usernameEl = document.getElementById('username');
        if (usernameEl) {
            usernameEl.textContent = username;
        }
    }
    
    // Load statistics
    const allReports = JSON.parse(localStorage.getItem('reports') || '[]');
    const allStudents = [];
    allReports.forEach(report => {
        if (report.students) {
            allStudents.push(...report.students);
        }
    });
    
    document.getElementById('totalReports').textContent = allReports.length > 0 ? allReports.length : '0';
    document.getElementById('totalStudents').textContent = allStudents.length;
}

