// 系统数据模块 - 包含模拟数据和数据结构

// 模拟用户数据
const mockUsers = {
    // 学生用户
    students: [
        {
            id: '1001',
            name: '张三',
            password: '123456',
            type: 'student',
            groupId: 1,
            phone: '13800138001',
            email: 'zhangsan@example.com'
        },
        {
            id: '1002',
            name: '李四',
            password: '123456',
            type: 'student',
            groupId: 2,
            phone: '13800138002',
            email: 'lisi@example.com'
        },
        {
            id: '1003',
            name: '王五',
            password: '123456',
            type: 'student',
            groupId: 3,
            phone: '13800138003',
            email: 'wangwu@example.com'
        }
    ],
    
    // 导师用户
    teachers: [
        {
            id: '2001',
            name: '李教授',
            password: '123456',
            type: 'teacher',
            department: '计算机科学与技术',
            title: '教授',
            phone: '13900139001',
            email: 'prof.li@example.com'
        },
        {
            id: '2002',
            name: '张副教授',
            password: '123456',
            type: 'teacher',
            department: '软件工程',
            title: '副教授',
            phone: '13900139002',
            email: 'assoc.prof.zhang@example.com'
        }
    ],
    
    // 管理员用户
    admins: [
        {
            id: '3001',
            name: '管理员',
            password: 'admin123',
            type: 'admin'
        }
    ]
};

// 模拟学生组数据
const mockStudentGroups = [
    {
        id: 1,
        name: '人工智能研究小组',
        leaderId: '1001',
        leaderName: '张三',
        members: [
            { id: '1001', name: '张三', role: '组长' },
            { id: '1004', name: '赵六', role: '成员' },
            { id: '1005', name: '钱七', role: '成员' },
            { id: '1006', name: '孙八', role: '成员' },
            { id: '1007', name: '周九', role: '成员' }
        ],
        direction: '机器学习与模式识别',
        introduction: '专注于深度学习算法研究与应用',
        preferences: [2001, 2002], // 偏好导师ID
        createdAt: '2024-01-15'
    },
    {
        id: 2,
        name: '大数据分析团队',
        leaderId: '1002',
        leaderName: '李四',
        members: [
            { id: '1002', name: '李四', role: '组长' },
            { id: '1008', name: '吴十', role: '成员' },
            { id: '1009', name: '郑十一', role: '成员' },
            { id: '1010', name: '陈十二', role: '成员' }
        ],
        direction: '大数据挖掘与分析',
        introduction: '致力于大数据处理技术与应用开发',
        preferences: [2001],
        createdAt: '2024-01-16'
    },
    {
        id: 3,
        name: '前端开发组',
        leaderId: '1003',
        leaderName: '王五',
        members: [
            { id: '1003', name: '王五', role: '组长' },
            { id: '1011', name: '林十三', role: '成员' },
            { id: '1012', name: '黄十四', role: '成员' }
        ],
        direction: 'Web前端开发',
        introduction: '专注于现代前端框架与用户体验优化',
        preferences: [2002],
        createdAt: '2024-01-17'
    },
    {
        id: 4,
        name: '后端架构组',
        leaderId: '1013',
        leaderName: '刘十五',
        members: [
            { id: '1013', name: '刘十五', role: '组长' },
            { id: '1014', name: '杨十六', role: '成员' },
            { id: '1015', name: '唐十七', role: '成员' },
            { id: '1016', name: '许十八', role: '成员' }
        ],
        direction: '分布式系统与微服务',
        introduction: '研究高可用分布式系统架构设计',
        preferences: [2001, 2002],
        createdAt: '2024-01-18'
    },
    {
        id: 5,
        name: '移动应用开发',
        leaderId: '1017',
        leaderName: '韩十九',
        members: [
            { id: '1017', name: '韩十九', role: '组长' },
            { id: '1018', name: '冯二十', role: '成员' },
            { id: '1019', name: '蒋二十一', role: '成员' }
        ],
        direction: 'Android/iOS应用开发',
        introduction: '专注于跨平台移动应用开发技术',
        preferences: [2002],
        createdAt: '2024-01-19'
    },
    {
        id: 6,
        name: '网络安全小组',
        leaderId: '1020',
        leaderName: '朱二十二',
        members: [
            { id: '1020', name: '朱二十二', role: '组长' },
            { id: '1021', name: '秦二十三', role: '成员' },
            { id: '1022', name: '尤二十四', role: '成员' },
            { id: '1023', name: '许二十五', role: '成员' }
        ],
        direction: '信息安全与网络防护',
        introduction: '研究网络安全技术与防护策略',
        preferences: [2001],
        createdAt: '2024-01-20'
    }
];

// 模拟导师信息数据
const mockTeachersInfo = [
    {
        id: '2001',
        name: '李教授',
        department: '计算机科学与技术',
        title: '教授',
        phone: '13900139001',
        email: 'prof.li@example.com',
        researchDirections: [
            '人工智能',
            '机器学习',
            '数据挖掘'
        ],
        availableSlots: 3,
        selectedGroups: [],
        matchedGroups: []
    },
    {
        id: '2002',
        name: '张副教授',
        department: '软件工程',
        title: '副教授',
        phone: '13900139002',
        email: 'assoc.prof.zhang@example.com',
        researchDirections: [
            '软件工程',
            'Web开发',
            '移动应用开发'
        ],
        availableSlots: 2,
        selectedGroups: [],
        matchedGroups: []
    }
];

// 模拟匹配结果数据
const mockMatchResults = [
    {
        id: 1,
        teacherId: '2001',
        teacherName: '李教授',
        groupId: 1,
        groupName: '人工智能研究小组',
        matchRate: '95%',
        reason: '研究方向高度匹配',
        status: '已匹配',
        matchTime: '2024-01-25 10:30:00'
    },
    {
        id: 2,
        teacherId: '2001',
        teacherName: '李教授',
        groupId: 2,
        groupName: '大数据分析团队',
        matchRate: '88%',
        reason: '成员结构合理',
        status: '已匹配',
        matchTime: '2024-01-25 10:30:00'
    },
    {
        id: 3,
        teacherId: '2002',
        teacherName: '张副教授',
        groupId: 3,
        groupName: '前端开发组',
        matchRate: '92%',
        reason: '研究方向完全一致',
        status: '已匹配',
        matchTime: '2024-01-25 10:30:00'
    }
];

// 数据访问函数
const dataAccess = {
    // 用户验证
    authenticateUser(id, password, type) {
        const userList = mockUsers[type + 's'] || [];
        return userList.find(user => user.id === id && user.password === password);
    },
    
    // 获取用户信息
    getUserInfo(id, type) {
        if (type === 'teacher') {
            return mockTeachersInfo.find(teacher => teacher.id === id);
        }
        const userList = mockUsers[type + 's'] || [];
        return userList.find(user => user.id === id);
    },
    
    // 获取学生组列表
    getStudentGroups() {
        return [...mockStudentGroups];
    },
    
    // 获取学生组详情
    getStudentGroup(id) {
        return mockStudentGroups.find(group => group.id === id);
    },
    
    // 获取导师列表
    getTeachers() {
        return [...mockTeachersInfo];
    },
    
    // 获取导师详情
    getTeacher(id) {
        return mockTeachersInfo.find(teacher => teacher.id === id);
    },
    
    // 更新导师信息
    updateTeacherInfo(id, updates) {
        const teacher = mockTeachersInfo.find(t => t.id === id);
        if (teacher) {
            Object.assign(teacher, updates);
            return true;
        }
        return false;
    },
    
    // 保存导师选择的学生组
    saveTeacherSelections(teacherId, groupIds) {
        const teacher = mockTeachersInfo.find(t => t.id === teacherId);
        if (teacher) {
            teacher.selectedGroups = [...groupIds];
            return true;
        }
        return false;
    },
    
    // 获取匹配结果
    getMatchResults(teacherId) {
        return mockMatchResults.filter(result => result.teacherId === teacherId);
    },
    
    // 搜索学生组
    searchStudentGroups(keyword) {
        if (!keyword) return this.getStudentGroups();
        
        const lowerKeyword = keyword.toLowerCase();
        return mockStudentGroups.filter(group => 
            group.name.toLowerCase().includes(lowerKeyword) ||
            group.leaderName.toLowerCase().includes(lowerKeyword) ||
            group.direction.toLowerCase().includes(lowerKeyword) ||
            group.introduction.toLowerCase().includes(lowerKeyword)
        );
    }
};

// 导出数据和数据访问接口
window.mockUsers = mockUsers;
window.mockStudentGroups = mockStudentGroups;
window.mockTeachersInfo = mockTeachersInfo;
window.mockMatchResults = mockMatchResults;
window.dataAccess = dataAccess;

// 为了兼容性，添加一个简单的数据存储接口
window.dataStorage = {
    setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('数据存储失败:', e);
            return false;
        }
    },
    getItem(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('数据读取失败:', e);
            return null;
        }
    },
    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('数据删除失败:', e);
            return false;
        }
    }
};