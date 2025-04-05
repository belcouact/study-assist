/**
 * Study Assist - Educational Profile
 * Handles user educational profile selection and display
 */

// Educational profile state
const EDUCATIONAL_PROFILE = {
    school: null,  // 小学, 初中, 高中
    grade: null,   // Depends on school
    semester: null // 上学期, 下学期
};

// Grade options based on school selection
const GRADE_OPTIONS = {
    '小学': ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'],
    '初中': ['初一', '初二', '初三'],
    '高中': ['高一', '高二', '高三']
};

// Semester options
const SEMESTER_OPTIONS = ['上学期', '下学期'];

/**
 * Initialize the educational profile functionality
 */
function initEducationalProfile() {
    loadProfileFromStorage();
    updateProfileDisplay();
    setupProfileButton();
}

/**
 * Load educational profile from local storage
 */
function loadProfileFromStorage() {
    const savedProfile = localStorage.getItem('educationalProfile');
    if (savedProfile) {
        try {
            const parsedProfile = JSON.parse(savedProfile);
            EDUCATIONAL_PROFILE.school = parsedProfile.school;
            EDUCATIONAL_PROFILE.grade = parsedProfile.grade;
            EDUCATIONAL_PROFILE.semester = parsedProfile.semester;
        } catch (error) {
            console.error('Failed to parse educational profile from storage:', error);
        }
    }
}

/**
 * Save educational profile to local storage
 */
function saveProfileToStorage() {
    localStorage.setItem('educationalProfile', JSON.stringify(EDUCATIONAL_PROFILE));
}

/**
 * Update the profile display in the header
 */
function updateProfileDisplay() {
    const profileDisplay = document.getElementById('profile-display');
    
    if (!profileDisplay) {
        return;
    }
    
    if (EDUCATIONAL_PROFILE.school && EDUCATIONAL_PROFILE.grade && EDUCATIONAL_PROFILE.semester) {
        profileDisplay.textContent = `${EDUCATIONAL_PROFILE.school} | ${EDUCATIONAL_PROFILE.grade} | ${EDUCATIONAL_PROFILE.semester}`;
        profileDisplay.style.display = 'block';
    } else {
        profileDisplay.style.display = 'none';
    }
}

/**
 * Set up the profile selection button
 */
function setupProfileButton() {
    const profileButton = document.getElementById('profile-button');
    
    if (profileButton) {
        profileButton.addEventListener('click', showProfileModal);
    }
}

/**
 * Show the profile selection modal
 */
function showProfileModal() {
    // Create modal if it doesn't exist
    let profileModal = document.getElementById('profile-modal');
    
    if (!profileModal) {
        profileModal = createProfileModal();
    }
    
    // Set current values in the form if they exist
    if (EDUCATIONAL_PROFILE.school) {
        document.getElementById('school-select').value = EDUCATIONAL_PROFILE.school;
        updateGradeOptions(EDUCATIONAL_PROFILE.school);
    }
    
    if (EDUCATIONAL_PROFILE.grade) {
        document.getElementById('grade-select').value = EDUCATIONAL_PROFILE.grade;
    }
    
    if (EDUCATIONAL_PROFILE.semester) {
        document.getElementById('semester-select').value = EDUCATIONAL_PROFILE.semester;
    }
    
    // Show the modal
    profileModal.style.display = 'flex';
}

/**
 * Create the profile selection modal
 */
function createProfileModal() {
    const modal = document.createElement('div');
    modal.id = 'profile-modal';
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>请选择你当前的教育背景</h3>
                <button class="close-button" id="close-profile-modal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="profile-form">
                    <div class="form-group">
                        <label for="school-select">学校类型</label>
                        <select id="school-select" class="form-control" required>
                            <option value="" disabled selected>请选择</option>
                            <option value="小学">小学</option>
                            <option value="初中">初中</option>
                            <option value="高中">高中</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="grade-select">年级</label>
                        <select id="grade-select" class="form-control" required>
                            <option value="" disabled selected>请先选择学校类型</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="semester-select">学期</label>
                        <select id="semester-select" class="form-control" required>
                            <option value="" disabled selected>请选择</option>
                            <option value="上学期">上学期</option>
                            <option value="下学期">下学期</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">确认</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('close-profile-modal').addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    document.getElementById('school-select').addEventListener('change', (e) => {
        updateGradeOptions(e.target.value);
    });
    
    document.getElementById('profile-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveProfile();
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    return modal;
}

/**
 * Update grade options based on selected school
 */
function updateGradeOptions(school) {
    const gradeSelect = document.getElementById('grade-select');
    
    // Clear existing options
    gradeSelect.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '请选择';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    gradeSelect.appendChild(defaultOption);
    
    // Add grade options based on school
    if (school && GRADE_OPTIONS[school]) {
        GRADE_OPTIONS[school].forEach(grade => {
            const option = document.createElement('option');
            option.value = grade;
            option.textContent = grade;
            gradeSelect.appendChild(option);
        });
    }
}

/**
 * Save the selected profile
 */
function saveProfile() {
    const school = document.getElementById('school-select').value;
    const grade = document.getElementById('grade-select').value;
    const semester = document.getElementById('semester-select').value;
    
    if (school && grade && semester) {
        EDUCATIONAL_PROFILE.school = school;
        EDUCATIONAL_PROFILE.grade = grade;
        EDUCATIONAL_PROFILE.semester = semester;
        
        saveProfileToStorage();
        updateProfileDisplay();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initEducationalProfile); 