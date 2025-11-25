// 注意：由于浏览器环境限制，不使用import/export
// 数据将从全局变量获取，在data.js中定义全局变量

// 获取DOM元素
const userType = document.getElementById('userType');
const username = document.getElementById('username');
const password = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const errorMsg = document.getElementById('errorMsg');

// 登录功能
loginBtn.addEventListener('click', function() {
    const type = userType.value;
    const user = username.value.trim();
    const pwd = password.value.trim();
    
    // 清空错误信息
    errorMsg.textContent = '';
    
    // 验证输入
    if (!user || !pwd) {
        errorMsg.textContent = '请输入账号和密码';
        return;
    }
    
    // 根据用户类型进行登录验证
    switch(type) {
        case 'student':
            loginAsStudent(user, pwd);
            break;
        case 'teacher':
            loginAsTeacher(user, pwd);
            break;
        case 'admin':
            loginAsAdmin(user, pwd);
            break;
    }
});

// 学生登录
function loginAsStudent(userId, pwd) {
    // 查找学生
    const student = window.getStudentById(userId);
    
    if (student && pwd === '123456') {
        // 保存登录信息到localStorage
        localStorage.setItem('user', JSON.stringify({
            type: 'student',
            id: student.id,
            name: student.name
        }));
        
        // 跳转到学生主页
        window.location.href = 'student.html';
    } else {
        errorMsg.textContent = '学生账号或密码错误';
    }
}

// 导师登录
function loginAsTeacher(userId, pwd) {
    // 查找导师
    const teacher = window.getTeacherById(userId);
    
    if (teacher && pwd === '123456') {
        // 保存登录信息到localStorage
        localStorage.setItem('user', JSON.stringify({
            type: 'teacher',
            id: teacher.id,
            name: teacher.name
        }));
        
        // 跳转到导师主页
        window.location.href = 'teacher.html';
    } else {
        errorMsg.textContent = '导师账号或密码错误';
    }
}

// 管理员登录
function loginAsAdmin(userId, pwd) {
    const admin = window.adminData;
    if (userId === admin.id && pwd === admin.password) {
        // 保存登录信息到localStorage
        localStorage.setItem('user', JSON.stringify({
            type: 'admin',
            id: admin.id,
            name: admin.name
        }));
        
        // 跳转到管理员主页
        window.location.href = 'admin.html';
    } else {
        errorMsg.textContent = '管理员账号或密码错误';
    }
}

// 回车键登录
password.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        loginBtn.click();
    }
});