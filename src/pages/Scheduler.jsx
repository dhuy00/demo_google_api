import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

export default function ScheduleMeeting() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const accessToken = user?.access_token;

  const [title, setTitle] = useState('');
  const [emails, setEmails] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleAddEmail = () => {
    if (emailInput && !emails.includes(emailInput)) {
      setEmails([...emails, emailInput]);
      setEmailInput('');
    }
  };

  const handleRemoveEmail = (email) => {
    setEmails(emails.filter(e => e !== email));
  };

  const createLocalDateTime = (date, time) => {
    const [hour, minute] = time.split(':');
    const local = new Date(date);
    local.setHours(hour);
    local.setMinutes(minute);
    local.setSeconds(0);
    local.setMilliseconds(0);
    return local.toISOString();
  };

  const handleCreateEvent = async () => {
    if (!accessToken) return alert('Bạn chưa đăng nhập');
    if (!title || !date || !startTime || !endTime) {
      return alert('Vui lòng nhập đầy đủ thông tin');
    }

    const startDateTime = createLocalDateTime(date, startTime);
    const endDateTime = createLocalDateTime(date, endTime);

    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: title,
          start: {
            dateTime: startDateTime,
            timeZone: 'Asia/Ho_Chi_Minh',
          },
          end: {
            dateTime: endDateTime,
            timeZone: 'Asia/Ho_Chi_Minh',
          },
          attendees: emails.map(email => ({ email })),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(`Đã tạo sự kiện: ${data.summary}`);

        // Clear all form inputs
        setTitle('');
        setEmails([]);
        setEmailInput('');
        setDate('');
        setStartTime('');
        setEndTime('');
      } else {
        console.error('Error creating event:', data);
        alert(`Không thể tạo sự kiện: ${data.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Không thể tạo sự kiện.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-24 p-6 bg-white shadow-wrap rounded-2xl space-y-6">
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
        <div className="flex gap-2 flex-col">
          <label className="text-gray-600 font-medium">Ngày tổ chức</label>
          <input
            type="date"
            className="p-2 border rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-col">
          <label className="text-gray-600 font-medium">Từ</label>
          <input
            type="time"
            className="p-2 border rounded"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-col">
          <label className="text-gray-600 font-medium">Đến</label>
          <input
            type="time"
            className="p-2 border rounded"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>

      <button
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        onClick={handleCreateEvent}
      >
        Tạo sự kiện
      </button>
    </div>
  );
}
