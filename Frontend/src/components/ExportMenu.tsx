import React from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from './Fusion';
import api from '../services/api';

export const ExportMenu = ({ module }: { module: string }) => {
  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      const response = await api.get(`/reports/export/${module}?format=${format}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${module}_reporte.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error al exportar:', error);
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="ghost" className="h-9 gap-2 text-xs" onClick={() => handleExport('excel')}>
        <FileSpreadsheet size={14} className="text-emerald-primary" /> Excel
      </Button>
      <Button variant="ghost" className="h-9 gap-2 text-xs" onClick={() => handleExport('pdf')}>
        <FileText size={14} className="text-danger" /> PDF
      </Button>
    </div>
  );
};
