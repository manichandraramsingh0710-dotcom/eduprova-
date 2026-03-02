import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const ProgressCircle = ({ progress }) => {
    const data = [
        { name: 'Completed', value: progress },
        { name: 'Remaining', value: 100 - progress },
    ];

    const COLORS = ['#3b82f6', '#e5e7eb']; // Tailwind blue-500 and gray-200

    return (
        <div className="relative h-48 w-48 mx-auto">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={0}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value) => `${value}%`}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-bold text-gray-800">{progress}%</span>
                <span className="text-xs text-gray-500 uppercase tracking-wider mt-1 font-medium">Progress</span>
            </div>
        </div>
    );
};

export default ProgressCircle;
