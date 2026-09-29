import React, { useState, useEffect } from 'react';
import { Folder, Download, FileText, Search, ExternalLink, HardDrive, Shield } from 'lucide-react';
import api from '../services/api';
import { FileItem } from '../types';

export const FilesPage: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    try {
      const res = await api.get(`/files?category=${categoryFilter}&search=${search}`);
      setFiles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [categoryFilter, search]);

  const handleDownload = async (id: string) => {
    try {
      const res = await api.get(`/files/${id}/download-url`);
      window.open(res.data.downloadUrl, '_blank');
    } catch (err) {
      console.error(err);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121722] border border-slate-800/80 rounded-xl p-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 font-mono">
            <Folder className="w-5 h-5 text-blue-400" />
            AWS S3 Telemetry Reports & Log Archives
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Cloud file storage backed by AWS S3 presigned URLs and diagnostic exports.
          </p>
        </div>

        <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" /> S3 BUCKET: nexus-observe-telemetry-reports
        </div>
      </div>

      {/* Control bar */}
      <div className="bg-[#121722] border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search report file name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#161C2A] border border-slate-800 focus:border-blue-500 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="bg-[#161C2A] border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none"
        >
          <option value="All">Category: All</option>
          <option value="Report">Report</option>
          <option value="CSV Export">CSV Export</option>
          <option value="Diagnostic File">Diagnostic File</option>
          <option value="Log Archive">Log Archive</option>
        </select>
      </div>

      {/* Files List Table */}
      <div className="bg-[#121722] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="bg-[#161C2A] border-b border-slate-800 text-[11px] text-slate-400 uppercase">
              <th className="py-3 px-4">File Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Size</th>
              <th className="py-3 px-4">Uploaded By</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {files.map(file => (
              <tr key={file.id} className="hover:bg-[#161C2A]/60 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-semibold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="truncate">{file.fileName}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-300">
                  <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px]">{file.category}</span>
                </td>
                <td className="py-3 px-4 text-slate-400">{formatBytes(file.fileSize)}</td>
                <td className="py-3 px-4 text-slate-300">{file.uploadedBy}</td>
                <td className="py-3 px-4 text-slate-500 text-[10px]">{new Date(file.createdAt).toLocaleDateString()}</td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleDownload(file.id)}
                    className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 ml-auto"
                  >
                    <Download className="w-3.5 h-3.5" /> Presigned Link
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
