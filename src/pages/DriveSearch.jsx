import React, { useState, useEffect, useContext, useRef } from 'react';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

export default function DriveSearch() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [keyword, setKeyword] = useState('');
  const [fileType, setFileType] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewFileId, setPreviewFileId] = useState(null);

  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState('');

  const fileInputRef = useRef(null);

  const fileTypes = [
    { label: 'Tất cả', value: '' },
    { label: 'PDF', value: 'application/pdf' },
    { label: 'Ảnh', value: 'image/' },
    { label: 'Google Docs', value: 'application/vnd.google-apps.document' },
    { label: 'Google Sheets', value: 'application/vnd.google-apps.spreadsheet' },
    { label: 'Video', value: 'video/' },
  ];

  useEffect(() => {
    const fetchFolders = async () => {
      if (!user?.access_token) return;
      try {
        const res = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.folder'&fields=files(id,name)&pageSize=1000`,
          {
            headers: {
              Authorization: `Bearer ${user.access_token}`,
            },
          }
        );
        const data = await res.json();
        setFolders(data.files || []);
      } catch (err) {
        console.error('Lỗi tải thư mục:', err);
      }
    };
    fetchFolders();
  }, [user]);

  const getType = (mime) => {
    if (mime.startsWith('image/')) return 'Ảnh';
    if (mime === 'application/pdf') return 'PDF';
    if (mime.includes('spreadsheet')) return 'Google Sheets';
    if (mime.includes('document')) return 'Google Docs';
    if (mime.includes('word')) return 'Word';
    return 'Khác';
  };

  const formatSize = (bytes) => {
    if (!bytes) return '-';
    const kb = bytes / 1024;
    return kb > 1024 ? (kb / 1024).toFixed(2) + ' MB' : kb.toFixed(1) + ' KB';
  };

  const handleSearch = async () => {
    if (!user?.access_token) return alert('Vui lòng đăng nhập.');
    setLoading(true);

    try {
      const query = [];
      if (keyword.trim()) query.push(`name contains '${keyword.trim()}'`);
      if (fileType) {
        if (fileType.endsWith('/')) {
          query.push(`mimeType contains '${fileType}'`);
        } else {
          query.push(`mimeType = '${fileType}'`);
        }
      }
      if (selectedFolderId) {
        query.push(`'${selectedFolderId}' in parents`);
      }

      const qString = query.join(' and ');

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(qString)}&pageSize=100&fields=files(id,name,mimeType,size,webViewLink)`,
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        }
      );

      const data = await response.json();
      setResults(data.files || []);
    } catch (err) {
      console.error('Lỗi truy vấn Drive API:', err);
      setResults([]);
    }

    setLoading(false);
  };

  const handleUploadFile = async (file) => {
    if (!file || !selectedFolderId || !user?.access_token) {
      return alert('Vui lòng chọn file và thư mục!');
    }

    const metadata = {
      name: file.name,
      parents: [selectedFolderId],
    };

    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    form.append('file', file);

    try {
      setLoading(true);
      const uploadRes = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
          body: form,
        }
      );
      const uploadData = await uploadRes.json();
      console.log('Upload thành công:', uploadData);
      alert('Upload thành công!');
      handleSearch(); // Refresh sau khi upload
    } catch (err) {
      console.error('Lỗi upload:', err);
      alert('Lỗi upload file.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Hàm xóa file
  const handleDeleteFile = async (fileId, fileName) => {
    if (!user?.access_token) return alert('Vui lòng đăng nhập.');
    const confirmDelete = window.confirm(`Bạn có chắc muốn xóa file "${fileName}"?`);
    if (!confirmDelete) return;

    try {
      setLoading(true);
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        }
      );

      if (response.status === 204) {
        alert('Xóa file thành công!');
        // Refresh danh sách
        handleSearch();
      } else {
        const error = await response.json();
        console.error('Lỗi khi xóa file:', error);
        alert('Không thể xóa file.');
      }
    } catch (err) {
      console.error('Lỗi xóa file:', err);
      alert('Lỗi khi xóa file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white shadow-wrap rounded-3xl mt-24 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Google Drive API
      </h1>

      {/* Thanh công cụ */}
      <div className="flex flex-wrap gap-4 items-center border p-4 rounded-xl bg-gray-50">
        <select
          className="p-2 border rounded min-w-[200px]"
          value={selectedFolderId}
          onChange={(e) => setSelectedFolderId(e.target.value)}
        >
          <option value="">Tất cả thư mục</option>
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              📁 {folder.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Tìm kiếm"
          className="p-2 border rounded flex-1 min-w-[150px]"
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

        <label className="bg-green-600 text-white px-5 py-2 rounded cursor-pointer hover:bg-green-700 transition">
          Thêm file
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => handleUploadFile(e.target.files[0])}
          />
        </label>
      </div>

      {/* Danh sách file */}
      {results.length > 0 ? (
        <table className="w-full mt-4 table-auto border text-sm rounded-md overflow-hidden">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3 border">Tên file</th>
              <th className="p-3 border">Loại</th>
              <th className="p-3 border">Dung lượng</th>
              <th className="p-3 border">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {results.map((file) => (
              <tr key={file.id} className="border-t hover:bg-gray-50">
                <td className="p-3 border">{file.name}</td>
                <td className="p-3 border text-gray-600">{getType(file.mimeType)}</td>
                <td className="p-3 border">{formatSize(file.size)}</td>
                <td className="p-3 border flex gap-3">
                  <a
                    href={file.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md"
                  >
                    Xem file
                  </a>
                  <button
                    onClick={() => setPreviewFileId(file.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-md"
                  >
                    Xem trước
                  </button>
                  <button
                    onClick={() => handleDeleteFile(file.id, file.name)}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center text-gray-500 pt-6 text-lg font-medium">
          {loading ? 'Đang tìm kiếm...' : 'Chưa có kết quả nào.'}
        </div>
      )}

      {/* Modal xem trước */}
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
