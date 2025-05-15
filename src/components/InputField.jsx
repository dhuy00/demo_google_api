import React from 'react'

const InputField = ({label, placeholder}) => {
  return (
    <div className="flex flex-row justify-between items-center">
      <label>
        {label}
      </label>
      <input
        className="border-2 border-solid border-blue-500 px-4 py-1 w-[80%]
            rounded-md outline-none focus:border-blue-700 transition-colors"
        type="text"
        placeholder="Nhập điểm cần đi" />
    </div>
  )
}

export default InputField
