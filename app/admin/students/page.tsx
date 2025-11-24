"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "verified" | "pending">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const supabase = createClient()

  useEffect(() => {
    loadStudents()
  }, [filter])

  const loadStudents = async () => {
    setLoading(true)
    let query = supabase
      .from("profiles")
      .select("*")
      .eq("user_type", "student")
      .order("created_at", { ascending: false })

    if (filter === "verified") {
      query = query.eq("is_verified", true)
    } else if (filter === "pending") {
      query = query.eq("is_verified", false)
    }

    const { data } = await query
    setStudents(data || [])
    setLoading(false)
  }

  const verifyStudent = async (studentId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ 
        is_verified: true,
        updated_at: new Date().toISOString() 
      })
      .eq("id", studentId)

    if (!error) {
      loadStudents()
    }
  }

  const unverifyStudent = async (studentId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ 
        is_verified: false,
        updated_at: new Date().toISOString() 
      })
      .eq("id", studentId)

    if (!error) {
      loadStudents()
    }
  }

  const filteredStudents = students.filter((student) =>
    student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/admin/dashboard" className="text-primary hover:underline mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-2">Student Management</h1>
          <p className="text-muted">Verify and manage student accounts</p>
        </div>

        {/* Filters */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === "all"
                    ? "bg-primary text-white"
                    : "bg-background border border-border hover:border-primary"
                }`}
              >
                All Students
              </button>
              <button
                onClick={() => setFilter("verified")}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === "verified"
                    ? "bg-primary text-white"
                    : "bg-background border border-border hover:border-primary"
                }`}
              >
                Verified
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === "pending"
                    ? "bg-primary text-white"
                    : "bg-background border border-border hover:border-primary"
                }`}
              >
                Pending
              </button>
            </div>

            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-96 bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Students List */}
        <div className="card">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted">Loading students...</p>
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">University</th>
                    <th className="text-left py-3 px-4 font-semibold">Student ID</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Joined</th>
                    <th className="text-right py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b border-border hover:bg-background/50">
                      <td className="py-3 px-4">{student.full_name || "N/A"}</td>
                      <td className="py-3 px-4 text-muted text-sm">{student.email}</td>
                      <td className="py-3 px-4 text-sm">{student.university || "N/A"}</td>
                      <td className="py-3 px-4 text-sm">{student.student_id || "N/A"}</td>
                      <td className="py-3 px-4">
                        {student.is_verified ? (
                          <span className="px-2 py-1 bg-green-900/20 border border-green-700 text-green-400 rounded text-xs font-semibold">
                            Verified
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-900/20 border border-yellow-700 text-yellow-400 rounded text-xs font-semibold">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-muted text-sm">
                        {new Date(student.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {student.is_verified ? (
                          <button
                            onClick={() => unverifyStudent(student.id)}
                            className="px-3 py-1 bg-red-900/20 border border-red-700 text-red-400 rounded text-sm hover:bg-red-900/30 transition"
                          >
                            Unverify
                          </button>
                        ) : (
                          <button
                            onClick={() => verifyStudent(student.id)}
                            className="px-3 py-1 bg-green-900/20 border border-green-700 text-green-400 rounded text-sm hover:bg-green-900/30 transition"
                          >
                            Verify
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted">No students found</p>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="card">
            <h3 className="text-muted text-sm font-medium mb-2">Total Students</h3>
            <p className="text-3xl font-bold">{students.length}</p>
          </div>
          <div className="card">
            <h3 className="text-muted text-sm font-medium mb-2">Verified</h3>
            <p className="text-3xl font-bold text-green-400">
              {students.filter((s) => s.is_verified).length}
            </p>
          </div>
          <div className="card">
            <h3 className="text-muted text-sm font-medium mb-2">Pending</h3>
            <p className="text-3xl font-bold text-yellow-400">
              {students.filter((s) => !s.is_verified).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}