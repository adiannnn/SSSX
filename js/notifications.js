// 公告数据管理模块

/**
 * 加载所有公告
 * @returns {Array} 公告列表数组
 */
function loadNotifications() {
    try {
        // 从localStorage获取公告数据
        const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
        
        // 更新全局数据
        window.notificationsData = notifications;
        
        // 按时间倒序排序，最新的在前面
        return [...notifications].sort((a, b) => 
            new Date(b.publishTime) - new Date(a.publishTime)
        );
    } catch (error) {
        console.error('加载公告失败:', error);
        return [];
    }
}

/**
 * 获取最新的n条公告
 * @param {number} limit 限制数量
 * @returns {Array} 公告列表数组
 */
function getLatestNotifications(limit = 10) {
    const notifications = loadNotifications();
    return notifications.slice(0, limit);
}

/**
 * 获取公告详情
 * @param {string} id 公告ID
 * @returns {Object|null} 公告对象或null
 */
function getNotificationById(id) {
    try {
        const notifications = loadNotifications();
        return notifications.find(notification => notification.id === id) || null;
    } catch (error) {
        console.error('获取公告详情失败:', error);
        return null;
    }
}

/**
 * 渲染公告列表
 * @param {HTMLElement} container 容器元素
 * @param {Array} notifications 公告列表
 * @param {boolean} showFullContent 是否显示完整内容
 */
function renderNotifications(container, notifications = [], showFullContent = false) {
    if (!container) return;
    
    container.innerHTML = '';
    
    if (notifications.length === 0) {
        const emptyElement = document.createElement('div');
        emptyElement.className = 'empty-notification';
        emptyElement.innerHTML = '<p>暂无公告</p>';
        container.appendChild(emptyElement);
        return;
    }
    
    notifications.forEach(notification => {
        const notificationElement = document.createElement('div');
        notificationElement.className = 'notification-item';
        
        // 格式化时间
        const formattedTime = new Date(notification.publishTime).toLocaleString('zh-CN');
        
        // 根据是否显示完整内容决定内容显示
        const content = showFullContent ? 
            notification.content : 
            (notification.content.length > 100 ? notification.content.substring(0, 100) + '...' : notification.content);
        
        notificationElement.innerHTML = `
            <div class="notification-header">
                <h4 class="notification-title">${notification.title}</h4>
                <span class="notification-time">${formattedTime}</span>
            </div>
            <div class="notification-content">
                <p>${content}</p>
            </div>
            <div class="notification-meta">
                <span class="notification-author">发布人：${notification.publisher}</span>
            </div>
        `;
        
        container.appendChild(notificationElement);
    });
}

/**
 * 搜索公告
 * @param {string} keyword 搜索关键词
 * @returns {Array} 搜索结果
 */
function searchNotifications(keyword) {
    if (!keyword || keyword.trim() === '') {
        return loadNotifications();
    }
    
    const lowerKeyword = keyword.toLowerCase().trim();
    const notifications = loadNotifications();
    
    return notifications.filter(notification => 
        notification.title.toLowerCase().includes(lowerKeyword) ||
        notification.content.toLowerCase().includes(lowerKeyword)
    );
}

// 将函数暴露给window对象，供其他模块使用
window.notificationsManager = {
    loadNotifications,
    getLatestNotifications,
    getNotificationById,
    renderNotifications,
    searchNotifications
};

// 为了兼容性，也直接暴露部分常用函数
window.loadNotifications = loadNotifications;
// 添加与student.js兼容的函数名，确保学生端可以正确加载公告
// 使用立即执行函数确保兼容性处理正确
(function() {
    // 确保函数正确赋值
    window.loadNotificationsData = loadNotifications;
    console.log('已设置window.loadNotificationsData = loadNotifications');
    
    // 添加一个简单的测试函数用于验证
    window.testNotificationFunctionality = function() {
        try {
            const notifications = window.loadNotificationsData();
            console.log('测试获取公告成功，数量：', notifications.length);
            return notifications;
        } catch (error) {
            console.error('测试公告功能失败:', error);
            return [];
        }
    };
})();

window.getLatestNotifications = getLatestNotifications;
window.renderNotifications = renderNotifications;

// 确保有测试公告数据
function initNotificationData() {
    try {
        // 检查localStorage中是否有公告数据
        const existingNotifications = localStorage.getItem('notifications');
        let notifications = [];
        
        if (existingNotifications) {
            try {
                notifications = JSON.parse(existingNotifications);
                console.log('发现现有公告数据，数量：', notifications.length);
            } catch (e) {
                console.error('解析现有公告数据失败，将重置：', e);
                notifications = [];
            }
        }
        
        // 如果没有公告数据或数据为空数组，添加测试公告
        if (!notifications || notifications.length === 0) {
            // 添加测试公告数据
            const testNotifications = [
                {
                    id: "1",
                    title: "关于毕业设计选题的重要通知",
                    content: "各位同学请注意，毕业设计选题将于下周一开始，请提前准备好选题方向并与导师沟通。选题确定后将进行分组和任务分配。",
                    publisher: "系统管理员",
                    publishTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: "2",
                    title: "学生组匹配结果已公布",
                    content: "系统已完成学生组与导师的匹配工作，匹配结果现已公布。请各位同学和导师查看匹配结果，并及时进行沟通。如有异议，请在本周内提出申诉。",
                    publisher: "系统管理员",
                    publishTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: "3",
                    title: "系统功能更新通知",
                    content: "我们对系统进行了功能优化，新增了实时消息提醒、任务进度追踪等功能。请各位用户及时更新浏览器缓存以获得最佳体验。如有使用问题，请联系技术支持。",
                    publisher: "技术支持团队",
                    publishTime: new Date().toISOString()
                }
            ];
            localStorage.setItem('notifications', JSON.stringify(testNotifications));
            console.log('测试公告数据已添加到localStorage', testNotifications);
            // 更新全局数据
            window.notificationsData = testNotifications;
        } else {
            // 更新全局数据
            window.notificationsData = notifications;
        }
    } catch (error) {
        console.error('初始化公告数据失败:', error);
        // 即使出错也要确保有基础的公告数据
        const fallbackNotifications = [
            {
                id: "fallback-1",
                title: "系统公告",
                content: "欢迎使用毕业设计师生双选系统",
                publisher: "系统管理员",
                publishTime: new Date().toISOString()
            }
        ];
        localStorage.setItem('notifications', JSON.stringify(fallbackNotifications));
        window.notificationsData = fallbackNotifications;
        console.log('已设置备用公告数据');
    }
}

// 立即执行初始化，确保页面加载时就有数据
initNotificationData();

// 页面加载完成后再次确认数据
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，确认公告数据状态');
    // 再次调用以确保数据已初始化
    const notifications = loadNotifications();
    console.log('当前公告数量：', notifications.length);
    console.log('window.loadNotificationsData函数是否存在：', typeof window.loadNotificationsData === 'function');
});

// 确保loadNotificationsData正确指向loadNotifications函数
if (typeof window.loadNotificationsData !== 'function') {
    window.loadNotificationsData = window.loadNotifications;
    console.log('已确保window.loadNotificationsData指向window.loadNotifications');
} else {
    console.log('window.loadNotificationsData已存在且为函数');
}
