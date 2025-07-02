import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Star, Zap, Shield, Search, X, Bike, MapPin } from 'lucide-react';
import MotorcycleList from "../components/MotorcycleList";

interface MotorcycleModel {
  id: string;
  name: string;
  type: string;
  year: number;
  description: string;
  features: string[];
  price: string;
  icon: React.ElementType;
  color: string;
}

const motorcycleModels: MotorcycleModel[] = [];

const ModelsPage = () => {
  return (
    <div className="p-4">
      <MotorcycleList />
    </div>
  );
};

export default ModelsPage; 