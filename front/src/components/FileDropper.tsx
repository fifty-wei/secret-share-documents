import React, { ChangeEvent, useRef } from "react";
import { useFormikContext } from "formik";

interface FileDropperProps {
  fileSelected: File | null; // Changed from File | undefined to File | null
  setFileSelected: React.Dispatch<React.SetStateAction<File | null>>; // Accepts File | null
}

const FileDropper = ({ fileSelected, setFileSelected }: FileDropperProps) => {
  const formikProps = useFormikContext();
  const fileInputRef = useRef<any>();

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = [...event.dataTransfer.files][0];
    formikProps.setFieldValue("file", file);

    setFileSelected(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      formikProps.setFieldValue("file", file);

      setFileSelected(file);
    }
  };

  const removeFile = () => {
    setFileSelected(null);
    formikProps.setFieldValue("file", null);
  };

  return !fileSelected ? (
    <>
      <div
        className={`flex flex-col w-48 h-48 p-50 cursor-pointer mt-1 mb-1 items-center justify-center text-24 text-gray-600 border-2 border-dashed border-gray-300 rounded-lg  bg-white`}
        onDrop={(e: React.DragEvent<HTMLDivElement>) => handleDrop(e)}
        onDragOver={(e: React.DragEvent<HTMLDivElement>) => handleDragOver(e)}
        onDragEnter={(e: React.DragEvent<HTMLDivElement>) => handleDragEnter(e)}
        onDragLeave={(e: React.DragEvent<HTMLDivElement>) => handleDragLeave(e)}
        ref={fileInputRef}
      >
        <input
          className={"hidden"}
          type="file"
          onChange={handleFileChange}
          value={fileSelected || ""}
          id={"file"}
        />
        <label htmlFor="file">
          <span>Drop your file here</span>
          <br />
          Or click to<span className="text-blue-600 font-medium"> upload</span>
        </label>
      </div>
    </>
  ) : (
    <>
      <p className="text-sm text-white font-bold text-center">Your file</p>
      <div className={"w-48 h-48 flex flex-col items-center justify-center"}>
        <div className="flex flex-row items-center justify-center place-content-end">
          <div className={`mt-1 flex flex-col text-24 text-white items-center`}>
            {fileSelected.name}
          </div>
          <button
            onClick={() => removeFile()}
            type="button"
            className="ml-4 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 inline-flex items-center "
            data-modal-toggle="defaultModal"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default FileDropper;
