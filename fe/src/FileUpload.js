import React, { useState } from "react";

const FileUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [status, setStatus] = useState("");

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
    };

    const handleFileUpload = () => {
        if (!selectedFile) {
            alert("Please select a file to upload.");
            return;
        }

        const chunkSize = 2 * 1024 * 1024; // 5MB (adjust based on your requirements)
        const fileSize = selectedFile.size
        const totalChunks = Math.ceil(fileSize / chunkSize) + 1;
        let chunkNumber = 0;
        let start = 0;
        let end = 0;

        const uploadNextChunk = async () => {
            if (chunkNumber !== totalChunks) {
                const chunk = selectedFile.slice(start, end);
                const formData = new FormData();
                formData.append("file", chunk);
                formData.append("chunkNumber", chunkNumber);
                formData.append("totalChunks", totalChunks);
                formData.append("originalname", selectedFile.name);

                fetch("http://localhost:8000/upload", {
                    method: "POST",
                    body: formData,
                })
                    .then((response) => response.json())
                    .then((data) => {
                        const temp = `Chunk ${chunkNumber + 1
                            }/${totalChunks} uploaded successfully`;
                        setStatus(temp);
                        chunkNumber++;
                        start = end;
                        end = start + chunkSize;
                        uploadNextChunk();
                    })
                    .catch((error) => {
                        console.error("Error uploading chunk:", error);
                    });
            } else {
                setSelectedFile(null);
                setStatus("File upload completed");
            }
        };

        uploadNextChunk();
    };

    return (
        <div>
            <h2>Resumable File Upload</h2>
            <h3>{status}</h3>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleFileUpload}>Upload File</button>
        </div>
    );
};

export default FileUpload;