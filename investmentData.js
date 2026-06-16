// ============================================
// LRKK Family - 投资记录/定投日历数据
// ============================================

const investmentData = {
    // 定投记录
    records: [
        { date: '2024-01-15', amount: 1000, asset: 'BTC', price: 42000, note: '月度定投' },
        { date: '2024-01-15', amount: 500, asset: 'ETH', price: 2500, note: '月度定投' },
        { date: '2024-02-15', amount: 1000, asset: 'BTC', price: 48000, note: '月度定投' },
        { date: '2024-02-15', amount: 500, asset: 'ETH', price: 2800, note: '月度定投' },
        { date: '2024-03-15', amount: 1000, asset: 'BTC', price: 45000, note: '月度定投' },
        { date: '2024-03-15', amount: 500, asset: 'ETH', price: 2600, note: '月度定投' },
    ],
    
    // 定投统计
    stats: {
        totalInvested: 4500,
        currentValue: 5200,
        startDate: '2024-01-15',
        totalMonths: 3,
        monthlyAmount: 1500
    },
    
    // 定投日历（模拟数据）
    calendar: {
        year: 2024,
        months: [
            {
                month: 1,
                days: [
                    { date: '2024-01-15', type: 'invest', amount: 1500, note: '定投日' },
                    { date: '2024-01-20', type: 'read', note: '读完《定投改变命运》' },
                    { date: '2024-01-25', type: 'check', note: '月度复盘' }
                ]
            },
            {
                month: 2,
                days: [
                    { date: '2024-02-15', type: 'invest', amount: 1500, note: '定投日' },
                    { date: '2024-02-18', type: 'read', note: '读完《把时间当作朋友》' },
                    { date: '2024-02-25', type: 'check', note: '月度复盘' }
                ]
            },
            {
                month: 3,
                days: [
                    { date: '2024-03-15', type: 'invest', amount: 1500, note: '定投日' },
                    { date: '2024-03-20', type: 'read', note: '读完《自学是门手艺》' },
                    { date: '2024-03-25', type: 'check', note: '月度复盘' }
                ]
            }
        ]
    }
};
