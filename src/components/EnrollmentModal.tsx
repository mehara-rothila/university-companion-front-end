'use client';

import { useState, useEffect } from 'react';
import { competitionService, Competition, FormField } from '@/services/competitionService';
import { X } from 'lucide-react';

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  competition: Competition;
  userId: number;
  isDarkMode: boolean;
  onSuccess: () => void;
}

export default function EnrollmentModal({
  isOpen,
  onClose,
  competition,
  userId,
  isDarkMode,
  onSuccess
}: EnrollmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [formResponses, setFormResponses] = useState<Record<string, string>>({});

  useEffect(() => {
    if (competition?.id) {
      loadFormFields();
    }
  }, [competition]);

  const loadFormFields = async () => {
    try {
      const data = await competitionService.getCompetitionById(competition.id);
      if (data.formFields) {
        setFormFields(data.formFields);
      }
    } catch (error) {
      console.error('Error loading form fields:', error);
    }
  };

  const handleInputChange = (fieldLabel: string, value: string) => {
    setFormResponses(prev => ({
      ...prev,
      [fieldLabel]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    for (const field of formFields) {
      if (field.required && !formResponses[field.fieldLabel]?.trim()) {
        alert(`Please fill in the required field: ${field.fieldLabel}`);
        return;
      }
    }

    try {
      setLoading(true);
      await competitionService.enrollInCompetition(competition.id, {
        formResponses: JSON.stringify(formResponses)
      });

      alert('Successfully enrolled in competition!');
      onSuccess();
    } catch (error: any) {
      console.error('Error enrolling:', error);
      alert(error.response?.data?.error || 'Failed to enroll. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full my-8`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Enroll in Competition
            </h2>
            <button
              onClick={onClose}
              className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6">
            <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
              {competition.title}
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {competition.description}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {formFields.length > 0 ? (
              <>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                  Please fill out the enrollment form:
                </p>

                {formFields.map((field) => (
                  <div key={field.id}>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {field.fieldLabel} {field.required && <span className="text-red-500">*</span>}
                    </label>

                    {field.fieldType === 'TEXTAREA' ? (
                      <textarea
                        value={formResponses[field.fieldLabel] || ''}
                        onChange={(e) => handleInputChange(field.fieldLabel, e.target.value)}
                        placeholder={field.placeholder || ''}
                        required={field.required}
                        rows={4}
                        className={`w-full px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'}`}
                      />
                    ) : (
                      <input
                        type={
                          field.fieldType === 'EMAIL' ? 'email' :
                          field.fieldType === 'PHONE' ? 'tel' :
                          field.fieldType === 'NUMBER' ? 'number' :
                          field.fieldType === 'DATE' ? 'date' :
                          'text'
                        }
                        value={formResponses[field.fieldLabel] || ''}
                        onChange={(e) => handleInputChange(field.fieldLabel, e.target.value)}
                        placeholder={field.placeholder || ''}
                        required={field.required}
                        className={`w-full px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'}`}
                      />
                    )}
                  </div>
                ))}
              </>
            ) : (
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No additional information required. Click below to confirm your enrollment.
              </p>
            )}

            <div className="flex space-x-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 px-6 py-3 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Enrolling...' : 'Confirm Enrollment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
