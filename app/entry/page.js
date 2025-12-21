"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { searchVoterByEpicNo, searchVoterByName } from "./voterService";
import { updateVoterData } from "./updateVoterService";
import { spreadFullName } from "../common";
import { isUserLoggedIn, getStoredUser, isAdmin } from "../authUtils";
import SearchResultsModal from "./SearchResultsModal";

export default function Entry() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const initFormData = {
    epicNo: "",
    name: "",
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    mobile: "",
    mobile0: "",
    mobile1: "",
    mobile2: "",
    address: "",
    wing: "",
    roomNo: "",
    building: "",
    area: "",
    remark: "",
  };
  const [formData, setFormData] = useState(initFormData);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [user, setUser] = useState(null);
  const [showAdminFields, setShowAdminFields] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    setError("");

    // Priority 1: Search by Epic No if provided
    if (formData.epicNo && formData.epicNo.trim() !== "") {
      setLoading(true);
      try {
        const result = await searchVoterByEpicNo(formData.epicNo);
        if (result.ok && result.data) {
          const {
            Name,
            Epic,
            F_Name,
            M_Name,
            L_Name,
            Gender,
            House_No,
            Mobile,
            Mobile0,
            Mobile1,
            Mobile2,
            Wing,
            Room_No,
            Building_Name,
            Area,
            Remark,
          } = result.data;
          const { first_name, middle_name, last_name } = spreadFullName(Name);
          // Populate form with voter data
          setFormData((prev) => ({
            ...prev,
            name: Name || "",
            firstName: F_Name || first_name || "",
            middleName: M_Name || middle_name || "",
            lastName: L_Name || last_name || "",
            gender: Gender || "",
            mobile: Mobile || "",
            mobile0: Mobile0 || "",
            mobile1: Mobile1 || "",
            mobile2: Mobile2 || "",
            address: House_No || "",
            wing: Wing || "",
            roomNo: Room_No || "",
            building: Building_Name || "",
            area: Area || "",
            remark: Remark || "",
          }));
        } else {
          setError(result.error || "Voter not found");
        }
      } catch (err) {
        setError("Failed to search voter");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Priority 2: Search by Name (Admin only)
    if (isAdmin(user)) {
      const hasNameField =
        (formData.firstName && formData.firstName.trim()) ||
        (formData.middleName && formData.middleName.trim()) ||
        (formData.lastName && formData.lastName.trim());

      if (!hasNameField) {
        setError(
          "Please enter Epic No or at least one name field (First/Middle/Last Name)"
        );
        return;
      }

      setLoading(true);
      try {
        const result = await searchVoterByName(
          formData.firstName || "",
          formData.middleName || "",
          formData.lastName || ""
        );

        if (result.ok && result.data && result.data.length > 0) {
          if (result.data.length === 1) {
            // Single result - populate form directly
            const voter = result.data[0];
            const { first_name, middle_name, last_name } = spreadFullName(
              voter.Name || `${voter.F_Name} ${voter.M_Name} ${voter.L_Name}`
            );
            setFormData((prev) => ({
              ...prev,
              epicNo: voter.Epic || "",
              name:
                voter.F_Name ||
                `${voter.F_Name} ${voter.M_Name} ${voter.L_Name}`,
              firstName: voter.F_Name || first_name || "",
              middleName: voter.M_Name || middle_name || "",
              lastName: voter.L_Name || last_name || "",
              gender: voter.Gender || "",
              mobile: voter.Mobile || "",
              mobile0: voter.Mobile0 || "",
              mobile1: voter.Mobile1 || "",
              mobile2: voter.Mobile2 || "",
              address: voter.House_No || "",
              wing: voter.Wing || "",
              roomNo: voter.Room_No || "",
              building: voter.Building_Name || "",
              area: voter.Area || "",
              remark: voter.Remark || "",
            }));
          } else {
            // Multiple results - show modal
            setSearchResults(result.data);
            setModalOpen(true);
          }
        } else {
          setError("No voters found matching the search criteria");
        }
      } catch (err) {
        setError("Failed to search voters by name");
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      setError("Please enter Epic No to search");
    }
  };

  const handleSelectVoter = (voter) => {
    const { first_name, middle_name, last_name } = spreadFullName(
      voter.full_name ||
        `${voter.first_name} ${voter.middle_name} ${voter.last_name}`
    );
    setFormData((prev) => ({
      ...prev,
      epicNo: voter.Epic || "",
      name: voter.Name || `${voter.F_Name} ${voter.M_Name} ${voter.L_Name}`,
      firstName: voter.F_Name || first_name || "",
      middleName: voter.M_Name || middle_name || "",
      lastName: voter.L_Name || last_name || "",
      gender: voter.Gender || "",
      mobile: voter.Mobile || "",
      mobile0: voter.Mobile0 || "",
      mobile1: voter.Mobile1 || "",
      mobile2: voter.Mobile2 || "",
      address: voter.House_No || "",
      wing: voter.Wing || "",
      roomNo: voter.Room_No || "",
      building: voter.Building_Name || "",
      area: voter.Area || "",
      remark: voter.Remark || "",
    }));
    setModalOpen(false);
    setSearchResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.epicNo || formData.epicNo.trim() === "") {
      setError("Please enter Epic No");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Get userId from stored user data
      const user = getStoredUser();
      const userId = user?.id || "system";

      const updateData = {
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        mobile: formData.mobile,
        wing: formData.wing,
        roomNo: formData.roomNo,
        building: formData.building,
        area: formData.area,
        remark: formData.remark,
        userId: userId,
      };

      const result = await updateVoterData(
        formData.epicNo.trim().toUpperCase(),
        updateData
      );

      if (result.ok) {
        setError("");
        alert("Voter data updated successfully!");
        console.log("Updated Data:", result.data);
        setFormData(initFormData);
      } else {
        setError(result.error || "Failed to update voter data");
      }
    } catch (err) {
      setError("Failed to update voter data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is logged in and token is not expired
    if (!isUserLoggedIn()) {
      router.push("/login");
      return;
    }
    const storedUser = getStoredUser();
    setUser(storedUser);
    setIsAuthorized(true);
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-800">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <SearchResultsModal
        isOpen={modalOpen}
        results={searchResults}
        onClose={() => {
          setModalOpen(false);
          setSearchResults([]);
        }}
        onSelect={handleSelectVoter}
        isLoading={loading}
      />
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-8 shadow-2xl">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-lg font-semibold text-gray-800">
                Searching...
              </p>
            </div>
          </div>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl"
      >
        <div className="sticky top-0 z-50 bg-white rounded-t-xl border-b border-gray-200 p-2 shadow-md">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-gray-800">Search Voter</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={loading}
                  className="cursor-pointer p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 flex"
                  title="Search voter by Epic No or Name"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Search
                </button>
                <div
                  className="p-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition"
                  onClick={() => setShowAdminFields(!showAdminFields)}
                  title="Toggle Admin Search Fields"
                >
                  <svg
                    className="w-6 h-6 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>
              </div>
            </div>
            {isAdmin(user) && showAdminFields && (
              <div className="flex flex-col sm:flex-row gap-2 text-xs text-gray-600 bg-blue-50 p-2 rounded">
                <span className="font-semibold">Admin Search:</span>
                <div className="flex flex-col sm:flex-row gap-2 flex-1">
                  <input
                    type="text"
                    placeholder="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Middle Name"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-8 pt-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Epic No
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-700 placeholder-gray-500"
                placeholder="Enter Epic No"
                name="epicNo"
                value={formData.epicNo}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Name
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-blue-50 text-gray-700">
                {formData.name || "N/A"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                First Name
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-700 placeholder-gray-500"
                placeholder="Enter First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Middle Name
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-700 placeholder-gray-500"
                placeholder="Enter Middle Name"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Last Name
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-700 placeholder-gray-500"
                placeholder="Enter Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gender
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-700"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-700 placeholder-gray-500"
                placeholder="Enter Mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile 0
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-700 placeholder-gray-500 bg-gray-100"
                placeholder="Enter Mobile 0"
                name="mobile0"
                disabled={true}
                value={formData.mobile0}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile 1
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-700 placeholder-gray-500 bg-gray-100"
                placeholder="Enter Mobile 1"
                name="mobile1"
                disabled={true}
                value={formData.mobile1}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile 2
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-700 placeholder-gray-500 bg-gray-100"
                placeholder="Enter Mobile 2"
                name="mobile2"
                disabled={true}
                value={formData.mobile2}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-700 placeholder-gray-500 bg-gray-100"
                placeholder="Enter Address"
                name="address"
                disabled={true}
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Wing
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-700 placeholder-gray-500"
                placeholder="Enter Wing"
                name="wing"
                value={formData.wing}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Room No
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-700 placeholder-gray-500"
                placeholder="Enter Room No"
                name="roomNo"
                value={formData.roomNo}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Building
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-700 placeholder-gray-500"
                placeholder="Enter Building"
                name="building"
                value={formData.building}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Area
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-700 placeholder-gray-500"
                placeholder="Enter Area"
                name="area"
                value={formData.area}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Remark
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-700 placeholder-gray-500"
              placeholder="Enter Remark"
              name="remark"
              rows="3"
              value={formData.remark}
              onChange={handleChange}
            />
          </div>
          <button
            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
            type="submit"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );
}
