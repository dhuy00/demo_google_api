import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/UserContext';

export default function GoogleGmail() {
  const { user } = useContext(UserContext);

  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(false);

  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachment, setAttachment] = useState(null);

  const fetchEmails = async () => {

    setLoading(true);
    try {
      const resList = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10`,
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        }
      );
      const listData = await resList.json();
      const messages = listData.messages || [];

      const emailDetails = await Promise.all(
        messages.map(async (msg) => {
          const resMsg = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=subject&metadataHeaders=from&metadataHeaders=date`,
            {
              headers: {
                Authorization: `Bearer ${user.access_token}`,
              },
            }
          );
          return resMsg.json();
        })
      );

      setEmails(emailDetails);
    } catch (err) {
      console.error('Lỗi khi tải email:', err);
    }
    setLoading(false);
  };

  const fetchEmailContent = async (emailId) => {
    if (!user?.access_token) return;
    setLoading(true);

    try {
      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}?format=full`,
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        }
      );
      const data = await res.json();

      const parts = data.payload.parts || [];
      let bodyPart = data.payload.body?.data;
      if (!bodyPart && parts.length > 0) {
        const htmlPart = parts.find((p) => p.mimeType === 'text/html');
        const textPart = parts.find((p) => p.mimeType === 'text/plain');
        bodyPart = htmlPart?.body?.data || textPart?.body?.data;
      }

      const decodedBody = bodyPart
        ? decodeURIComponent(
          escape(window.atob(bodyPart.replace(/-/g, '+').replace(/_/g, '/')))
        )
        : 'Không có nội dung';

      setSelectedEmail({
        subject:
          data.payload.headers.find((h) => h.name === 'Subject')?.value || '',
        from: data.payload.headers.find((h) => h.name === 'From')?.value || '',
        date: data.payload.headers.find((h) => h.name === 'Date')?.value || '',
        body: decodedBody,
      });
    } catch (err) {
      console.error('Lỗi khi tải nội dung email:', err);
    }

    setLoading(false);
  };

  const sendEmail = async () => {
    if (!to || !subject || !body) return alert('Vui lòng nhập đầy đủ thông tin.');

    const boundary = 'boundary-' + Math.random().toString(36).substring(2, 15);

    const buildMimeMessage = async () => {
      if (attachment) {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const fileContentBase64 = reader.result.split(',')[1]; // get base64 part
            const mimeMessage = [
              `To: ${to}`,
              `Subject: ${subject}`,
              `Content-Type: multipart/mixed; boundary="${boundary}"`,
              'MIME-Version: 1.0',
              '',
              `--${boundary}`,
              'Content-Type: text/plain; charset="UTF-8"',
              'MIME-Version: 1.0',
              'Content-Transfer-Encoding: 7bit',
              '',
              body,
              '',
              `--${boundary}`,
              `Content-Type: ${attachment.type}; name="${attachment.name}"`,
              'MIME-Version: 1.0',
              'Content-Transfer-Encoding: base64',
              `Content-Disposition: attachment; filename="${attachment.name}"`,
              '',
              fileContentBase64,
              '',
              `--${boundary}--`,
            ].join('\r\n');


            resolve(mimeMessage);
          };

          reader.readAsDataURL(attachment);
        });
      } else {
        // Simple email nếu không có attachment
        const simpleMessage = [
          `To: ${to}`,
          `Subject: ${subject}`,
          '',
          body,
        ].join('\n');
        return simpleMessage;
      }
    };

    const mimeMessage = await buildMimeMessage();

    // Encode MIME to Base64URL
    const encodedMessage = btoa(unescape(encodeURIComponent(mimeMessage)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    try {
      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${user.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            raw: encodedMessage,
          }),
        }
      );

      if (res.ok) {
        alert('Đã gửi email thành công!');
        setTo('');
        setSubject('');
        setBody('');
        setAttachment(null);
      } else {
        const error = await res.json();
        console.error('Lỗi gửi email:', error);
        alert('Lỗi gửi email.');
      }
    } catch (err) {
      console.error('Lỗi gửi email:', err);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto mt-24 p-8 bg-white shadow-wrap rounded-xl space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Demo Google Gmail API</h1>

      <button
        onClick={fetchEmails}
        className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
      >
        {loading ? 'Đang tải...' : 'Tải lại danh sách email'}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Danh sách email */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Hộp thư đến:</h2>
          {emails.length === 0 && (
            <div className="text-gray-500">Chưa có email.</div>
          )}
          {emails.map((email) => (
            <div
              key={email.id}
              className="p-4 border rounded hover:bg-gray-50 cursor-pointer"
              onClick={() => fetchEmailContent(email.id)}
            >
              <div className="font-semibold text-gray-800">
                {email.payload.headers.find((h) => h.name === 'Subject')?.value}
              </div>
              <div className="text-sm text-gray-600">
                {email.payload.headers.find((h) => h.name === 'From')?.value}
              </div>
              <div className="text-xs text-gray-500">
                {email.payload.headers.find((h) => h.name === 'Date')?.value}
              </div>
            </div>
          ))}
        </div>

        {/* Nội dung email */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Nội dung email:</h2>
          {selectedEmail ? (
            <div className="p-4 border rounded space-y-2">
              <div className="font-semibold text-lg">{selectedEmail.subject}</div>
              <div className="text-sm text-gray-600">{selectedEmail.from}</div>
              <div className="text-xs text-gray-500">{selectedEmail.date}</div>
              <hr />
              <div
                className="text-gray-800 text-sm"
                dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
              />
            </div>
          ) : (
            <div className="text-gray-500">Chọn 1 email để xem nội dung.</div>
          )}
        </div>
      </div>

      {/* Gửi email */}
      <div className="pt-8 border-t space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Gửi email mới:</h2>
        <input
          type="email"
          placeholder="To"
          className="p-2 border rounded w-full"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <input
          type="text"
          placeholder="Subject"
          className="p-2 border rounded w-full"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <textarea
          placeholder="Body"
          className="p-2 border rounded w-full h-40"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        ></textarea>

        <input
          type="file"
          onChange={(e) => setAttachment(e.target.files[0])}
          className="p-2 border rounded w-full"
        />

        {attachment && (
          <div className="text-sm text-green-600">
            Đã chọn file: {attachment.name}
          </div>
        )}

        <button
          onClick={sendEmail}
          className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
        >
          Gửi email
        </button>
      </div>
    </div>
  );
}
