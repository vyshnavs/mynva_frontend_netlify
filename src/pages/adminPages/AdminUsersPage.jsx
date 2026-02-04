import { useEffect, useState, useContext } from "react";
import AdminLayout from "../../layouts/admin/AdminLayout";
import api from "../../api/connection";
import { ThemeContext } from "../../contexts/ThemeContext";
import UsersTable from "../../components/adminComp/usersComp/UsersTable";

export default function AdminUsersPage() {
  const { theme } = useContext(ThemeContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <AdminLayout>
      <div className={theme === "dark" ? "text-gray-100" : "text-gray-900"}>
        <h2 className="text-3xl font-bold mb-6">Users</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <UsersTable users={users} />
        )}
      </div>
    </AdminLayout>
  );
}
