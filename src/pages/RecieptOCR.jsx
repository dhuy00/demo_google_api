import React, { useContext, useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';


export default function ReceiptOCR() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [extracted, setExtracted] = useState({
    store: '',
    date: '',
    total: ''
  });

  const [useMock, setUseMock] = useState(true);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setText('');
    setExtracted({ store: '', date: '', total: '' });
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
      parseData(mockText);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result.replace(/^data:image\/(png|jpeg);base64,/, '');

      const response = await fetch(
        'https://vision.googleapis.com/v1/images:annotate?key=YOUR_API_KEY',
        {
          method: 'POST',
          body: JSON.stringify({
            requests: [
              {
                image: { content: base64 },
                features: [{ type: 'TEXT_DETECTION' }]
              }
            ]
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();
      const fullText = result.responses?.[0]?.fullTextAnnotation?.text || '';
      setText(fullText);
      parseData(fullText);
    };

    reader.readAsDataURL(image);
  };

  const parseData = (text) => {
    const lines = text.split('\n');
    let store = lines[0];
    let date = lines.find((line) =>
      /\d{2,4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}/.test(line)
    );
    let totalLine = lines.find((line) => /Tổng|Total/i.test(line));

    let total = totalLine ? totalLine.match(/(\d+[.,]?\d*)/g)?.[0] : '';

    setExtracted({
      store: store || '',
      date: date || '',
      total: total || ''
    });
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow space-y-4">
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
        <div className="bg-gray-50 p-4 rounded border text-sm whitespace-pre-wrap">
          <h2 className="font-semibold mb-2 text-gray-700">Kết quả OCR:</h2>
          {text}
        </div>
      )}

      {(extracted.store || extracted.date || extracted.total) && (
        <div className="bg-yellow-50 p-4 rounded border">
          <h2 className="font-semibold mb-2 text-yellow-800">Dữ liệu trích xuất:</h2>
          <p><strong>Tên cửa hàng:</strong> {extracted.store}</p>
          <p><strong>Ngày giờ:</strong> {extracted.date}</p>
          <p><strong>Tổng tiền:</strong> {extracted.total}</p>
        </div>
      )}
    </div>
  );
}
