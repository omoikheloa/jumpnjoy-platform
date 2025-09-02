import React, { useEffect, useMemo, useState } from "react";
import apiService from "../../services/api";

const initialFilters = {
  search: "",
  employee: "",
  appraiser: "",
  date_from: "",
  date_to: "",
  ordering: "-date_of_appraisal",
  page: 1,
};

const StaffAppraisalList = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null); // selected row for details

  const pageSize = 10;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((data?.count || 0) / pageSize)),
    [data?.count]
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiService.listAppraisals({
        search: filters.search || undefined,
        employee: filters.employee || undefined,
        appraiser: filters.appraiser || undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
        ordering: filters.ordering || undefined,
        page: filters.page || 1,
      });
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [filters]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFilters((f) => ({ ...f, [name]: value, page: 1 }));
  };

  const clearFilters = () => setFilters(initialFilters);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Staff Appraisals</h2>
        <button
          onClick={fetchData}
          className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Filters */}
      <div className="grid md:grid-cols-6 grid-cols-2 gap-3 mb-4">
        <input
          name="search"
          value={filters.search}
          onChange={onChange}
          placeholder="Search text..."
          className="form-input"
        />
        <input
          name="employee"
          value={filters.employee}
          onChange={onChange}
          placeholder="Employee ID"
          className="form-input"
        />
        <input
          name="appraiser"
          value={filters.appraiser}
          onChange={onChange}
          placeholder="Appraiser ID"
          className="form-input"
        />
        <input
          type="date"
          name="date_from"
          value={filters.date_from}
          onChange={onChange}
          className="form-input"
        />
        <input
          type="date"
          name="date_to"
          value={filters.date_to}
          onChange={onChange}
          className="form-input"
        />
        <select
          name="ordering"
          value={filters.ordering}
          onChange={onChange}
          className="form-input"
        >
          <option value="-date_of_appraisal">Newest first</option>
          <option value="date_of_appraisal">Oldest first</option>
          <option value="-created_at">Created (newest)</option>
          <option value="created_at">Created (oldest)</option>
          <option value="-quality_rating">Quality rating (high→low)</option>
          <option value="quality_rating">Quality rating (low→high)</option>
        </select>
        <button onClick={clearFilters} className="px-3 py-2 rounded border">
          Clear
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Employee</th>
              <th className="px-3 py-2 text-left">Appraiser</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Quality</th>
              <th className="px-3 py-2">Teamwork</th>
              <th className="px-3 py-2">Initiative</th>
              <th className="px-3 py-2">Customer Service</th>
              <th className="px-3 py-2">Adherence</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.results?.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="px-3 py-2">
                  {row.employee_info?.full_name || row.employee_info?.username}
                </td>
                <td className="px-3 py-2">
                  {row.appraiser_info?.full_name || row.appraiser_info?.username}
                </td>
                <td className="px-3 py-2">{row.date_of_appraisal}</td>
                <td className="px-3 py-2 text-center">{row.quality_rating}</td>
                <td className="px-3 py-2 text-center">{row.teamwork_rating}</td>
                <td className="px-3 py-2 text-center">{row.initiative_rating}</td>
                <td className="px-3 py-2 text-center">{row.customer_service_rating}</td>
                <td className="px-3 py-2 text-center">{row.adherence_rating}</td>
                <td className="px-3 py-2">
                  <button
                    className="px-2 py-1 rounded border"
                    onClick={() => setSelected(row)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
            {!loading && data?.results?.length === 0 && (
              <tr>
                <td colSpan="9" className="px-3 py-6 text-center text-gray-500">
                  No results.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div>Page {filters.page} of {totalPages}</div>
        <div className="space-x-2">
          <button
            onClick={() => setFilters(f => ({ ...f, page: Math.max(1, f.page - 1) }))}
            disabled={filters.page <= 1}
            className="px-3 py-2 rounded border disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setFilters(f => ({ ...f, page: Math.min(totalPages, f.page + 1) }))}
            disabled={filters.page >= totalPages}
            className="px-3 py-2 rounded border disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Details Drawer/Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative">
            <button
              className="absolute right-3 top-3 px-3 py-1 rounded border"
              onClick={() => setSelected(null)}
            >
              Close
            </button>
            <h3 className="text-xl font-bold mb-3">
              Appraisal — {selected.employee_info?.full_name || selected.employee_info?.username}
            </h3>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="font-semibold">Date:</span> {selected.date_of_appraisal}</div>
              <div><span className="font-semibold">Appraiser:</span> {selected.appraiser_info?.full_name || selected.appraiser_info?.username}</div>

              <div className="col-span-2 border-t pt-2 font-semibold">Ratings</div>
              <div>Attendance: {selected.attendance_rating}</div>
              <div>Quality: {selected.quality_rating}</div>
              <div>Teamwork: {selected.teamwork_rating}</div>
              <div>Initiative: {selected.initiative_rating}</div>
              <div>Customer Service: {selected.customer_service_rating}</div>
              <div>Adherence: {selected.adherence_rating}</div>

              <div className="col-span-2 border-t pt-2 font-semibold">Comments</div>
              <div className="col-span-2"><span className="font-semibold">Attendance:</span> {selected.attendance_comments || "—"}</div>
              <div className="col-span-2"><span className="font-semibold">Quality:</span> {selected.quality_comments || "—"}</div>
              <div className="col-span-2"><span className="font-semibold">Teamwork:</span> {selected.teamwork_comments || "—"}</div>
              <div className="col-span-2"><span className="font-semibold">Initiative:</span> {selected.initiative_comments || "—"}</div>
              <div className="col-span-2"><span className="font-semibold">Customer Service:</span> {selected.customer_service_comments || "—"}</div>
              <div className="col-span-2"><span className="font-semibold">Adherence:</span> {selected.adherence_comments || "—"}</div>

              <div className="col-span-2 border-t pt-2">
                <div className="font-semibold">Achievements</div>
                <div>{selected.achievements || "—"}</div>
              </div>
              <div className="col-span-2">
                <div className="font-semibold">Development Needs</div>
                <div>{selected.development_needs || "—"}</div>
              </div>
              <div className="col-span-2">
                <div className="font-semibold">Goals (3–6 months)</div>
                <div>{selected.goals || "—"}</div>
              </div>
              <div className="col-span-2">
                <div className="font-semibold">Employee Comments</div>
                <div>{selected.employee_comments || "—"}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffAppraisalList;