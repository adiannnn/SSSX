// 管理员端功能实现

// 加载系统统计仪表盘数据
function loadDashboardStats() {
    try {
        // 加载学生数据
        let studentsData = [];
        if (window.studentsData) {
            studentsData = window.studentsData.length ? window.studentsData : Object.values(window.studentsData);
        } else {
            studentsData = JSON.parse(localStorage.getItem('studentsData') || '[]');
        }
        
        // 加载导师数据
        let teachersData = [];
        if (window.teachersData) {
            teachersData = window.teachersData.length ? window.teachersData : Object.values(window.teachersData);
        } else {
            teachersData = JSON.parse(localStorage.getItem('teachersData') || '[]');
        }
        
        // 加载团队数据
        let teamsData = [];
        if (window.teamsData && window.teamsData.length > 0) {
            teamsData = window.teamsData;
        } else {
            try {
                if (window.loadTeamsData) {
                    teamsData = window.loadTeamsData();
                }
            } catch (e) {
                teamsData = JSON.parse(localStorage.getItem('teamsData') || '[]');
            }
        }
        
        // 加载匹配结果数据
        let matchingResultsData = [];
        if (window.matchingResultsData && window.matchingResultsData.length > 0) {
            matchingResultsData = window.matchingResultsData;
        } else {
            matchingResultsData = JSON.parse(localStorage.getItem('matchingResultsData') || '[]');
        }
        
        // 计算统计数据
        const studentCount = studentsData.filter(s => s).length;
        const teacherCount = teachersData.filter(t => t).length;
        const teamCount = teamsData.filter(t => t).length;
        
        // 计算匹配完成率
        let matchRate = 0;
        if (teamCount > 0) {
            matchRate = Math.round((matchingResultsData.length / teamCount) * 100);
        }
        
        // 更新仪表盘显示
        const dashboardNumbers = document.querySelectorAll('.dashboard-number');
        if (dashboardNumbers.length >= 4) {
            // 更新学生总数
            dashboardNumbers[0].textContent = studentCount;
            dashboardNumbers[0].nextElementSibling.querySelector('.progress-fill').style.width = `${Math.min(studentCount * 2, 100)}%`;
            
            // 更新导师总数
            dashboardNumbers[1].textContent = teacherCount;
            dashboardNumbers[1].nextElementSibling.querySelector('.progress-fill').style.width = `${Math.min(teacherCount * 5, 100)}%`;
            
            // 更新学生组总数
            dashboardNumbers[2].textContent = teamCount;
            dashboardNumbers[2].nextElementSibling.querySelector('.progress-fill').style.width = `${Math.min(teamCount * 10, 100)}%`;
            
            // 更新匹配完成率
            dashboardNumbers[3].textContent = `${matchRate}%`;
            dashboardNumbers[3].nextElementSibling.querySelector('.progress-fill').style.width = `${matchRate}%`;
        }
        
        console.log('仪表盘数据已更新:', {
            studentCount,
            teacherCount,
            teamCount,
            matchRate
        });
    } catch (error) {
        console.error('加载仪表盘统计数据时出错:', error);
    }
}

// 页面加载完成后执行
window.onload = function() {
    // 检查登录状态
    checkLoginStatus();
    
    // 加载系统统计仪表盘
    loadDashboardStats();
    
    // 加载学生列表
    loadStudentList();
    
    // 加载导师列表
    loadTeacherList();
    
    // 加载学生组列表
    loadTeamList();
    
    // 加载公告列表
    loadNotificationList();
    
    // 加载系统设置
    loadSystemSettings();
    
    // 加载学生志愿
    loadStudentPreferences();
    
    // 加载老师选择
    loadTeacherPreferences();
    
    // 加载匹配结果
    loadMatchingResults();
    
    // 检查URL哈希值，自动滚动到对应区域
    if (window.location.hash) {
        setTimeout(() => {
            const element = document.querySelector(window.location.hash);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                element.classList.add('highlight');
                setTimeout(() => element.classList.remove('highlight'), 2000);
            }
        }, 100);
    }
    
    // 绑定事件
    bindEvents();
    
    // 定期更新仪表盘数据（每30秒）
    setInterval(loadDashboardStats, 30000);
};

// 检查登录状态
function checkLoginStatus() {
    try {
        const user = localStorage.getItem('user');
        if (!user) {
            // 未登录，跳转到登录页
            window.location.href = 'index.html';
            return;
        }
        
        let userInfo = null;
        try {
            userInfo = JSON.parse(user);
            // 检查解析结果是否有效
            if (!userInfo || typeof userInfo !== 'object') {
                console.error('用户信息格式无效');
                localStorage.removeItem('user');
                window.location.href = 'index.html';
                return;
            }
        } catch (parseError) {
            console.error('解析用户信息失败:', parseError);
            localStorage.removeItem('user');
            window.location.href = 'index.html';
            return;
        }
        
        // 安全检查type属性
        if (userInfo.type !== 'admin') {
            // 不是管理员，跳转到对应页面
            if (userInfo.type === 'student') {
                window.location.href = 'student.html';
            } else if (userInfo.type === 'teacher') {
                window.location.href = 'teacher.html';
            } else {
                // 类型未知，清除用户信息并跳转到登录页
                localStorage.removeItem('user');
                window.location.href = 'index.html';
            }
        }
        
        // 显示用户名（确保名称存在）
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = userInfo.name || '管理员';
        }
    } catch (error) {
        console.error('检查登录状态时发生错误:', error);
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
}

// 加载学生列表
function loadStudentList() {
    const students = window.studentsData;
    const studentTableBody = document.getElementById('studentTableBody');
    
    studentTableBody.innerHTML = '';
    
    // 应用搜索和筛选
    const searchText = document.getElementById('studentSearch').value.toLowerCase();
    const gradeFilter = document.getElementById('studentGradeFilter').value;
    const majorFilter = document.getElementById('studentMajorFilter').value;
    
    const filteredStudents = students.filter(student => {
        const idMatch = student.id.toLowerCase().includes(searchText);
        const nameMatch = student.name.toLowerCase().includes(searchText);
        const gradeMatch = !gradeFilter || student.grade === gradeFilter;
        const majorMatch = !majorFilter || student.major === majorFilter;
        
        return (idMatch || nameMatch) && gradeMatch && majorMatch;
    });
    
    filteredStudents.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.grade}</td>
            <td>${student.major}</td>
            <td>${student.class}</td>
            <td>${student.phone || '-'}</td>
            <td>
                <button class="btn btn-sm btn-edit" onclick="editStudent('${student.id}')">编辑</button>
                <button class="btn btn-sm btn-delete" onclick="deleteStudent('${student.id}')">删除</button>
            </td>
        `;
        studentTableBody.appendChild(row);
    });
    
    // 更新专业下拉列表
    updateMajorFilterOptions();
}

// 加载导师列表
function loadTeacherList() {
    const teachers = window.teachersData;
    const teacherTableBody = document.getElementById('teacherTableBody');
    
    teacherTableBody.innerHTML = '';
    
    // 应用搜索和筛选
    const searchText = document.getElementById('teacherSearch').value.toLowerCase();
    const majorFilter = document.getElementById('teacherMajorFilter').value;
    
    const filteredTeachers = teachers.filter(teacher => {
        const idMatch = teacher.id.toLowerCase().includes(searchText);
        const nameMatch = teacher.name.toLowerCase().includes(searchText);
        const majorMatch = !majorFilter || teacher.major === majorFilter;
        
        return (idMatch || nameMatch) && majorMatch;
    });
    
    filteredTeachers.forEach(teacher => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${teacher.id}</td>
            <td>${teacher.name}</td>
            <td>${teacher.title}</td>
            <td>${teacher.major}</td>
            <td>${teacher.phone || '-'}</td>
            <td>${teacher.email || '-'}</td>
            <td>
                <button class="btn btn-sm btn-edit" onclick="editTeacher('${teacher.id}')">编辑</button>
                <button class="btn btn-sm btn-delete" onclick="deleteTeacher('${teacher.id}')">删除</button>
            </td>
        `;
        teacherTableBody.appendChild(row);
    });
    
    // 更新专业下拉列表
    updateTeacherMajorFilterOptions();
}

// 加载系统设置
function loadSystemSettings() {
    try {
        // 从localStorage加载系统设置
        const systemSettings = JSON.parse(localStorage.getItem('systemSettings') || '{}');
        
        // 设置权重值
        if (systemSettings.studentPrefWeight) {
            document.getElementById('studentPrefWeight').value = systemSettings.studentPrefWeight;
        }
        if (systemSettings.teacherPrefWeight) {
            document.getElementById('teacherPrefWeight').value = systemSettings.teacherPrefWeight;
        }
        if (systemSettings.researchMatchWeight) {
            document.getElementById('researchMatchWeight').value = systemSettings.researchMatchWeight;
        }
        if (systemSettings.maxStudentsPerTeacher) {
            document.getElementById('maxStudentsPerTeacher').value = systemSettings.maxStudentsPerTeacher;
        }
        if (systemSettings.minStudentsPerGroup) {
            document.getElementById('minStudentsPerGroup').value = systemSettings.minStudentsPerGroup;
        }
        
        // 设置截止时间
        if (systemSettings.studentTeamPrefDeadline) {
            document.getElementById('studentTeamPrefDeadline').value = systemSettings.studentTeamPrefDeadline;
        }
        if (systemSettings.teacherSelectionDeadline) {
            document.getElementById('teacherSelectionDeadline').value = systemSettings.teacherSelectionDeadline;
        }
    } catch (error) {
        console.error('加载系统设置时出错:', error);
    }
}

// 初始化学生组志愿和老师选择数据
function initPreferencesData() {
    // 初始化学生组志愿数据
    const storedData = localStorage.getItem('studentPreferencesData');
    if (storedData) {
        try {
            const parsedData = JSON.parse(storedData);
            // 确保studentPreferencesData是一个数组
            window.studentPreferencesData = Array.isArray(parsedData) ? parsedData : [];
            console.log('已从localStorage加载学生组志愿数据，共', window.studentPreferencesData.length, '条记录');
        } catch (error) {
            console.error('解析学生组志愿数据出错:', error);
            window.studentPreferencesData = [];
        }
    } else if (!window.studentPreferencesData || !Array.isArray(window.studentPreferencesData)) {
        window.studentPreferencesData = [];
        console.log('初始化空的学生组志愿数据数组');
    }
    
    // 初始化老师选择数据
    if (!window.teacherPreferencesData) {
        const storedData = localStorage.getItem('teacherPreferencesData');
        window.teacherPreferencesData = storedData ? JSON.parse(storedData) : [];
    }
}

// 保存学生组志愿数据
function saveStudentPreferencesData(data) {
    // 确保data是一个数组
    if (!Array.isArray(data)) {
        console.error('保存学生组志愿数据失败：数据必须是数组');
        return;
    }
    
    window.studentPreferencesData = data;
    localStorage.setItem('studentPreferencesData', JSON.stringify(data));
    console.log('学生组志愿数据已保存到localStorage，共', data.length, '条记录');
}

// 保存老师选择数据
function saveTeacherPreferencesData(data) {
    window.teacherPreferencesData = data;
    localStorage.setItem('teacherPreferencesData', JSON.stringify(data));
}

// 加载学生组志愿数据
function loadStudentPreferences() {
    // 确保数据已初始化
    initPreferencesData();
    
    // 直接从localStorage加载数据，不依赖于可能未定义的函数
    const teamsData = JSON.parse(localStorage.getItem('teamsData') || '[]');
    const studentsData = JSON.parse(localStorage.getItem('studentsData') || '[]');
    const teachersData = JSON.parse(localStorage.getItem('teachersData') || '[]');
    
    // 直接从localStorage获取最新的学生组志愿数据，而不仅仅依赖于window.studentPreferencesData
    const rawPreferencesData = localStorage.getItem('studentPreferencesData');
    let preferencesData = [];
    
    try {
        preferencesData = rawPreferencesData ? JSON.parse(rawPreferencesData) : [];
        // 确保是数组
        if (!Array.isArray(preferencesData)) {
            console.error('学生组志愿数据不是数组类型，重置为空数组');
            preferencesData = [];
        }
        // 更新window对象中的数据，确保全局一致性
        window.studentPreferencesData = preferencesData;
    } catch (error) {
        console.error('解析学生组志愿数据出错:', error);
        preferencesData = [];
        window.studentPreferencesData = [];
    }
    
    const tableBody = document.getElementById('studentPrefTableBody');
    const emptyState = document.getElementById('emptyStudentPrefState');
    
    // 获取搜索和筛选条件
    const searchText = document.getElementById('studentPrefSearch')?.value.toLowerCase() || '';
    const gradeFilter = document.getElementById('studentPrefGradeFilter')?.value || '';
    const majorFilter = document.getElementById('studentPrefMajorFilter')?.value || '';
    
    tableBody.innerHTML = '';
    console.log('从localStorage直接加载的学生组志愿数据数量:', preferencesData.length);
    
    // 辅助函数：获取学生信息
    function getStudentInfo(studentId) {
        return studentsData.find(s => s.id === studentId) || { name: studentId, major: '', grade: '' };
    }
    
    // 辅助函数：获取老师信息
    function getTeacherInfo(teacherId) {
        return teachersData.find(t => t.id === teacherId) || { name: teacherId };
    }
    
    // 辅助函数：获取团队成员的专业和年级
    function getTeamMajorAndGrade(teamMembers) {
        if (!teamMembers || teamMembers.length === 0) {
            return { major: '', grade: '' };
        }
        // 假设团队成员的专业和年级相同，使用第一个成员的信息
        const firstMember = getStudentInfo(teamMembers[0]);
        return { major: firstMember.major || '', grade: firstMember.grade || '' };
    }
    
    // 即使有数据，也要确保能正确显示
    console.log('学生组志愿数据数量:', preferencesData.length);
    console.log('团队数据数量:', teamsData.length);
    
    if (preferencesData.length > 0) {
        // 应用筛选条件
        const filteredPreferences = preferencesData.filter(pref => {
            const team = teamsData.find(t => t.id === pref.teamId) || { id: pref.teamId, name: '未知团队', members: [] };
            const teamInfo = getTeamMajorAndGrade(team.members);
            
            // 搜索条件匹配
            const searchMatch = team.name.toLowerCase().includes(searchText);
            
            // 年级筛选匹配
            const gradeMatch = !gradeFilter || teamInfo.grade === gradeFilter;
            
            // 专业筛选匹配
            const majorMatch = !majorFilter || teamInfo.major === majorFilter;
            
            return searchMatch && gradeMatch && majorMatch;
        });
        
        // 显示表格，隐藏空状态
        if (filteredPreferences.length > 0) {
            tableBody.parentElement.style.display = 'table';
            emptyState.style.display = 'none';
            
            filteredPreferences.forEach(pref => {
                const team = teamsData.find(t => t.id === pref.teamId) || { id: pref.teamId, name: '未知团队', members: [], direction: '' };
                const row = document.createElement('tr');
                
                // 获取团队成员信息
                const members = team.members || [];
                const memberNames = members.map(m => {
                    const student = getStudentInfo(m);
                    return student.name;
                }).join(', ');
                
                // 获取组长信息
                const leaderName = members.length > 0 ? getStudentInfo(members[0]).name : '-';
                
                // 获取志愿信息
                const preferences = pref.preferences || [];
                const firstPrefName = preferences[0] ? getTeacherInfo(preferences[0]).name : '-';
                const secondPrefName = preferences[1] ? getTeacherInfo(preferences[1]).name : '-';
                const thirdPrefName = preferences[2] ? getTeacherInfo(preferences[2]).name : '-';
                
                row.innerHTML = `
                    <td>${team.id}</td>
                    <td>${team.name}</td>
                    <td>${leaderName}</td>
                    <td>${memberNames || '-'}</td>
                    <td>${team.direction || '-'}</td>
                    <td>${firstPrefName}</td>
                    <td>${secondPrefName}</td>
                    <td>${thirdPrefName}</td>
                    <td>${pref.submitDate || '-'}</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            // 没有匹配的结果
            tableBody.parentElement.style.display = 'none';
            emptyState.style.display = 'block';
        }
    } else {
        // 隐藏表格，显示空状态
        tableBody.parentElement.style.display = 'none';
        emptyState.style.display = 'block';
    }
    
    // 更新年级和专业下拉列表
    updateStudentPrefGradeFilterOptions();
    updateStudentPrefMajorFilterOptions();
    
    // 绑定搜索事件（避免重复绑定）
    if (document.getElementById('studentPrefSearch')) {
        const searchInput = document.getElementById('studentPrefSearch');
        // 移除旧的事件监听器
        const newSearchInput = searchInput.cloneNode(true);
        searchInput.parentNode.replaceChild(newSearchInput, searchInput);
        newSearchInput.addEventListener('input', filterStudentPreferences);
    }
    if (document.getElementById('studentPrefGradeFilter')) {
        const gradeFilter = document.getElementById('studentPrefGradeFilter');
        const newGradeFilter = gradeFilter.cloneNode(true);
        gradeFilter.parentNode.replaceChild(newGradeFilter, gradeFilter);
        newGradeFilter.addEventListener('change', filterStudentPreferences);
    }
    if (document.getElementById('studentPrefMajorFilter')) {
        const majorFilter = document.getElementById('studentPrefMajorFilter');
        const newMajorFilter = majorFilter.cloneNode(true);
        majorFilter.parentNode.replaceChild(newMajorFilter, majorFilter);
        newMajorFilter.addEventListener('change', filterStudentPreferences);
    }
}

// 筛选学生组志愿
function filterStudentPreferences() {
    loadStudentPreferences();
}

// 加载老师选择数据
function loadTeacherPreferences() {
    // 确保数据已初始化
    initPreferencesData();
    
    // 直接从localStorage加载数据，不依赖于可能未定义的函数
    const teachersData = JSON.parse(localStorage.getItem('teachersData') || '[]');
    const teamsData = JSON.parse(localStorage.getItem('teamsData') || '[]');
    const preferencesData = window.teacherPreferencesData;
    const tableBody = document.getElementById('teacherPrefTableBody');
    const emptyState = document.getElementById('emptyTeacherPrefState');
    
    tableBody.innerHTML = '';
    
    // 辅助函数：获取团队信息
    function getTeamInfo(teamId) {
        return teamsData.find(t => t.id === teamId) || { name: teamId };
    }
    
    // 即使有数据，也要确保能正确显示
    console.log('老师选择数据数量:', preferencesData.length);
    console.log('老师数据数量:', teachersData.length);
    
    if (preferencesData.length > 0) {
        // 显示表格，隐藏空状态
        tableBody.parentElement.style.display = 'table';
        emptyState.style.display = 'none';
        
        preferencesData.forEach(pref => {
            const teacher = teachersData.find(t => t.id === pref.teacherId) || { id: pref.teacherId, name: '未知老师', title: '', major: '', research: '' };
            const row = document.createElement('tr');
            
            // 获取选择的学生组信息
            const selectedGroups = pref.selectedGroups || [];
            const groupNames = selectedGroups.map(gId => {
                const team = getTeamInfo(gId);
                return team.name;
            }).join(', ');
            
            row.innerHTML = `
                <td>${teacher.id}</td>
                <td>${teacher.name}</td>
                <td>${teacher.title || '-'}</td>
                <td>${teacher.major || '-'}</td>
                <td>${teacher.research || '-'}</td>
                <td>${groupNames || '-'}</td>
                <td>${pref.submitDate || '-'}</td>
            `;
            tableBody.appendChild(row);
        });
    } else {
        // 隐藏表格，显示空状态
        tableBody.parentElement.style.display = 'none';
        emptyState.style.display = 'block';
    }
    
    // 绑定搜索事件
    if (document.getElementById('teacherPrefSearch')) {
        document.getElementById('teacherPrefSearch').addEventListener('input', filterTeacherPreferences);
    }
    if (document.getElementById('teacherPrefMajorFilter')) {
        document.getElementById('teacherPrefMajorFilter').addEventListener('change', filterTeacherPreferences);
    }
}

// 筛选老师选择
function filterTeacherPreferences() {
    // 实现筛选逻辑
    loadTeacherPreferences();
}

// 加载学生组列表
function loadTeamList() {
    // 加载团队数据
    const teamsData = window.loadTeamsData();
    const teamTableBody = document.getElementById('teamTableBody');
    const emptyTeamState = document.getElementById('emptyTeamState');
    
    teamTableBody.innerHTML = '';
    
    // 应用搜索和筛选
    const searchText = document.getElementById('teamSearch') ? document.getElementById('teamSearch').value.toLowerCase() : '';
    const gradeFilter = document.getElementById('teamGradeFilter') ? document.getElementById('teamGradeFilter').value : '';
    
    // 如果没有团队数据
    if (!teamsData || teamsData.length === 0) {
        emptyTeamState.style.display = 'block';
        return;
    }
    
    emptyTeamState.style.display = 'none';
    
    // 对团队数据进行筛选
    const filteredTeams = teamsData.filter(team => {
        // 搜索条件匹配
        const nameMatch = team.name ? team.name.toLowerCase().includes(searchText) : false;
        
        // 检查成员是否匹配搜索文本
        let memberMatch = false;
        if (team.members && team.members.length > 0) {
            memberMatch = team.members.some(memberId => {
                const member = window.getStudentById(memberId);
                return member && (member.name.toLowerCase().includes(searchText) || member.id.toLowerCase().includes(searchText));
            });
        }
        
        // 年级筛选
        let gradeMatch = true;
        if (gradeFilter) {
            gradeMatch = team.members && team.members.some(memberId => {
                const member = window.getStudentById(memberId);
                return member && member.grade === gradeFilter;
            });
        }
        
        return (nameMatch || memberMatch) && gradeMatch;
    });
    
    filteredTeams.forEach(team => {
        const row = document.createElement('tr');
        
        // 获取组长信息
        let leaderName = '-';
        if (team.leaderId) {
            const leader = window.getStudentById(team.leaderId);
            leaderName = leader ? leader.name : '-';
        }
        
        // 获取成员列表
        let memberList = '';
        if (team.members && team.members.length > 0) {
            memberList = team.members.map(memberId => {
                const member = window.getStudentById(memberId);
                return member ? member.name : memberId;
            }).join(', ');
        }
        
        row.innerHTML = `
            <td>${team.id || '-'}</td>
            <td>${team.name || '-'}</td>
            <td>${leaderName}</td>
            <td>${team.members ? team.members.length : 0}</td>
            <td>${memberList}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewTeamDetails('${team.id}')">查看详情</button>
            </td>
        `;
        teamTableBody.appendChild(row);
    });
}

// 查看学生组详情
function viewTeamDetails(teamId) {
    const teamsData = window.loadTeamsData();
    const team = teamsData.find(t => t.id === teamId);
    
    if (!team) {
        alert('找不到该学生组信息');
        return;
    }
    
    // 构建详情信息
    let details = `学生组详情\n\n`;
    details += `组ID: ${team.id}\n`;
    details += `组名: ${team.name || '-'}\n\n`;
    
    // 组长信息
    if (team.leaderId) {
        const leader = window.getStudentById(team.leaderId);
        if (leader) {
            details += `组长信息:\n`;
            details += `  学号: ${leader.id}\n`;
            details += `  姓名: ${leader.name}\n`;
            details += `  年级: ${leader.grade}\n`;
            details += `  专业: ${leader.major}\n`;
        }
    } else {
        details += `组长: 无\n`;
    }
    
    // 成员列表
    details += `\n成员列表(${team.members ? team.members.length : 0}人):\n`;
    if (team.members && team.members.length > 0) {
        team.members.forEach((memberId, index) => {
            const member = window.getStudentById(memberId);
            if (member) {
                details += `  ${index + 1}. ${member.name} (${member.id})\n`;
            } else {
                details += `  ${index + 1}. ${memberId} (信息未找到)\n`;
            }
        });
    }
    
    alert(details);
}

// 加载匹配结果
function loadMatchingResults() {
    // 首先从localStorage加载匹配结果，如果window对象中没有
    if (!window.matchingResultsData || window.matchingResultsData.length === 0) {
        try {
            const storedResults = localStorage.getItem('matchingResultsData');
            if (storedResults) {
                window.matchingResultsData = JSON.parse(storedResults);
                console.log('已从localStorage加载匹配结果，共', window.matchingResultsData.length, '条记录');
            } else {
                window.matchingResultsData = [];
                console.log('未找到匹配结果数据');
            }
        } catch (error) {
            console.error('加载匹配结果出错:', error);
            window.matchingResultsData = [];
        }
    }
    
    const results = window.matchingResultsData || [];
    const resultTableBody = document.getElementById('resultTableBody');
    const emptyState = document.getElementById('emptyResultState');
    
    // 确保DOM元素存在
    if (!resultTableBody) {
        console.error('未找到resultTableBody元素');
        return;
    }
    
    resultTableBody.innerHTML = '';
    
    if (results.length > 0) {
        // 显示表格，隐藏空状态
        if (resultTableBody.parentElement) {
            resultTableBody.parentElement.style.display = 'table';
        }
        if (emptyState) {
            emptyState.style.display = 'none';
        }
        
        results.forEach(result => {
            const team = window.getTeamById(result.teamId);
            const teacher = window.getTeacherById(result.teacherId);
            
            if (team && teacher) {
                const row = document.createElement('tr');
                
                // 获取团队成员
                const teamMembers = team.members || [];
                // 正确获取团队成员名称，通过学生ID查询详细信息
                const memberList = teamMembers.map(memberId => {
                    const member = window.getStudentById(memberId);
                    return member ? member.name : '未知成员';
                }).join(', ');
                
                row.innerHTML = `
                    <td>${team.name}</td>
                    <td>${memberList}</td>
                    <td>${team.topic.name}</td>
                    <td>${teacher.name}</td>
                    <td>${result.score ? result.score.toFixed(2) : '0.00'}</td>
                    <td>
                        <button class="btn btn-sm btn-info view-details" data-id="${result.id}">详情</button>
                        <button class="btn btn-sm btn-secondary edit-result" data-id="${result.id}">编辑</button>
                    </td>
                `;
                resultTableBody.appendChild(row);
            }
        });
        
        // 绑定操作按钮事件
        document.querySelectorAll('.view-details').forEach(btn => {
            btn.addEventListener('click', function() {
                const resultId = this.getAttribute('data-id');
                viewResultDetails(resultId);
            });
        });
        
        document.querySelectorAll('.edit-result').forEach(btn => {
            btn.addEventListener('click', function() {
                const resultId = this.getAttribute('data-id');
                editMatchingResult(resultId);
            });
        });
    } else {
        // 隐藏表格，显示空状态
        if (resultTableBody.parentElement) {
            resultTableBody.parentElement.style.display = 'none';
        }
        if (emptyState) {
            emptyState.style.display = 'block';
        }
    }
}

// 查看匹配结果详情
function viewResultDetails(resultId) {
    // 获取匹配结果详情
    const result = window.matchingResultsData.find(r => r.id === resultId);
    if (result) {
        const team = window.getTeamById(result.teamId);
        const teacher = window.getTeacherById(result.teacherId);
        
        if (team && teacher) {
            // 创建详情模态框内容
            const detailsModal = document.createElement('div');
            detailsModal.className = 'modal';
            detailsModal.innerHTML = `
                <div class="modal-backdrop"></div>
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>匹配结果详情</h3>
                            <span class="close-modal">&times;</span>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label>团队名称：</label>
                                <span class="form-value">${team.name}</span>
                            </div>
                            <div class="form-group">
                                <label>团队成员：</label>
                                <ul class="member-list">
                                    ${team.members && team.members.length > 0 
                                        ? team.members.map(m => `<li>${m.name} (${m.id})</li>`).join('') 
                                        : '<li>无</li>'}
                                </ul>
                            </div>
                            <div class="form-group">
                                <label>毕业设计题目：</label>
                                <span class="form-value">${team.topic.name}</span>
                            </div>
                            <div class="form-group">
                                <label>导师姓名：</label>
                                <span class="form-value">${teacher.name}</span>
                            </div>
                            <div class="form-group">
                                <label>匹配得分：</label>
                                <span class="form-value">${result.score ? result.score.toFixed(2) : '0.00'}</span>
                            </div>
                            ${result.notes ? `<div class="form-group"><label>备注：</label><span class="form-value">${result.notes}</span></div>` : ''}
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary close-btn">关闭</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(detailsModal);
            detailsModal.style.display = 'block';
            
            // 绑定关闭事件
            detailsModal.querySelector('.close-modal').addEventListener('click', () => {
                document.body.removeChild(detailsModal);
            });
            detailsModal.querySelector('.modal-backdrop').addEventListener('click', () => {
                document.body.removeChild(detailsModal);
            });
            detailsModal.querySelector('.close-btn').addEventListener('click', () => {
                document.body.removeChild(detailsModal);
            });
        }
    }
}

// 添加缺失的getTeacherById函数
function getTeacherById(id) {
    return window.teachersData.find(teacher => teacher.id === id);
}

// 添加到window对象，使其成为全局可访问
window.getTeacherById = getTeacherById;

// 实现编辑匹配结果功能
function editMatchingResult(resultId) {
    // 获取匹配结果
    const result = window.matchingResultsData.find(r => r.id === resultId);
    if (!result) {
        alert('未找到匹配结果');
        return;
    }
    
    // 获取团队和教师信息
    const team = window.getTeamById(result.teamId);
    const currentTeacher = getTeacherById(result.teacherId);
    
    if (!team) {
        alert('未找到团队信息');
        return;
    }
    
    // 创建或获取模态框
    let modal = document.getElementById('editMatchResultModal');
    if (!modal) {
        // 创建模态框HTML
        modal = document.createElement('div');
        modal.id = 'editMatchResultModal';
        modal.className = 'modal';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>编辑匹配结果</h3>
                        <span class="close-modal" onclick="document.getElementById('editMatchResultModal').style.display='none'">&times;</span>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="editResultId">
                        <div class="form-group">
                            <label>团队名称</label>
                            <input type="text" id="editTeamName" class="form-control" readonly>
                        </div>
                        <div class="form-group">
                            <label>团队成员</label>
                            <input type="text" id="editTeamMembers" class="form-control" readonly>
                        </div>
                        <div class="form-group">
                            <label>毕业设计题目</label>
                            <input type="text" id="editTeamTopic" class="form-control" readonly>
                        </div>
                        <div class="form-group">
                            <label>当前指导老师</label>
                            <input type="text" id="editCurrentTeacher" class="form-control" readonly>
                        </div>
                        <div class="form-group">
                            <label for="editNewTeacher">选择新指导老师</label>
                            <select id="editNewTeacher" class="form-control" required>
                                <!-- 教师列表将通过JavaScript动态生成 -->
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="document.getElementById('editMatchResultModal').style.display='none'">取消</button>
                        <button class="btn btn-primary" onclick="saveEditedMatchResult()">保存修改</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // 填充模态框数据
    document.getElementById('editResultId').value = resultId;
    document.getElementById('editTeamName').value = team.name;
    
    // 获取团队成员列表
    const teamMembers = team.members || [];
    const memberNames = teamMembers.map(memberId => {
        const member = window.studentsData.find(s => s.id === memberId);
        return member ? member.name : '未知成员';
    }).join(', ');
    document.getElementById('editTeamMembers').value = memberNames;
    
    document.getElementById('editTeamTopic').value = team.topic ? team.topic.name : '未设置';
    document.getElementById('editCurrentTeacher').value = currentTeacher ? currentTeacher.name : '未分配';
    
    // 填充教师下拉列表
    const teacherSelect = document.getElementById('editNewTeacher');
    teacherSelect.innerHTML = '';
    
    // 添加空选项
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = '请选择指导老师';
    teacherSelect.appendChild(emptyOption);
    
    // 添加所有教师选项
    window.teachersData.forEach(teacher => {
        const option = document.createElement('option');
        option.value = teacher.id;
        option.textContent = teacher.name;
        option.selected = teacher.id === result.teacherId;
        teacherSelect.appendChild(option);
    });
    
    // 显示模态框
    modal.style.display = 'block';
}

// 保存编辑后的匹配结果
function saveEditedMatchResult() {
    const resultId = document.getElementById('editResultId').value;
    const newTeacherId = document.getElementById('editNewTeacher').value;
    
    if (!newTeacherId) {
        alert('请选择指导老师');
        return;
    }
    
    // 查找匹配结果并更新
    const resultIndex = window.matchingResultsData.findIndex(r => r.id === resultId);
    if (resultIndex === -1) {
        alert('未找到匹配结果');
        return;
    }
    
    // 更新教师ID
    const oldTeacherId = window.matchingResultsData[resultIndex].teacherId;
    window.matchingResultsData[resultIndex].teacherId = newTeacherId;
    
    // 重新计算匹配得分（可选，如果需要的话）
    // 这里可以调用matching.js中的计算函数重新计算得分
    
    // 保存到localStorage - 这是同步到学生端和老师端的关键
    localStorage.setItem('matchingResultsData', JSON.stringify(window.matchingResultsData));
    
    // 记录修改日志（可选）
    const logEntry = {
        timestamp: new Date().toISOString(),
        action: '修改匹配结果',
        resultId: resultId,
        oldTeacherId: oldTeacherId,
        newTeacherId: newTeacherId
    };
    
    // 保存操作日志
    let operationLogs = JSON.parse(localStorage.getItem('operationLogs') || '[]');
    operationLogs.push(logEntry);
    localStorage.setItem('operationLogs', JSON.stringify(operationLogs));
    
    // 刷新管理员端表格
    loadMatchingResults();
    
    // 关闭模态框
    document.getElementById('editMatchResultModal').style.display = 'none';
    
    // 提示成功并告知用户数据已同步
    alert('编辑成功！修改已同步到学生端和老师端。');
}

// 将函数添加到window对象
window.saveEditedMatchResult = saveEditedMatchResult;

// 绑定事件
// 加载公告列表
function loadNotificationList() {
    try {
        // 从localStorage获取公告数据
        const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
        window.notificationsData = notifications;
        
        // 清空表格内容
        const tableBody = document.getElementById('notificationTableBody');
        tableBody.innerHTML = '';
        
        // 反向排序，最新的公告显示在前面
        const sortedNotifications = [...notifications].sort((a, b) => 
            new Date(b.publishTime) - new Date(a.publishTime)
        );
        
        // 填充表格
        sortedNotifications.forEach(notification => {
            const row = document.createElement('tr');
            
            // 限制内容显示长度
            const shortContent = notification.content.length > 50 ? 
                notification.content.substring(0, 50) + '...' : notification.content;
            
            row.innerHTML = `
                <td>${notification.title}</td>
                <td>${shortContent}</td>
                <td>${new Date(notification.publishTime).toLocaleString('zh-CN')}</td>
                <td>${notification.publisher}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteNotification('${notification.id}')">删除</button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('加载公告列表失败:', error);
        showMessage('加载公告列表失败', 'error');
    }
}

// 打开添加公告模态框
function openNotificationModal() {
    // 清空表单
    document.getElementById('notificationTitle').value = '';
    document.getElementById('notificationContent').value = '';
    
    // 显示模态框
    const modal = document.getElementById('addNotificationModal');
    modal.style.display = 'block';
    
    // 添加关闭事件监听
    const closeButtons = modal.querySelectorAll('.close-btn, .btn-secondary');
    closeButtons.forEach(button => {
        button.onclick = function() {
            modal.style.display = 'none';
        };
    });
}

// 保存公告
function saveNotification() {
    try {
        const title = document.getElementById('notificationTitle').value.trim();
        const content = document.getElementById('notificationContent').value.trim();
        
        if (!title || !content) {
            showMessage('请填写公告标题和内容', 'warning');
            return;
        }
        
        // 获取当前用户信息
        const userInfo = JSON.parse(localStorage.getItem('user'));
        
        // 创建新公告对象
        const newNotification = {
            id: 'notif_' + Date.now(),
            title: title,
            content: content,
            publishTime: new Date().toISOString(),
            publisher: userInfo ? userInfo.name : '管理员'
        };
        
        // 获取现有公告列表
        let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
        
        // 添加新公告
        notifications.push(newNotification);
        
        // 保存到localStorage
        localStorage.setItem('notifications', JSON.stringify(notifications));
        
        // 更新全局数据
        window.notificationsData = notifications;
        
        // 重新加载公告列表
        loadNotificationList();
        
        // 关闭模态框
        document.getElementById('addNotificationModal').style.display = 'none';
        
        showMessage('公告发布成功', 'success');
        
    } catch (error) {
        console.error('保存公告失败:', error);
        showMessage('公告发布失败', 'error');
    }
}

// 删除公告
function deleteNotification(id) {
    if (!confirm('确定要删除这条公告吗？')) {
        return;
    }
    
    try {
        // 获取现有公告列表
        let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
        
        // 过滤掉要删除的公告
        notifications = notifications.filter(notification => notification.id !== id);
        
        // 保存到localStorage
        localStorage.setItem('notifications', JSON.stringify(notifications));
        
        // 更新全局数据
        window.notificationsData = notifications;
        
        // 重新加载公告列表
        loadNotificationList();
        
        showMessage('公告删除成功', 'success');
        
    } catch (error) {
        console.error('删除公告失败:', error);
        showMessage('公告删除失败', 'error');
    }
}

// 搜索公告
function searchNotifications() {
    const searchTerm = document.getElementById('notificationSearch').value.toLowerCase();
    
    try {
        // 从localStorage获取公告数据
        const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
        
        // 过滤公告
        const filteredNotifications = notifications.filter(notification => 
            notification.title.toLowerCase().includes(searchTerm) ||
            notification.content.toLowerCase().includes(searchTerm)
        );
        
        // 清空表格内容
        const tableBody = document.getElementById('notificationTableBody');
        tableBody.innerHTML = '';
        
        // 反向排序，最新的公告显示在前面
        const sortedNotifications = [...filteredNotifications].sort((a, b) => 
            new Date(b.publishTime) - new Date(a.publishTime)
        );
        
        // 填充表格
        sortedNotifications.forEach(notification => {
            const row = document.createElement('tr');
            
            // 限制内容显示长度
            const shortContent = notification.content.length > 50 ? 
                notification.content.substring(0, 50) + '...' : notification.content;
            
            row.innerHTML = `
                <td>${notification.title}</td>
                <td>${shortContent}</td>
                <td>${new Date(notification.publishTime).toLocaleString('zh-CN')}</td>
                <td>${notification.publisher}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteNotification('${notification.id}')">删除</button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('搜索公告失败:', error);
    }
}

function bindEvents() {
    // 退出登录按钮事件
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
    
    // 公告相关事件绑定
    if (document.getElementById('addNotificationBtn')) {
        document.getElementById('addNotificationBtn').addEventListener('click', openNotificationModal);
    }
    
    if (document.getElementById('saveNotificationBtn')) {
        document.getElementById('saveNotificationBtn').addEventListener('click', saveNotification);
    }
    
    if (document.getElementById('notificationSearch')) {
        document.getElementById('notificationSearch').addEventListener('input', searchNotifications);
    }
    
    // 添加学生按钮
    document.getElementById('addStudentBtn').addEventListener('click', function() {
        document.getElementById('studentModalTitle').textContent = '添加学生';
        document.getElementById('studentIdInput').disabled = false;
        clearStudentForm();
        document.getElementById('studentModal').style.display = 'block';
    });
    
    // 导入Excel按钮事件
    document.getElementById('importExcelBtn').addEventListener('click', function() {
        openModal('excelImportModal');
        resetImportModal();
    });

    // 添加下载模板按钮事件
    if (document.getElementById('downloadTemplateBtn')) {
        document.getElementById('downloadTemplateBtn').addEventListener('click', downloadExcelTemplate);
    }
    
    // 取消导入按钮事件
    document.getElementById('cancelImportBtn').addEventListener('click', function() {
        closeModal('excelImportModal');
    });
    
    // 模态框关闭按钮和背景点击事件
    bindModalClose('excelImportModal');
    bindModalClose('importResultModal');
    
    // 关闭结果模态框按钮
    document.getElementById('closeResultBtn').addEventListener('click', function() {
        closeModal('importResultModal');
    });
    
    // 确认导入按钮事件
    document.getElementById('confirmImportBtn').addEventListener('click', handleExcelImport);
    
    // 关闭结果按钮事件
    document.getElementById('closeResultBtn').addEventListener('click', function() {
        document.getElementById('importResultModal').style.display = 'none';
    });
    
    // 文件上传区域点击事件
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('excelFileInput');
    
    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });
    
    // 添加全局变量存储当前选择的文件
    let selectedFile = null;
    
    // 文件选择事件
    fileInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const fileName = file.name;
            const fileExtension = fileName.split('.').pop().toLowerCase();
            
            // 验证文件格式
            if (fileExtension === 'xlsx' || fileExtension === 'xls') {
                const fileNameDisplay = document.getElementById('fileNameDisplay');
                fileNameDisplay.textContent = fileName;
                fileNameDisplay.style.display = 'block';
                document.getElementById('selectedFileInfo').style.display = 'block';
                
                // 保存选择的文件到全局变量
                selectedFile = file;
                
                // 显示导入按钮
                document.getElementById('confirmImportBtn').disabled = false;
            } else {
                showNotification('请选择.xlsx或.xls格式的文件', 'error');
                // 重置文件输入和全局变量
                fileInput.value = '';
                selectedFile = null;
            }
        }
    });
    
    // 拖拽上传事件
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            const fileName = file.name;
            const fileExtension = fileName.split('.').pop().toLowerCase();
            
            // 验证文件格式
            if (fileExtension === 'xlsx' || fileExtension === 'xls') {
                const fileNameDisplay = document.getElementById('fileNameDisplay');
                fileNameDisplay.textContent = fileName;
                fileNameDisplay.style.display = 'block';
                document.getElementById('selectedFileInfo').style.display = 'block';
                
                // 设置文件到input中，使确认按钮可以获取到文件
                fileInput.files = e.dataTransfer.files;
                // 同时保存到全局变量
                selectedFile = file;
                
                // 显示导入按钮
                document.getElementById('confirmImportBtn').disabled = false;
            } else {
                showNotification('请选择.xlsx或.xls格式的文件', 'error');
                // 重置文件输入和全局变量
                fileInput.value = '';
                selectedFile = null;
            }
        }
    });
    
    // 添加导师按钮
    document.getElementById('addTeacherBtn').addEventListener('click', function() {
        document.getElementById('teacherModalTitle').textContent = '添加导师';
        document.getElementById('teacherIdInput').disabled = false;
        clearTeacherForm();
        document.getElementById('teacherModal').style.display = 'block';
    });
    
    // 保存学生信息
    document.getElementById('saveStudentBtn').addEventListener('click', function() {
        saveStudent();
    });
    
    // 保存导师信息
    document.getElementById('saveTeacherBtn').addEventListener('click', function() {
        saveTeacher();
    });
    
    // 关闭模态框
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            document.getElementById('studentModal').style.display = 'none';
            document.getElementById('teacherModal').style.display = 'none';
        });
    });
    
    // 为取消按钮绑定事件
    const cancelStudentBtn = document.getElementById('cancelStudentBtn');
    const cancelTeacherBtn = document.getElementById('cancelTeacherBtn');
    if (cancelStudentBtn) {
        cancelStudentBtn.addEventListener('click', function() {
            document.getElementById('studentModal').style.display = 'none';
        });
    }
    if (cancelTeacherBtn) {
        cancelTeacherBtn.addEventListener('click', function() {
            document.getElementById('teacherModal').style.display = 'none';
        });
    }
    
    // 绑定事件
    document.getElementById('studentSearch').addEventListener('input', loadStudentList);
    document.getElementById('studentGradeFilter').addEventListener('change', loadStudentList);
    document.getElementById('studentMajorFilter').addEventListener('change', loadStudentList);
    
    // 导师搜索和筛选事件
    document.getElementById('teacherSearch').addEventListener('input', loadTeacherList);
    document.getElementById('teacherMajorFilter').addEventListener('change', loadTeacherList);
    
    // 学生组搜索和筛选事件
    if (document.getElementById('teamSearch')) {
        document.getElementById('teamSearch').addEventListener('input', loadTeamList);
    }
    if (document.getElementById('teamGradeFilter')) {
        document.getElementById('teamGradeFilter').addEventListener('change', loadTeamList);
    }
    
    // 保存系统设置
    document.getElementById('saveSettingsBtn').addEventListener('click', function() {
        saveSystemSettings();
        showNotification('设置保存成功！', 'success');
    });
    
    // 运行匹配
    document.getElementById('runMatchingBtn').addEventListener('click', runMatching);
    
    // 重置匹配结果
    document.getElementById('resetMatchingBtn').addEventListener('click', resetMatchingResults);
    
    // 导出结果
    document.getElementById('exportResultBtn').addEventListener('click', function() {
        if (window.matchingResultsData && window.matchingResultsData.length > 0) {
            showNotification('正在导出匹配结果...', 'info');
            // 延迟执行导出，以便用户看到提示
            setTimeout(() => {
                exportResults();
                showNotification('导出成功！', 'success');
            }, 500);
        } else {
            showNotification('暂无匹配结果可导出', 'error');
        }
    });
}

// 更新专业下拉列表
function updateMajorFilterOptions() {
    const students = window.studentsData;
    const majorFilter = document.getElementById('studentMajorFilter');
    
    // 获取所有专业
    const majors = [...new Set(students.map(student => student.major))];
    
    // 清空并添加默认选项
    majorFilter.innerHTML = '<option value="">全部专业</option>';
    
    // 添加专业选项
    majors.forEach(major => {
        const option = document.createElement('option');
        option.value = major;
        option.textContent = major;
        majorFilter.appendChild(option);
    });
    
    // 同样更新导师端的专业下拉列表
    updateTeacherMajorFilterOptions();
}

// 更新导师专业下拉列表
function updateTeacherMajorFilterOptions() {
    const teachers = window.teachersData;
    const majorFilter = document.getElementById('teacherMajorFilter');
    
    // 获取所有专业
    const majors = [...new Set(teachers.map(teacher => teacher.major))];
    
    // 清空并添加默认选项
    majorFilter.innerHTML = '<option value="">全部专业</option>';
    
    // 添加专业选项
    majors.forEach(major => {
        const option = document.createElement('option');
        option.value = major;
        option.textContent = major;
        majorFilter.appendChild(option);
    });
}

// 更新学生志愿年级下拉列表
function updateStudentPrefGradeFilterOptions() {
    const teamsData = JSON.parse(localStorage.getItem('teamsData') || '[]');
    const studentsData = JSON.parse(localStorage.getItem('studentsData') || '[]');
    const gradeFilter = document.getElementById('studentPrefGradeFilter');
    
    if (!gradeFilter) return;
    
    // 收集所有团队成员的年级
    const grades = new Set();
    teamsData.forEach(team => {
        if (team.members && team.members.length > 0) {
            team.members.forEach(memberId => {
                const student = studentsData.find(s => s.id === memberId);
                if (student && student.grade) {
                    grades.add(student.grade);
                }
            });
        }
    });
    
    // 清空并添加默认选项
    gradeFilter.innerHTML = '<option value="">全部年级</option>';
    
    // 添加年级选项
    [...grades].sort().forEach(grade => {
        const option = document.createElement('option');
        option.value = grade;
        option.textContent = grade + '级';
        gradeFilter.appendChild(option);
    });
}

// 更新学生志愿专业下拉列表
function updateStudentPrefMajorFilterOptions() {
    const teamsData = JSON.parse(localStorage.getItem('teamsData') || '[]');
    const studentsData = JSON.parse(localStorage.getItem('studentsData') || '[]');
    const majorFilter = document.getElementById('studentPrefMajorFilter');
    
    if (!majorFilter) return;
    
    // 收集所有团队成员的专业
    const majors = new Set();
    teamsData.forEach(team => {
        if (team.members && team.members.length > 0) {
            team.members.forEach(memberId => {
                const student = studentsData.find(s => s.id === memberId);
                if (student && student.major) {
                    majors.add(student.major);
                }
            });
        }
    });
    
    // 清空并添加默认选项
    majorFilter.innerHTML = '<option value="">全部专业</option>';
    
    // 添加专业选项
    [...majors].sort().forEach(major => {
        const option = document.createElement('option');
        option.value = major;
        option.textContent = major;
        majorFilter.appendChild(option);
    });
}

// 清空学生表单
function clearStudentForm() {
    document.getElementById('studentIdInput').value = '';
    document.getElementById('studentNameInput').value = '';
    document.getElementById('studentGradeInput').value = '';
    document.getElementById('studentMajorInput').value = '';
    document.getElementById('studentClassInput').value = '';
    document.getElementById('studentPhoneInput').value = '';
}

// 清空导师表单
function clearTeacherForm() {
    document.getElementById('teacherIdInput').value = '';
    document.getElementById('teacherNameInput').value = '';
    document.getElementById('teacherTitleInput').value = '';
    document.getElementById('teacherMajorInput').value = '';
    document.getElementById('teacherPhoneInput').value = '';
    document.getElementById('teacherEmailInput').value = '';
}

// 重置导入模态框
function resetImportModal() {
    document.getElementById('excelFileInput').value = '';
    document.getElementById('selectedFileInfo').style.display = 'none';
    document.getElementById('fileNameDisplay').textContent = '';
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        uploadArea.classList.remove('drag-over');
    }
}

// 处理Excel导入
function handleExcelImport() {
    try {
        if (!selectedFile) {
            alert('请先选择Excel文件');
            return;
        }

        // 检查文件类型是否为Excel
        const fileName = selectedFile.name.toLowerCase();
        if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
            alert('请选择.xlsx或.xls格式的Excel文件');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // 将Excel数据转换为JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                // 验证数据并导入
                if (validateAndImportData(jsonData)) {
                    // 导入成功后关闭模态框
                    $('#importExcelModal').modal('hide');
                    // 重置导入状态
                    resetImportModal();
                    // 刷新学生列表
                    fetchAndDisplayStudents();
                    alert('数据导入成功！');
                }
            } catch (error) {
                console.error('Excel解析错误:', error);
                alert('Excel文件解析失败，请检查文件格式是否正确');
            }
        };
        
        reader.onerror = function() {
            alert('文件读取失败，请重试');
        };
        
        reader.onabort = function() {
            alert('文件读取已取消');
        };
        
        // 读取文件
        reader.readAsArrayBuffer(selectedFile);
    } catch (error) {
        console.error('导入处理错误:', error);
        alert('数据导入过程中发生错误，请重试');
    }
}

// 验证并导入数据
function validateAndImportData(data) {
    try {
        // 检查数据是否为空
        if (!data || data.length <= 1) {
            alert('Excel文件中没有找到有效数据');
            return false;
        }

        // 验证表头
        const headers = data[0];
        const requiredHeaders = ['姓名', '学号', '专业', '导师编号', '导师姓名'];
        
        // 检查是否包含所有必需的列
        for (let header of requiredHeaders) {
            if (!headers.some(h => h && typeof h === 'string' && h.trim().includes(header))) {
                alert(`请确保Excel文件包含"${header}"列`);
                return false;
            }
        }

        // 处理数据行
        const studentImportList = [];
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            // 跳过空行
            if (!row || row.every(cell => !cell)) {
                continue;
            }

            // 确保有足够的列数据
            if (row.length < 5) {
                alert(`第${i+1}行数据不完整，请检查`);
                return false;
            }

            // 创建学生对象
            const student = {
                name: row[0] || '',
                studentId: row[1] || '',
                major: row[2] || '',
                teacherId: row[3] || '',
                teacherName: row[4] || ''
            };

            // 简单的非空验证
            if (!student.name || !student.studentId) {
                alert(`第${i+1}行：姓名和学号不能为空`);
                return false;
            }

            studentImportList.push(student);
        }

        // 调用API导入数据
        return importStudents(studentImportList);
    } catch (error) {
        console.error('数据验证错误:', error);
        alert('数据验证过程中发生错误，请检查Excel文件格式');
        return false;
    }
}

// 编辑学生
function editStudent(id) {
    const student = window.getStudentById(id);
    if (student) {
        document.getElementById('studentModalTitle').textContent = '编辑学生';
        document.getElementById('studentIdInput').value = student.id;
        document.getElementById('studentIdInput').disabled = true;
        document.getElementById('studentNameInput').value = student.name;
        document.getElementById('studentGradeInput').value = student.grade;
        document.getElementById('studentMajorInput').value = student.major;
        document.getElementById('studentClassInput').value = student.class;
        document.getElementById('studentPhoneInput').value = student.phone || '';
        document.getElementById('studentModal').style.display = 'block';
    }
}

// 保存学生信息
function saveStudent() {
    const id = document.getElementById('studentIdInput').value.trim();
    const name = document.getElementById('studentNameInput').value.trim();
    const grade = document.getElementById('studentGradeInput').value.trim();
    const major = document.getElementById('studentMajorInput').value.trim();
    const className = document.getElementById('studentClassInput').value.trim();
    const phone = document.getElementById('studentPhoneInput').value.trim();
    
    if (!id || !name || !grade || !major || !className) {
        alert('请填写必填信息（学号、姓名、年级、专业、班级）');
        return;
    }
    
    // 检查是否已存在
    const existingStudent = window.getStudentById(id);
    
    if (existingStudent) {
        // 更新现有学生
        existingStudent.name = name;
        existingStudent.grade = grade;
        existingStudent.major = major;
        existingStudent.class = className;
        existingStudent.phone = phone;
        existingStudent.password = '123456'; // 密码保持默认
    } else {
        // 添加新学生
        window.studentsData.push({
            id: id,
            name: name,
            grade: grade,
            major: major,
            class: className,
            phone: phone,
            password: '123456'
        });
    }
    
    // 保存学生数据
    window.saveStudentsData(window.studentsData);
    
    // 重新加载学生列表
    loadStudentList();
    
    // 关闭模态框
    document.getElementById('studentModal').style.display = 'none';
    
    alert('学生信息保存成功！');
}

// 删除学生
function deleteStudent(id) {
    if (confirm('确定要删除这个学生吗？')) {
        const index = window.studentsData.findIndex(student => student.id === id);
        if (index !== -1) {
            window.studentsData.splice(index, 1);
            window.saveStudentsData(window.studentsData);
            loadStudentList();
            alert('学生删除成功！');
        }
    }
}

// 编辑导师信息
function editTeacher(id) {
    const teacher = window.getTeacherById(id);
    if (teacher) {
        document.getElementById('teacherModalTitle').textContent = '编辑导师';
        document.getElementById('teacherIdInput').value = teacher.id;
        document.getElementById('teacherIdInput').disabled = true;
        document.getElementById('teacherNameInput').value = teacher.name;
        document.getElementById('teacherTitleInput').value = teacher.title;
        document.getElementById('teacherMajorInput').value = teacher.major;
        document.getElementById('teacherPhoneInput').value = teacher.phone || '';
        document.getElementById('teacherEmailInput').value = teacher.email || '';
        document.getElementById('teacherModal').style.display = 'block';
    }
}

// 保存导师信息
function saveTeacher() {
    const id = document.getElementById('teacherIdInput').value.trim();
    const name = document.getElementById('teacherNameInput').value.trim();
    const title = document.getElementById('teacherTitleInput').value.trim();
    const major = document.getElementById('teacherMajorInput').value.trim();
    const phone = document.getElementById('teacherPhoneInput').value.trim();
    const email = document.getElementById('teacherEmailInput').value.trim();
    
    if (!id || !name || !title || !major) {
        alert('请填写必填信息（工号、姓名、职称、专业）');
        return;
    }
    
    // 检查是否已存在
    const existingTeacher = window.getTeacherById(id);
    
    if (existingTeacher) {
        // 更新现有导师
        existingTeacher.name = name;
        existingTeacher.title = title;
        existingTeacher.major = major;
        existingTeacher.phone = phone;
        existingTeacher.email = email;
        existingTeacher.password = '123456'; // 密码保持默认
    } else {
        // 添加新导师
        window.teachersData.push({
            id: id,
            name: name,
            title: title,
            major: major,
            phone: phone,
            email: email,
            password: '123456'
        });
    }
    
    // 保存导师数据
    window.saveTeachersData(window.teachersData);
    
    // 重新加载导师列表
    loadTeacherList();
    
    // 关闭模态框
    document.getElementById('teacherModal').style.display = 'none';
    
    alert('导师信息保存成功！');
}

// 删除导师
function deleteTeacher(id) {
    if (confirm('确定要删除这个导师吗？')) {
        const index = window.teachersData.findIndex(teacher => teacher.id === id);
        if (index !== -1) {
            window.teachersData.splice(index, 1);
            window.saveTeachersData(window.teachersData);
            loadTeacherList();
            alert('导师删除成功！');
        }
    }
}

// 保存系统设置
function saveSystemSettings() {
    const studentPrefWeight = parseFloat(document.getElementById('studentPrefWeight').value);
    const teacherPrefWeight = parseFloat(document.getElementById('teacherPrefWeight').value);
    const researchMatchWeight = parseFloat(document.getElementById('researchMatchWeight').value);
    const maxStudentsPerTeacher = parseInt(document.getElementById('maxStudentsPerTeacher').value);
    const minStudentsPerGroup = parseInt(document.getElementById('minStudentsPerGroup').value);
    const studentTeamPrefDeadline = document.getElementById('studentTeamPrefDeadline').value;
    const teacherSelectionDeadline = document.getElementById('teacherSelectionDeadline').value;
    
    // 验证设置
    if (isNaN(studentPrefWeight) || isNaN(teacherPrefWeight) || isNaN(researchMatchWeight)) {
        alert('请输入有效的权重值');
        return;
    }
    if (isNaN(maxStudentsPerTeacher) || maxStudentsPerTeacher <= 0) {
        alert('请输入有效的每位导师最多指导学生数');
        return;
    }
    if (isNaN(minStudentsPerGroup) || minStudentsPerGroup <= 0) {
        alert('请输入有效的每组最少学生数');
        return;
    }
    
    // 保存到localStorage
    localStorage.setItem('systemSettings', JSON.stringify({
        studentPrefWeight: studentPrefWeight,
        teacherPrefWeight: teacherPrefWeight,
        researchMatchWeight: researchMatchWeight,
        maxStudentsPerTeacher: maxStudentsPerTeacher,
        minStudentsPerGroup: minStudentsPerGroup,
        studentTeamPrefDeadline: studentTeamPrefDeadline,
        teacherSelectionDeadline: teacherSelectionDeadline
    }));
}

// 重置匹配结果
function resetMatchingResults() {
    if (confirm('确定要重置所有匹配结果吗？这将取消所有已匹配的结果，解散学生队伍，清除学生志愿、老师选择和学生端导师选择界面。此操作不可撤销！')) {
        try {
            // 重置匹配结果数据
            window.matchingResultsData = [];
            
            // 解散学生队伍并重置学生的选择状态
            window.studentsData.forEach(student => {
                student.teamId = null;
                student.teamRole = null;
                student.selectedTeachers = [];
                student.matched = false;
            });
            
            // 重置导师的选择状态
            window.teachersData.forEach(teacher => {
                teacher.selectedStudentGroups = [];
                teacher.matchedTeams = [];
            });
            
            // 重置队伍数据
            window.teamsData = [];
            
            // 清除学生志愿数据
            window.studentPreferencesData = [];
            
            // 清除老师选择数据
            window.teacherPreferencesData = [];
            
            // 清除学生端临时选择的导师数据
            localStorage.removeItem('selectedTeachers');
            
            // 保存到localStorage
            localStorage.setItem('matchingResultsData', JSON.stringify(window.matchingResultsData));
            localStorage.setItem('studentsData', JSON.stringify(window.studentsData));
            localStorage.setItem('teachersData', JSON.stringify(window.teachersData));
            localStorage.setItem('teamsData', JSON.stringify(window.teamsData));
            localStorage.setItem('studentPreferencesData', JSON.stringify(window.studentPreferencesData));
            localStorage.setItem('teacherPreferencesData', JSON.stringify(window.teacherPreferencesData));
            
            // 更新界面显示
            loadMatchingResults();
            loadStudentList();
            loadTeacherList();
            
            // 如果存在这些函数，则调用它们来更新显示
            if (typeof loadStudentPreferences === 'function') {
                loadStudentPreferences();
            }
            if (typeof loadTeacherPreferences === 'function') {
                loadTeacherPreferences();
            }
            
            showNotification('重置成功', '所有匹配结果已清除，学生队伍已解散，学生志愿、老师选择和学生端导师选择界面已清除。', 'success');
        } catch (error) {
            console.error('重置匹配结果时出错:', error);
            showNotification('重置失败', '重置过程中发生错误，请重试。', 'error');
        }
    }
}

// 运行匹配
function runMatching() {
    console.log('========== 开始执行匹配过程 ==========');
    
    if (confirm('确定要运行系统匹配吗？这将基于当前的学生志愿和导师选择进行匹配。')) {
        // 显示加载状态
        const runBtn = document.getElementById('runMatchingBtn');
        const originalText = runBtn.innerHTML || '运行匹配';
        runBtn.innerHTML = '<i class="loading-icon"></i> 运行中...';
        runBtn.disabled = true;
        
        try {
            // 收集系统设置参数
            const settings = {
                studentPreferenceWeight: parseFloat(document.getElementById('studentPrefWeight').value || 0.3),
                teacherPreferenceWeight: parseFloat(document.getElementById('teacherPrefWeight').value || 0.4),
                researchMatchWeight: parseFloat(document.getElementById('researchMatchWeight').value || 0.3),
                maxTeamsPerTeacher: parseInt(document.getElementById('maxStudentsPerTeacher').value || 5),
                minStudentsPerTeam: parseInt(document.getElementById('minStudentsPerTeam').value || 1)
            };
            
            console.log('匹配算法设置参数:', settings);
            
            // 确保数据加载到全局变量中
            console.log('加载数据到全局变量...');
            window.teamsData = JSON.parse(localStorage.getItem('teamsData') || '[]');
            window.teachersData = JSON.parse(localStorage.getItem('teachersData') || '[]');
            window.studentPreferencesData = JSON.parse(localStorage.getItem('studentPreferencesData') || '[]');
            window.teacherPreferencesData = JSON.parse(localStorage.getItem('teacherPreferencesData') || '[]');
            
            console.log('全局变量数据加载完成:', {
                teams: window.teamsData.length,
                teachers: window.teachersData.length,
                studentPrefs: window.studentPreferencesData.length,
                teacherPrefs: window.teacherPreferencesData.length
            });
            
            // 预检查数据
            const dataReady = checkMatchingDataReady();
            if (!dataReady) {
                console.warn('数据预检查未通过，但仍尝试执行匹配');
            }
            
            // 调用匹配算法模块进行匹配
            if (window.runMatchingAlgorithm) {
                try {
                    // 执行匹配算法
                    console.log('调用window.runMatchingAlgorithm...');
                    const results = window.runMatchingAlgorithm(settings);
                    
                    console.log('匹配算法执行完毕，结果类型:', typeof results, '结果长度:', results ? results.length : 0);
                    
                    // 检查并保存匹配结果
                    if (results && Array.isArray(results) && results.length > 0) {
                        // 更新全局变量
                        window.matchingResultsData = results;
                        
                        // 保存到localStorage
                        localStorage.setItem('matchingResultsData', JSON.stringify(results));
                        console.log('匹配结果已保存，数量:', results.length);
                        
                        // 调用专门的保存函数（如果存在）
                        if (typeof window.saveMatchingResultsData === 'function') {
                            window.saveMatchingResultsData(results);
                            console.log('已调用window.saveMatchingResultsData保存结果');
                        }
                        
                        // 重新加载结果列表
                        console.log('调用loadMatchingResults加载匹配结果显示');
                        loadMatchingResults();
                        
                        // 显示成功提示
                        showNotification(`匹配成功完成！成功匹配 ${results.length} 个团队。`, 'success');
                        
                        // 滚动到匹配结果区域
                        const resultSection = document.getElementById('matchingResults');
                        if (resultSection) {
                            resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    } else {
                        // 无匹配结果的情况
                        console.log('未生成任何匹配结果或结果为空');
                        window.matchingResultsData = [];
                        localStorage.setItem('matchingResultsData', JSON.stringify([]));
                        showNotification('没有生成匹配结果，请检查是否有足够的数据或志愿信息。', 'warning');
                        // 重新加载以显示空状态
                        loadMatchingResults();
                    }
                } catch (error) {
                    console.error('匹配算法执行出错:', error);
                    showNotification('匹配过程中发生错误：' + (error.message || String(error)), 'error');
                    // 即使出错也尝试加载空结果
                    loadMatchingResults();
                }
            } else {
                console.error('错误: window.runMatchingAlgorithm 函数不存在');
                showNotification('匹配算法模块未加载，请刷新页面重试。', 'error');
            }
        } catch (error) {
            console.error('runMatching函数执行过程中出错:', error);
            showNotification('执行匹配时发生系统错误，请检查控制台日志获取详细信息。', 'error');
        } finally {
            // 恢复按钮状态
            setTimeout(() => {
                runBtn.innerHTML = originalText;
                runBtn.disabled = false;
                console.log('========== 匹配过程执行结束 ==========');
            }, 500);
        }
    }
}

// 检查匹配数据是否准备就绪
function checkMatchingDataReady() {
    // 检查学生数据
    const studentsData = localStorage.getItem('studentsData');
    const studentCount = studentsData ? JSON.parse(studentsData).length : 0;
    console.log('学生数据数量:', studentCount);
    
    // 检查教师数据
    const teachersData = localStorage.getItem('teachersData');
    const teacherCount = teachersData ? JSON.parse(teachersData).length : 0;
    console.log('教师数据数量:', teacherCount);
    
    // 检查团队数据
    const teamsData = localStorage.getItem('teamsData');
    const teamCount = teamsData ? JSON.parse(teamsData).length : 0;
    console.log('团队数据数量:', teamCount);
    
    // 检查学生偏好数据
    const studentPrefs = localStorage.getItem('studentPreferencesData');
    const studentPrefCount = studentPrefs ? JSON.parse(studentPrefs).length : 0;
    console.log('学生偏好数据数量:', studentPrefCount);
    
    // 检查教师偏好数据
    const teacherPrefs = localStorage.getItem('teacherPreferencesData');
    const teacherPrefCount = teacherPrefs ? JSON.parse(teacherPrefs).length : 0;
    console.log('教师偏好数据数量:', teacherPrefCount);
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 自动显示
    setTimeout(() => notification.classList.add('show'), 10);
    
    // 自动关闭
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// 显示导入结果
function showImportResult(results) {
    // 更新结果显示
    document.getElementById('totalRecords').textContent = results.total;
    document.getElementById('successRecords').textContent = results.success;
    document.getElementById('failedRecords').textContent = results.failed;
    
    // 显示错误详情（如果有）
    const errorDetails = document.getElementById('errorDetails');
    const errorList = document.getElementById('errorList');
    
    if (results.errors.length > 0) {
        errorDetails.style.display = 'block';
        errorList.innerHTML = '';
        
        results.errors.forEach(error => {
            const errorItem = document.createElement('div');
            errorItem.className = 'error-item';
            errorItem.textContent = `第${error.row}行: ${error.error}`;
            errorList.appendChild(errorItem);
        });
    } else {
        errorDetails.style.display = 'none';
    }
    
    // 显示结果模态框
    openModal('importResultModal');
}

// 打开模态框
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

// 绑定模态框关闭事件
function bindModalClose(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // 点击关闭按钮
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => closeModal(modalId));
        }
        
        // 点击模态框背景关闭
        const backdrop = modal.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', () => closeModal(modalId));
        }
    }
}

// 关闭模态框
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// 导出结果
function exportResults() {
    const results = window.matchingResultsData;
    
    if (results.length === 0) {
        alert('暂无匹配结果可导出');
        return;
    }
    
    // 调用匹配算法模块的导出功能
    if (window.exportMatchesAsCSV) {
        const csvContent = window.exportMatchesAsCSV();
        
        // 创建Blob对象
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        
        // 创建下载链接
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', '匹配结果_'+new Date().toLocaleDateString()+'.csv');
        link.style.visibility = 'hidden';
        
        // 添加到DOM并触发下载
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert('导出功能模块未加载');
    }
}

// 全局函数，供HTML中直接调用
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;
window.editTeacher = editTeacher;
window.deleteTeacher = deleteTeacher;
window.deleteNotification = deleteNotification;
window.openNotificationModal = openNotificationModal;
window.saveNotification = saveNotification;
window.searchNotifications = searchNotifications;
window.loadNotificationList = loadNotificationList;
window.viewTeamDetails = viewTeamDetails;

// 下载Excel模板
function downloadExcelTemplate() {
    try {
        // 创建工作簿
        const wb = XLSX.utils.book_new();
        
        // 创建工作表数据，包含表头和示例数据
        const ws_data = [
            ['学号', '姓名', '年级', '专业', '班级', '联系电话'],
            ['20210001', '张三', '2021', '计算机科学与技术', '计科1班', '13800138000'],
            ['20210002', '李四', '2021', '软件工程', '软工2班', '']
        ];
        
        // 创建工作表
        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        
        // 设置列宽
        const wscols = [
            {wch: 12}, // 学号
            {wch: 10}, // 姓名
            {wch: 8},  // 年级
            {wch: 20}, // 专业
            {wch: 10}, // 班级
            {wch: 15}  // 联系电话
        ];
        ws['!cols'] = wscols;
        
        // 添加工作表到工作簿
        XLSX.utils.book_append_sheet(wb, ws, "学生信息");
        
        // 生成Excel文件并下载，这里仍使用xlsx格式，但导入功能支持xls格式
        XLSX.writeFile(wb, '学生信息导入模板.xlsx');
        
        showNotification('模板下载成功，请按照模板格式填写数据后导入（支持.xlsx和.xls格式）', 'success');
    } catch (error) {
        showNotification('模板下载失败: ' + error.message, 'error');
        console.error('模板下载错误:', error);
    }
}

// 导入学生数据函数
function importStudents(students) {
    try {
        // 获取现有的学生数据
        const existingStudents = JSON.parse(localStorage.getItem('studentsData') || '[]');
        
        // 检查重复学号
        const existingIds = new Set(existingStudents.map(s => s.id));
        const newStudents = [];
        let hasErrors = false;
        
        for (const student of students) {
            // 检查学号是否重复
            if (existingIds.has(student.studentId)) {
                console.error('学号重复:', student.studentId);
                alert(`学号 ${student.studentId} 已存在，将更新现有记录`);
                
                // 更新现有学生记录
                const index = existingStudents.findIndex(s => s.id === student.studentId);
                if (index !== -1) {
                    existingStudents[index] = {
                        ...existingStudents[index],
                        name: student.name,
                        major: student.major,
                        // 保留其他现有字段
                    };
                }
            } else {
                // 添加新学生，转换为系统需要的格式
                newStudents.push({
                    id: student.studentId,
                    name: student.name,
                    major: student.major,
                    grade: '',  // 可能需要从其他地方获取或设置默认值
                    class: '',  // 可能需要从其他地方获取或设置默认值
                    phone: '',  // 可能需要从其他地方获取或设置默认值
                    password: '123456'  // 默认密码
                });
                existingIds.add(student.studentId);
            }
        }
        
        // 添加所有新学生
        if (newStudents.length > 0) {
            existingStudents.push(...newStudents);
        }
        
        // 保存到localStorage
        localStorage.setItem('studentsData', JSON.stringify(existingStudents));
        
        return !hasErrors;
    } catch (error) {
        console.error('保存学生数据错误:', error);
        alert('保存学生数据失败，请重试');
        return false;
    }
}

// 替换或添加fetchAndDisplayStudents函数（根据现有代码结构调整）
function fetchAndDisplayStudents() {
    // 获取最新的学生数据
    const studentsData = JSON.parse(localStorage.getItem('studentsData') || '[]');
    window.studentsData = studentsData;
    
    // 重新加载学生列表
    loadStudentList();
    
    // 更新专业筛选器
    updateMajorFilterOptions();
}

// 暴露函数给window对象
window.loadStudentPreferences = loadStudentPreferences;
window.loadTeacherPreferences = loadTeacherPreferences;
window.filterStudentPreferences = filterStudentPreferences;
window.filterTeacherPreferences = filterTeacherPreferences;
window.saveStudentPreferencesData = saveStudentPreferencesData;
window.saveTeacherPreferencesData = saveTeacherPreferencesData;
// 暴露匹配相关函数给window对象
window.runMatching = runMatching;
window.loadMatchingResults = loadMatchingResults;
// 确保showMessage函数存在，用于显示操作反馈
if (typeof showMessage !== 'function') {
    window.showMessage = function(message, type = 'info') {
        alert(message);
        console.log(`[${type.toUpperCase()}] ${message}`);
    };
}