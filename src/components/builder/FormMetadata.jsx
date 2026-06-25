import { useFormStore } from "../../store/formStore";

export default function FormMetadata() {
  const { formName, formDescription, createdBy, version, updateFormMetadata } =
    useFormStore();

  const handleChange = (key, value) => {
    updateFormMetadata({ [key]: value });
  };

  return (
    <div className="space-y-4 pb-4 border-b mb-4">
      <h3 className="font-bold text-gray-700">Form Settings</h3>

      {/* Form Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Form Name
        </label>
        <input
          type="text"
          value={formName}
          onChange={(e) => handleChange("formName", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Enter form name"
        />
      </div>

      {/* Form Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formDescription}
          onChange={(e) => handleChange("formDescription", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          placeholder="Form description"
          rows="2"
        />
      </div>

      {/* Created By */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Created By
        </label>
        <input
          type="text"
          value={createdBy}
          onChange={(e) => handleChange("createdBy", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Your name"
        />
      </div>

      {/* Version */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Version
        </label>
        <input
          type="text"
          value={version}
          onChange={(e) => handleChange("version", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="1.0"
        />
      </div>
    </div>
  );
}
