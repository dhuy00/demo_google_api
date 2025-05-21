import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#00c49f', '#ff6384'];

const dummyFiles = [
  { name: 'Báo cáo.pdf', mimeType: 'application/pdf', size: 300000 },
  { name: 'Ảnh.png', mimeType: 'image/png', size: 120000 },
  { name: 'Kế hoạch.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 240000 },
  { name: 'Tài liệu Google', mimeType: 'application/vnd.google-apps.document', size: 80000 },
  { name: 'Hóa đơn.pdf', mimeType: 'application/pdf', size: 150000 },
  { name: 'Ảnh2.jpg', mimeType: 'image/jpeg', size: 90000 },
  { name: 'Bảng tính Google', mimeType: 'application/vnd.google-apps.spreadsheet', size: 200000 },
];

export default function DriveStats() {
  const [statsByType, setStatsByType] = useState([]);
  const [sizeByType, setSizeByType] = useState([]);

  useEffect(() => {
    const groupByType = {};
    const sizeMap = {};

    dummyFiles.forEach((file) => {
      const typeKey = getType(file.mimeType);

      if (!groupByType[typeKey]) {
        groupByType[typeKey] = 0;
        sizeMap[typeKey] = 0;
      }

      groupByType[typeKey] += 1;
      sizeMap[typeKey] += file.size || 0;
    });

    const typeData = Object.keys(groupByType).map((key) => ({
      type: key,
      count: groupByType[key],
    }));

    const sizeData = Object.keys(sizeMap).map((key) => ({
      type: key,
      sizeMB: +(sizeMap[key] / (1024 * 1024)).toFixed(2),
    }));

    setStatsByType(typeData);
    setSizeByType(sizeData);
  }, []);

  const getType = (mime) => {
    if (mime.startsWith('image/')) return 'Ảnh';
    if (mime === 'application/pdf') return 'PDF';
    if (mime.includes('spreadsheet')) return 'Google Sheets';
    if (mime.includes('document')) return 'Google Docs';
    if (mime.includes('word')) return 'Word';
    return 'Khác';
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-10 space-y-10">
      <h2 className="text-2xl font-bold text-gray-800">📊 Thống kê file Google Drive</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pie Chart - Số lượng theo loại */}
        <div className="bg-gray-50 p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4 text-center">Số lượng file theo loại</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statsByType}
                dataKey="count"
                nameKey="type"
                outerRadius={100}
                label
              >
                {statsByType.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Dung lượng theo loại */}
        <div className="bg-gray-50 p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4 text-center">Dung lượng theo loại (MB)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sizeByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sizeMB" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
