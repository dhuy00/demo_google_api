import { useState } from "react";
import InputField from "./components/InputField";
import Nav from "./components/InputField";

function App() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  const [transportMode, setTransportMode] = useState("driving");
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");

  const [filterType, setFilterType] = useState("restaurant");
  const [places, setPlaces] = useState([]);

  const [plan, setPlan] = useState({
    title: "",
    startDate: "",
    endDate: "",
    planOrigin: "",
    planDestination: "",
    notes: "",
  });

  const handlePlanChange = (field, value) => {
    setPlan(prev => ({ ...prev, [field]: value }));
  };

  const fetchRouteInfo = async () => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=${transportMode}&key=YOUR_API_KEY`
    );
    const data = await response.json();
    if (data.routes.length > 0) {
      const leg = data.routes[0].legs[0];
      setDistance(leg.distance.text);
      setDuration(leg.duration.text);
    }
  };

  const fetchNearbyPlaces = async (lat, lng) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1500&type=${filterType}&key=YOUR_API_KEY`
    );
    const data = await response.json();
    setPlaces(data.results);
  };

  const createCalendarEvent = async () => {
    // use gapi.client.calendar.events.insert(...)
  };



  return (
    <div className="flex flex-col font-inter px-12 py-8 gap-4 w-screen h-screen">
      {/* Title */}
      <h2 className="text-blue-700 text-[1.75rem] font-bold">
        Demo Google API
      </h2>
      {/* Search Bar */}
      <div className="flex flex-row gap-10">
        <div className="flex flex-col gap-4 justify-center w-1/2">
          <InputField
            label="Nhập điểm đi"
            placeholder="Nhập vị trí muốn bắt đầu"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
          />
          <InputField
            label="Nhập điểm đến"
            placeholder="Nhập vị trí muốn đến"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
          <button
            className="text-white bg-blue-600 px-4 py-2 rounded-md font-medium 
            hover:bg-blue-500 transition-all cursor-pointer"
            onClick={fetchRouteInfo}>
            Tìm đường
          </button>
        </div>
        <div className="flex flex-col justify-center gap-2">
          <p>Phương tiện: {transportMode}</p>
          <p>Khoảng cách: {distance}</p>
          <p>Thời gian: {duration}</p>
        </div>
      </div>
      {/* Map And Recomend Places*/}
      <div className="w-full h-full 300 flex gap-10">
        {/* Map */}
        <div className="w-1/2 rounded-md bg-green-300">
        </div>
        {/* Recommend Places */}
        <div className="w-[40%] py-2 flex flex-col gap-4">
          <h2 className="font-bold text-blue-900 text-lg">
            Các dịch vụ xung quanh
          </h2>
          {/* Search */}
          <InputField label="Tìm dịch vụ" placeholder="" />
          <div className="flex justify-between">
            <label>Lọc</label>
            <select className="w-2/3 p-1 focus:border-none border-2 border-gray-500 rounded-md">
              <option>Khách sạn</option>
              <option>Thức ăn nhanh</option>
              <option>Nhà hàng</option>
            </select>
          </div>
          {/* Places List */}
          <div>
            <h3 className="font-bold text-blue-900 text-lg mb-2">
              Danh sách địa điểm
            </h3>
            <ul className="flex flex-col gap-2 pl-2">
              <ul className="flex flex-col gap-2 pl-2">
                {places.map((place, idx) => (
                  <li key={idx}>- {place.name} (cách {place.vicinity})</li>
                ))}
              </ul>
            </ul>
          </div>
          {/* Plan */}
          <div className="">
            <h3 className="font-bold text-blue-900 text-lg mb-2">
              Lên kế hoạch
            </h3>
            <div className="flex flex-col gap-4 mb-4">
              <InputField label="Tiêu đề chuyến đi" />
              <InputField label="Ngày bắt đầu" />
              <InputField label="Ngày kết thúc" />
              <InputField label="Điểm đi" />
              <InputField label="Điểm đến" />
              <InputField label="Ghi chú" />
            </div>
            <div className="w-full justify-end flex mb-8">
              <button className="text-white bg-blue-600 px-4 py-2 rounded-md 
              font-medium ">
                Lưu vào Google Calendar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}

export default App;
