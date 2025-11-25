// 测试脚本：添加测试公告数据到localStorage
function addTestNotifications() {
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
    console.log('当前公告数据:', localStorage.getItem('notifications'));
}

// 执行添加测试数据
addTestNotifications();