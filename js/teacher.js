// 导师端功能实现

// 页面加载完成后执行
window.onload = function() {
    // 检查登录状态
    checkLoginStatus();
    
    // 加载导师信息
    loadTeacherInfo();
    
    // 加载专业列表
    loadMajorList();
    
    // 加载学生组列表
    loadStudentGroupList();
    
    // 加载选择的学生组
    loadSelectedGroups();
    
    // 绑定事件
    bindEvents();
};

// 检查登录状态
function checkLoginStatus() {
    const user = localStorage.getItem('user');
    if (!user) {
        // 未登录，跳转到登录页
        window.location.href = 'index.html';
    }
    
    const userInfo = JSON.parse(user);
    if (userInfo.type !== 'teacher') {
        // 不是导师，跳转到对应页面
        if (userInfo.type === 'student') {
            window.location.href = 'student.html';
        } else if (userInfo.type === 'admin') {
            window.location.href = 'admin.html';
        }
    }
    
    // 显示用户名
    document.getElementById('userName').textContent = userInfo.name;
}

// 加载导师信息
function loadTeacherInfo() {
    const user = JSON.parse(localStorage.getItem('user'));
    const teacher = window.getTeacherById(user.id);
    
    if (teacher) {
        document.getElementById('teacherId').textContent = teacher.id;
        document.getElementById('teacherName').textContent = teacher.name;
        document.getElementById('teacherTitle').textContent = teacher.title;
        document.getElementById('teacherMajor').textContent = teacher.major;
        document.getElementById('teacherPhone').textContent = teacher.phone;
        document.getElementById('teacherEmail').textContent = teacher.email;
        
        // 如果有研究方向，显示研究方向信息
        if (teacher.research) {
            document.getElementById('researchForm').style.display = 'none';
            document.getElementById('researchInfo').style.display = 'block';
            document.getElementById('savedResearch').textContent = teacher.research;
            
            // 如果有提交时间，显示提交时间
            if (teacher.researchSubmitDate) {
                document.getElementById('researchSubmitDate').textContent = '提交时间：' + teacher.researchSubmitDate;
            }
        } else {
            // 否则，将研究方向设置到表单中
            document.getElementById('researchInput').value = '';
        }
        
        // 设置编辑表单的初始值
        document.getElementById('editPhone').value = teacher.phone;
        document.getElementById('editEmail').value = teacher.email;
    }
}

// 加载专业列表
function loadMajorList() {
    const majorFilter = document.getElementById('majorFilter');
    if (!majorFilter) return;
    
    // 获取所有学生数据
    const students = Object.values(window.studentsData);
    
    // 提取不重复的专业
    const majorsSet = new Set();
    students.forEach(student => {
        if (student.major) {
            majorsSet.add(student.major);
        }
    });
    
    // 将专业添加到下拉框
    majorsSet.forEach(major => {
        const option = document.createElement('option');
        option.value = major;
        option.textContent = major;
        majorFilter.appendChild(option);
    });
}

// 根据团队成员获取团队的主要专业
function getTeamMajor(team) {
    if (!team.members || team.members.length === 0) return null;
    
    // 默认使用组长的专业
    if (team.leaderId && window.getStudentById) {
        const leader = window.getStudentById(team.leaderId);
        if (leader && leader.major) {
            return leader.major;
        }
    }
    
    // 如果没有组长，使用第一个成员的专业
    if (window.getStudentById) {
        const firstMember = window.getStudentById(team.members[0]);
        if (firstMember && firstMember.major) {
            return firstMember.major;
        }
    }
    
    return null;
}

// 加载学生组列表
function loadStudentGroupList() {
    // 使用window.loadTeamsData()确保获取到最新的团队数据
    let teams = window.loadTeamsData();
    
    // 使用正确的表格容器ID
    const groupList = document.getElementById('teamTableBody');
    const emptyTeamState = document.getElementById('emptyTeamState');
    const emptySearchState = document.getElementById('emptySearchState');
    
    if (!groupList) {
        console.error('学生组表格容器不存在');
        return;
    }
    
    // 获取专业筛选条件
    const majorFilter = document.getElementById('majorFilter');
    const selectedMajor = majorFilter ? majorFilter.value : '';
    
    // 应用专业筛选
    if (selectedMajor) {
        teams = teams.filter(team => {
            const teamMajor = getTeamMajor(team);
            return teamMajor === selectedMajor;
        });
    }
    
    // 清空表格内容
    groupList.innerHTML = '';
    
    // 隐藏所有空状态
    if (emptyTeamState) emptyTeamState.style.display = 'none';
    if (emptySearchState) emptySearchState.style.display = 'none';
    
    // 如果没有数据，显示空状态
    if (!Array.isArray(teams) || teams.length === 0) {
        if (emptyTeamState) {
            emptyTeamState.style.display = 'block';
        } else {
            groupList.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 30px;">
                        暂无符合条件的学生组数据
                    </td>
                </tr>
            `;
        }
        return;
    }
    
    // 渲染表格行
    teams.forEach((team, index) => {
        // 获取组长姓名 - 使用系统提供的getStudentById函数
        let leaderName = '未知组长';
        if (team.leaderId && window.getStudentById) {
            const leader = window.getStudentById(team.leaderId);
            if (leader && leader.name) {
                leaderName = leader.name;
            }
        }
        
        // 处理空值
        const topicName = team.topic && team.topic.name ? team.topic.name : '-';
        const topicDescription = team.topic && team.topic.description ? team.topic.description : '-';
        // 截断过长的描述，显示前50个字符
        const displayDescription = topicDescription.length > 50 ? topicDescription.substring(0, 50) + '...' : topicDescription;
        
        // 获取成员列表，显示学生姓名而非ID
        let membersStr = '';
        if (Array.isArray(team.members) && team.members.length > 0 && window.getStudentById) {
            membersStr = team.members.map(memberId => {
                const member = window.getStudentById(memberId);
                return member && member.name ? member.name : memberId;
            }).join(', ');
        } else if (Array.isArray(team.members)) {
            membersStr = team.members.join(', ');
        }
        
        // 创建表格行
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${team.name || '-'}</td>
            <td>${leaderName}</td>
            <td>${Array.isArray(team.members) ? team.members.length : 0}</td>
            <td>${membersStr}</td>
            <td>${topicName}</td>
            <td>${displayDescription}</td>
            <td>
                <button class="btn btn-sm btn-primary select-group" data-id="${team.id}">选择</button>
            </td>
        `;
        
        groupList.appendChild(tr);
    });
}

function searchGroups(searchText) {
    // 使用window.loadTeamsData()确保获取到最新的团队数据
    const teams = window.loadTeamsData();
    const teamTableBody = document.getElementById('teamTableBody');
    const emptyTeamState = document.getElementById('emptyTeamState');
    const emptySearchState = document.getElementById('emptySearchState');
    
    teamTableBody.innerHTML = '';
    
    // 获取专业筛选条件
    const majorFilter = document.getElementById('majorFilter');
    const selectedMajor = majorFilter ? majorFilter.value : '';
    
    // 移除topic过滤条件，搜索所有团队
    let filteredTeams = teams || [];
    
    // 先应用专业筛选
    if (selectedMajor) {
        filteredTeams = filteredTeams.filter(team => {
            const teamMajor = getTeamMajor(team);
            return teamMajor === selectedMajor;
        });
    }
    
    // 再应用搜索文本筛选
    if (searchText && searchText.trim() !== '') {
        const searchLower = searchText.toLowerCase().trim();
        
        // 搜索所有团队，包括没有topic的团队
        filteredTeams = filteredTeams.filter(team => {
            // 搜索团队名称
            const matchesTeamName = team.name && team.name.toLowerCase().includes(searchLower);
            
            // 搜索组长信息
            let matchesLeader = false;
            if (team.leaderId && window.getStudentById) {
                const leader = window.getStudentById(team.leaderId);
                matchesLeader = leader && leader.name && leader.name.toLowerCase().includes(searchLower);
            }
            
            // 搜索成员信息
            let matchesMembers = false;
            if (team.members && Array.isArray(team.members) && window.getStudentById) {
                matchesMembers = team.members.some(memberId => {
                    const member = window.getStudentById(memberId);
                    return member && member.name && member.name.toLowerCase().includes(searchLower);
                });
            }
            
            // 搜索题目信息（如果存在）
            const matchesTopic = team.topic && 
                               (team.topic.name && team.topic.name.toLowerCase().includes(searchLower));
            
            return matchesTeamName || matchesLeader || matchesMembers || matchesTopic;
        });
    }
    
    if (filteredTeams.length === 0) {
        if (searchText && searchText.trim() !== '') {
            if (emptySearchState) emptySearchState.style.display = 'block';
            if (emptyTeamState) emptyTeamState.style.display = 'none';
        } else {
            if (emptyTeamState) emptyTeamState.style.display = 'block';
            if (emptySearchState) emptySearchState.style.display = 'none';
        }
        return;
    } else {
        if (emptyTeamState) emptyTeamState.style.display = 'none';
        if (emptySearchState) emptySearchState.style.display = 'none';
    }
    
    // 显示搜索结果
    filteredTeams.forEach((team, index) => {
        // 获取组长信息
        let leaderName = '未知组长';
        if (team.leaderId && window.getStudentById) {
            const leader = window.getStudentById(team.leaderId);
            if (leader && leader.name) {
                leaderName = leader.name;
            }
        }
        
        // 获取成员列表，显示学生姓名而非ID
        let memberList = '';
        if (team.members && Array.isArray(team.members) && window.getStudentById) {
            memberList = team.members.map(memberId => {
                const member = window.getStudentById(memberId);
                return member && member.name ? member.name : memberId;
            }).join(', ');
        } else if (team.members && Array.isArray(team.members)) {
            memberList = team.members.join(', ');
        }
        
        // 获取题目信息（如果存在）
        const topicName = team.topic && team.topic.name ? team.topic.name : '-';
        const topicDescription = team.topic && team.topic.description ? team.topic.description : '-';
        // 截断过长的描述，显示前50个字符
        const displayDescription = topicDescription.length > 50 ? topicDescription.substring(0, 50) + '...' : topicDescription;
        
        // 修改表格行创建的ID和名称显示，添加默认值
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${team.name || '-'}</td>
            <td>${leaderName}</td>
            <td>${team.members && Array.isArray(team.members) ? team.members.length : 0}</td>
            <td>${memberList}</td>
            <td>${topicName}</td>
            <td>${displayDescription}</td>
            <td>
                <button class="btn btn-sm btn-info view-group-details" data-id="${team.id}">查看详情</button>
                <button class="btn btn-sm btn-primary select-group" data-id="${team.id}">选择该组</button>
            </td>
        `;
        
        teamTableBody.appendChild(row);
    });
}

// 添加查看详情函数
function viewGroupDetails(teamId) {
    // 从localStorage获取数据
    const teamsDataStr = localStorage.getItem('teamsData');
    const teamsData = teamsDataStr ? JSON.parse(teamsDataStr) : [];
    
    // 查找指定ID的团队
    const team = teamsData.find(t => t.id === teamId);
    
    if (team) {
        // 获取学生信息
        const studentsInfoStr = localStorage.getItem('mockStudentsInfo');
        const studentsInfo = studentsInfoStr ? JSON.parse(studentsInfoStr) : [];
        
        // 获取组长信息
        const leader = studentsInfo.find(s => s.id === team.leaderId);
        const leaderName = leader ? leader.name : '未知组长';
        
        // 构建详情信息
        let details = `
            组ID: ${team.id || '-'}\n
            组名: ${team.name || '-'}\n
            组长: ${leaderName}\n
            成员数量: ${Array.isArray(team.members) ? team.members.length : 0}\n
            成员列表: ${Array.isArray(team.members) ? team.members.join(', ') : '-'}\n
            毕业设计题目: ${team.topic && team.topic.name ? team.topic.name : '-'}
        `;
        
        alert('学生组详情:\n\n' + details);
    } else {
        alert('未找到该学生组信息');
    }
}

// 加载选择的学生组
function loadSelectedGroups() {
    const user = JSON.parse(localStorage.getItem('user'));
    const teacherId = user.id;
    
    // 获取教师选择的学生组
    const teacherPreferences = window.teacherPreferencesData.find(pref => pref.teacherId === teacherId);
    
    if (teacherPreferences && teacherPreferences.selectedGroups) {
        const selectedList = document.getElementById('selectedGroupsList');
        selectedList.innerHTML = '';
        
        teacherPreferences.selectedGroups.forEach((groupId, index) => {
            const team = window.getTeamById(groupId);
            if (team) {
                const li = document.createElement('li');
                li.textContent = `${index + 1}. ${team.name || '未命名组'}`;
                selectedList.appendChild(li);
            } else {
                const li = document.createElement('li');
                li.textContent = `${index + 1}. 未知组 (${groupId})`;
                selectedList.appendChild(li);
            }
        });
        
        // 使用通用函数更新确认按钮状态
        updateConfirmButtonState(teacherPreferences.selectedGroups.length);
    }
}

// 绑定事件
function bindEvents() {
    // 公告相关事件绑定
    const notificationSearchBtn = document.querySelector('.search-container .search-btn');
    const notificationSearchInput = document.getElementById('notificationSearch');
    
    if (notificationSearchBtn && notificationSearchInput) {
        // 搜索按钮点击事件
        notificationSearchBtn.addEventListener('click', () => {
            const searchText = notificationSearchInput.value;
            searchNotifications(searchText);
        });
        
        // 回车搜索事件
        notificationSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchText = notificationSearchInput.value;
                searchNotifications(searchText);
            }
        });
    }
    // 退出登录
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
    
    // 编辑信息按钮
    document.getElementById('editInfoBtn').addEventListener('click', function() {
        document.getElementById('editInfoModal').style.display = 'block';
    });
    
    // 关闭模态框
    document.querySelector('.close-modal').addEventListener('click', function() {
        document.getElementById('editInfoModal').style.display = 'none';
    });
    
    // 保存信息按钮
    document.getElementById('saveInfoBtn').addEventListener('click', function() {
        updateTeacherInfo();
        document.getElementById('editInfoModal').style.display = 'none';
    });
    
    // 提交研究方向
    document.getElementById('submitResearchBtn').addEventListener('click', function() {
        submitResearchDirection();
    });
    
    // 编辑研究方向
    document.getElementById('editResearchBtn').addEventListener('click', function() {
        editResearchDirection();
    });
    
    // 保存编辑后的研究方向
    document.getElementById('saveResearchBtn').addEventListener('click', function() {
        saveResearchDirection();
    });
    
    // 取消编辑研究方向
    document.getElementById('cancelEditBtn').addEventListener('click', function() {
        // 隐藏编辑表单，显示信息
        document.getElementById('researchEditForm').style.display = 'none';
        document.getElementById('researchInfo').style.display = 'block';
    });
    
    // 选择学生组
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('select-group')) {
            const groupId = e.target.getAttribute('data-id');
            selectGroup(groupId);
        } else if (e.target.classList.contains('view-group-details')) {
            const groupId = e.target.getAttribute('data-id');
            viewGroupDetails(groupId);
        }
    });
    
    // 确认选择
    document.getElementById('confirmSelectionBtn').addEventListener('click', function() {
        confirmGroupSelection();
    });
    
    // 搜索功能
    document.querySelector('.search-btn').addEventListener('click', function() {
        const searchText = document.getElementById('groupSearch').value.toLowerCase();
        searchGroups(searchText);
    });
    
    // 回车键搜索
    document.getElementById('groupSearch').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            const searchText = this.value.toLowerCase();
            searchGroups(searchText);
        }
    });
    
    // 专业筛选下拉框change事件
    const majorFilter = document.getElementById('majorFilter');
    if (majorFilter) {
        majorFilter.addEventListener('change', function() {
            const searchText = document.getElementById('groupSearch').value;
            searchGroups(searchText);
        });
    }
}

// 更新导师信息
function updateTeacherInfo() {
    const user = JSON.parse(localStorage.getItem('user'));
    const phone = document.getElementById('editPhone').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    
    // 更新教师数据
    const teacher = window.getTeacherById(user.id);
    if (teacher) {
        teacher.phone = phone;
        teacher.email = email;
        
        // 保存更新后的教师数据
        window.saveTeachersData(window.teachersData);
        
        // 重新加载教师信息
        loadTeacherInfo();
        
        alert('信息更新成功！');
    }
}

// 提交研究方向
function submitResearchDirection() {
    const user = JSON.parse(localStorage.getItem('user'));
    const research = document.getElementById('researchInput').value.trim();
    
    if (!research) {
        alert('请输入研究方向');
        return;
    }
    
    // 更新教师数据
    const teacher = window.getTeacherById(user.id);
    if (teacher) {
        teacher.research = research;
        teacher.researchSubmitDate = new Date().toLocaleDateString();
        
        // 保存更新后的教师数据
        window.saveTeachersData(window.teachersData);
        
        // 更新显示
        document.getElementById('researchForm').style.display = 'none';
        document.getElementById('researchInfo').style.display = 'block';
        document.getElementById('savedResearch').textContent = research;
        document.getElementById('researchSubmitDate').textContent = '提交时间：' + teacher.researchSubmitDate;
        
        alert('研究方向提交成功！');
    }
}

// 编辑研究方向
function editResearchDirection() {
    const user = JSON.parse(localStorage.getItem('user'));
    const teacher = window.getTeacherById(user.id);
    
    if (teacher && teacher.research) {
        // 设置编辑表单的值
        document.getElementById('editResearchInput').value = teacher.research;
        
        // 隐藏信息显示，显示编辑表单
        document.getElementById('researchInfo').style.display = 'none';
        document.getElementById('researchEditForm').style.display = 'block';
    }
}

// 保存编辑后的研究方向
function saveResearchDirection() {
    const user = JSON.parse(localStorage.getItem('user'));
    const research = document.getElementById('editResearchInput').value.trim();
    
    if (!research) {
        alert('请输入研究方向');
        return;
    }
    
    // 更新教师数据
    const teacher = window.getTeacherById(user.id);
    if (teacher) {
        teacher.research = research;
        teacher.researchSubmitDate = new Date().toLocaleDateString();
        
        // 保存更新后的教师数据
        window.saveTeachersData(window.teachersData);
        
        // 更新显示
        document.getElementById('researchEditForm').style.display = 'none';
        document.getElementById('researchInfo').style.display = 'block';
        document.getElementById('savedResearch').textContent = research;
        document.getElementById('researchSubmitDate').textContent = '提交时间：' + teacher.researchSubmitDate;
        
        alert('研究方向更新成功！');
    }
}

// 选择学生组
function selectGroup(groupId) {
    const user = JSON.parse(localStorage.getItem('user'));
    const teacherId = user.id;
    
    // 获取或创建教师选择的学生组
    let teacherPreferences = window.teacherPreferencesData.find(pref => pref.teacherId === teacherId);
    
    if (!teacherPreferences) {
        teacherPreferences = {
            teacherId: teacherId,
            selectedGroups: [],
            submitDate: ''
        };
        window.teacherPreferencesData.push(teacherPreferences);
    }
    
    // 检查是否已选择5个学生组
    if (teacherPreferences.selectedGroups.length >= 5) {
        alert('最多只能选择5个学生组');
        return;
    }
    
    // 检查是否已选择该学生组
    if (teacherPreferences.selectedGroups.includes(groupId)) {
        alert('您已选择该学生组');
        return;
    }
    
    // 添加到已选列表
    teacherPreferences.selectedGroups.push(groupId);
    
    // 重新加载选择的学生组
    loadSelectedGroups();
    
    // 保存教师选择数据
    window.saveTeacherPreferencesData(window.teacherPreferencesData);
}

// 确认学生组选择
function confirmGroupSelection() {
    const user = JSON.parse(localStorage.getItem('user'));
    const teacherId = user.id;
    
    // 确保数据已初始化
    if (!window.teacherPreferencesData) {
        window.teacherPreferencesData = [];
    }
    
    // 获取或创建教师选择的数据
    let teacherPreferences = window.teacherPreferencesData.find(pref => pref.teacherId === teacherId);
    
    // 如果没有找到，创建新的
    if (!teacherPreferences) {
        teacherPreferences = {
            teacherId: teacherId,
            selectedGroups: [],
            submitDate: ''
        };
        window.teacherPreferencesData.push(teacherPreferences);
    }
    
    // 检查选择数量
    if (teacherPreferences.selectedGroups.length > 0) {
        // 更新提交时间
        teacherPreferences.submitDate = new Date().toLocaleDateString();
        
        // 保存教师选择数据
        if (typeof window.saveTeacherPreferencesData === 'function') {
            window.saveTeacherPreferencesData(window.teacherPreferencesData);
        } else {
            // 备用保存方式
            localStorage.setItem('teacherPreferencesData', JSON.stringify(window.teacherPreferencesData));
        }
        
        alert('学生组选择确认成功！');
    } else {
        alert('请至少选择1个学生组后再确认');
    }
}



// 查看学生组详情
function viewGroupDetails(groupId) {
    // 从localStorage获取团队数据
    const teams = window.loadTeamsData();
    const team = teams.find(t => t.id === groupId);
    
    if (!team) {
        alert('未找到该团队信息');
        return;
    }
    
    // 获取组长信息
    const leader = window.getStudentById(team.leaderId);
    
    // 准备成员信息
    let membersHtml = '';
    team.members.forEach(memberId => {
        const member = window.getStudentById(memberId);
        if (member) {
            const isLeader = memberId === team.leaderId;
            membersHtml += `<tr>
                <td>${member.id}</td>
                <td>${member.name}</td>
                <td>${member.major}</td>
                <td>${member.grade}</td>
                <td>${isLeader ? '是' : '否'}</td>
            </tr>`;
        }
    });
    
    // 创建详情模态框
    const modalHtml = `
    <div id="groupDetailsModal" class="modal" style="display:block; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.4);">
        <div class="modal-content" style="background-color: #fefefe; margin: 5% auto; padding: 20px; border: 1px solid #888; width: 90%; max-width: 800px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ddd; padding-bottom: 15px; margin-bottom: 20px;">
                <h2 style="margin: 0;">学生组详情</h2>
                <button id="closeDetailsModal" class="close" style="color: #aaa; font-size: 28px; font-weight: bold; background: none; border: none; cursor: pointer;">&times;</button>
            </div>
            
            <div class="modal-body">
                <div class="team-basic-info" style="margin-bottom: 20px;">
                    <h3>${team.name}</h3>
                    <p><strong>团队ID：</strong>${team.id}</p>
                    <p><strong>组长：</strong>${leader ? `${leader.name} (${leader.id})` : '未知'}</p>
                    <p><strong>成员数量：</strong>${team.members.length}人</p>
                </div>
                
                <div class="team-topic" style="margin-bottom: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                    <h4>毕业设计题目</h4>
                    <p><strong>题目名称：</strong>${team.topic ? team.topic.name : '未提交'}</p>
                    <p><strong>题目描述：</strong>${team.topic ? team.topic.description : '未提交'}</p>
                    <p><strong>技术要求：</strong>${team.topic ? team.topic.requirements : '未提交'}</p>
                    ${team.topic && team.topic.relatedKnowledge ? `<p><strong>相关知识：</strong>${team.topic.relatedKnowledge}</p>` : ''}
                    ${team.topic && team.topic.submitDate ? `<p><strong>提交时间：</strong>${team.topic.submitDate}</p>` : ''}
                </div>
                
                <div class="team-members" style="margin-bottom: 20px;">
                    <h4>团队成员</h4>
                    <div class="table-responsive">
                        <table class="table" style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background-color: #f2f2f2;">
                                    <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">学号</th>
                                    <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">姓名</th>
                                    <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">专业</th>
                                    <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">年级</th>
                                    <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">是否组长</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${membersHtml}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="team-tags" style="margin-bottom: 20px;">
                    <h4>团队标签</h4>
                    <p>${team.tags && team.tags.length > 0 ? team.tags.join(', ') : '暂无标签'}</p>
                </div>
            </div>
            
            <div class="modal-footer" style="display: flex; justify-content: flex-end; border-top: 1px solid #ddd; padding-top: 15px; margin-top: 20px;">
                <button id="closeModalBtn" class="btn btn-default" style="padding: 8px 16px; background-color: #ddd; border: none; border-radius: 4px; cursor: pointer;">关闭</button>
            </div>
        </div>
    </div>`;
    
    // 添加模态框到页面
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // 添加关闭事件
    document.getElementById('closeDetailsModal').addEventListener('click', closeDetailsModal);
    document.getElementById('closeModalBtn').addEventListener('click', closeDetailsModal);
    
    // 点击模态框外部关闭
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('groupDetailsModal');
        if (event.target === modal) {
            closeDetailsModal();
        }
    });
}

// 关闭详情模态框
function closeDetailsModal() {
    const modal = document.getElementById('groupDetailsModal');
    if (modal) {
        modal.remove();
    }
}

// 添加clearSearch函数，与HTML中的调用保持一致
function clearSearch() {
    const searchInput = document.getElementById('groupSearch');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // 隐藏空搜索状态
    const emptySearchState = document.getElementById('emptySearchState');
    if (emptySearchState) {
        emptySearchState.style.display = 'none';
    }
    
    // 重新加载学生组列表
    loadStudentGroupList();
}

// 添加缺失的辅助函数
function getTeamById(teamId) {
    return window.teamsData.find(team => team.id === teamId);
}

window.getTeamById = getTeamById;

function saveTeacherPreferencesData(data) {
    window.teacherPreferencesData = data;
    localStorage.setItem('teacherPreferencesData', JSON.stringify(data));
}

window.saveTeacherPreferencesData = saveTeacherPreferencesData;

// 加载本地存储中的教师偏好数据
function loadTeacherPreferencesData() {
    const data = localStorage.getItem('teacherPreferencesData');
    if (data) {
        window.teacherPreferencesData = JSON.parse(data);
    }
    return window.teacherPreferencesData;
}

// 确保所有函数都是全局可访问的
window.loadStudentGroupList = loadStudentGroupList;
window.searchGroups = searchGroups;
window.viewGroupDetails = viewGroupDetails;
window.clearSearch = clearSearch;
window.getTeamById = getTeamById;
window.saveTeacherPreferencesData = saveTeacherPreferencesData;
window.loadTeacherPreferencesData = loadTeacherPreferencesData;
window.confirmGroupSelection = confirmGroupSelection;
window.selectGroup = selectGroup;
window.loadSelectedGroups = loadSelectedGroups;
// 公告相关函数
window.loadNotificationList = loadNotificationList;
window.searchNotifications = searchNotifications;
window.renderNotifications = renderNotifications;

// 页面加载完成后初始化
window.onload = function() {
    // 检查登录状态
    checkLoginStatus();
    
    // 加载教师偏好数据
    loadTeacherPreferencesData();
    
    // 加载导师信息
    loadTeacherInfo();
    
    // 加载学生组列表
    loadStudentGroupList();
    
    // 加载选择的学生组
    loadSelectedGroups();
    
    // 加载公告列表
    loadNotificationList();
    
    // 绑定事件
    bindEvents();
};

// 加载公告列表
function loadNotificationList() {
    // 优先使用notifications.js模块
    if (window.loadNotificationsData) {
        const notifications = window.loadNotificationsData();
        renderNotifications(notifications);
    } else {
        // 备选方案：直接从localStorage获取
        const notificationsData = localStorage.getItem('notifications');
        const notifications = notificationsData ? JSON.parse(notificationsData) : [];
        renderNotifications(notifications);
    }
}

// 渲染公告列表
function renderNotifications(notifications) {
    const notificationList = document.getElementById('notificationList');
    const emptyState = document.getElementById('emptyNotificationState');
    
    if (!notificationList || !emptyState) {
        console.error('公告容器不存在');
        return;
    }
    
    // 清空列表
    notificationList.innerHTML = '';
    
    // 按发布时间降序排序
    notifications.sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime));
    
    // 如果没有公告，显示空状态
    if (!notifications || notifications.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    // 隐藏空状态
    emptyState.style.display = 'none';
    
    // 渲染每个公告
    notifications.forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.className = 'notification-item';
        
        // 格式化发布时间
        const publishTime = new Date(notification.publishTime);
        const formattedTime = publishTime.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // 截断内容，只显示前100个字符
        const truncatedContent = notification.content && notification.content.length > 100 
            ? notification.content.substring(0, 100) + '...' 
            : (notification.content || '无内容');
        
        notificationItem.innerHTML = `
            <div class="notification-header">
                <h4 class="notification-title">${notification.title || '无标题'}</h4>
                <span class="notification-time">${formattedTime}</span>
            </div>
            <div class="notification-content">
                <p>${truncatedContent}</p>
            </div>
        `;
        
        // 添加点击事件，显示公告详情
        notificationItem.addEventListener('click', function() {
            showNotificationDetail(notification);
        });
        
        notificationList.appendChild(notificationItem);
    });
}

// 显示公告详情
function showNotificationDetail(notification) {
    const modal = document.getElementById('notificationDetailModal');
    const titleElem = document.getElementById('modalNotificationTitle');
    const authorElem = document.getElementById('modalNotificationAuthor');
    const timeElem = document.getElementById('modalNotificationTime');
    const contentElem = document.getElementById('modalNotificationContent');
    
    if (modal && titleElem && authorElem && timeElem && contentElem) {
        // 填充模态框内容
        titleElem.textContent = notification.title || '无标题';
        authorElem.textContent = notification.author || '系统管理员';
        
        // 格式化发布时间
        const publishTime = new Date(notification.publishTime);
        const formattedTime = publishTime.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        timeElem.textContent = formattedTime;
        
        // 显示完整内容
        contentElem.textContent = notification.content || '无内容';
        
        // 显示模态框
        modal.style.display = 'block';
        
        // 绑定关闭事件
        document.querySelector('#notificationDetailModal .close-modal').addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        document.getElementById('closeNotificationBtn').addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        // 点击模态框背景关闭
        modal.querySelector('.modal-backdrop').addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        // 阻止事件冒泡，防止点击模态框内容区域关闭模态框
        modal.querySelector('.modal-content').addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
}

// 搜索公告
function searchNotifications(searchText) {
    let notifications = [];
    
    // 优先使用notifications.js模块
    if (window.loadNotificationsData) {
        notifications = window.loadNotificationsData();
    } else {
        // 备选方案：直接从localStorage获取
        const notificationsData = localStorage.getItem('notifications');
        notifications = notificationsData ? JSON.parse(notificationsData) : [];
    }
    
    if (searchText && searchText.trim() !== '') {
        const searchLower = searchText.toLowerCase().trim();
        notifications = notifications.filter(notification => 
            (notification.title && notification.title.toLowerCase().includes(searchLower)) ||
            (notification.content && notification.content.toLowerCase().includes(searchLower))
        );
    }
    
    renderNotifications(notifications);
}

// 确保loadSelectedGroups函数正确更新确认按钮状态
function updateConfirmButtonState(selectedGroupsCount) {
    const confirmButton = document.getElementById('confirmSelectionBtn');
    if (selectedGroupsCount > 0) {
        confirmButton.disabled = false;
    } else {
        confirmButton.disabled = true;
    }
    document.getElementById('selectionCount').textContent = `已选择：${selectedGroupsCount}/5`;
}


// 加载匹配结果数据
function loadMatchingResultsData() {
    // 优先从window对象获取
    if (window.matchingResultsData && Array.isArray(window.matchingResultsData)) {
        return window.matchingResultsData;
    }
    
    // 从localStorage获取
    const stored = localStorage.getItem('matchingResultsData');
    if (stored) {
        try {
            const results = JSON.parse(stored);
            window.matchingResultsData = Array.isArray(results) ? results : [];
            return window.matchingResultsData;
        } catch (error) {
            console.error('解析匹配结果数据出错:', error);
        }
    }
    
    return [];
}

// 显示老师的匹配结果
function displayTeacherMatchingResult() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    // 加载匹配结果
    const matchingResults = loadMatchingResultsData();
    
    // 查找分配给当前老师的所有团队
    const assignedTeams = matchingResults.filter(match => match.teacherId === user.id);
    
    const matchResultInfo = document.getElementById('matchResultInfo');
    const matchedTeams = document.getElementById('matchedTeams');
    
    if (!matchResultInfo || !matchedTeams) return;
    
    if (assignedTeams.length > 0) {
        matchResultInfo.style.display = 'block';
        document.getElementById('resultNotReady').style.display = 'none';
        
        // 清空团队列表
        matchedTeams.innerHTML = '';
        
        // 加载团队数据
        const teams = window.loadTeamsData() || [];
        
        // 构建完整的匹配结果表格
        let html = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>团队名称</th>
                        <th>团队成员</th>
                        <th>课题名称</th>
                        <th>研究方向</th>
                        <th>匹配分数</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        // 显示每个分配的团队
        assignedTeams.forEach(match => {
            // 查找团队详情
            const team = teams.find(t => t.id === match.teamId);
            if (team) {
                html += `
                    <tr>
                        <td>${team.name || '-'}</td>
                        <td>${getTeamMembersNames(team)}</td>
                        <td>${team.topic ? team.topic.name : '未设置'}</td>
                        <td>${team.direction || '未设置'}</td>
                        <td>${(match.score || 0).toFixed(2)}</td>
                    </tr>
                `;
            }
        });
        
        html += `
                </tbody>
            </table>
        `;
        
        matchedTeams.innerHTML = html;
    } else {
        matchResultInfo.style.display = 'none';
        document.getElementById('resultNotReady').style.display = 'block';
        matchedTeams.innerHTML = '<p>暂无分配的团队</p>';
    }
}

// 在页面加载完成时调用显示匹配结果函数
window.addEventListener('load', function() {
    // 确保在其他初始化完成后调用
    setTimeout(displayTeacherMatchingResult, 100);
});

// 获取团队成员姓名列表
function getTeamMembersNames(team) {
    const teamMembers = [];
    for (const memberId of team.members) {
        const member = window.getStudentById(memberId);
        if (member) {
            teamMembers.push(member.name);
        }
    }
    return teamMembers.join(', ');
}

// 确保函数全局可访问
window.loadMatchingResultsData = loadMatchingResultsData;
window.displayTeacherMatchingResult = displayTeacherMatchingResult;
