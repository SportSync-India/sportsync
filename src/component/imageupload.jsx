import React, { useState } from "react";
import axios from "axios";

const ImageUpload = ({ onUpload }) => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "your_upload_preset"); // Use your actual upload preset
    formData.append("cloud_name", "dly9w7k1p"); // Use your Cloudinary cloud name

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/your_cloud_name/image/upload",
        formData
      );
      console.log("Upload successful:", response.data);
      return response.data.secure_url; // Get the uploaded image URL
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Image upload failed. Check your credentials and upload preset.");
    }
  };

  return (
    <div>
      <input type="file" onChange={handleImageChange} />
      <button onClick={handleImageUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload Image"}
      </button>
    </div>
  );
};

export default ImageUpload;
