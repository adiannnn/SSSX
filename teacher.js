// 导师端交互功能脚本

// 绑定个人信息
function bindPersonalInfo() {
    // 模拟当前登录的导师ID (实际应用中应该从登录状态获取)
    const currentTeacherId = '2001';
    
    // 从dataAccess获取导师信息
    let teacherInfo;
    
    // 尝试通过dataAccess获取
    if (window.dataAccess && typeof window.dataAccess.getTeacher === 'function') {
        teacherInfo = window.dataAccess.getTeacher(currentTeacherId);
    }
    
    // 如果dataAccess不可用，直接从mock数据获取
    if (!teacherInfo && window.mockTeachersInfo) {
        teacherInfo = window.mockTeachersInfo.find(t => t.id === currentTeacherId);
    }
    
    // 如果仍然没有，从mockUsers获取基本信息
    if (!teacherInfo && window.mockUsers && window.mockUsers.teachers) {
        teacherInfo = window.mockUsers.teachers.find(t => t.id === currentTeacherId);
    }
    
    // 如果找到导师信息，绑定到界面
    if (teacherInfo) {
        // 更新页面上的个人信息
        document.getElementById('teacherId').textContent = teacherInfo.id || '--';
        document.getElementById('teacherName').textContent = teacherInfo.name || '--';
        document.getElementById('teacherTitle').textContent = teacherInfo.title || '--';
        document.getElementById('teacherMajor').textContent = teacherInfo.department || teacherInfo.major || '--';
        document.getElementById('teacherPhone').textContent = teacherInfo.phone || '未设置';
        document.getElementById('teacherEmail').textContent = teacherInfo.email || '未设置';
        
        // 更新用户名显示
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = teacherInfo.name || '导师';
        }
    }
}

// 导航栏功能
function setupNavbar() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const logoutBtn = document.querySelector('.btn-logout');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('确定要退出登录吗？')) {
                window.location.href = 'login.html';
            }
        });
    }
}

// 编辑个人信息模态框
function setupEditModal() {
    const editBtn = document.getElementById('editInfoBtn');
    const modal = document.getElementById('editInfoModal');
    const closeBtn = document.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancelEditBtn');
    const saveBtn = document.getElementById('saveInfoBtn');
    
    if (editBtn && modal) {
        editBtn.addEventListener('click', () => {
            // 填充当前信息
            const phoneElement = document.getElementById('teacherPhone');
            const emailElement = document.getElementById('teacherEmail');
            const editPhone = document.getElementById('editPhone');
            const editEmail = document.getElementById('editEmail');
            
            if (phoneElement && editPhone) {
                const currentPhone = phoneElement.textContent;
                editPhone.value = currentPhone === '未设置' ? '' : currentPhone;
            }
            if (emailElement && editEmail) {
                const currentEmail = emailElement.textContent;
                editEmail.value = currentEmail === '未设置' ? '' : currentEmail;
            }
            
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }
    
    function closeModal() {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    
    // 点击模态框外部关闭
    if (modal) {
        modal.addEventListener('click', (e) => {
            const backdrop = modal.querySelector('.modal-backdrop');
            if (backdrop && e.target === backdrop) {
                closeModal();
            }
        });
    }
    
    // 保存信息
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const editPhone = document.getElementById('editPhone');
            const editEmail = document.getElementById('editEmail');
            const phoneElement = document.getElementById('teacherPhone');
            const emailElement = document.getElementById('teacherEmail');
            
            if (phoneElement && editPhone) {
                phoneElement.textContent = editPhone.value || '未设置';
            }
            if (emailElement && editEmail) {
                emailElement.textContent = editEmail.value || '未设置';
            }
            
            // 更新mock数据 (实际应用中应该调用API)
            updateTeacherData('phone', editPhone.value);
            updateTeacherData('email', editEmail.value);
            
            showMessage('个人信息已更新', 'success');
            closeModal();
        });
    }
}

// 更新导师数据
function updateTeacherData(field, value) {
    const currentTeacherId = '2001';
    
    // 更新mockTeachersInfo
    if (window.mockTeachersInfo) {
        const teacher = window.mockTeachersInfo.find(t => t.id === currentTeacherId);
        if (teacher) {
            teacher[field] = value;
        }
    }
    
    // 更新mockUsers
    if (window.mockUsers && window.mockUsers.teachers) {
        const teacher = window.mockUsers.teachers.find(t => t.id === currentTeacherId);
        if (teacher) {
            teacher[field] = value;
        }
    }
}

// 研究方向提交功能
function setupResearchDirection() {
    const submitBtn = document.getElementById('submitResearchBtn');
    const researchTextarea = document.getElementById('researchDirection');
    const submittedInfo = document.getElementById('submittedResearchInfo');
    
    if (submitBtn && researchTextarea) {
        submitBtn.addEventListener('click', () => {
            const direction = researchTextarea.value.trim();
            
            if (!direction) {
                showMessage('请输入研究方向', 'error');
                return;
            }
            
            if (submittedInfo) {
                // 更新已提交信息
                const researchContent = submittedInfo.querySelector('.research-content');
                const metaInfo = submittedInfo.querySelector('.meta-info');
                
                if (researchContent) {
                    researchContent.textContent = direction;
                }
                if (metaInfo) {
                    const now = new Date();
                    metaInfo.textContent = `更新时间: ${now.toLocaleString('zh-CN')}`;
                }
                
                submittedInfo.style.display = 'block';
            }
            
            showMessage('研究方向已提交', 'success');
            researchTextarea.value = '';
        });
    }
}

// 学生组浏览功能
function setupGroupBrowse() {
    const searchInput = document.getElementById('groupSearch');
    const searchBtn = document.getElementById('searchGroupBtn');
    const teamTableBody = document.getElementById('teamTableBody');
    const emptyTeamState = document.getElementById('emptyTeamState');
    
    // 从localStorage加载真实学生组数据
    function loadStudentGroupList() {
        try {
            // 获取团队数据
            const teamsData = localStorage.getItem('teamsData');
            const teams = teamsData ? JSON.parse(teamsData) : [];
            
            // 使用所有团队数据
            const allTeams = teams || [];
            
            // 清空表格
            if (teamTableBody) {
                teamTableBody.innerHTML = '';
            }
            
            // 检查是否有团队数据
            if (allTeams.length === 0) {
                if (emptyTeamState) {
                    emptyTeamState.style.display = 'block';
                }
                return;
            }
            
            // 隐藏空状态
            if (emptyTeamState) {
                emptyTeamState.style.display = 'none';
            }
            
            // 渲染表格行
            allTeams.forEach(team => {
                const row = document.createElement('tr');
                row.className = 'data-row';
                
                // 获取组长信息
                let leaderName = '未知组长';
                if (team.leaderId && window.mockStudentsInfo) {
                    const leader = window.mockStudentsInfo.find(s => s.id === team.leaderId);
                    leaderName = leader ? leader.name : leaderName;
                }
                
                // 构建成员列表
                const memberList = team.members ? team.members.join(', ') : '';
                
                // 获取题目信息
                const topicName = team.topic && team.topic.name ? team.topic.name : '-';
                
                // 设置行内容
                row.innerHTML = `
                    <td>${team.id || '-'}</td>
                    <td>${team.name || '-'}</td>
                    <td>${leaderName}</td>
                    <td>${team.members ? team.members.length : 0}</td>
                    <td>${memberList}</td>
                    <td>${topicName}</td>
                    <td>
                        <button class="btn btn-small btn-primary select-group" data-id="${team.id}">选择</button>
                    </td>
                `;
                
                if (teamTableBody) {
                    teamTableBody.appendChild(row);
                }
            });
            
            // 添加选择按钮事件
            document.querySelectorAll('.select-group').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const groupId = e.currentTarget.dataset.id;
                    const teams = JSON.parse(localStorage.getItem('teamsData') || '[]');
                    const group = teams.find(g => g.id === groupId);
                    if (group) {
                        addToSelection(group);
                    }
                });
            });
            
        } catch (error) {
            console.error('加载学生组列表时出错:', error);
            showMessage('加载学生组数据失败', 'error');
        }
    }
    
    // 搜索功能
    function searchGroups() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        
        try {
            // 获取所有团队数据
            const teamsData = localStorage.getItem('teamsData');
            const teams = teamsData ? JSON.parse(teamsData) : [];
            
            // 过滤团队
            let filteredTeams = [];
            
            if (searchTerm) {
                filteredTeams = teams.filter(team => {
                    // 搜索团队名称
                    const nameMatch = team.name && team.name.toLowerCase().includes(searchTerm);
                    
                    // 搜索组长
                    let leaderMatch = false;
                    if (team.leaderId && window.mockStudentsInfo) {
                        const leader = window.mockStudentsInfo.find(s => s.id === team.leaderId);
                        leaderMatch = leader && leader.name && leader.name.toLowerCase().includes(searchTerm);
                    }
                    
                    // 搜索成员
                    const membersMatch = team.members && team.members.some(member => 
                        member.toLowerCase().includes(searchTerm)
                    );
                    
                    // 搜索题目
                    const topicMatch = team.topic && team.topic.name && 
                                      team.topic.name.toLowerCase().includes(searchTerm);
                    
                    return nameMatch || leaderMatch || membersMatch || topicMatch;
                });
            } else {
                filteredTeams = teams;
            }
            
            // 清空表格
            if (teamTableBody) {
                teamTableBody.innerHTML = '';
            }
            
            // 检查过滤结果
            if (filteredTeams.length === 0) {
                if (emptyTeamState) {
                    emptyTeamState.style.display = 'block';
                    emptyTeamState.textContent = searchTerm ? '没有找到匹配的学生组' : '暂无学生组数据';
                }
                return;
            }
            
            // 隐藏空状态
            if (emptyTeamState) {
                emptyTeamState.style.display = 'none';
            }
            
            // 渲染过滤后的表格行
            filteredTeams.forEach(team => {
                const row = document.createElement('tr');
                row.className = 'data-row';
                
                // 获取组长信息
                let leaderName = '未知组长';
                if (team.leaderId && window.mockStudentsInfo) {
                    const leader = window.mockStudentsInfo.find(s => s.id === team.leaderId);
                    leaderName = leader ? leader.name : leaderName;
                }
                
                // 构建成员列表
                const memberList = team.members ? team.members.join(', ') : '';
                
                // 获取题目信息
                const topicName = team.topic && team.topic.name ? team.topic.name : '-';
                
                // 设置行内容
                row.innerHTML = `
                    <td>${team.id || '-'}</td>
                    <td>${team.name || '-'}</td>
                    <td>${leaderName}</td>
                    <td>${team.members ? team.members.length : 0}</td>
                    <td>${memberList}</td>
                    <td>${topicName}</td>
                    <td>
                        <button class="btn btn-small btn-primary select-group" data-id="${team.id}">选择</button>
                    </td>
                `;
                
                if (teamTableBody) {
                    teamTableBody.appendChild(row);
                }
            });
            
            // 添加选择按钮事件
            document.querySelectorAll('.select-group').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const groupId = e.currentTarget.dataset.id;
                    const teams = JSON.parse(localStorage.getItem('teamsData') || '[]');
                    const group = teams.find(g => g.id === groupId);
                    if (group) {
                        addToSelection(group);
                    }
                });
            });
            
        } catch (error) {
            console.error('搜索学生组时出错:', error);
            showMessage('搜索学生组失败', 'error');
        }
    }
    
    // 初始化加载数据
    loadStudentGroupList();
    
    // 绑定搜索事件
    if (searchBtn) {
        searchBtn.addEventListener('click', searchGroups);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchGroups();
            }
        });
    }
}

// 学生组选择功能
let selectedGroups = [];
const MAX_SELECTIONS = 5;

function setupGroupSelection() {
    const selectedList = document.getElementById('selectedGroupsList');
    const countDisplay = document.getElementById('selectionCount');
    const confirmBtn = document.getElementById('confirmSelectionBtn');
    
    function updateSelectionUI() {
        if (selectedList) {
            selectedList.innerHTML = '';
            
            selectedGroups.forEach((group, index) => {
                // 获取组长信息
                let leaderName = '未知组长';
                if (group.leaderId && window.mockStudentsInfo) {
                    const leader = window.mockStudentsInfo.find(s => s.id === group.leaderId);
                    leaderName = leader ? leader.name : leaderName;
                }
                
                const item = document.createElement('div');
                item.className = 'priority-item';
                item.innerHTML = `
                    <div>
                        <span class="priority-number">${index + 1}</span>
                        <span>${group.name || '未命名组'} (组长: ${leaderName})</span>
                    </div>
                    <button class="remove-priority" data-index="${index}">&times;</button>
                `;
                selectedList.appendChild(item);
            });
            
            // 添加移除按钮事件
            document.querySelectorAll('.remove-priority').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.currentTarget.dataset.index);
                    removeFromSelection(index);
                });
            });
        }
        
        if (countDisplay) {
            countDisplay.textContent = `已选择：${selectedGroups.length}/${MAX_SELECTIONS}`;
        }
        
        if (confirmBtn) {
            confirmBtn.disabled = selectedGroups.length === 0;
        }
    }
    
    window.addToSelection = function(group) {
        // 检查是否已选择
        if (selectedGroups.some(g => g.id === group.id)) {
            showMessage('该学生组已在选择列表中', 'info');
            return;
        }
        
        // 检查数量限制
        if (selectedGroups.length >= MAX_SELECTIONS) {
            showMessage(`最多只能选择${MAX_SELECTIONS}个学生组`, 'error');
            return;
        }
        
        selectedGroups.push(group);
        updateSelectionUI();
        showMessage('学生组已添加到选择列表', 'success');
    };
    
    function removeFromSelection(index) {
        selectedGroups.splice(index, 1);
        updateSelectionUI();
        showMessage('已从选择列表中移除', 'info');
    }
    
    // 确认选择按钮
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            if (selectedGroups.length === 0) return;
            
            showMessage('选择已确认，系统正在进行匹配', 'success');
            
            // 模拟匹配过程
            setTimeout(() => {
                showMatchResults();
            }, 1500);
        });
    }
    
    updateSelectionUI();
}

// 显示匹配结果
function showMatchResults() {
    const resultNotReady = document.getElementById('resultNotReady');
    const matchResultInfo = document.getElementById('matchResultInfo');
    const matchedTeams = document.getElementById('matchedTeams');
    
    if (resultNotReady) {
        resultNotReady.style.display = 'none';
    }
    
    if (matchResultInfo) {
        matchResultInfo.style.display = 'block';
    }
    
    if (matchedTeams) {
        // 模拟匹配结果
        const results = [
            {
                id: 1,
                name: '人工智能研究小组',
                leader: '张三',
                members: 5,
                matchRate: '95%',
                reason: '研究方向高度匹配'
            },
            {
                id: 2,
                name: '大数据分析团队',
                leader: '李四',
                members: 4,
                matchRate: '88%',
                reason: '成员结构合理'
            }
        ];
        
        matchedTeams.innerHTML = '';
        
        results.forEach(team => {
            const teamElement = document.createElement('div');
            teamElement.className = 'matched-team';
            teamElement.innerHTML = `
                <h5>🎉 ${team.name}</h5>
                <div class="team-details">
                    <div class="team-detail">
                        <strong>组长：</strong>${team.leader}
                    </div>
                    <div class="team-detail">
                        <strong>成员数：</strong>${team.members}人
                    </div>
                    <div class="team-detail">
                        <strong>匹配度：</strong><span style="color: #28a745;">${team.matchRate}</span>
                    </div>
                    <div class="team-detail">
                        <strong>匹配理由：</strong>${team.reason}
                    </div>
                </div>
            `;
            matchedTeams.appendChild(teamElement);
        });
    }
}

// 消息提示功能
function showMessage(message, type = 'info') {
    // 创建消息元素
    const msgElement = document.createElement('div');
    msgElement.className = `message message-${type}`;
    msgElement.textContent = message;
    msgElement.style.position = 'fixed';
    msgElement.style.top = '20px';
    msgElement.style.right = '20px';
    msgElement.style.zIndex = '2000';
    msgElement.style.padding = '12px 20px';
    msgElement.style.borderRadius = '6px';
    msgElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    msgElement.style.opacity = '0';
    msgElement.style.transform = 'translateX(100%)';
    msgElement.style.transition = 'all 0.3s ease';
    
    // 设置消息样式
    switch(type) {
        case 'success':
            msgElement.style.backgroundColor = '#d4edda';
            msgElement.style.color = '#155724';
            msgElement.style.border = '1px solid #c3e6cb';
            break;
        case 'error':
            msgElement.style.backgroundColor = '#f8d7da';
            msgElement.style.color = '#721c24';
            msgElement.style.border = '1px solid #f5c6cb';
            break;
        case 'info':
            msgElement.style.backgroundColor = '#d1ecf1';
            msgElement.style.color = '#0c5460';
            msgElement.style.border = '1px solid #bee5eb';
            break;
    }
    
    document.body.appendChild(msgElement);
    
    // 显示消息
    setTimeout(() => {
        msgElement.style.opacity = '1';
        msgElement.style.transform = 'translateX(0)';
    }, 10);
    
    // 自动消失
    setTimeout(() => {
        msgElement.style.opacity = '0';
        msgElement.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(msgElement);
        }, 300);
    }, 3000);
}

// 初始化所有功能
function init() {
    // 先绑定个人信息
    bindPersonalInfo();
    
    // 设置其他功能
    setupNavbar();
    setupEditModal();
    setupResearchDirection();
    setupGroupBrowse();
    setupGroupSelection();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);