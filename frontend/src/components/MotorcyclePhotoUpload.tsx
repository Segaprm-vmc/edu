import React, { useState } from "react";

interface Props {
  motorcycleId: number;
  onUploaded?: (photo: any) => void;
}

const MotorcyclePhotoUpload: React.FC<Props> = ({ motorcycleId, onUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/admin/v2/motorcycles/${motorcycleId}/photos`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Ошибка загрузки файла");
      const data = await res.json();
      if (onUploaded) onUploaded(data);
      setFile(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button type="submit" disabled={isLoading || !file} className="bg-blue-600 text-white px-4 py-2 rounded">
        {isLoading ? "Загрузка..." : "Загрузить фото"}
      </button>
      {error && <div className="text-red-600 text-sm">{error}</div>}
    </form>
  );
};

export default MotorcyclePhotoUpload; 