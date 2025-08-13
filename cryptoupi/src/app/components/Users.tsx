"use client";

import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase"; 
import React, { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
}

const Users: React.FC = () => {
  const [data, setData] = useState<User[]>([]);
  const [name, setName] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const usersData: User[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name as string,
    }));
    setData(usersData);
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    await addDoc(collection(db, "users"), { name });
    setName("");
    fetchUsers();
  };

  const handleUpdate = async (id: string) => {
    if (!name.trim()) return;
    const userRef = doc(db, "users", id);
    await updateDoc(userRef, { name });
    setName("");
    setEditingId(null);
    fetchUsers();
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "users", id));
    fetchUsers();
  };

  const startEditing = (user: User) => {
    setName(user.name);
    setEditingId(user.id);
  };

  const cancelEditing = () => {
    setName("");
    setEditingId(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">User Management</h2>
      
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter user name"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        {editingId ? (
          <div className="flex gap-2">
            <button 
              onClick={() => handleUpdate(editingId)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              Update
            </button>
            <button 
              onClick={cancelEditing}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button 
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Add User
          </button>
        )}
      </div>

      <ul className="space-y-3">
        {data.map((user) => (
          <li 
            key={user.id} 
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
          >
            <span className="font-medium text-gray-700">{user.name}</span>
            
            <div className="flex gap-2">
              <button
                onClick={() => startEditing(user)}
                className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(user.id)}
                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition text-sm"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No users found. Add your first user above.
        </div>
      )}
    </div>
  );
};

export default Users;