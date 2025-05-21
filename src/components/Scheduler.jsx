import React, { useState } from 'react';

export default function ScheduleMeeting() {
  const [title, setTitle] = useState('');
  const [emails, setEmails] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [suggestions, setSuggestions] = useState([]);

  const handleAddEmail = () => {
    if (emailInput && !emails.includes(emailInput)) {
      setEmails([...emails, emailInput]);
      setEmailInput('');
    }
  };

  const handleRemoveEmail = (email) => {
    setEmails(emails.filter(e => e !== email));
  };

  const handleSuggestTimes = async () => {
    // Giả lập API call, bạn sẽ thay bằng real API call ở đây
    const mockSuggestions = [
      '09:00 - 09:30',
      '10:00 - 10:30',
      '13:30 - 14:00'
    ];
    setSuggestions(mockSuggestions);
  };

  const handleCreateEvent = (selectedTime) => {
    alert(`Tạo sự kiện "${title}" vào ${selectedTime}`);
    // Gửi thông tin lên backend để tạo sự kiện
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Tạo cuộc hẹn</h1>

      <input
        type="text"
        className="w-full p-2 border rounded"
        placeholder="Tiêu đề cuộc hẹn"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div>
        <label className="block font-medium mb-1">Người tham gia:</label>
        <div className="flex gap-2 flex-wrap">
          {emails.map((email) => (
            <span
              key={email}
              className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm flex items-center"
            >
              {email}
              <button
                className="ml-2 text-red-500"
                onClick={() => handleRemoveEmail(email)}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
        <div className="flex mt-2">
          <input
            type="email"
            className="flex-1 p-2 border rounded-l"
            placeholder="Thêm email người tham gia"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-4 rounded-r"
            onClick={handleAddEmail}
          >
            Thêm
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <input
          type="date"
          className="p-2 border rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="number"
          className="p-2 border rounded"
          placeholder="Thời lượng (phút)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
        <input
          type="time"
          className="p-2 border rounded"
          placeholder="Từ"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        <input
          type="time"
          className="p-2 border rounded"
          placeholder="Đến"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>

      <button
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        onClick={handleSuggestTimes}
      >
        Gợi ý thời gian
      </button>

      {suggestions.length > 0 && (
        <div className="mt-4">
          <h2 className="font-semibold mb-2">Khung giờ đề xuất:</h2>
          <div className="grid gap-2">
            {suggestions.map((time) => (
              <button
                key={time}
                className="w-full border p-2 rounded hover:bg-blue-100"
                onClick={() => handleCreateEvent(time)}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
