'use client';

import { useState } from 'react';
import { competitionService, FormField } from '@/services/competitionService';
import { fileUploadService } from '@/services/fileUploadService';
import { X, Plus, Trash2, Upload } from 'lucide-react';

interface CreateCompetitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  organizerId: number;
  isDarkMode: boolean;
}

export default function CreateCompetitionModal({
  isOpen,
  onClose,
  onSuccess,
  organizerId,
  isDarkMode
}: CreateCompetitionModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    prizes: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxParticipants: '',
    internalEnrollmentEnabled: false,
    externalEnrollmentUrl: ''
  });

  const [formFields, setFormFields] = useState<Omit<FormField, 'id' | 'competitionId'>[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addFormField = () => {
    setFormFields([...formFields, {
      fieldLabel: '',
      fieldType: 'TEXT',
      required: true,
      order: formFields.length,
      options: null,
      placeholder: null
    }]);
  };

  const updateFormField = (index: number, updates: Partial<Omit<FormField, 'id' | 'competitionId'>>) => {
    setFormFields(formFields.map((field, i) =>
      i === index ? { ...field, ...updates } : field
    ));
  };

  const removeFormField = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      let imageUrl = null;
      if (imageFile) {
        const uploadResult = await fileUploadService.uploadImage(imageFile, 'competition-images');
        imageUrl = uploadResult.fileUrl;
      }

      const competitionData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        prizes: formData.prizes || null,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        registrationDeadline: formData.registrationDeadline ? new Date(formData.registrationDeadline).toISOString() : null,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        imageUrl,
        organizerId,
        internalEnrollmentEnabled: formData.internalEnrollmentEnabled,
        externalEnrollmentUrl: formData.externalEnrollmentUrl || null,
        formFields: formData.internalEnrollmentEnabled ? formFields : []
      };

      await competitionService.createCompetition(competitionData);
      alert('Competition created successfully! It will be visible after admin approval.');
      onSuccess();
    } catch (error) {
      console.error('Error creating competition:', error);
      alert('Failed to create competition. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-2xl w-full my-8`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Create Competition
            </h2>
            <button
              onClick={onClose}
              className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s
                      ? 'bg-purple-600 text-white'
                      : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {s}
                  </div>
                  {s < 3 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      step > s
                        ? 'bg-purple-600'
                        : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Basic Info</span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Enrollment</span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Review</span>
            </div>
          </div>

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Competition Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'}`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'}`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'}`}
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Sports">Sports</option>
                    <option value="Academic">Academic</option>
                    <option value="Tech">Tech</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Start Date *
                  </label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'}`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    End Date *
                  </label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'}`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Registration Deadline
                  </label>
                  <input
                    type="datetime-local"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Max Participants
                  </label>
                  <input
                    type="number"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'}`}
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Prizes
                </label>
                <textarea
                  name="prizes"
                  value={formData.prizes}
                  onChange={handleInputChange}
                  rows={2}
                  className={`w-full px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'}`}
                  placeholder="e.g., 1st Prize: $500, 2nd Prize: $300"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Competition Image
                </label>
                <div className={`border-2 border-dashed rounded-lg p-4 text-center ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded" />
                      <button
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className={`w-12 h-12 mx-auto mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Click to upload image</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Enrollment Options */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="internalEnrollmentEnabled"
                  checked={formData.internalEnrollmentEnabled}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Enable internal enrollment (with custom form)
                </label>
              </div>

              {formData.internalEnrollmentEnabled && (
                <div className="space-y-4 pl-6">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Enrollment Form Fields
                    </h4>
                    <button
                      onClick={addFormField}
                      className="px-3 py-1 bg-purple-600 text-white rounded text-sm flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Field
                    </button>
                  </div>

                  {formFields.map((field, index) => (
                    <div key={index} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Field {index + 1}
                        </span>
                        <button
                          onClick={() => removeFormField(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Field Label"
                          value={field.fieldLabel}
                          onChange={(e) => updateFormField(index, { fieldLabel: e.target.value })}
                          className={`px-3 py-2 rounded ${isDarkMode ? 'bg-gray-600 text-gray-100' : 'bg-white text-gray-900'}`}
                        />

                        <select
                          value={field.fieldType}
                          onChange={(e) => updateFormField(index, { fieldType: e.target.value as FormField['fieldType'] })}
                          className={`px-3 py-2 rounded ${isDarkMode ? 'bg-gray-600 text-gray-100' : 'bg-white text-gray-900'}`}
                        >
                          <option value="TEXT">Text</option>
                          <option value="EMAIL">Email</option>
                          <option value="PHONE">Phone</option>
                          <option value="NUMBER">Number</option>
                          <option value="TEXTAREA">Text Area</option>
                          <option value="DATE">Date</option>
                        </select>

                        <input
                          type="text"
                          placeholder="Placeholder (optional)"
                          value={field.placeholder || ''}
                          onChange={(e) => updateFormField(index, { placeholder: e.target.value })}
                          className={`px-3 py-2 rounded col-span-2 ${isDarkMode ? 'bg-gray-600 text-gray-100' : 'bg-white text-gray-900'}`}
                        />

                        <label className="flex items-center space-x-2 col-span-2">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateFormField(index, { required: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Required field</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  External Enrollment URL (optional)
                </label>
                <input
                  type="url"
                  name="externalEnrollmentUrl"
                  value={formData.externalEnrollmentUrl}
                  onChange={handleInputChange}
                  placeholder="https://forms.google.com/..."
                  className={`w-full px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'}`}
                />
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Provide a link to external registration form (Google Forms, etc.)
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                  Your competition will be submitted for admin approval. It will be visible to students once approved.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Summary:</h4>
                <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <li>Title: {formData.title}</li>
                  <li>Category: {formData.category}</li>
                  <li>Dates: {new Date(formData.startDate).toLocaleDateString()} - {new Date(formData.endDate).toLocaleDateString()}</li>
                  <li>Internal Enrollment: {formData.internalEnrollmentEnabled ? 'Yes' : 'No'}</li>
                  <li>External URL: {formData.externalEnrollmentUrl ? 'Yes' : 'No'}</li>
                  {formData.internalEnrollmentEnabled && <li>Form Fields: {formFields.length}</li>}
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className={`px-6 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'}`}
              >
                Back
              </button>
            )}

            <div className="ml-auto flex space-x-2">
              <button
                onClick={onClose}
                className={`px-6 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'}`}
              >
                Cancel
              </button>

              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 && (!formData.title || !formData.description || !formData.category || !formData.startDate || !formData.endDate)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Competition'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
