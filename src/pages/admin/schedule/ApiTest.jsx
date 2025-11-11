// src/pages/admin/schedule/ApiTest.jsx
// Component để test API integration - chỉ dùng cho development/debug
import { useEffect, useState } from "react";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { scheduleApi } from "../../../services/schedule/schedule.api.js";

export default function ApiTest() {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runTest = async (testName, apiCall) => {
    setLoading(true);
    try {
      const start = Date.now();
      const result = await apiCall();
      const duration = Date.now() - start;
      
      setTestResults(prev => ({
        ...prev,
        [testName]: {
          status: 'success',
          data: result,
          duration,
          count: Array.isArray(result) ? result.length : 1
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: {
          status: 'error',
          error: error.message,
          duration: 0
        }
      }));
    }
    setLoading(false);
  };

  const runAllTests = async () => {
    setTestResults({});
    await Promise.all([
      runTest('semesters', () => scheduleApi.getSemesters()),
      runTest('timeSlots', () => scheduleApi.getTimeSlots()),
      runTest('teachers', () => scheduleApi.getTeachers()),
      runTest('classes', () => scheduleApi.getClasses()),
    ]);
  };

  useEffect(() => {
    const initialTest = async () => {
      setTestResults({});
      const testCases = [
        { name: 'semesters', fn: () => scheduleApi.getSemesters() },
        { name: 'timeSlots', fn: () => scheduleApi.getTimeSlots() },
        { name: 'teachers', fn: () => scheduleApi.getTeachers() },
        { name: 'classes', fn: () => scheduleApi.getClasses() },
      ];
      
      for (const testCase of testCases) {
        await runTest(testCase.name, testCase.fn);
      }
    };
    initialTest();
  }, []);

  const getStatusBadge = (status) => {
    if (status === 'success') {
      return <Badge className="bg-green-100 text-green-800">SUCCESS</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800">FAILED</Badge>;
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">API Integration Test</h1>
        <Button onClick={runAllTests} disabled={loading}>
          {loading ? "Testing..." : "Run All Tests"}
        </Button>
      </div>

      <div className="grid gap-4">
        {Object.entries(testResults).map(([testName, result]) => (
          <Card key={testName}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{testName}</h3>
                <div className="flex items-center gap-2">
                  {getStatusBadge(result.status)}
                  <span className="text-sm text-gray-500">{result.duration}ms</span>
                </div>
              </div>
              
              {result.status === 'success' ? (
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    ✅ Loaded {result.count} items
                  </p>
                  <details className="text-xs">
                    <summary className="cursor-pointer text-blue-600">View Data</summary>
                    <pre className="bg-gray-50 p-2 mt-2 overflow-auto max-h-40">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-red-600">
                    ❌ {result.error}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {Object.keys(testResults).length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Click "Run All Tests" to start API testing</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}