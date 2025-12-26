
import React from 'react';

interface SkillCardProps {
  name: string;
  type: 'matching' | 'missing' | 'irrelevant' | 'detected';
}

const SkillCard: React.FC<SkillCardProps> = ({ name, type }) => {
  const styles = {
    matching: 'bg-green-50 border-green-200 text-green-700',
    missing: 'bg-orange-50 border-orange-200 text-orange-700',
    irrelevant: 'bg-gray-50 border-gray-200 text-gray-500',
    detected: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  };

  const icons = {
    matching: 'fa-check-circle',
    missing: 'fa-circle-plus',
    irrelevant: 'fa-circle-minus',
    detected: 'fa-brain',
  };

  return (
    <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border text-sm font-medium ${styles[type]} shadow-sm`}>
      <i className={`fas ${icons[type]}`}></i>
      <span>{name}</span>
    </div>
  );
};

export default SkillCard;
