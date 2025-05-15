import InputField from "./components/InputField";
import Nav from "./components/InputField";

function App() {
  return (
    <div className="flex flex-col font-inter px-12 py-8 gap-4 w-screen h-screen">
      {/* Title */}
      <h2 className="text-blue-700 text-[1.75rem] font-bold">
        Demo Google API
      </h2>
      {/* Search Bar */}
      <div className="flex flex-row gap-10">
        <div className="flex flex-col gap-4 justify-center w-1/2">
          <InputField label="Nhập điểm đi" placeholder="Nhập vị trí muốn bắt đầu" />
          <InputField label="Nhập điểm đến" placeholder="Nhập vị trí muốn đến" />
        </div>
        <div className="flex flex-col justify-center gap-2">
          <p>
            Phương tiện:
          </p>
          <p>
            Khoảng cách:
          </p>
          <p>
            Thời gian:
          </p>
        </div>
      </div>
      {/* Map And Recomend Places*/}
      <div className="w-full h-full 300 flex gap-10">
        {/* Map */}
        <div className="w-1/2 rounded-md">

        </div>
        {/* Recommend Places */}
        <div className="w-[40%] py-2 flex flex-col gap-4">
          <h2 className="font-bold text-blue-900 text-lg">
            Các dịch vụ xung quanh
          </h2>
          <InputField label="Tìm dịch vụ" placeholder="" />
          <div className="flex justify-between">
            <label>Lọc</label>
            <select className="w-2/3 p-1 focus:border-none border-2 border-gray-500 rounded-md">
              <option>Khách sạn</option>
              <option>Thức ăn nhanh</option>
              <option>Nhà hàng</option>
            </select>
          </div>
          <div>
            <h3 className="font-bold text-blue-900 text-lg mb-2">
              Danh sách địa điểm 
            </h3>
            <ul className="flex flex-col gap-2 pl-2">
              <li>- Phở 24 (cách 300m)</li>
              <li>- Phở 24 (cách 300m)</li>
              <li>- Phở 24 (cách 300m)</li>
              <li>- Phở 24 (cách 300m)</li>
            </ul>
          </div>
        </div>
      </div>
    </div >
  );
}

export default App;
