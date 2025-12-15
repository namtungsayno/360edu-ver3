// pages/parent/profile/ParentProfile.jsx
import { useEffect, useState } from "react";
import { User, Mail, Phone, MapPin, Edit, Save, X, Users } from "lucide-react";
import PageTitle from "../../../components/common/PageTitle";
import { Card } from "../../../components/ui/Card";
import { parentApi } from "../../../services/parent/parent.api";

const ParentProfile = () => {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [editedProfile, setEditedProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await parentApi.getProfile();
      setProfile(response);
      setEditedProfile(response);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setEditedProfile({ ...profile });
  };

  const handleCancel = () => {
    setEditing(false);
    setEditedProfile({ ...profile });
  };

  const handleSave = async () => {
    try {
      const response = await parentApi.updateProfile(editedProfile);
      setProfile(response);
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleChange = (field, value) => {
    setEditedProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageTitle
        title="Thông tin cá nhân"
        subtitle="Quản lý thông tin phụ huynh"
      />

      <div className="max-w-4xl mx-auto">
        {/* Profile Card */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-xl font-bold">Thông tin phụ huynh</h2>
            {!editing ? (
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Chỉnh sửa
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Lưu
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Hủy
                </button>
              </div>
            )}
          </div>

          <div className="flex items-start gap-6 mb-6">
            <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
              {profile.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Họ và tên
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={editedProfile.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Số điện thoại
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      value={editedProfile.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.phone}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Địa chỉ
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={editedProfile.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.address}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Children Card */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Thông tin con
          </h2>
          <div className="space-y-4">
            {profile.children.map((child) => (
              <div key={child.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white text-xl font-bold">
                    {child.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">
                      {child.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-700">
                      <div>
                        <span className="font-medium">Ngày sinh:</span>{" "}
                        {new Date(child.dateOfBirth).toLocaleDateString(
                          "vi-VN"
                        )}
                      </div>
                      <div>
                        <span className="font-medium">Lớp:</span> {child.grade}
                      </div>
                      <div>
                        <span className="font-medium">Trường:</span>{" "}
                        {child.school}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ParentProfile;
