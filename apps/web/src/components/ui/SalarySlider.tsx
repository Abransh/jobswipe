'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Eye, EyeOff } from 'lucide-react';

interface SalarySliderProps {
  minValue?: number;
  maxValue?: number;
  currency?: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
  onRangeChange: (min: number | undefined, max: number | undefined) => void;
  onCurrencyChange: (currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD') => void;
  className?: string;
  showPrivacyNotice?: boolean;
}

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$'
};

const SALARY_RANGES = {
  USD: { min: 30000, max: 500000, step: 5000 },
  EUR: { min: 25000, max: 400000, step: 5000 },
  GBP: { min: 20000, max: 350000, step: 5000 },
  CAD: { min: 35000, max: 450000, step: 5000 },
  AUD: { min: 40000, max: 450000, step: 5000 }
};

export function SalarySlider({
  minValue,
  maxValue,
  currency = 'USD',
  onRangeChange,
  onCurrencyChange,
  className = '',
  showPrivacyNotice = true
}: SalarySliderProps) {
  const [isEnabled, setIsEnabled] = useState(Boolean(minValue || maxValue));
  const [localMin, setLocalMin] = useState(minValue || SALARY_RANGES[currency].min);
  const [localMax, setLocalMax] = useState(maxValue || SALARY_RANGES[currency].max / 2);

  const range = SALARY_RANGES[currency];
  const symbol = CURRENCY_SYMBOLS[currency];

  useEffect(() => {
    if (isEnabled) {
      onRangeChange(localMin, localMax);
    } else {
      onRangeChange(undefined, undefined);
    }
  }, [isEnabled, localMin, localMax, onRangeChange]);

  const formatSalary = (amount: number) => {
    if (amount >= 1000000) {
      return `${symbol}${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${symbol}${(amount / 1000).toFixed(0)}K`;
    }
    return `${symbol}${amount.toLocaleString()}`;
  };

  const handleMinChange = (value: number) => {
    const newMin = Math.min(value, localMax - range.step);
    setLocalMin(newMin);
  };

  const handleMaxChange = (value: number) => {
    const newMax = Math.max(value, localMin + range.step);
    setLocalMax(newMax);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">
            Salary Expectations
          </h3>
          <span className="text-sm text-gray-500">(Optional)</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsEnabled(!isEnabled)}
            className={`
              flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors
              ${isEnabled 
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {isEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            <span>{isEnabled ? 'Enabled' : 'Skip'}</span>
          </button>
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{
          opacity: isEnabled ? 1 : 0.5,
          scale: isEnabled ? 1 : 0.98
        }}
        transition={{ duration: 0.2 }}
        className="space-y-6"
      >
        {/* Currency Selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Currency
          </label>
          <div className="flex space-x-2">
            {Object.keys(CURRENCY_SYMBOLS).map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => onCurrencyChange(curr as any)}
                disabled={!isEnabled}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${currency === curr
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                  ${!isEnabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>

        {/* Range Display */}
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {formatSalary(localMin)}
            </p>
            <p className="text-sm text-gray-500">Minimum</p>
          </div>
          
          <div className="px-4">
            <div className="h-px w-8 bg-gray-300"></div>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {formatSalary(localMax)}
            </p>
            <p className="text-sm text-gray-500">Maximum</p>
          </div>
        </div>

        {/* Dual Range Slider */}
        <div className="relative px-3">
          <div className="relative h-2 bg-gray-200 rounded-full">
            {/* Active Range */}
            <div
              className="absolute h-2 bg-blue-500 rounded-full"
              style={{
                left: `${((localMin - range.min) / (range.max - range.min)) * 100}%`,
                width: `${((localMax - localMin) / (range.max - range.min)) * 100}%`
              }}
            />
            
            {/* Min Slider */}
            <input
              type="range"
              min={range.min}
              max={range.max}
              step={range.step}
              value={localMin}
              onChange={(e) => handleMinChange(Number(e.target.value))}
              disabled={!isEnabled}
              className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer range-slider"
              style={{ zIndex: 1 }}
            />
            
            {/* Max Slider */}
            <input
              type="range"
              min={range.min}
              max={range.max}
              step={range.step}
              value={localMax}
              onChange={(e) => handleMaxChange(Number(e.target.value))}
              disabled={!isEnabled}
              className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer range-slider"
              style={{ zIndex: 2 }}
            />
          </div>
        </div>

        {/* Manual Input Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Minimum Salary
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {symbol}
              </span>
              <input
                type="number"
                value={localMin}
                onChange={(e) => handleMinChange(Number(e.target.value))}
                disabled={!isEnabled}
                min={range.min}
                max={range.max}
                step={range.step}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Maximum Salary
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {symbol}
              </span>
              <input
                type="number"
                value={localMax}
                onChange={(e) => handleMaxChange(Number(e.target.value))}
                disabled={!isEnabled}
                min={range.min}
                max={range.max}
                step={range.step}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Privacy Notice */}
      {showPrivacyNotice && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: isEnabled ? 1 : 0.7, 
            height: 'auto' 
          }}
          className="bg-amber-50 border border-amber-200 rounded-lg p-4"
        >
          <div className="flex items-start space-x-3">
            <DollarSign className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-900">Privacy Notice</p>
              <p className="text-amber-700 mt-1">
                We only share salary information when companies specifically require it for their application process. 
                This helps us filter out positions that don't match your expectations.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <style jsx>{`
        .range-slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3B82F6;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          pointer-events: all;
          position: relative;
          z-index: 1;
        }

        .range-slider::-webkit-slider-thumb:hover {
          background: #2563EB;
          transform: scale(1.1);
        }

        .range-slider::-moz-range-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3B82F6;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          pointer-events: all;
        }

        .range-slider::-moz-range-thumb:hover {
          background: #2563EB;
          transform: scale(1.1);
        }

        .range-slider:disabled::-webkit-slider-thumb {
          background: #9CA3AF;
          cursor: not-allowed;
        }

        .range-slider:disabled::-moz-range-thumb {
          background: #9CA3AF;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}