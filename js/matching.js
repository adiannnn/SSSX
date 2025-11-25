// 系统自动匹配算法实现

// 计算研究方向匹配度
function calculateResearchMatch(teamTopic, teacherResearch) {
    // 转换为小写并拆分关键词
    const topicKeywords = teamTopic.toLowerCase().split(/[\s,，。;；、]+/);
    const researchKeywords = teacherResearch.toLowerCase().split(/[\s,，。;；、]+/);
    
    // 计算匹配的关键词数量
    let matchCount = 0;
    topicKeywords.forEach(keyword => {
        if (keyword.length > 1 && researchKeywords.some(rKey => rKey.includes(keyword))) {
            matchCount++;
        }
    });
    
    // 计算匹配度分数（0-1）
    const maxKeywords = Math.max(topicKeywords.filter(k => k.length > 1).length, 1);
    return matchCount / maxKeywords;
}

// 计算学生偏好分数
function calculateStudentPreferenceScore(teamId, teacherId) {
    // 优先使用全局变量，备选使用localStorage
    const studentPreferencesData = window.studentPreferencesData && Array.isArray(window.studentPreferencesData) 
        ? window.studentPreferencesData 
        : JSON.parse(localStorage.getItem('studentPreferencesData') || '[]');
    
    console.log('学生偏好数据长度:', studentPreferencesData.length);
    const teamPreference = studentPreferencesData.find(pref => pref.teamId === teamId);
    
    if (!teamPreference || !teamPreference.selectedTeachers) {
        console.log(`未找到团队 ${teamId} 的偏好数据`);
        return 0;
    }
    
    // 计算分数：第一志愿3分，第二志愿2分，第三志愿1分
    const index = teamPreference.selectedTeachers.indexOf(teacherId);
    const score = index === 0 ? 3 : index === 1 ? 2 : index === 2 ? 1 : 0;
    console.log(`团队 ${teamId} 对导师 ${teacherId} 的偏好分数: ${score}`);
    return score;
}

// 计算导师偏好分数
function calculateTeacherPreferenceScore(teamId, teacherId) {
    // 优先使用全局变量，备选使用localStorage
    const teacherPreferencesData = window.teacherPreferencesData && Array.isArray(window.teacherPreferencesData) 
        ? window.teacherPreferencesData 
        : JSON.parse(localStorage.getItem('teacherPreferencesData') || '[]');
    
    console.log('导师偏好数据长度:', teacherPreferencesData.length);
    const teacherPreference = teacherPreferencesData.find(pref => pref.teacherId === teacherId);
    
    if (!teacherPreference || !teacherPreference.selectedGroups) {
        console.log(`未找到导师 ${teacherId} 的偏好数据`);
        return 0;
    }
    
    // 计算分数：第一志愿5分，第二志愿4分，依此类推
    const index = teacherPreference.selectedGroups.indexOf(teamId);
    const score = index !== -1 ? 5 - index : 0;
    console.log(`导师 ${teacherId} 对团队 ${teamId} 的偏好分数: ${score}`);
    return score;
}

// 计算团队和导师之间的匹配分数
function calculateMatchScore(team, teacher, settings) {
    // 获取权重设置
    const studentPrefWeight = settings.studentPrefWeight || 0.5;
    const teacherPrefWeight = settings.teacherPrefWeight || 0.5;
    const researchMatchWeight = settings.researchMatchWeight || 0.3;
    
    // 计算各项分数
    const studentScore = calculateStudentPreferenceScore(team.id, teacher.id);
    const teacherScore = calculateTeacherPreferenceScore(team.id, teacher.id);
    
    // 计算研究方向匹配度
    let researchMatch = 0;
    if (team.topic && teacher.research) {
        researchMatch = calculateResearchMatch(team.topic.name + ' ' + team.topic.description, teacher.research);
    }
    
    // 归一化分数
    const normalizedStudentScore = studentScore / 3; // 最高得3分
    const normalizedTeacherScore = teacherScore / 5; // 最高得5分
    
    // 计算最终匹配分数
    // 注意：需要确保权重总和为1
    const baseWeightSum = studentPrefWeight + teacherPrefWeight;
    const finalScore = 
        (normalizedStudentScore * studentPrefWeight / baseWeightSum) +
        (normalizedTeacherScore * teacherPrefWeight / baseWeightSum) +
        (researchMatch * researchMatchWeight);
    
    return finalScore;
}

// 主匹配算法
function performMatching(settings) {
    console.log('开始执行匹配算法...');
    
    // 加载系统设置，优先使用传入的settings
    let systemSettings = {
        studentPrefWeight: 0.5,
        teacherPrefWeight: 0.5,
        researchMatchWeight: 0.3,
        maxStudentsPerTeacher: 5,
        minStudentsPerTeam: 1
    };
    
    // 合并传入的设置
    if (settings) {
        systemSettings = { ...systemSettings, ...settings };
        console.log('已合并用户提供的设置:', settings);
    }
    
    console.log('最终系统设置:', systemSettings);
    
    // 加载数据
    const teams = window.loadTeamsData ? window.loadTeamsData() : [];
    const teachers = window.teachersData || [];
    
    console.log('可用团队数量:', teams.length);
    if (teams.length === 0) {
        console.error('警告: 没有加载到团队数据');
    }
    
    console.log('可用教师数量:', teachers.length);
    if (teachers.length === 0) {
        console.error('警告: 没有加载到教师数据');
    }
    
    // 筛选已提交题目的团队
    const validTeams = teams.filter(team => team.topic);
    console.log('有效团队数量(已选题):', validTeams.length);
    
    if (validTeams.length === 0) {
        console.error('错误: 没有有效的团队数据，所有团队都没有选题');
    } else {
        console.log('有效团队列表:', validTeams.map(team => `团队ID: ${team.id}, 选题: ${team.topic.name || '未知'}`));
    }
    
    // 为每个团队计算与每个导师的匹配分数
    const matchingResults = [];
    let matchCount = 0;
    
    validTeams.forEach(team => {
        console.log(`处理团队: ${team.id}, 选题: ${team.topic ? team.topic.name : '无'}`);
        teachers.forEach(teacher => {
            const score = calculateMatchScore(team, teacher, systemSettings);
            console.log(`团队 ${team.id} 与教师 ${teacher.id} 的匹配分数: ${score.toFixed(3)}`);
            matchingResults.push({
                teamId: team.id,
                teacherId: teacher.id,
                score: score
            });
            matchCount++;
        });
    });
    
    console.log(`总共计算了 ${matchCount} 个可能的匹配组合`);
    
    // 按照匹配分数降序排序
    matchingResults.sort((a, b) => b.score - a.score);
    console.log('排序后的前5个匹配:', matchingResults.slice(0, 5).map(m => `团队${m.teamId}->教师${m.teacherId}: ${m.score.toFixed(3)}`));
    
    // 使用贪心算法进行匹配
    const matchedTeams = new Set();
    const matchedTeachers = new Map(); // 存储每个导师已匹配的团队数量
    const finalMatches = [];
    
    console.log('开始贪心匹配过程...');
    let firstRoundMatches = 0;
    
    matchingResults.forEach(pair => {
        // 检查团队是否已匹配
        if (matchedTeams.has(pair.teamId)) {
            console.log(`跳过: 团队 ${pair.teamId} 已匹配`);
            return;
        }

        // 检查导师是否已达到最大匹配数量
        const currentCount = matchedTeachers.get(pair.teacherId) || 0;
        const maxMatches = systemSettings.maxStudentsPerTeacher || 5;
        if (currentCount >= maxMatches) {
            console.log(`跳过: 教师 ${pair.teacherId} 已达到最大匹配数 ${maxMatches}`);
            return;
        }
        
        // 进行匹配
        matchedTeams.add(pair.teamId);
        matchedTeachers.set(pair.teacherId, currentCount + 1);
        firstRoundMatches++;
        
        console.log(`成功匹配: 团队 ${pair.teamId} -> 教师 ${pair.teacherId}, 分数: ${pair.score.toFixed(3)}`);
        
        // 添加到最终匹配结果
        finalMatches.push({
            id: `match-${pair.teamId}-${pair.teacherId}`,
            teamId: pair.teamId,
            teacherId: pair.teacherId,
            score: pair.score,
            matchTime: new Date().toLocaleString()
        });
    });
    
    console.log(`第一轮贪心匹配完成，匹配了 ${firstRoundMatches} 个团队`);
    
    // 处理未匹配的团队
    console.log('开始处理未匹配的团队...');
    let additionalMatches = 0;
    
    validTeams.forEach(team => {
        if (!matchedTeams.has(team.id)) {
            console.log(`处理未匹配团队: ${team.id}`);
            
            // 寻找未达到匹配上限的导师
            let availableTeacher = null;
            for (let [teacherId, count] of matchedTeachers.entries()) {
                const maxMatches = systemSettings.maxStudentsPerTeacher || 5;
                if (count < maxMatches) {
                    availableTeacher = teacherId;
                    console.log(`找到可用教师: ${teacherId}, 当前指导 ${count}/${maxMatches} 个团队`);
                    break;
                }
            }
            
            // 如果没有可用导师，分配给匹配分数最高的未匹配导师
            if (!availableTeacher && teachers.length > 0) {
                availableTeacher = teachers[0].id;
                console.log(`未找到可用教师，选择默认教师: ${availableTeacher}`);
            }
            
            if (availableTeacher) {
                const targetTeacher = window.getTeacherById ? window.getTeacherById(availableTeacher) : teachers.find(t => t.id === availableTeacher);
                const score = calculateMatchScore(team, targetTeacher, systemSettings);
                
                console.log(`额外匹配: 团队 ${team.id} -> 教师 ${availableTeacher}, 分数: ${score.toFixed(3)}`);
                
                finalMatches.push({
                    id: `match-${team.id}-${availableTeacher}`,
                    teamId: team.id,
                    teacherId: availableTeacher,
                    score: score,
                    matchTime: new Date().toLocaleString()
                });
                
                matchedTeams.add(team.id);
                matchedTeachers.set(availableTeacher, (matchedTeachers.get(availableTeacher) || 0) + 1);
                additionalMatches++;
            } else {
                console.log(`警告: 没有可用教师，团队 ${team.id} 无法匹配`);
            }
        }
    });
    
    console.log(`额外匹配完成，匹配了 ${additionalMatches} 个团队`);
    console.log(`匹配完成，结果总数: ${finalMatches.length}`);
    
    // 输出匹配统计信息
    console.log('教师分配统计:');
    teachers.forEach(teacher => {
        const count = matchedTeachers.get(teacher.id) || 0;
        console.log(`教师 ${teacher.id}: ${count} 个团队`);
    });
    
    // 保存匹配结果
    window.matchingResultsData = finalMatches;
    
    // 调用保存函数
    if (window.saveMatchingResultsData) {
        console.log('调用保存函数保存匹配结果');
        window.saveMatchingResultsData(finalMatches);
    } else {
        // 如果保存函数不存在，直接保存到localStorage
        localStorage.setItem('matchingResultsData', JSON.stringify(finalMatches));
        console.log('匹配结果已直接保存到localStorage');
    }
    
    return finalMatches;
}

// 更新学生端和导师端的匹配结果显示
function updateMatchDisplays() {
    try {
        const matches = window.getMatchingResultsData();
        console.log('更新显示匹配结果数量:', matches.length);
        
        // 为每个团队保存匹配的导师信息
        let teams = [];
        if (window.loadTeamsData && typeof window.loadTeamsData === 'function') {
            try {
                teams = window.loadTeamsData();
                if (!Array.isArray(teams)) {
                    console.warn('loadTeamsData返回非数组数据');
                    teams = [];
                }
            } catch (e) {
                console.error('loadTeamsData执行出错:', e);
                teams = [];
            }
        }
        
        if (teams.length > 0 && matches.length > 0) {
            teams.forEach(team => {
                const match = matches.find(m => m.teamId === team.id || m.teamId === team.teamId);
                if (match) {
                    team.matchedTeacherId = match.teacherId;
                    team.matchedTeacherName = window.getTeacherById(match.teacherId)?.name;
                }
            });
            
            // 保存更新后的团队数据
            if (window.saveTeamsData && typeof window.saveTeamsData === 'function') {
                try {
                    window.saveTeamsData(teams);
                    console.log('团队数据已更新并保存');
                } catch (e) {
                    console.error('保存团队数据出错:', e);
                }
            }
        }
        
        return matches;
    } catch (error) {
        console.error('updateMatchDisplays出错:', error);
        return [];
    }
}

// 导出匹配结果为CSV格式
function exportMatchesToCSV() {
    const matches = window.matchingResultsData || [];
    const teams = window.loadTeamsData ? window.loadTeamsData() : [];
    
    // 构建CSV内容
    let csvContent = '团队名称,团队成员,毕业设计题目,导师姓名,匹配得分,匹配时间\n';
    
    matches.forEach(match => {
        const team = teams.find(t => t.id === match.teamId);
        const teacher = window.getTeacherById ? window.getTeacherById(match.teacherId) : null;
        
        if (team && teacher) {
            const teamMembers = team.members || [];
        const memberNames = teamMembers.map(memberId => {
            const member = window.getStudentById ? window.getStudentById(memberId) : null;
            return member ? member.name : '未知成员';
        }).join(', ');
            const topicName = team.topic ? team.topic.name : '无';
            
            csvContent += `"${team.name}","${memberNames}","${topicName}","${teacher.name}",${match.score.toFixed(2)},"${match.matchTime}"\n`;
        }
    });
    
    return csvContent;
}

// 提供给管理员端调用的函数
window.runMatchingAlgorithm = function(settings) {
    try {
        console.log('========== 开始执行匹配算法 ==========');
        console.log('用户提供的设置:', settings || '无');
        
        // 安全地获取团队数据
        let teams = [];
        try {
            teams = window.teamsData && Array.isArray(window.teamsData) ? window.teamsData : 
                    (localStorage.getItem('teamsData') ? JSON.parse(localStorage.getItem('teamsData')) : []);
        } catch (e) {
            console.error('获取团队数据出错:', e);
            teams = [];
        }
        
        // 安全地获取教师数据
        let teachers = [];
        try {
            teachers = window.teachersData && Array.isArray(window.teachersData) ? window.teachersData : 
                      (localStorage.getItem('teachersData') ? JSON.parse(localStorage.getItem('teachersData')) : []);
        } catch (e) {
            console.error('获取教师数据出错:', e);
            teachers = [];
        }
        
        // 验证数据
        if (teams.length === 0) {
            console.error('错误: 没有可用的团队数据');
            throw new Error('没有可用的团队数据');
        }
        
        if (teachers.length === 0) {
            console.error('错误: 没有可用的教师数据');
            throw new Error('没有可用的教师数据');
        }
        
        // 确保全局变量设置正确
        window.teamsData = teams;
        window.teachersData = teachers;
        
        // 执行匹配算法
        const results = performMatching(settings || {});
        
        console.log('匹配算法执行完成，结果数量:', results.length);
        
        // 更新显示 - 更加安全的错误处理
        try {
            updateMatchDisplays();
            console.log('匹配结果显示已更新');
        } catch (displayError) {
            console.error('更新显示时出错，忽略继续执行:', displayError.message);
            // 即使显示更新失败，也返回匹配结果
        }
        
        // 返回匹配结果
        return results;
    } catch (error) {
        console.error('匹配算法执行出错:', error);
        // 尝试创建一个空的结果对象，确保调用方不会崩溃
        try {
            window.matchingResultsData = [];
            localStorage.setItem('matchingResultsData', JSON.stringify([]));
        } catch (e) {
            console.error('设置空结果也失败:', e);
        }
        throw error;
    } finally {
        console.log('========== 匹配算法执行结束 ==========');
    }
};

// 添加全局辅助函数，确保能正确获取团队数据
window.getTeamById = function(teamId) {
    try {
        let teams = [];
        if (window.teamsData && Array.isArray(window.teamsData)) {
            teams = window.teamsData;
        } else {
            const stored = localStorage.getItem('teamsData');
            if (stored) {
                teams = JSON.parse(stored);
                if (!Array.isArray(teams)) {
                    console.warn('teamsData格式错误，期望数组');
                    teams = [];
                }
            }
        }
        return teams.find(team => team.id === teamId || team.teamId === teamId || team.teamId === teamId.toString());
    } catch (error) {
        console.error('getTeamById出错:', error);
        return null;
    }
};

// 添加全局辅助函数，确保能正确获取教师数据
window.getTeacherById = function(teacherId) {
    try {
        let teachers = [];
        if (window.teachersData && Array.isArray(window.teachersData)) {
            teachers = window.teachersData;
        } else {
            const stored = localStorage.getItem('teachersData');
            if (stored) {
                teachers = JSON.parse(stored);
                if (!Array.isArray(teachers)) {
                    console.warn('teachersData格式错误，期望数组');
                    teachers = [];
                }
            }
        }
        return teachers.find(teacher => teacher.id === teacherId || teacher.teacherId === teacherId || teacher.teacherId === teacherId.toString());
    } catch (error) {
        console.error('getTeacherById出错:', error);
        return null;
    }
};

// 添加获取匹配结果数据的安全函数
window.getMatchingResultsData = function() {
    try {
        if (window.matchingResultsData && Array.isArray(window.matchingResultsData)) {
            return window.matchingResultsData;
        }
        const stored = localStorage.getItem('matchingResultsData');
        if (stored) {
            const results = JSON.parse(stored);
            return Array.isArray(results) ? results : [];
        }
        return [];
    } catch (error) {
        console.error('获取匹配结果数据出错:', error);
        return [];
    }
};

// 导出CSV功能
window.exportMatchesAsCSV = exportMatchesToCSV;

// 添加保存匹配结果的函数
window.saveMatchingResultsData = function(results) {
    try {
        localStorage.setItem('matchingResultsData', JSON.stringify(results));
        console.log('匹配结果已保存到localStorage:', results.length, '条记录');
        return true;
    } catch (error) {
        console.error('保存匹配结果失败:', error);
        return false;
    }
};

// 测试用例函数，用于验证匹配算法功能
window.testMatchingAlgorithm = function() {
    console.log('========== 开始匹配算法测试 ==========');
    
    try {
        // 创建模拟数据
        const mockTeams = [
            {
                id: 'team1',
                teamId: 'team1',
                teamName: '团队1',
                selectedTopic: '人工智能',
                researchDirection: '人工智能'
            },
            {
                id: 'team2',
                teamId: 'team2',
                teamName: '团队2',
                selectedTopic: '计算机网络',
                researchDirection: '计算机网络'
            }
        ];
        
        const mockTeachers = [
            {
                id: 'teacher1',
                teacherId: 'teacher1',
                name: '张教授',
                researchDirection: '人工智能'
            },
            {
                id: 'teacher2',
                teacherId: 'teacher2',
                name: '李教授',
                researchDirection: '计算机网络'
            }
        ];
        
        const mockStudentPreferences = [
            {
                teamId: 'team1',
                selectedTeachers: ['teacher1', 'teacher2']
            },
            {
                teamId: 'team2',
                selectedTeachers: ['teacher2', 'teacher1']
            }
        ];
        
        const mockTeacherPreferences = [
            {
                teacherId: 'teacher1',
                selectedGroups: ['team1', 'team2']
            },
            {
                teacherId: 'teacher2',
                selectedGroups: ['team2', 'team1']
            }
        ];
        
        // 保存模拟数据到localStorage
        localStorage.setItem('teamsData', JSON.stringify(mockTeams));
        localStorage.setItem('teachersData', JSON.stringify(mockTeachers));
        localStorage.setItem('studentPreferencesData', JSON.stringify(mockStudentPreferences));
        localStorage.setItem('teacherPreferencesData', JSON.stringify(mockTeacherPreferences));
        
        // 设置全局变量
        window.teamsData = mockTeams;
        window.teachersData = mockTeachers;
        window.studentPreferencesData = mockStudentPreferences;
        window.teacherPreferencesData = mockTeacherPreferences;
        
        console.log('模拟数据已创建:', {
            teams: mockTeams.length,
            teachers: mockTeachers.length,
            studentPrefs: mockStudentPreferences.length,
            teacherPrefs: mockTeacherPreferences.length
        });
        
        // 执行匹配算法
        const settings = {
            studentPreferenceWeight: 0.3,
            teacherPreferenceWeight: 0.4,
            researchMatchWeight: 0.3,
            maxTeamsPerTeacher: 2
        };
        
        console.log('使用设置参数执行测试:', settings);
        const results = performMatching(settings);
        
        console.log('测试结果:', {
            success: results && results.length > 0,
            matchCount: results ? results.length : 0,
            results: results
        });
        
        // 验证结果
        if (results && results.length > 0) {
            console.log('✅ 匹配算法测试成功！');
            return {
                success: true,
                message: `测试成功！成功匹配 ${results.length} 个团队。`,
                results: results
            };
        } else {
            console.log('❌ 匹配算法测试失败，未生成匹配结果');
            return {
                success: false,
                message: '测试失败，未生成匹配结果',
                results: []
            };
        }
    } catch (error) {
        console.error('测试过程中发生错误:', error);
        return {
            success: false,
            message: '测试过程中发生错误: ' + error.message,
            error: error
        };
    } finally {
        console.log('========== 匹配算法测试结束 ==========');
    }
};

// 自动执行测试的函数（仅在开发环境使用）
function autoTestMatchingAlgorithm() {
    // 检测是否是开发环境
    if (window.location.href.includes('localhost') || window.location.href.includes('127.0.0.1')) {
        console.log('在开发环境中，5秒后自动测试匹配算法...');
        setTimeout(() => {
            window.testMatchingAlgorithm();
        }, 5000);
    }
}