import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#00c49f', '#ff6384'];

const fileTypes = [
  { label: 'Tất cả', value: '' },
  { label: 'PDF', value: 'application/pdf' },
  { label: 'Ảnh', value: 'image/' },
  { label: 'Google Docs', value: 'application/vnd.google-apps.document' },
  { label: 'Google Sheets', value: 'application/vnd.google-apps.spreadsheet' },
  { label: 'Video', value: 'video/' },
];

export default function DriveSearch() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [keyword, setKeyword] = useState('');
  const [fileType, setFileType] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewFileId, setPreviewFileId] = useState(null);

  // Thống kê dữ liệu cho biểu đồ
  const [statsByType, setStatsByType] = useState([]);
  const [sizeByType, setSizeByType] = useState([]);

  const getType = (mime) => {
    if (mime.startsWith('image/')) return 'Ảnh';
    if (mime === 'application/pdf') return 'PDF';
    if (mime.includes('spreadsheet')) return 'Google Sheets';
    if (mime.includes('document')) return 'Google Docs';
    if (mime.includes('word')) return 'Word';
    return 'Khác';
  };

  // Cập nhật thống kê mỗi khi results thay đổi
  useEffect(() => {
    const groupByType = {};
    const sizeMap = {};

    results.forEach((file) => {
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
  }, [results]);

  const formatSize = (bytes) => {
    if (!bytes) return '-';
    const kb = bytes / 1024;
    return kb > 1024 ? (kb / 1024).toFixed(2) + ' MB' : kb.toFixed(1) + ' KB';
  };

  const handleSearch = async () => {
    setLoading(true);

    try {
      // TODO: Thay bằng API thực, hiện dummy data tạm
      const dummyResults = [
        {
          id: '1abc123',
          name: 'Báo cáo tài chính.pdf',
          mimeType: 'application/pdf',
          size: 204800,
          webViewLink: 'https://drive.google.com/file/d/1abc123/view',
        },
        {
          id: '2xyz456',
          name: 'Ảnh chụp màn hình.png',
          mimeType: 'image/png',
          size: 102400,
          webViewLink: 'https://drive.google.com/file/d/2xyz456/view',
        },
        {
          id: '3def789',
          name: 'Kế hoạch Google Docs',
          mimeType: 'application/vnd.google-apps.document',
          size: 80000,
          webViewLink: 'https://docs.google.com/document/d/3def789/edit',
        },
      ];

      // Lọc theo từ khóa & loại file đơn giản
      let filtered = dummyResults;
      if (keyword.trim()) {
        filtered = filtered.filter((f) =>
          f.name.toLowerCase().includes(keyword.toLowerCase())
        );
      }
      if (fileType) {
        filtered = filtered.filter((f) =>
          fileType.endsWith('/') // ví dụ 'image/' để filter ảnh
            ? f.mimeType.startsWith(fileType)
            : f.mimeType === fileType
        );
      }

      setResults(filtered);
    } catch (err) {
      console.error('Lỗi tìm kiếm:', err);
      setResults([]);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-wrap rounded-2xl mt-24 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">🔍 Tìm kiếm & Thống kê file Google Drive</h1>

      {/* Form tìm kiếm */}
      <div className="flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Từ khóa tìm kiếm..."
          className="flex-1 p-2 border rounded"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <select
          className="p-2 border rounded"
          value={fileType}
          onChange={(e) => setFileType(e.target.value)}
        >
          {fileTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? 'Đang tìm...' : 'Tìm kiếm'}
        </button>
      </div>

      {/* Kết quả tìm kiếm */}
      {results.length > 0 ? (
        <>
          <table className="w-full mt-6 table-auto border text-sm rounded-md overflow-hidden">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3 border">Tên file</th>
                <th className="p-3 border">Loại MIME</th>
                <th className="p-3 border">Dung lượng</th>
                <th className="p-3 border">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {results.map((file) => (
                <tr key={file.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 border">{file.name}</td>
                  <td className="p-3 border text-gray-600">{file.mimeType}</td>
                  <td className="p-3 border">{formatSize(file.size)}</td>
                  <td className="p-3 border flex gap-4">
                    <a
                      href={file.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Xem file
                    </a>
                    <button
                      onClick={() => setPreviewFileId(file.id)}
                      className="text-gray-700 underline hover:text-blue-500"
                    >
                      Xem trước
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Biểu đồ thống kê */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            {/* Pie Chart số lượng */}
            <div className="bg-gray-50 p-4 rounded-xl shadow">
              <h3 className="text-lg font-semibold mb-4 text-center">
                Số lượng file theo loại
              </h3>
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
                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart dung lượng */}
            <div className="bg-gray-50 p-4 rounded-xl shadow">
              <h3 className="text-lg font-semibold mb-4 text-center">
                Dung lượng theo loại (MB)
              </h3>
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
        </>
      ) : (
        <div className="text-center text-gray-500 pt-6">
          {loading ? 'Đang tìm kiếm...' : 'Chưa có kết quả nào.'}
        </div>
      )}

      {/* Modal xem trước file */}
      {previewFileId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 w-[90%] h-[90%] relative shadow-2xl">
            <button
              className="absolute top-2 right-4 text-gray-500 hover:text-red-500 text-2xl"
              onClick={() => setPreviewFileId(null)}
            >
              ✕
            </button>
            <iframe
              src={`https://drive.google.com/file/d/${previewFileId}/preview`}
              className="w-full h-full rounded"
              allow="autoplay"
            />
          </div>
        </div>
      )}
    </div>
  );
}
