import { FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from './Fusion';
import { downloadFromApi } from '../services/download';

export const ExportMenu = ({ module }: { module: string }) => {
  const handleExport = async (format: 'pdf' | 'excel') => {
    const ext = format === 'excel' ? 'xlsx' : 'pdf';
    await downloadFromApi(`/reports/export/${module}?format=${format}`, `${module}_reporte.${ext}`);
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
