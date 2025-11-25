// 学生端功能实现

// 测试数据初始化函数（方便用户测试）
function initTestData() {
    // 创建一个测试团队
    const testTeam = {
        id: 'test-team-1',
        name: '测试团队',
        leaderId: '23209010001', // 使用一个学生ID作为组长
        members: ['23209010001', '23209010002'], // 包含两名成员
        createdAt: new Date().toLocaleDateString()
    };
    
    // 保存测试团队
    window.saveTeamsData([testTeam]);
    
    // 创建测试用户
    const testUser = {
        id: '23209010001',
        name: '测试用户',
        type: 'student'
    };
    
    // 保存测试用户
    localStorage.setItem('user', JSON.stringify(testUser));
    
    alert('测试数据已初始化！请刷新页面查看效果。');
}

// 页面加载完成后执行
window.onload = function() {
    try {
        console.log('页面开始加载初始化');
        // 检查登录状态
        checkLoginStatus();
        
        // 加载个人信息
        loadStudentInfo();
        
        // 加载团队信息
        loadTeamInfo();
        
        // 加载导师列表
        loadTeacherList();
        
        // 注释掉可能未定义的函数调用
        console.log('已注释可能未定义的loadUnassignedStudents函数调用');
        // loadUnassignedStudents();
        
        // 加载公告列表
        loadNotificationList();
        
        // 显示匹配结果
        displayMatchingResult();
        
        // 绑定事件
        bindEvents();
        
        // 为测试数据初始化按钮添加事件监听器
        const initTestDataBtn = document.getElementById('initTestDataBtn');
        if (initTestDataBtn) {
            initTestDataBtn.addEventListener('click', initTestData);
        }
        
        console.log('页面初始化完成');
    } catch (error) {
        console.error('页面初始化错误:', error);
        // 即使有错误也要确保公告加载
        setTimeout(loadNotificationList, 500);
    }
};

// 加载公告列表
function loadNotificationList() {
    try {
        console.log('开始加载公告列表');
        // 尝试从全局函数加载公告数据
        console.log('检查window.loadNotificationsData:', typeof window.loadNotificationsData);
        
        // 尝试多种方式获取数据
        let notifications = [];
        
        // 方式1：使用window.loadNotificationsData函数
        if (typeof window.loadNotificationsData === 'function') {
            try {
                notifications = window.loadNotificationsData();
                console.log('通过window.loadNotificationsData获取公告:', notifications.length);
            } catch (e) {
                console.error('调用loadNotificationsData失败:', e);
            }
        }
        
        // 方式2：如果方式1失败，尝试使用window.loadNotifications函数
        if (notifications.length === 0 && typeof window.loadNotifications === 'function') {
            try {
                notifications = window.loadNotifications();
                console.log('通过window.loadNotifications获取公告:', notifications.length);
            } catch (e) {
                console.error('调用loadNotifications失败:', e);
            }
        }
        
        // 方式3：如果方式2也失败，尝试直接从localStorage获取
        if (notifications.length === 0) {
            try {
                const notificationsData = localStorage.getItem('notifications');
                if (notificationsData) {
                    notifications = JSON.parse(notificationsData);
                    console.log('从localStorage直接获取公告:', notifications.length);
                }
            } catch (e) {
                console.error('从localStorage获取公告失败:', e);
            }
        }
        
        // 方式4：如果所有方式都失败，使用默认公告
        if (notifications.length === 0) {
            console.log('所有方式获取公告失败，使用默认公告');
            notifications = [
                {
                    id: 'default-1',
                    title: '默认公告标题1',
                    content: '这是一条默认公告内容，用于测试显示功能。',
                    publisher: '系统',
                    publishTime: new Date().toISOString()
                },
                {
                    id: 'default-2',
                    title: '默认公告标题2',
                    content: '这是第二条默认公告内容。',
                    publisher: '系统',
                    publishTime: new Date(Date.now() - 86400000).toISOString()
                }
            ];
        }
        
        console.log('最终使用的公告数据:', notifications);
        renderStudentNotifications(notifications);
    } catch (error) {
        console.error('加载公告列表发生异常:', error);
        // 显示错误信息和默认公告
        document.getElementById('notification-list').innerHTML = `
            <div class="error-message">
                加载公告失败，显示默认公告
            </div>
            <div class="notification-item">
                <h4>默认公告</h4>
                <p>系统公告内容测试</p>
                <div class="notification-meta">
                    <span>发布人: 系统管理员</span>
                    <span>发布时间: ${new Date().toLocaleString()}</span>
                </div>
            </div>
        `;
    }
}

// 渲染学生端公告列表
function renderStudentNotifications(notifications) {
    console.log('渲染公告列表，传入数据数量:', notifications ? notifications.length : 'undefined/null');
    
    const notificationList = document.getElementById('notification-list');
    
    if (!notificationList) {
        console.error('未找到公告列表容器');
        return;
    }
    
    // 清空列表
    notificationList.innerHTML = '';
    
    // 检查并显示空状态
    if (!notifications || notifications.length === 0) {
        console.log('公告数据为空，显示空状态');
        notificationList.innerHTML = `
            <div class="message message-info">
                <p>暂无系统公告</p>
                <p class="debug-info">调试：如果您看到这条消息，请检查公告数据初始化是否成功</p>
            </div>
        `;
        return;
    }
    
    // 按发布时间降序排序
    const sortedNotifications = [...notifications].sort((a, b) => {
        return new Date(b.publishTime) - new Date(a.publishTime);
    });
    
    console.log('排序后的公告数量:', sortedNotifications.length);
    console.log('排序后的公告数据:', sortedNotifications);
    
    // 渲染每个公告
    sortedNotifications.forEach(notification => {
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
        
        // 确保通知对象有必要的属性
        const title = notification.title || '无标题';
        const publisher = notification.publisher || '管理员';
        
        console.log('渲染公告项:', title);
        
        notificationItem.innerHTML = `
            <div class="notification-header">
                <h4 class="notification-title">${title}</h4>
                <span class="notification-time">${formattedTime}</span>
            </div>
            <div class="notification-content">
                <p>${truncatedContent}</p>
            </div>
            <div class="notification-meta">
                <span class="notification-author">发布人：${publisher}</span>
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
        authorElem.textContent = notification.publisher || '系统管理员';
        
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
        
        // 绑定关闭按钮事件
        const closeBtn = document.getElementById('closeNotificationBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                modal.style.display = 'none';
            });
        }
        
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
    
    renderStudentNotifications(notifications);
}

// 确保函数全局可访问
window.loadNotificationList = loadNotificationList;
window.searchNotifications = searchNotifications;
window.renderStudentNotifications = renderStudentNotifications;
window.showNotificationDetail = showNotificationDetail;

// 检查登录状态
function checkLoginStatus() {
    try {
        const user = localStorage.getItem('user');
        if (!user) {
            // 未登录，跳转到登录页
            window.location.href = 'index.html';
            return;
        }
        
        // 安全地解析用户对象
        let userInfo = null;
        try {
            userInfo = JSON.parse(user);
        } catch (e) {
            console.error('解析用户信息失败:', e);
            return;
        }
        
        // 检查用户对象是否有效
        if (!userInfo) {
            console.error('用户信息无效');
            return;
        }
        
        // 检查用户类型
        if (userInfo.type && userInfo.type !== 'student') {
            // 不是学生，跳转到对应页面
            if (userInfo.type === 'teacher') {
                window.location.href = 'teacher.html';
            } else if (userInfo.type === 'admin') {
                window.location.href = 'admin.html';
            }
            return;
        }
        
        // 安全地显示用户名
        if (userInfo.name && document.getElementById('userName')) {
            document.getElementById('userName').textContent = userInfo.name;
        }
    } catch (error) {
        console.error('检查登录状态时发生错误:', error);
        // 出错时继续执行，不阻止页面显示
    }
}

// 加载学生信息
function loadStudentInfo() {
    const user = JSON.parse(localStorage.getItem('user'));
    const student = window.getStudentById(user.id);
    
    if (student) {
        document.getElementById('studentId').textContent = student.id;
        document.getElementById('studentName').textContent = student.name;
        document.getElementById('studentMajor').textContent = student.major;
        document.getElementById('studentGrade').textContent = student.grade;
        document.getElementById('studentClass').textContent = student.class;
        document.getElementById('studentPhone').textContent = student.phone;
    }
}

// 加载团队信息
function loadTeamInfo() {
    const user = JSON.parse(localStorage.getItem('user'));
    // 从localStorage重新加载数据，确保获取最新的团队信息
    const teams = window.loadTeamsData();
    
    // 查找当前用户所在的团队
    const userTeam = teams.find(team => team.members.includes(user.id));
    
    // 重置按钮状态为默认值
    document.getElementById('createTeamBtn').disabled = false;
    document.getElementById('joinTeamBtn').disabled = false;
    
    if (userTeam) {
        // 用户在团队中
        document.getElementById('notInTeam').style.display = 'none';
        document.getElementById('teamDetail').style.display = 'block';
        document.getElementById('createTeamBtn').disabled = true;
        document.getElementById('joinTeamBtn').disabled = true;
        
        // 显示团队信息
        document.getElementById('teamName').textContent = userTeam.name;
        
        // 获取组长信息
        const leader = window.getStudentById(userTeam.leaderId);
        document.getElementById('teamLeader').textContent = leader.name;
        
        // 显示团队成员 - 确保清除之前的内容并重新渲染所有成员
        const memberList = document.getElementById('teamMembers');
        memberList.innerHTML = '';
        
        // 确保正确处理所有成员
        if (userTeam.members && userTeam.members.length > 0) {
            userTeam.members.forEach(memberId => {
                // 确保能正确获取成员信息
                const member = window.getStudentById(memberId);
                if (member) {
                    const li = document.createElement('li');
                    li.textContent = `${member.name} (${member.id})`;
                    // 如果是当前登录用户，标记一下
                    if (memberId === user.id) {
                        li.classList.add('current-user');
                        li.innerHTML += ' <span class="badge">您</span>';
                    }
                    memberList.appendChild(li);
                }
            });
        } else {
            // 防止没有成员的情况
            const li = document.createElement('li');
            li.textContent = '团队暂无成员';
            memberList.appendChild(li);
        }
        
        // 如果是组长，显示题目表单
        if (userTeam.leaderId === user.id) {
            document.getElementById('topicForm').style.display = 'block';
            document.getElementById('notLeaderAlert').style.display = 'none';
            
            // 检查是否已提交题目
            if (userTeam.topic) {
                document.getElementById('topicForm').style.display = 'none';
                document.getElementById('topicInfo').style.display = 'block';
                document.getElementById('savedTopicName').textContent = userTeam.topic.name;
                document.getElementById('savedTopicDescription').textContent = userTeam.topic.description;
                document.getElementById('topicSubmitDate').textContent = '提交时间：' + userTeam.topic.submitDate;
            } else {
                document.getElementById('topicForm').style.display = 'block';
                document.getElementById('topicInfo').style.display = 'none';
            }
        } else {
            document.getElementById('topicForm').style.display = 'none';
            document.getElementById('topicInfo').style.display = 'none';
            document.getElementById('notLeaderAlert').style.display = 'block';
        }
    } else {
        // 用户不在团队中
        document.getElementById('notInTeam').style.display = 'block';
        document.getElementById('teamDetail').style.display = 'none';
        document.getElementById('topicForm').style.display = 'none';
        document.getElementById('topicInfo').style.display = 'none';
        document.getElementById('notLeaderAlert').style.display = 'none';
    }
}

// 加载导师列表
function loadTeacherList() {
    const teachers = window.teachersData;
    const teacherList = document.getElementById('teacherList');
    
    teacherList.innerHTML = '';
    teachers.forEach(teacher => {
        const teacherCard = document.createElement('div');
        teacherCard.className = 'user-card';
        teacherCard.innerHTML = `
            <h4>${teacher.name}</h4>
            <p><strong>工号：</strong>${teacher.id}</p>
            <p><strong>职称：</strong>${teacher.title}</p>
            <p><strong>专业：</strong>${teacher.major}</p>
            <p><strong>研究方向：</strong>${teacher.research}</p>
            <p><strong>联系电话：</strong>${teacher.phone}</p>
            <p><strong>邮箱：</strong>${teacher.email}</p>
            <button class="btn btn-primary select-teacher" data-id="${teacher.id}">选择</button>
        `;
        teacherList.appendChild(teacherCard);
    });
}

// 获取未组队的学生名单
function getUnassignedStudents() {
    // 获取所有学生
    const allStudents = window.studentsData;
    
    // 获取所有团队
    const teams = window.loadTeamsData();
    
    // 收集所有已经在团队中的学生ID
    const assignedStudentIds = new Set();
    teams.forEach(team => {
        if (team.members && team.members.length > 0) {
            team.members.forEach(memberId => {
                assignedStudentIds.add(memberId);
            });
        }
    });
    
    // 过滤出未组队的学生
    const unassignedStudents = allStudents.filter(student => 
        !assignedStudentIds.has(student.id)
    );
    
    return unassignedStudents;
}

// 绑定事件
function bindEvents() {
    // 退出登录
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
    
    // 创建团队按钮
    document.getElementById('createTeamBtn').addEventListener('click', function() {
        document.getElementById('createTeamModal').style.display = 'block';
    });
    
    // 加入团队按钮
    document.getElementById('joinTeamBtn').addEventListener('click', function() {
        // 显示加入团队模态框
        document.getElementById('joinTeamModal').style.display = 'block';
        // 加载可用团队列表
        loadAvailableTeams();
    });
    
    // 关闭加入团队模态框按钮
    document.getElementById('closeJoinTeamBtn').addEventListener('click', function() {
        document.getElementById('joinTeamModal').style.display = 'none';
    });
    
    // 团队搜索框事件监听
    document.getElementById('teamSearch').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filterTeams(searchTerm);
    });
    
    // 关闭模态框（为所有关闭按钮添加事件监听）
    document.querySelectorAll('.close-modal').forEach(function(element) {
        element.addEventListener('click', function() {
            // 找到最近的模态框并关闭
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // 关闭添加成员模态框按钮
    document.getElementById('closeAddMemberBtn').addEventListener('click', function() {
        document.getElementById('addMemberModal').style.display = 'none';
    });
    
    // 关闭移除成员模态框按钮
    document.getElementById('closeRemoveMemberBtn').addEventListener('click', function() {
        document.getElementById('removeMemberModal').style.display = 'none';
    });
    
    // 为添加成员模态框中的添加学生按钮添加事件监听（委托事件处理）
    document.getElementById('unassignedStudentList').addEventListener('click', function(e) {
        if (e.target.classList.contains('add-student')) {
            const studentId = e.target.getAttribute('data-id');
            const currentTeam = window.currentTeamForAddMember;
            if (currentTeam) {
                actuallyAddTeamMember(studentId, currentTeam);
            }
        }
    });
    
    // 为学号筛选输入框添加事件监听
    document.getElementById('studentIdFilter').addEventListener('input', function() {
        const filterValue = this.value;
        const currentTeam = window.currentTeamForAddMember;
        if (currentTeam) {
            // 重新显示模态框并应用筛选
            showAddMemberModal(currentTeam, filterValue);
        }
    });
    
    // 为移除成员模态框中的移除学生按钮添加事件监听（委托事件处理）
    document.getElementById('teamMemberList').addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-student')) {
            const studentId = e.target.getAttribute('data-id');
            const currentTeam = window.currentTeamForRemoveMember;
            if (currentTeam) {
                // 确认移除操作
                if (confirm(`确定要移除该学生吗？`)) {
                    actuallyRemoveTeamMember(studentId, currentTeam);
                }
            }
        }
    });
    
    // 提交创建团队
    document.getElementById('confirmCreateTeamBtn').addEventListener('click', function() {
        const teamName = document.getElementById('newTeamName').value.trim();
        if (!teamName) {
            alert('请输入团队名称');
            return;
        }
        
        createTeam(teamName);
        document.getElementById('createTeamModal').style.display = 'none';
    });
    
    // 提交题目
    document.getElementById('submitTopicBtn').addEventListener('click', function() {
        const topicName = document.getElementById('topicName').value.trim();
        const topicDescription = document.getElementById('topicDescription').value.trim();
        
        if (!topicName || !topicDescription) {
            alert('请填写完整的题目信息');
            return;
        }
        
        submitTopic(topicName, topicDescription);
    });
    
    // 选择导师
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('select-teacher')) {
            const teacherId = e.target.getAttribute('data-id');
            selectTeacher(teacherId);
        }
    });
    
    // 确认导师选择
    document.getElementById('confirmSelectionBtn').addEventListener('click', function() {
        confirmTeacherSelection();
    });
    
    // 管理团队按钮
    document.getElementById('manageTeamBtn').addEventListener('click', function() {
        const user = JSON.parse(localStorage.getItem('user'));
        const teams = window.loadTeamsData();
        const userTeam = teams.find(team => team.members.includes(user.id));
        
        if (!userTeam) {
            alert('您还没有加入团队，请先创建或加入团队！');
            return;
        }
        
        // 检查是否是组长
        if (userTeam.leaderId === user.id) {
            // 显示管理团队的选项（可以是模态框或其他交互方式）
            const action = prompt('请选择操作：\n1. 添加成员\n2. 移除成员\n3. 解散团队');
            
            switch(action) {
                case '1':
                    // 添加成员
                    addTeamMember(userTeam);
                    break;
                case '2':
                    // 移除成员
                    removeTeamMember(userTeam);
                    break;
                case '3':
                    // 解散团队
                    if (confirm('确定要解散团队吗？此操作不可撤销！')) {
                        disbandTeam(userTeam.id);
                    }
                    break;
                default:
                    // 取消操作
                    break;
            }
        } else {
            alert('只有团队组长可以管理团队！');
        }
    });
    
    // 加入团队按钮的事件监听已在前面定义
    
    // 为公告搜索按钮添加事件监听器
    const notificationSearchBtn = document.getElementById('notification-search-btn');
    if (notificationSearchBtn) {
        notificationSearchBtn.addEventListener('click', function() {
            const searchInput = document.getElementById('notification-search-input');
            if (searchInput) {
                searchNotifications(searchInput.value);
            }
        });
    }
    
    // 为公告搜索输入框添加回车事件监听器
    const notificationSearchInput = document.getElementById('notification-search-input');
    if (notificationSearchInput) {
        notificationSearchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                searchNotifications(this.value);
            }
        });
    }
    
    // 初始化加载公告列表
    // 添加测试数据（仅在没有数据时添加）
    if (!localStorage.getItem('notifications')) {
        const testNotifications = [
            {
                id: "1",
                title: "关于毕业设计选题的重要通知",
                content: "各位同学请注意，毕业设计选题将于下周一开始，请提前准备好选题方向并与导师沟通。选题确定后将进行分组和任务分配。",
                publisher: "系统管理员",
                publishTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2天前
            },
            {
                id: "2",
                title: "学生组匹配结果已公布",
                content: "系统已完成学生组与导师的匹配工作，匹配结果现已公布。请各位同学和导师查看匹配结果，并及时进行沟通。如有异议，请在本周内提出申诉。",
                publisher: "系统管理员",
                publishTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1天前
            },
            {
                id: "3",
                title: "系统功能更新通知",
                content: "我们对系统进行了功能优化，新增了实时消息提醒、任务进度追踪等功能。请各位用户及时更新浏览器缓存以获得最佳体验。如有使用问题，请联系技术支持。",
                publisher: "技术支持团队",
                publishTime: new Date().toISOString() // 刚刚
            }
        ];
        localStorage.setItem('notifications', JSON.stringify(testNotifications));
        console.log('测试公告数据已添加到localStorage');
    }
    loadNotificationList();
}

// 暴露函数到window对象
window.loadNotificationList = loadNotificationList;
window.searchNotifications = searchNotifications;
window.renderStudentNotifications = renderStudentNotifications;

// 创建团队
function createTeam(teamName) {
    const user = JSON.parse(localStorage.getItem('user'));
    const teams = window.loadTeamsData();
    
    // 创建新团队
    const newTeam = {
        id: 'team' + Date.now(),
        name: teamName,
        leaderId: user.id,
        members: [user.id],
        createDate: new Date().toLocaleDateString(),
        direction: ''
    };
    
    // 添加到团队列表
    teams.push(newTeam);
    
    // 保存团队数据
    window.saveTeamsData(teams);
    
    // 重新加载团队信息
    loadTeamInfo();
    
    alert('团队创建成功！');
}

// 加载可用团队列表
function loadAvailableTeams() {
    const user = JSON.parse(localStorage.getItem('user'));
    const teams = window.loadTeamsData() || [];
    const teamListContainer = document.getElementById('availableTeamsList');
    
    // 清空现有列表
    teamListContainer.innerHTML = '';
    
    // 显示加载中状态
    teamListContainer.innerHTML = '<div class="loading-indicator">加载团队列表中...</div>';
    
    // 过滤出用户可以加入的团队（用户不在团队成员中）
    const availableTeams = teams.filter(team => team && team.members && !team.members.includes(user.id));
    
    // 清空加载中状态
    teamListContainer.innerHTML = '';
    
    if (availableTeams.length === 0) {
        teamListContainer.innerHTML = '<div class="no-results">暂无可用团队，请稍后再试或创建新团队。</div>';
        return;
    }
    
    // 渲染团队列表
    availableTeams.forEach(team => {
        const teamCard = document.createElement('div');
        teamCard.className = 'team-card';
        
        // 获取团队领导信息
        const leader = window.getStudentById ? window.getStudentById(team.leaderId) : null;
        const leaderName = leader ? leader.name : '未知';
        
        // 获取团队成员信息
        const memberNames = [];
        if (team.members && team.members.length > 0) {
            team.members.forEach(memberId => {
                if (memberId !== team.leaderId) { // 排除组长，避免重复显示
                    const member = window.getStudentById ? window.getStudentById(memberId) : null;
                    if (member) {
                        memberNames.push(member.name);
                    }
                }
            });
        }
        
        // 格式化创建时间
        const formattedDate = team.createdAt || team.createDate || '未知';
        
        teamCard.innerHTML = `
            <div class="team-card-header">
                <h3>${team.name}</h3>
                <span class="team-id">团队编号：${team.id}</span>
            </div>
            <div class="team-card-content">
                <div class="team-members">
                    <div class="member-tag leader">${leaderName} (组长)</div>
                    ${memberNames.slice(0, 2).map(name => `<div class="member-tag">${name}</div>`).join('')}
                    ${memberNames.length > 2 ? `<div class="member-tag more">+${memberNames.length - 2}</div>` : ''}
                </div>
                <p class="team-description">${team.description || '该团队尚未添加描述信息'}</p>
                <div class="team-stats">
                    <div class="stat-item">
                        <span class="stat-label">创建时间</span>
                        <span class="stat-value">${formattedDate}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">成员数量</span>
                        <span class="stat-value">${team.members ? team.members.length : 0}人</span>
                    </div>
                </div>
            </div>
            <div class="team-card-footer">
                <button class="btn btn-primary join-team-btn" data-team-id="${team.id}">加入团队</button>
            </div>
        `;
        
        teamListContainer.appendChild(teamCard);
    });
    
    // 为所有加入团队按钮添加事件监听
    document.querySelectorAll('.join-team-btn').forEach(button => {
        button.addEventListener('click', function() {
            const teamId = this.getAttribute('data-team-id');
            joinTeam(teamId);
        });
    });
}

// 加入团队
function joinTeam(teamId) {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            alert('请先登录！');
            return;
        }
        
        const teams = window.loadTeamsData() || [];
        
        // 查找指定团队
        const targetTeam = teams.find(team => team.id === teamId);
        
        if (!targetTeam) {
            alert('团队不存在或已被删除！');
            return;
        }
        
        // 检查用户是否已在团队中
        if (targetTeam.members && targetTeam.members.includes(user.id)) {
            alert('您已经是该团队的成员了！');
            return;
        }
        
        // 检查用户是否已经在其他团队中
        const userInOtherTeam = teams.some(team => 
            team.id !== teamId && team.members && team.members.includes(user.id)
        );
        
        if (userInOtherTeam) {
            if (!confirm('您已经加入了其他团队，确定要离开当前团队并加入新团队吗？')) {
                return;
            }
            
            // 从原团队中移除用户
            teams.forEach(team => {
                if (team.id !== teamId && team.members && team.members.includes(user.id)) {
                    const userIndex = team.members.indexOf(user.id);
                    team.members.splice(userIndex, 1);
                }
            });
        }
        
        // 确保targetTeam.members是数组
        if (!targetTeam.members) {
            targetTeam.members = [];
        }
        
        // 向团队添加成员
        targetTeam.members.push(user.id);
        
        // 保存更新后的团队数据
        if (window.saveTeamsData) {
            window.saveTeamsData(teams);
        } else {
            // 备用保存方式
            localStorage.setItem('teams', JSON.stringify(teams));
        }
        
        // 关闭模态框
        document.getElementById('joinTeamModal').style.display = 'none';
        
        // 重新加载团队信息
        loadTeamInfo();
        
        // 显示成功消息
        alert(`成功加入团队"${targetTeam.name}"！`);
    } catch (error) {
        console.error('加入团队失败:', error);
        alert('加入团队时发生错误，请稍后重试！');
    }
}

// 过滤团队列表
function filterTeams(searchTerm) {
    const teamCards = document.querySelectorAll('.team-card');
    
    teamCards.forEach(card => {
        const teamName = card.querySelector('h4').textContent.toLowerCase();
        const teamInfo = card.querySelector('.team-info').textContent.toLowerCase();
        
        if (teamName.includes(searchTerm) || teamInfo.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// 提交题目
function submitTopic(topicName, topicDescription) {
    const user = JSON.parse(localStorage.getItem('user'));
    const teams = window.loadTeamsData();
    
    // 查找用户所在的团队
    const userTeam = teams.find(team => team.leaderId === user.id);
    
    if (userTeam) {
        // 添加题目信息
        userTeam.topic = {
            name: topicName,
            description: topicDescription,
            submitDate: new Date().toLocaleDateString()
        };
        
        // 假设研究方向从题目名称中提取或默认为相关领域
        // 这里我们可以简单地设置一个默认值或基于题目名称的简单逻辑
        userTeam.direction = topicName.includes('人工智能') ? '人工智能' : 
                            topicName.includes('大数据') ? '大数据' : 
                            topicName.includes('软件工程') ? '软件工程' : 
                            topicName.includes('计算机网络') ? '计算机网络' : 
                            '计算机科学与技术';
        
        // 保存团队数据
        window.saveTeamsData(teams);
        
        // 更新显示
        document.getElementById('topicForm').style.display = 'none';
        document.getElementById('topicInfo').style.display = 'block';
        document.getElementById('savedTopicName').textContent = topicName;
        document.getElementById('savedTopicDescription').textContent = topicDescription;
        document.getElementById('topicSubmitDate').textContent = '提交时间：' + userTeam.topic.submitDate;
        
        alert('题目提交成功！');
    }
}

// 获取团队特定的localStorage键
function getTeamSpecificKey() {
    const user = JSON.parse(localStorage.getItem('user'));
    const teams = window.loadTeamsData() || [];
    const userTeam = teams.find(team => team && team.members && team.members.includes(user.id));
    return `selectedTeachers_${userTeam ? userTeam.id : 'default'}`;
}

// 选择导师
function selectTeacher(teacherId) {
    const storageKey = getTeamSpecificKey();
    let selectedTeachers = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    // 检查是否已选择3个导师
    if (selectedTeachers.length >= 3) {
        alert('最多只能选择3个导师');
        return;
    }
    
    // 检查是否已选择该导师
    if (selectedTeachers.includes(teacherId)) {
        alert('您已选择该导师');
        return;
    }
    
    // 添加到已选列表
    selectedTeachers.push(teacherId);
    localStorage.setItem(storageKey, JSON.stringify(selectedTeachers));
    
    // 更新显示
    updateSelectedTeachers();
}

// 移除单个已选导师
function removeSelectedTeacher(index) {
    const storageKey = getTeamSpecificKey();
    let selectedTeachers = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    // 移除指定索引的导师
    selectedTeachers.splice(index, 1);
    localStorage.setItem(storageKey, JSON.stringify(selectedTeachers));
    
    // 更新显示
    updateSelectedTeachers();
}

// 重置所有导师选择
function resetTeacherSelection() {
    if (confirm('确定要重置所有导师选择吗？此操作不可恢复。')) {
        const storageKey = getTeamSpecificKey();
        localStorage.removeItem(storageKey);
        updateSelectedTeachers();
        alert('已重置所有导师选择');
    }
}

// 更新已选导师显示
function updateSelectedTeachers() {
    const storageKey = getTeamSpecificKey();
    const selectedTeachers = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    // 更新进度条和选择计数
    const progressFill = document.getElementById('progress-fill');
    const selectionCount = document.getElementById('selection-count');
    const progressPercentage = (selectedTeachers.length / 3) * 100;
    
    if (progressFill) {
        progressFill.style.width = progressPercentage + '%';
    }
    
    if (selectionCount) {
        selectionCount.textContent = `${selectedTeachers.length}/3`;
    }
    
    if (selectedTeachers.length > 0) {
        document.getElementById('selectedTeachers').style.display = 'block';
        const selectionContent = document.getElementById('selectedTeachers');
        const list = document.getElementById('selectedTeachersList');
        list.innerHTML = '';
        
        selectedTeachers.forEach((teacherId, index) => {
            const teacher = window.getTeacherById(teacherId);
            if (teacher) {
                const li = document.createElement('li');
                li.style.display = 'flex';
                li.style.justifyContent = 'space-between';
                li.style.alignItems = 'center';
                li.style.padding = '5px 0';
                
                const teacherInfo = document.createElement('span');
                teacherInfo.textContent = `${index + 1}. ${teacher.name} (${teacher.research})`;
                
                const removeBtn = document.createElement('button');
                removeBtn.textContent = '移除';
                removeBtn.className = 'btn btn-sm btn-danger';
                removeBtn.style.marginLeft = '10px';
                removeBtn.onclick = function() {
                    removeSelectedTeacher(index);
                };
                
                li.appendChild(teacherInfo);
                li.appendChild(removeBtn);
                list.appendChild(li);
            }
        });
        
        // 检查是否已存在重置按钮，如果不存在则添加
        let resetBtn = selectionContent.querySelector('#resetSelectionBtn');
        if (!resetBtn) {
            resetBtn = document.createElement('button');
            resetBtn.id = 'resetSelectionBtn';
            resetBtn.textContent = '重置所有选择';
            resetBtn.className = 'btn btn-warning';
            resetBtn.style.marginTop = '10px';
            resetBtn.style.marginRight = '10px';
            resetBtn.onclick = resetTeacherSelection;
            
            // 插入到确认按钮之前
            const confirmBtn = document.getElementById('confirmSelectionBtn');
            selectionContent.insertBefore(resetBtn, confirmBtn);
        }
    } else {
        document.getElementById('selectedTeachers').style.display = 'none';
    }
}

// 确认导师选择
function confirmTeacherSelection() {
    try {
        // 获取必要数据，添加异常处理
        const userJson = localStorage.getItem('user');
        if (!userJson) {
            alert('用户信息丢失，请重新登录');
            return;
        }
        
        const user = JSON.parse(userJson);
        const teams = window.loadTeamsData() || [];
        
        // 使用团队特定的localStorage键
        const storageKey = getTeamSpecificKey();
        const selectedTeachersJson = localStorage.getItem(storageKey);
        const selectedTeachers = selectedTeachersJson ? JSON.parse(selectedTeachersJson) : [];
        
        // 验证选择的导师数量
        if (!Array.isArray(selectedTeachers) || selectedTeachers.length !== 3) {
            alert('请选择3个导师作为志愿');
            return;
        }
        
        // 查找用户所在的团队
        const userTeam = teams.find(team => team && team.members && team.members.includes(user.id));
        
        if (userTeam) {
            // 保存导师志愿到团队数据
            userTeam.teacherPreferences = selectedTeachers;
            window.saveTeamsData(teams);
            
            // 从localStorage重新加载学生志愿数据，确保数据最新
            const preferencesJson = localStorage.getItem('studentPreferencesData');
            let studentPreferencesData = preferencesJson ? JSON.parse(preferencesJson) : [];
            
            // 确保是数组格式
            if (!Array.isArray(studentPreferencesData)) {
                studentPreferencesData = [];
            }
            
            // 检查是否已存在该团队的志愿记录
            const existingIndex = studentPreferencesData.findIndex(pref => pref && pref.teamId === userTeam.id);
            const currentDate = new Date().toLocaleDateString();
            const newPreference = {
                teamId: userTeam.id,
                preferences: selectedTeachers,
                submitDate: currentDate
            };
            
            if (existingIndex >= 0) {
                // 更新现有记录
                studentPreferencesData[existingIndex] = newPreference;
            } else {
                // 添加新记录
                studentPreferencesData.push(newPreference);
            }
            
            // 更新全局变量和localStorage
            window.studentPreferencesData = studentPreferencesData;
            
            // 保存到localStorage（使用try-catch确保即使保存失败也能继续）
            try {
                if (typeof window.saveStudentPreferencesData === 'function') {
                    window.saveStudentPreferencesData(studentPreferencesData);
                } else {
                    // 备用保存方式
                    localStorage.setItem('studentPreferencesData', JSON.stringify(studentPreferencesData));
                }
            } catch (saveError) {
                console.error('保存学生志愿数据时出错:', saveError);
            }
            
            alert('导师选择提交成功！');
        } else {
            alert('未找到您所在的团队信息');
        }
    } catch (error) {
        console.error('处理导师选择确认时发生错误:', error);
        alert('提交过程中出现错误，请稍后重试');
    }
}

// 显示添加成员模态框
function showAddMemberModal(team, filterStudentId = '') {
    // 保存当前团队引用，供模态框中的按钮使用
    window.currentTeamForAddMember = team;
    
    // 获取未组队学生名单
    const unassignedStudents = getUnassignedStudents();
    
    // 根据学号筛选学生
    let filteredStudents = unassignedStudents;
    if (filterStudentId.trim()) {
        const filterValue = filterStudentId.toLowerCase();
        filteredStudents = unassignedStudents.filter(student => 
            student.id.toLowerCase().includes(filterValue)
        );
    }
    
    // 显示学生列表
    const studentListContainer = document.getElementById('unassignedStudentList');
    studentListContainer.innerHTML = '';
    
    if (filteredStudents.length === 0) {
        if (filterStudentId.trim()) {
            studentListContainer.innerHTML = `<p class="no-data">没有找到学号包含"${filterStudentId}"的学生</p>`;
        } else {
            studentListContainer.innerHTML = '<p class="no-data">没有可添加的学生</p>';
        }
    } else {
        filteredStudents.forEach(student => {
            const studentCard = document.createElement('div');
            studentCard.className = 'user-card';
            studentCard.innerHTML = `
                <h4>${student.name}</h4>
                <p><strong>学号：</strong>${student.id}</p>
                <p><strong>专业：</strong>${student.major}</p>
                <p><strong>班级：</strong>${student.class}</p>
                <button class="btn btn-primary add-student" data-id="${student.id}">添加</button>
            `;
            studentListContainer.appendChild(studentCard);
        });
    }
    
    // 显示模态框
    document.getElementById('addMemberModal').style.display = 'block';
}

// 添加团队成员
function addTeamMember(team) {
    // 直接显示添加成员模态框
    showAddMemberModal(team);
}

// 实际添加团队成员的函数
function actuallyAddTeamMember(studentId, team) {
    // 检查学生是否存在
    const student = window.getStudentById(studentId);
    if (!student) {
        alert('未找到该学生！');
        return;
    }
    
    // 检查学生是否已经在其他团队中
    const teams = window.loadTeamsData();
    const hasTeam = teams.some(t => t.members.includes(studentId));
    if (hasTeam) {
        alert('该学生已经在其他团队中！');
        return;
    }
    
    // 检查学生是否已经在本团队中
    if (team.members.includes(studentId)) {
        alert('该学生已经是团队成员！');
        return;
    }
    
    // 在teams数组中找到对应的团队对象并添加成员
    const targetTeam = teams.find(t => t.id === team.id);
    if (targetTeam) {
        targetTeam.members.push(studentId);
        
        // 同时更新传入的team对象（保持界面显示一致性）
        team.members.push(studentId);
        
        // 保存更新后的团队数据
        window.saveTeamsData(teams);
        
        // 重新加载团队信息
        loadTeamInfo();
        
        // 关闭模态框
        document.getElementById('addMemberModal').style.display = 'none';
        
        alert(`成功添加${student.name}到团队！`);
    } else {
        alert('未找到目标团队，添加成员失败！');
    }
}

// 显示移除成员模态框
function showRemoveMemberModal(team) {
    // 保存当前团队引用，供模态框中的按钮使用
    window.currentTeamForRemoveMember = team;
    
    const user = JSON.parse(localStorage.getItem('user'));
    
    // 获取团队成员列表（不包括组长）
    const teamMembers = team.members.filter(memberId => memberId !== user.id)
        .map(memberId => window.getStudentById(memberId))
        .filter(Boolean); // 过滤掉找不到信息的成员
    
    // 显示成员列表
    const memberListContainer = document.getElementById('teamMemberList');
    memberListContainer.innerHTML = '';
    
    if (teamMembers.length === 0) {
        memberListContainer.innerHTML = '<p class="no-data">团队中没有可移除的成员</p>';
    } else {
        teamMembers.forEach(student => {
            const studentCard = document.createElement('div');
            studentCard.className = 'user-card';
            studentCard.innerHTML = `
                <h4>${student.name}</h4>
                <p><strong>学号：</strong>${student.id}</p>
                <p><strong>专业：</strong>${student.major}</p>
                <p><strong>班级：</strong>${student.class}</p>
                <button class="btn btn-danger remove-student" data-id="${student.id}">移除</button>
            `;
            memberListContainer.appendChild(studentCard);
        });
    }
    
    // 显示模态框
    document.getElementById('removeMemberModal').style.display = 'block';
}

// 移除团队成员
function removeTeamMember(team) {
    if (team.members.length <= 1) {
        alert('团队至少需要保留一名成员！');
        return;
    }
    
    // 显示移除成员模态框
    showRemoveMemberModal(team);
}

// 实际移除团队成员的函数
function actuallyRemoveTeamMember(studentId, team) {
    // 检查学生是否在团队中
    const studentIndex = team.members.indexOf(studentId);
    if (studentIndex === -1) {
        alert('该学生不在团队中！');
        return;
    }
    
    // 获取学生信息
    const student = window.getStudentById(studentId);
    const studentName = student ? student.name : studentId;
    
    // 加载团队数据
    const teams = window.loadTeamsData();
    
    // 在teams数组中找到对应的团队对象并移除成员
    const targetTeam = teams.find(t => t.id === team.id);
    if (targetTeam) {
        // 在targetTeam中查找学生索引
        const targetStudentIndex = targetTeam.members.indexOf(studentId);
        if (targetStudentIndex !== -1) {
            // 移除targetTeam中的成员
            targetTeam.members.splice(targetStudentIndex, 1);
            
            // 同时更新传入的team对象（保持界面显示一致性）
            team.members.splice(studentIndex, 1);
            
            // 保存更新后的团队数据
            window.saveTeamsData(teams);
            
            // 重新加载团队信息
            loadTeamInfo();
            
            // 关闭模态框
            document.getElementById('removeMemberModal').style.display = 'none';
            
            alert(`成功移除${studentName}从团队！`);
        } else {
            alert('未在团队数据中找到该学生！');
        }
    } else {
        alert('未找到目标团队，移除成员失败！');
    }
}

// 解散团队
function disbandTeam(teamId) {
    let teams = window.loadTeamsData();
    
    // 移除团队
    teams = teams.filter(team => team.id !== teamId);
    
    // 保存团队数据
    window.saveTeamsData(teams);
    
    // 重新加载团队信息
    loadTeamInfo();
    
    // 启用创建和加入团队按钮
    document.getElementById('createTeamBtn').disabled = false;
    document.getElementById('joinTeamBtn').disabled = false;
    
    alert('团队已成功解散！');
}

// joinTeamById函数已被移除，使用更友好的模态框选择团队功能

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

// 显示匹配结果
function displayMatchingResult() {
    // 获取当前用户信息
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    // 获取结果元素
    const resultElement = document.getElementById('matchingResults');
    if (!resultElement) return;
    
    // 加载匹配结果数据
    const matchingResultsData = loadMatchingResultsData();
    
    // 加载团队数据
    const teams = window.loadTeamsData() || [];
    
    // 找到当前用户所在的团队
    const currentTeam = teams.find(team => team.members.includes(user.id));
    if (!currentTeam) {
        resultElement.innerHTML = '<div class="message message-warning"><p>您还没有加入团队，请先加入或创建团队。</p></div>';
        return;
    }
    
    // 查找当前团队的匹配结果
    const matchResult = matchingResultsData.find(match => match.teamId === currentTeam.id);
    
    if (matchResult && matchResult.teacherId) {
        // 获取匹配的导师信息
        const teacher = window.getTeacherById(matchResult.teacherId);
        
        // 获取团队成员信息
        const teamMembers = [];
        for (const memberId of currentTeam.members) {
            const member = window.getStudentById(memberId);
            if (member) {
                teamMembers.push(member.name);
            }
        }
        
        // 构建完整的匹配结果表格
        let html = `
            <div class="success-icon">🎯</div>
            <h4>匹配结果已公布</h4>
            <div class="match-info">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>团队名称</th>
                            <th>团队成员</th>
                            <th>课题名称</th>
                            <th>匹配导师</th>
                            <th>匹配度</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${currentTeam.name}</td>
                            <td>${teamMembers.join(', ')}</td>
                            <td>${currentTeam.topic ? currentTeam.topic.name : '未设置'}</td>
                            <td>${teacher ? teacher.name : '未知导师'}</td>
                            <td>${(matchResult.score || 0).toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
        
        resultElement.innerHTML = html;
    } else {
        resultElement.innerHTML = '<div class="message message-info"><p>等待中：系统正在进行匹配，请稍后查看结果。</p></div>';
    }
}

// 在页面加载完成时调用显示匹配结果函数
window.addEventListener('load', function() {
    // 确保在其他初始化完成后调用
    setTimeout(displayMatchingResult, 100);
});

// 确保函数全局可访问
window.loadMatchingResultsData = loadMatchingResultsData;
window.displayMatchingResult = displayMatchingResult;