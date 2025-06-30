import React, { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, Plus, Trash2, Edit3 } from 'lucide-react';
import * as XLSX from 'xlsx';

// Интерфейс характеристики
interface ModelSpec {
  id?: number;
  spec_name: string;
  spec_value: string;
  spec_unit?: string;
  category?: string;
  sort_order?: number;
}

interface SpecsExcelImportProps {
  modelId?: number;
  specs: ModelSpec[];
  onSpecsChange: (specs: ModelSpec[]) => void;
  onUploadSpecs?: (specs: ModelSpec[]) => Promise<void>;
  isLoading?: boolean;
}

const SpecsExcelImport: React.FC<SpecsExcelImportProps> = ({
  modelId,
  specs,
  onSpecsChange,
  onUploadSpecs,
  isLoading = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ModelSpec>({
    spec_name: '',
    spec_value: '',
    spec_unit: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Обработка загрузки Excel файла
  const handleFileUpload = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Конвертируем в массив объектов
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
      
      // Пропускаем первую строку (заголовки) и обрабатываем данные
      const newSpecs: ModelSpec[] = [];
      
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (row && row[0] && row[1]) {
          newSpecs.push({
            spec_name: String(row[0]).trim(),
            spec_value: String(row[1]).trim(),
            spec_unit: row[2] ? String(row[2]).trim() : undefined,
            category: row[3] ? String(row[3]).trim() : 'other',
            sort_order: i
          });
        }
      }
      
      if (newSpecs.length > 0) {
        // Объединяем с существующими характеристиками, избегая дублирования
        const existingNames = new Set(specs.map(s => s.spec_name));
        const uniqueNewSpecs = newSpecs.filter(spec => !existingNames.has(spec.spec_name));
        
        const updatedSpecs = [...specs, ...uniqueNewSpecs];
        onSpecsChange(updatedSpecs);
        
        // Если есть функция загрузки на сервер
        if (onUploadSpecs && modelId) {
          await onUploadSpecs(uniqueNewSpecs);
        }
      }
    } catch (error) {
      console.error('Ошибка чтения Excel файла:', error);
      alert('Ошибка при чтении Excel файла. Проверьте формат файла.');
    }
  };

  // Drag & Drop обработчики
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const excelFile = files.find(file => 
      file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    );

    if (excelFile) {
      await handleFileUpload(excelFile);
    } else {
      alert('Пожалуйста, загрузите файл Excel (.xlsx или .xls)');
    }
  };

  // Обработка выбора файла
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  // Скачивание шаблона Excel
  const downloadTemplate = () => {
    const templateData = [
      ['Название характеристики', 'Значение', 'Единица измерения', 'Категория'],
      ['Объем двигателя', '450', 'куб.см', 'engine'],
      ['Максимальная мощность', '45', 'л.с.', 'engine'],
      ['Снаряженная масса', '165', 'кг', 'dimensions'],
      ['Длина', '2150', 'мм', 'dimensions']
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Характеристики');
    
    XLSX.writeFile(workbook, 'template_specifications.xlsx');
  };

  // Добавление новой характеристики
  const addNewSpec = () => {
    const newSpec: ModelSpec = {
      spec_name: '',
      spec_value: '',
      spec_unit: '',
      category: 'other',
      sort_order: specs.length + 1
    };
    onSpecsChange([...specs, newSpec]);
    setEditingIndex(specs.length);
    setEditForm(newSpec);
  };

  // Редактирование характеристики
  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditForm({ ...specs[index] });
  };

  const saveEdit = () => {
    if (editingIndex !== null && editForm.spec_name && editForm.spec_value) {
      const updatedSpecs = [...specs];
      updatedSpecs[editingIndex] = editForm;
      onSpecsChange(updatedSpecs);
      setEditingIndex(null);
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditForm({ spec_name: '', spec_value: '', spec_unit: '' });
  };

  // Удаление характеристики
  const deleteSpec = (index: number) => {
    const updatedSpecs = specs.filter((_, i) => i !== index);
    onSpecsChange(updatedSpecs);
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Технические характеристики
        </h3>
        <span className="text-sm text-gray-500">
          {specs.length} характеристик
        </span>
      </div>

      {/* Загрузка Excel */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-red-400 bg-red-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <FileSpreadsheet className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h4 className="text-lg font-medium text-gray-900 mb-2">
          Загрузить Excel файл с характеристиками
        </h4>
        <p className="text-gray-600 mb-4">
          Перетащите файл сюда или нажмите для выбора
        </p>
        
        <div className="flex justify-center space-x-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Выбрать файл</span>
          </button>
          
          <button
            type="button"
            onClick={downloadTemplate}
            className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Скачать шаблон</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Формат файла */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Формат Excel файла:</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <div className="font-medium">Столбцы (в порядке):</div>
          <div>• <strong>A:</strong> Название характеристики (обязательно)</div>
          <div>• <strong>B:</strong> Значение (обязательно)</div>
          <div>• <strong>C:</strong> Единица измерения (необязательно)</div>
          <div>• <strong>D:</strong> Категория (необязательно)</div>
        </div>
      </div>

      {/* Список характеристик */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Характеристики</h4>
          <button
            type="button"
            onClick={addNewSpec}
            className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить</span>
          </button>
        </div>

        {specs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Нет характеристик</p>
            <p className="text-sm">Загрузите Excel файл или добавьте вручную</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {specs.map((spec, index) => (
              <div key={index} className="p-4">
                {editingIndex === index ? (
                  // Форма редактирования
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={editForm.spec_name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, spec_name: e.target.value }))}
                        placeholder="Название характеристики"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                      <input
                        type="text"
                        value={editForm.spec_value}
                        onChange={(e) => setEditForm(prev => ({ ...prev, spec_value: e.target.value }))}
                        placeholder="Значение"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                      <input
                        type="text"
                        value={editForm.spec_unit || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, spec_unit: e.target.value }))}
                        placeholder="Единица (опционально)"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={saveEdit}
                        disabled={!editForm.spec_name || !editForm.spec_value}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                      >
                        Сохранить
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                ) : (
                  // Отображение характеристики
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {spec.spec_name}
                      </div>
                      <div className="text-gray-600">
                        {spec.spec_value}
                        {spec.spec_unit && (
                          <span className="ml-1 text-gray-500">{spec.spec_unit}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => startEdit(index)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSpec(index)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecsExcelImport; 