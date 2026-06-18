import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, RefreshCw, Clock, Mail, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ModuleUsageEntry } from '../lib/moduleUsage';
import { fetchModuleUsageReport, getErrorMessage } from '../lib/moduleUsageQueries';

interface LoginLog {
  id: string;
  email: string;
  logged_in_at: string;
  created_at: string;
}

type ActivityTab = 'login' | 'modules';

export default function ActivityLog() {
  const [activeTab, setActiveTab] = useState<ActivityTab>('login');
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [moduleUsage, setModuleUsage] = useState<ModuleUsageEntry[]>([]);
  const [totalFlows, setTotalFlows] = useState(0);
  const [loadingLogin, setLoadingLogin] = useState(true);
  const [loadingModules, setLoadingModules] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [moduleError, setModuleError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchLoginLogs = async () => {
    setLoadingLogin(true);
    setLoginError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('login_logs')
        .select('*')
        .order('logged_in_at', { ascending: false });

      if (fetchError) throw fetchError;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching login logs:', err);
      setLoginError(getErrorMessage(err));
    } finally {
      setLoadingLogin(false);
    }
  };

  const fetchModuleUsage = async () => {
    setLoadingModules(true);
    setModuleError(null);

    try {
      const report = await fetchModuleUsageReport();
      setTotalFlows(report.totalFlows);
      setModuleUsage(report.entries);
    } catch (err) {
      console.error('Error fetching module usage:', err);
      setModuleError(getErrorMessage(err));
      setModuleUsage([]);
      setTotalFlows(0);
    } finally {
      setLoadingModules(false);
    }
  };

  const fetchData = useCallback(async () => {
    await Promise.all([fetchLoginLogs(), fetchModuleUsage()]);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(date);
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(dateString);
  };

  const tabMeta = useMemo(
    () => ({
      login: { label: 'Login History', count: logs.length },
      modules: { label: 'Module Usage', count: moduleUsage.length }
    }),
    [logs.length, moduleUsage.length]
  );

  const activeError = activeTab === 'login' ? loginError : moduleError;
  const activeLoading = activeTab === 'login' ? loadingLogin : loadingModules;
  const isRefreshing = loadingLogin || loadingModules;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
            </div>
            <button
              onClick={fetchData}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">
              {activeTab === 'login' ? 'Error loading login history' : 'Error loading module usage'}
            </p>
            <p className="text-sm">{activeError}</p>
          </div>
        )}

        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {(Object.keys(tabMeta) as ActivityTab[]).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {tabMeta[tab].label}
                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {tabMeta[tab].count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {activeTab === 'login' ? 'Login History' : 'Module Usage'}
              </h2>
              <span className="text-sm text-gray-500">
                {activeTab === 'login'
                  ? `${logs.length} ${logs.length === 1 ? 'entry' : 'entries'}`
                  : `${moduleUsage.length} ${moduleUsage.length === 1 ? 'module' : 'modules'} across ${totalFlows} ${totalFlows === 1 ? 'flow' : 'flows'}`}
              </span>
            </div>
          </div>

          {activeLoading ? (
            <div className="px-6 py-12 text-center">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">
                {activeTab === 'modules' && totalFlows === 0
                  ? 'Analyzing module usage across flows...'
                  : 'Loading...'}
              </p>
            </div>
          ) : activeTab === 'login' ? (
            logs.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No login activity yet</p>
                <p className="text-gray-500 text-sm mt-1">Login records will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time Ago
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{log.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">{formatDate(log.logged_in_at)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500">{getRelativeTime(log.logged_in_at)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : moduleError ? (
            <div className="px-6 py-12 text-center">
              <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Could not load module usage</p>
              <p className="text-gray-500 text-sm mt-1">{moduleError}</p>
            </div>
          ) : moduleUsage.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No module usage yet</p>
              <p className="text-gray-500 text-sm mt-1">Add modules to flows to see usage here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Module
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Component
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Flows
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {moduleUsage.map(entry => (
                    <tr key={entry.component} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Layers className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{entry.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 font-mono">{entry.component}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-sm font-medium text-indigo-700">
                          {entry.flowCount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
