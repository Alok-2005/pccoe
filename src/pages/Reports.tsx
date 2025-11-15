// File: web/src/pages/Reports.tsx
import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { reportAPI } from '../api/services';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Reports = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await reportAPI.getUserReports(user!.id);
      setReports(response.data.reports);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      await reportAPI.generateReport({ reportType: 'daily' });
      toast.success('Report generated successfully!');
      fetchReports();
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (reportId: string, reportDate: string) => {
    try {
      const response = await reportAPI.downloadReport(reportId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `health-report-${reportDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded!');
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 75) return 'text-red-400 bg-red-500/10';
    if (score >= 50) return 'text-orange-400 bg-orange-500/10';
    return 'text-green-400 bg-green-500/10';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Health Reports</h1>
          <p className="text-gray-400 mt-1">Download and review your personalized health reports</p>
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className="bg-yellow-400 text-black px-6 py-3 rounded-lg hover:bg-yellow-500 font-semibold shadow-yellow-400/40 shadow-md flex items-center space-x-2"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              <span>Generate Report</span>
            </>
          )}
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-yellow-400/20 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Reports</p>
              <h3 className="text-2xl font-bold text-white">{reports.length}</h3>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-yellow-400/20 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">This Month</p>
              <h3 className="text-2xl font-bold text-white">
                {reports.filter(r => 
                  new Date(r.createdAt).getMonth() === new Date().getMonth()
                ).length}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-yellow-400/20 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Download className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Downloads</p>
              <h3 className="text-2xl font-bold text-white">
                {reports.reduce((sum, r) => sum + r.downloadCount, 0)}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="bg-gray-900 border border-yellow-400/20 rounded-xl text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-400/10 mb-6">
            <FileText className="w-10 h-10 text-yellow-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Reports Yet</h3>
          <p className="text-gray-400 mb-6">Generate your first health report to get started</p>
          <button onClick={handleGenerateReport} className="bg-yellow-400 text-black px-6 py-3 rounded-lg hover:bg-yellow-500 font-semibold shadow-yellow-400/40 shadow-md">
            Generate Report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div key={report._id} className="bg-gray-900 border border-yellow-400/20 rounded-xl p-6 hover:shadow-lg hover:shadow-yellow-400/10 transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg bg-yellow-400 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      {report.reportType.charAt(0).toUpperCase() + report.reportType.slice(1)} Report
                    </h3>
                    <p className="text-sm text-gray-400">
                      {format(new Date(report.generatedAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {/* Risk Score */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Overall Risk</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(report.summary.overallRisk)}`}>
                    {report.summary.overallRisk}/100
                  </span>
                </div>

                {/* Top Risks */}
                {report.summary.topRisks.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Key Risks</p>
                    <div className="flex flex-wrap gap-2">
                      {report.summary.topRisks.slice(0, 3).map((risk: string, idx: number) => (
                        <span key={idx} className="bg-orange-500/20 text-orange-300 text-xs px-2 py-1 rounded-full">
                          {risk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-yellow-400/20">
                  <div>
                    <p className="text-xs text-gray-400">Downloads</p>
                    <p className="text-sm font-semibold text-white">{report.downloadCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Eco Score</p>
                    <p className="text-sm font-semibold text-white">{report.summary.ecoScore}</p>
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => handleDownload(report._id, format(new Date(report.generatedAt), 'yyyy-MM-dd'))}
                  className="w-full bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 font-semibold flex items-center justify-center space-x-2 mt-4 shadow-yellow-400/40 shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports;