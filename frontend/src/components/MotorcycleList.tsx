import React, { useState, useCallback } from "react";
import { useMotorcycleUpdates } from "../hooks/useMotorcycleUpdates";
import MotorcyclePhotoUpload from "./MotorcyclePhotoUpload";

const MotorcycleList: React.FC = () => {
  const [models, setModels] = useState<any[]>([]);

  // Функция для обновления списка при событии
  const handleUpdate = useCallback((newModel: any) => {
    setModels((prev) => [...prev, newModel]);
  }, []);

  useMotorcycleUpdates(handleUpdate);

  // TODO: добавить загрузку моделей с API при монтировании

  return (
    <div>
      <h2>Мотоциклы</h2>
      <ul>
        {models.map((m) => (
          <li key={m.id} className="mb-4">
            <div className="font-bold mb-2">{m.name}</div>
            <MotorcyclePhotoUpload motorcycleId={m.id} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MotorcycleList; 