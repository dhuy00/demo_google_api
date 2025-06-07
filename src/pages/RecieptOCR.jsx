import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const API_KEY = process.env.REACT_APP_GOOGLE_VISION_API_KEY;

export default function ReceiptOCR() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [useMock, setUseMock] = useState(true);

  // Thêm state để người dùng nhập Sheet ID và Sheet Name
  const [sheetId, setSheetId] = useState('');
  const [sheetName, setSheetName] = useState('');

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setText('');
  };

  const handleOCR = async () => {
    if (!image && !useMock) return alert('Vui lòng chọn ảnh hóa đơn.');

    if (useMock) {
      const mockText = `
      Coffee House
      2024-12-01 10:30 AM
      Latte: 40,000
      Sandwich: 60,000
      Tổng: 100,000 VND
    `;
      setText(mockText);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result.replace(/^data:image\/(png|jpeg);base64,/, '');

      try {
        const response = await fetch(
          `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              requests: [
                {
                  image: { content: base64 },
                  features: [{ type: 'TEXT_DETECTION' }],
                },
              ],
            }),
          }
        );

        const result = await response.json();

        const fullText = result.responses?.[0]?.fullTextAnnotation?.text || '';
        if (!fullText) {
          alert('Không thể trích xuất văn bản từ ảnh.');
          return;
        }

        setText(fullText);
      } catch (error) {
        console.error('OCR error:', error);
        alert('Lỗi khi gọi Google Vision API.');
      }
    };

    reader.readAsDataURL(image);
  };

  const handleSaveToSheet = async () => {
    if (!user?.access_token) {
      alert('Bạn cần đăng nhập trước.');
      return;
    }

    if (!text) {
      alert('Chưa có kết quả OCR để lưu.');
      return;
    }

    if (!sheetId.trim()) {
      alert('Vui lòng nhập Google Sheet ID.');
      return;
    }

    if (!sheetName.trim()) {
      alert('Vui lòng nhập tên Sheet (ví dụ: Sheet1).');
      return;
    }

    const spreadsheetId = sheetId.trim();
    const range = `${sheetName.trim()}!A1`;

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;

    const body = {
      values: [[new Date().toLocaleString(), text]],
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.access_token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to append to sheet:', error);
        alert('Lỗi khi lưu vào Google Sheet. Vui lòng kiểm tra lại Sheet ID và tên Sheet.');
        return;
      }

      await response.json();
      alert('Đã lưu vào Google Sheet!');
    } catch (error) {
      console.error('Error saving to Sheet:', error);
      alert('Lỗi khi lưu vào Google Sheet.');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-24 p-6 bg-white rounded-xl shadow-wrap space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">OCR Hóa Đơn</h1>

      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={useMock}
          onChange={() => setUseMock(!useMock)}
        />
        Dùng dữ liệu mẫu
      </label>

      {!useMock && (
        <input
          type="file"
          accept="image/*"
          className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:border file:rounded-full file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          onChange={handleImageChange}
        />
      )}

      <button
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        onClick={handleOCR}
      >
        Quét Hóa Đơn
      </button>

      {text && (
        <>
          <div className="bg-gray-50 p-4 rounded border text-sm whitespace-pre-wrap">
            <h2 className="font-semibold mb-2 text-gray-700">Kết quả OCR:</h2>
            {text}
          </div>

          <div className="space-y-4 mt-4">
            <input
              type="text"
              placeholder="Nhập Google Sheet ID"
              value={sheetId}
              onChange={(e) => setSheetId(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Nhập tên Sheet (ví dụ: Sheet1)"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />

            <button
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
              onClick={handleSaveToSheet}
            >
              Lưu vào Google Sheet
            </button>
          </div>
        </>
      )}
    </div>
  );
}
