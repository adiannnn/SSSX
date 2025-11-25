// 检查学生组数据的测试脚本
function checkTeamsData() {
    // 模拟浏览器环境的localStorage
    // 注意：此脚本需要在浏览器控制台中运行
    
    try {
        // 加载团队数据
        const teamsData = localStorage.getItem('teamsData');
        
        if (!teamsData) {
            console.log('当前系统中没有学生组数据');
            return { hasTeams: false, teams: [] };
        }
        
        const teams = JSON.parse(teamsData);
        
        if (teams && teams.length > 0) {
            console.log('当前系统中有学生组，共 ' + teams.length + ' 个团队：');
            
            teams.forEach((team, index) => {
                console.log(`\n团队 ${index + 1}:`);
                console.log(`- 团队ID: ${team.id}`);
                console.log(`- 团队名称: ${team.name}`);
                console.log(`- 组长ID: ${team.leaderId}`);
                console.log(`- 成员数量: ${team.members.length}`);
                console.log(`- 成员列表: ${team.members.join(', ')}`);
            });
            
            return { hasTeams: true, teams: teams };
        } else {
            console.log('当前系统中没有学生组数据');
            return { hasTeams: false, teams: [] };
        }
    } catch (error) {
        console.error('检查团队数据时出错:', error);
        return { hasTeams: false, teams: [], error: error.message };
    }
}

// 导出函数，便于在浏览器控制台中使用
window.checkTeamsData = checkTeamsData;
console.log('检查团队数据函数已加载，请调用 checkTeamsData() 查看当前学生组情况');