import DashboardLayout from "../components/DashboardLayout";
import {
  CloudUpload,
  ListFilter,
  Sparkles,
  Eye,
  Trash2,
  File,
} from "lucide-react";

export default function Documents() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl">
        {/* Page header */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
            Curation Hub
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            Document Management
          </h1>
          <p className="mt-2 text-slate-600 max-w-3xl">
            Elevate your proposals with architectural precision. Upload,
            categorize, and embed your professional history into the AI
            intelligence engine.
          </p>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload section */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                <CloudUpload className="w-8 h-8 text-slate-900" />
              </div>
              <h2 className="text-xl font-medium text-slate-900">
                Drag and Drop PDFs
              </h2>
              <p className="mt-2 text-slate-600">
                Securely transfer your documents to our encrypted AI vault.
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500 tracking-wide">
                ONLY .PDF FILES ARE ACCEPTED.
              </p>
              <button className="mt-6 px-6 py-3 bg-blue-900 hover:bg-blue-800 cursor-pointer text-white font-medium rounded-lg transition-colors">
                Browse Files
              </button>
            </div>
          </div>

          {/* Categorization section */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 tracking-wide uppercase">
              Categorization
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Assign a semantic context to your next upload to optimize AI
              extraction.
            </p>
            <div className="mt-4 space-y-3">
              {[
                "CV / Resume",
                "Portfolio",
                "Cover Letter",
                "LinkedIn PDF",
                "Certificate",
              ].map((category, index) => (
                <label
                  key={category}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors
                    ${
                      index === 0
                        ? "bg-white border-slate-300"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="category"
                    defaultChecked={index === 0}
                    className="w-4 h-4 text-slate-900 border-slate-300 focus:ring-slate-900"
                  />
                  <span className="text-sm text-slate-700">{category}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Library Overview */}
        <div className="mt-6 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-medium text-slate-900">
              Library Overview
            </h3>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ListFilter className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                  <th className="px-6 py-3">File Name</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date Uploaded</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[
                  {
                    name: "Senior_Architect_2024.pdf",
                    type: "CV",
                    status: "Embedded",
                    date: "Oct 12, 2023",
                  },
                  {
                    name: "Urban_Design_Portfolio_V2.pdf",
                    type: "Portfolio",
                    status: "Processing",
                    date: "Oct 14, 2023",
                  },
                  {
                    name: "LEED_Certification_2022.pdf",
                    type: "Certificate",
                    status: "Embedded",
                    date: "Sep 28, 2023",
                  },
                ].map((doc) => (
                  <tr key={doc.name} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center">
                          <File className="w-4 h-4 text-blue-700" />
                        </div>
                        <span className="text-sm font-medium text-slate-900">
                          {doc.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {doc.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${doc.status === "Embedded" ? "bg-green-500" : "bg-blue-500"}`}
                        ></span>
                        <span className="text-sm text-slate-700">
                          {doc.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {doc.date}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {doc.status === "Embedded" ? (
                          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs font-medium rounded-lg transition-colors">
                            <Sparkles className="w-3.5 h-3.5" />
                            Generate Memory
                          </button>
                        ) : (
                          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <Eye className="w-4 h-4 text-slate-600" />
                          </button>
                        )}
                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Showing 3 of 12 documents
            </p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                Previous
              </button>
              <button className="px-3 py-1.5 text-sm bg-slate-900 text-white rounded-lg">
                1
              </button>
              <button className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                2
              </button>
              <button className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
